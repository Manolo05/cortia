import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function clamp(v: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(v))) }

function computeScoring(dossier: any) {
  const revenus = dossier.revenus_mensuels || dossier.montant_revenus || 3500
  const charges = dossier.charges_mensuelles || dossier.montant_charges || 800
  const montant = dossier.montant || dossier.montant_projet || 250000
  const apport = dossier.apport || dossier.montant_apport || 0
  const duree = dossier.duree_mois || dossier.duree_pret || 240
  const loyer = dossier.loyer_actuel || 900
  const cdi = dossier.type_contrat === 'CDI' || dossier.situation_pro === 'CDI' || true
  const anciennete = dossier.anciennete_mois || dossier.anciennete || 36

  const taux_annuel = 0.035
  const taux_mensuel = taux_annuel / 12
  const besoin = montant - apport
  const mensualite = besoin > 0 ? besoin * (taux_mensuel * Math.pow(1 + taux_mensuel, duree)) / (Math.pow(1 + taux_mensuel, duree) - 1) : 0
  const taux_endettement = revenus > 0 ? ((mensualite + charges) / revenus) * 100 : 0
  const reste_a_vivre = revenus - mensualite - charges
  const ratio_apport = montant > 0 ? (apport / montant) * 100 : 0
  const saut_de_charge = mensualite - loyer
  const rav_uc = reste_a_vivre * 0.7

  // 1. Stabilite professionnelle (15%)
  let score_stabilite = 50
  if (cdi) score_stabilite += 30
  if (anciennete >= 36) score_stabilite += 20
  else if (anciennete >= 12) score_stabilite += 10
  score_stabilite = clamp(score_stabilite)

  // 2. Taux endettement (30%) - seuil HCSF 35%
  let score_endettement = 100
  if (taux_endettement > 45) score_endettement = 10
  else if (taux_endettement > 40) score_endettement = 25
  else if (taux_endettement > 35) score_endettement = 45
  else if (taux_endettement > 33) score_endettement = 65
  else if (taux_endettement > 28) score_endettement = 80
  else score_endettement = 95
  score_endettement = clamp(score_endettement)

  // 3. Patrimoine (20%)
  let score_patrimoine = 30
  if (ratio_apport >= 20) score_patrimoine = 95
  else if (ratio_apport >= 15) score_patrimoine = 80
  else if (ratio_apport >= 10) score_patrimoine = 65
  else if (ratio_apport >= 5) score_patrimoine = 50
  score_patrimoine = clamp(score_patrimoine)

  // 4. Reste a vivre (20%)
  let score_rav = 50
  if (reste_a_vivre >= 2000) score_rav = 95
  else if (reste_a_vivre >= 1500) score_rav = 80
  else if (reste_a_vivre >= 1200) score_rav = 65
  else if (reste_a_vivre >= 800) score_rav = 45
  else score_rav = 20
  score_rav = clamp(score_rav)

  // 5. Saut de charge (15%)
  let score_charge = 70
  if (saut_de_charge <= 0) score_charge = 95
  else if (saut_de_charge <= 200) score_charge = 80
  else if (saut_de_charge <= 500) score_charge = 60
  else score_charge = 35
  score_charge = clamp(score_charge)

  const score_global = clamp(
    score_stabilite * 0.15 + score_endettement * 0.30 + score_patrimoine * 0.20 + score_rav * 0.20 + score_charge * 0.15
  )

  const points_forts: string[] = []
  if (cdi && anciennete >= 24) points_forts.push('Emploi stable en CDI avec ' + Math.round(anciennete/12) + ' ans d\'anciennete')
  if (taux_endettement <= 33) points_forts.push('Taux d\'endettement maitrise a ' + taux_endettement.toFixed(1) + '% (seuil HCSF: 35%)')
  if (ratio_apport >= 10) points_forts.push('Apport personnel solide de ' + ratio_apport.toFixed(0) + '% du projet')
  if (reste_a_vivre >= 1500) points_forts.push('Reste a vivre confortable de ' + Math.round(reste_a_vivre) + ' EUR/mois')
  if (saut_de_charge <= 0) points_forts.push('Pas de saut de charge : mensualite inferieure au loyer actuel')
  if (points_forts.length === 0) points_forts.push('Dossier en cours d\'analyse approfondie')

  const points_vigilance: string[] = []
  if (taux_endettement > 35) points_vigilance.push('Taux d\'endettement de ' + taux_endettement.toFixed(1) + '% depasse le seuil HCSF de 35%')
  if (ratio_apport < 10) points_vigilance.push('Apport faible (' + ratio_apport.toFixed(0) + '%) - risque de refus sans garanties complementaires')
  if (reste_a_vivre < 1200) points_vigilance.push('Reste a vivre insuffisant (' + Math.round(reste_a_vivre) + ' EUR) - seuil recommande 1200 EUR')
  if (saut_de_charge > 500) points_vigilance.push('Saut de charge important de ' + Math.round(saut_de_charge) + ' EUR/mois')
  if (anciennete < 12) points_vigilance.push('Anciennete professionnelle insuffisante (moins de 12 mois)')

  let lecture = 'Dossier analyse par le moteur CortIA. '
  if (score_global >= 75) lecture += 'Le profil emprunteur presente des indicateurs solides avec un taux d\'endettement maitrise et un patrimoine adequat. Ce dossier peut etre presente aux grandes banques de detail avec confiance. Recommandation : prioriser les banques mutualistes pour obtenir les meilleures conditions.'
  else if (score_global >= 50) lecture += 'Le dossier est globalement acceptable mais presente des axes d\'amelioration. Il est conseille de travailler sur le renforcement de l\'apport ou la reduction des charges avant la presentation en banque. Les banques en ligne peuvent offrir plus de flexibilite sur ce type de profil.'
  else lecture += 'Le dossier necessite une consolidation significative avant presentation. Les principaux leviers sont l\'augmentation de l\'apport, la reduction du montant emprunte ou l\'allongement de la duree. Un co-emprunteur pourrait egalement renforcer le dossier.'

  return {
    dossier_id: dossier.id, revenus_retenus: Math.round(revenus), cout_total_projet: Math.round(montant),
    besoin_financement: Math.round(besoin), mensualite_estimee: Math.round(mensualite),
    taux_endettement: Math.round(taux_endettement * 10) / 10, reste_a_vivre: Math.round(reste_a_vivre),
    reste_a_vivre_uc: Math.round(rav_uc), ratio_apport: Math.round(ratio_apport * 10) / 10,
    saut_de_charge: Math.round(saut_de_charge), score_global, score_stabilite, score_endettement,
    score_patrimoine, score_reste_a_vivre: score_rav, score_charge, points_forts, points_vigilance, lecture_metier: lecture,
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: dossier, error: dErr } = await supabase.from('dossiers').select('*').eq('id', params.id).single()
    if (dErr || !dossier) return NextResponse.json({ error: 'Dossier non trouve' }, { status: 404 })
    const scoring = computeScoring(dossier)
    try {
      const { data } = await supabase.from('analyses_financieres').upsert(scoring, { onConflict: 'dossier_id' }).select().single()
      if (data) return NextResponse.json(data)
    } catch {}
    try {
      const { data } = await supabase.from('analyses_financieres').insert(scoring).select().single()
      if (data) return NextResponse.json(data)
    } catch {}
    return NextResponse.json(scoring)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from('analyses_financieres').select('*').eq('dossier_id', params.id).order('created_at', { ascending: false }).limit(1).single()
    if (error) return NextResponse.json({ error: 'Aucune analyse' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
