import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const demoProfiles = [
  {
    nom_emprunteur: 'Sophie Martin',
    type_pret: 'Résidence principale',
    montant: 320000,
    apport: 48000,
    duree_mois: 300,
    revenus_mensuels: 5200,
    charges_mensuelles: 600,
    loyer_actuel: 1100,
    type_contrat: 'CDI',
    anciennete_mois: 60,
    statut: 'en_attente',
  },
  {
    nom_emprunteur: 'Pierre Dubois',
    type_pret: 'Investissement locatif',
    montant: 180000,
    apport: 36000,
    duree_mois: 240,
    revenus_mensuels: 4100,
    charges_mensuelles: 950,
    loyer_actuel: 850,
    type_contrat: 'CDI',
    anciennete_mois: 84,
    statut: 'en_attente',
  },
  {
    nom_emprunteur: 'Claire Renault',
    type_pret: 'Résidence principale',
    montant: 450000,
    apport: 90000,
    duree_mois: 300,
    revenus_mensuels: 7500,
    charges_mensuelles: 1200,
    loyer_actuel: 1400,
    type_contrat: 'CDI',
    anciennete_mois: 120,
    statut: 'en_attente',
  },
  {
    nom_emprunteur: 'Lucas Petit',
    type_pret: 'Résidence principale',
    montant: 210000,
    apport: 10000,
    duree_mois: 300,
    revenus_mensuels: 2800,
    charges_mensuelles: 400,
    loyer_actuel: 650,
    type_contrat: 'CDI',
    anciennete_mois: 18,
    statut: 'en_attente',
  },
]

export async function POST() {
  try {
    const { data: dossiers } = await supabase
      .from('dossiers')
      .select('id, nom_emprunteur, montant')
      .order('created_at', { ascending: true })

    if (!dossiers) return NextResponse.json({ error: 'No dossiers found' }, { status: 404 })

    const emptyDossiers = dossiers.filter(d => !d.montant && !d.nom_emprunteur)
    const results = []

    for (let i = 0; i < Math.min(emptyDossiers.length, demoProfiles.length); i++) {
      const { data, error } = await supabase
        .from('dossiers')
        .update(demoProfiles[i])
        .eq('id', emptyDossiers[i].id)
        .select()
        .single()
      
      results.push({ id: emptyDossiers[i].id, updated: !error, name: demoProfiles[i].nom_emprunteur })
    }

    return NextResponse.json({ seeded: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
