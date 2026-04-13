import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Only use columns that exist in the emprunteurs table
const empFinancials: Record<string, any> = {
  'Sophie Martin': { salaire_net_mensuel: 5200, type_contrat: 'CDI', autres_revenus: 0, credits_en_cours: 0, epargne: 52000 },
  'Pierre Dubois': { salaire_net_mensuel: 4100, type_contrat: 'CDI', autres_revenus: 300, revenus_locatifs: 0, credits_en_cours: 250, epargne: 45000 },
  'Claire Renault': { salaire_net_mensuel: 7500, type_contrat: 'CDI', autres_revenus: 500, revenus_locatifs: 800, credits_en_cours: 0, epargne: 110000 },
  'Lucas Petit': { salaire_net_mensuel: 4200, type_contrat: 'CDI', autres_revenus: 0, credits_en_cours: 0, epargne: 15000 },
}

const projFinancials: Record<string, any> = {
  'Sophie Martin': { prix_achat: 320000, frais_notaire: 24000, apport: 48000, duree_souhaitee: 300, travaux: 0, taux_estime: 3.5, type_bien: 'Appartement', usage: 'Residence principale' },
  'Pierre Dubois': { prix_achat: 180000, frais_notaire: 13500, apport: 36000, duree_souhaitee: 240, travaux: 15000, taux_estime: 3.6, type_bien: 'Appartement', usage: 'Investissement locatif' },
  'Claire Renault': { prix_achat: 450000, frais_notaire: 33750, apport: 90000, duree_souhaitee: 300, travaux: 0, taux_estime: 3.4, type_bien: 'Maison', usage: 'Residence principale' },
  'Lucas Petit': { prix_achat: 320000, frais_notaire: 24000, apport: 40000, duree_souhaitee: 240, travaux: 0, taux_estime: 3.5, type_bien: 'Appartement', usage: 'Residence principale' },
}

export async function POST() {
  try {
    const { data: dossiers } = await supabase
      .from('dossiers')
      .select('id, reference, emprunteurs(id, nom, prenom), projets(id)')
      .order('created_at', { ascending: true })

    if (!dossiers || dossiers.length === 0) return NextResponse.json({ error: 'Aucun dossier' }, { status: 404 })

    const results: any[] = []

    for (const d of dossiers) {
      const emps = (d as any).emprunteurs || []
      if (emps.length === 0) { results.push({ ref: d.reference, status: 'no emprunteur' }); continue }

      const emp = emps[0]
      const fullName = (emp.prenom + ' ' + emp.nom).trim()
      const empData = empFinancials[fullName]
      const projData = projFinancials[fullName]

      if (!empData) { results.push({ ref: d.reference, name: fullName, status: 'skipped' }); continue }

      const { error: empErr } = await supabase.from('emprunteurs').update(empData).eq('id', emp.id)

      const projArr = (d as any).projets || []
      const projList = Array.isArray(projArr) ? projArr : [projArr]
      let projStatus = 'no projet'
      if (projList.length > 0 && projList[0]?.id && projData) {
        const { error: projErr } = await supabase.from('projets').update(projData).eq('id', projList[0].id)
        projStatus = projErr ? 'err: ' + projErr.message : 'updated'
      } else if (projData) {
        const { error: projErr } = await supabase.from('projets').insert({ ...projData, dossier_id: d.id })
        projStatus = projErr ? 'err: ' + projErr.message : 'inserted'
      }

      results.push({ ref: d.reference, name: fullName, emp: empErr ? 'err: ' + empErr.message : 'updated', proj: projStatus })
    }

    return NextResponse.json({ total: dossiers.length, results })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
