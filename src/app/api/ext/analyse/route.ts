import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyserDossierIA, resultatsVersAnalyseDB } from '@/lib/ia/analyse'

async function verifyExtensionToken(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return { user }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyExtensionToken(request)
    if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { dossierId } = await request.json()
    if (!dossierId) return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })

    const supabase = await createClient()

    const { data: dossier } = await supabase
      .from('dossiers')
      .select('*, emprunteurs:emprunteurs(*), projet:projets(*)')
      .eq('id', dossierId)
      .single()

    if (!dossier?.emprunteurs?.length || !dossier?.projet) {
      return NextResponse.json({ error: 'Données insuffisantes pour l\'analyse' }, { status: 400 })
    }

    const { calculs } = await analyserDossierIA(dossier.emprunteurs, dossier.projet)
    const analyseData = resultatsVersAnalyseDB(dossierId, calculs, true)

    const { data: analyse } = await supabase
      .from('analyses_financieres')
      .upsert(analyseData, { onConflict: 'dossier_id' })
      .select()
      .single()

    return NextResponse.json({ analyse, score: calculs.score_global })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur analyse' }, { status: 500 })
  }
}
