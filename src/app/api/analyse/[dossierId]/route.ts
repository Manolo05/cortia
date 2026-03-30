import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyserDossierIA, resultatsVersAnalyseDB } from '@/lib/ia/analyse'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ dossierId: string }> }
) {
  try {
    const { dossierId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Récupérer le dossier complet
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select(`
        *,
        emprunteurs:emprunteurs(*),
        projet:projets(*)
      `)
      .eq('id', dossierId)
      .single()

    if (dossierError || !dossier) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    if (!dossier.emprunteurs?.length) {
      return NextResponse.json({ error: 'Aucun emprunteur renseigné' }, { status: 400 })
    }

    if (!dossier.projet) {
      return NextResponse.json({ error: 'Projet non renseigné' }, { status: 400 })
    }

    // Lancer l'analyse IA
    const { calculs, ia } = await analyserDossierIA(dossier.emprunteurs, dossier.projet)

    // Sauvegarder en DB
    const analyseData = resultatsVersAnalyseDB(dossierId, calculs, true)

    const { data: analyse, error: analyseError } = await supabase
      .from('analyses_financieres')
      .upsert(analyseData, { onConflict: 'dossier_id' })
      .select()
      .single()

    if (analyseError) throw analyseError

    // Mettre à jour le statut du dossier
    await supabase
      .from('dossiers')
      .update({ statut: 'analyse' })
      .eq('id', dossierId)
      .eq('statut', 'nouveau')

    return NextResponse.json({ analyse, ia })
  } catch (error: any) {
    console.error('Erreur analyse:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de l\'analyse' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dossierId: string }> }
) {
  try {
    const { dossierId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data, error } = await supabase
      .from('analyses_financieres')
      .select('*')
      .eq('dossier_id', dossierId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Analyse non trouvée' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
