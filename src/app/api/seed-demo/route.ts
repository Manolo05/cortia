import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const demos = [
  {
    emprunteur: { nom: 'Martin', prenom: 'Sophie' },
    dossier: { montant: 320000, apport: 48000, duree_mois: 300, revenus_mensuels: 5200, charges_mensuelles: 600, loyer_actuel: 1100, type_contrat: 'CDI', anciennete_mois: 60 },
    projet: { prix_bien: 320000, type_operation: 'achat_ancien', ville_bien: 'Lyon 6e' },
  },
  {
    emprunteur: { nom: 'Dubois', prenom: 'Pierre' },
    dossier: { montant: 180000, apport: 36000, duree_mois: 240, revenus_mensuels: 4100, charges_mensuelles: 950, loyer_actuel: 850, type_contrat: 'CDI', anciennete_mois: 84 },
    projet: { prix_bien: 180000, type_operation: 'investissement_locatif', ville_bien: 'Bordeaux' },
  },
  {
    emprunteur: { nom: 'Renault', prenom: 'Claire' },
    dossier: { montant: 450000, apport: 90000, duree_mois: 300, revenus_mensuels: 7500, charges_mensuelles: 1200, loyer_actuel: 1400, type_contrat: 'CDI', anciennete_mois: 120 },
    projet: { prix_bien: 450000, type_operation: 'achat_neuf', ville_bien: 'Paris 15e' },
  },
  {
    emprunteur: { nom: 'Petit', prenom: 'Lucas' },
    dossier: { montant: 210000, apport: 10000, duree_mois: 300, revenus_mensuels: 2800, charges_mensuelles: 400, loyer_actuel: 650, type_contrat: 'CDI', anciennete_mois: 18 },
    projet: { prix_bien: 210000, type_operation: 'achat_ancien', ville_bien: 'Toulouse' },
  },
]

export async function POST() {
  try {
    const { data: dossiers } = await supabase
      .from('dossiers')
      .select('id, reference, emprunteurs(id, nom, prenom), projet:projets(id)')
      .order('created_at', { ascending: true })

    if (!dossiers || dossiers.length === 0) {
      return NextResponse.json({ error: 'Aucun dossier trouvé' }, { status: 404 })
    }

    const results: any[] = []
    let demoIdx = 0

    for (const d of dossiers) {
      const emps = (d as any).emprunteurs || []
      const hasName = emps.length > 0 && emps[0]?.nom
      const proj = (d as any).projet
      const hasMontant = proj && Array.isArray(proj) ? proj[0]?.prix_bien > 0 : proj?.prix_bien > 0

      if (hasName && hasMontant) {
        results.push({ id: d.id, ref: d.reference, status: 'skipped (has data)' })
        continue
      }

      if (demoIdx >= demos.length) break
      const demo = demos[demoIdx]
      demoIdx++

      // Update dossier fields
      await supabase.from('dossiers').update(demo.dossier).eq('id', d.id)

      // Update or insert emprunteur
      if (emps.length > 0) {
        await supabase.from('emprunteurs').update(demo.emprunteur).eq('id', emps[0].id)
      } else {
        await supabase.from('emprunteurs').insert({ ...demo.emprunteur, dossier_id: d.id, est_co_emprunteur: false })
      }

      // Update or insert projet
      const projArr = Array.isArray(proj) ? proj : (proj ? [proj] : [])
      if (projArr.length > 0 && projArr[0]?.id) {
        await supabase.from('projets').update(demo.projet).eq('id', projArr[0].id)
      } else {
        await supabase.from('projets').insert({ ...demo.projet, dossier_id: d.id })
      }

      results.push({ id: d.id, ref: d.reference, status: 'seeded', name: demo.emprunteur.prenom + ' ' + demo.emprunteur.nom })
    }

    return NextResponse.json({ total: dossiers.length, seeded: demoIdx, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
