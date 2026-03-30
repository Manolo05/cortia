import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererSyntheseIA, synthesesVersMarkdown } from '@/lib/ia/synthese'
import type { DonneesSynthese } from '@/lib/ia/types-synthese'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ dossierId: string }> }
) {
  try {
    const { dossierId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('nom_complet')
      .eq('id', user.id)
      .single()

    // Récupérer le dossier complet
    const { data: dossier } = await supabase
      .from('dossiers')
      .select(`
        *, reference,
        emprunteurs:emprunteurs(*),
        projet:projets(*),
        documents:documents(statut_verification),
        analyse:analyses_financieres(*)
      `)
      .eq('id', dossierId)
      .single()

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    if (!dossier.analyse) {
      return NextResponse.json({ error: 'Analyse financière requise avant la synthèse' }, { status: 400 })
    }

    // Préparer les données pour la synthèse
    const donneesSynthese: DonneesSynthese = {
      dossier: {
        reference: dossier.reference,
        date_creation: dossier.created_at,
        courtier: profil?.nom_complet || 'Courtier',
      },
      emprunteurs: dossier.emprunteurs.map((e: any) => ({
        nom_complet: `${e.prenom} ${e.nom}`,
        role: e.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal',
        situation_pro: e.type_contrat || 'Non précisé',
        revenus_nets: (e.salaire_net_mensuel || 0) + (e.autres_revenus || 0),
        anciennete: e.anciennete_emploi || 0,
      })),
      projet: {
        type: dossier.projet?.type_operation || 'Non précisé',
        usage: dossier.projet?.usage_bien || 'Non précisé',
        localisation: dossier.projet?.ville_bien || 'Non précisé',
        prix_bien: dossier.projet?.prix_bien || 0,
        travaux: dossier.projet?.montant_travaux || 0,
        apport: dossier.projet?.apport_personnel || 0,
        montant_emprunt: dossier.projet?.montant_emprunt || 0,
        duree: dossier.projet?.duree_souhaitee || 0,
        taux: dossier.projet?.taux_interet_cible || 4.0,
      },
      analyse: {
        score_global: dossier.analyse.score_global,
        taux_endettement_projet: dossier.analyse.taux_endettement_projet,
        mensualite: dossier.analyse.mensualite_estimee,
        taux_apport: dossier.analyse.taux_apport,
        reste_a_vivre: dossier.analyse.reste_a_vivre,
        capacite_emprunt: dossier.analyse.capacite_emprunt_max,
        points_forts: dossier.analyse.points_forts || [],
        points_vigilance: dossier.analyse.points_vigilance || [],
        recommandations: dossier.analyse.recommandations || [],
      },
      documents: {
        total: dossier.documents?.length || 0,
        valides: dossier.documents?.filter((d: any) => d.statut_verification === 'valide').length || 0,
        en_attente: dossier.documents?.filter((d: any) => d.statut_verification === 'en_attente').length || 0,
        refuses: dossier.documents?.filter((d: any) => d.statut_verification === 'refuse').length || 0,
      },
    }

    // Générer la synthèse IA
    const syntheseIA = await genererSyntheseIA(donneesSynthese)
    const markdownContent = synthesesVersMarkdown(syntheseIA)

    // Sauvegarder en DB
    const { data: synthese, error } = await supabase
      .from('syntheses_ia')
      .insert({
        dossier_id: dossierId,
        contenu_markdown: markdownContent,
        genere_par: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ synthese, ia: syntheseIA })
  } catch (error: any) {
    console.error('Erreur synthèse:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la génération de synthèse' },
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
      .from('syntheses_ia')
      .select('*')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Synthèse non trouvée' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
