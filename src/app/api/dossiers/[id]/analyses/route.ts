import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { matchBanques } from '@/data/banques-criteres'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function clamp(v: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(v))) }

function computeScoring(dossier: any, projet: any, emprunteurs: any[], charges: any[]) {
  let totalRevenus = 0
  let totalChargesEmprunteur = 0
  let mainContrat = 'CDI'
  let mainAnciennete = 36
  for (const emp of emprunteurs) {
    totalRevenus += (emp.salaire_net_mensuel || 0) + (emp.autres_revenus || 0) + (emp.revenus_locatifs || 0)
    totalChargesEmprunteur += (emp.credits_en_cours || 0) + (emp.pension_versee || 0) + (emp.autres_charges || 0)
    if (!emp.est_co_emprunteur) {
      mainContrat = emp.type_contrat || 'CDI'
      mainAnciennete = emp.anciennete_mois || 36
    }
  }
  if (totalRevenus === 0) totalRevenus = 3500

  let totalChargesDossier = 0
  for (const c of charges) { totalChargesDossier += (c.mensualite || 0) }
  const totalCharges = totalChargesEmprunteur + totalChargesDossier

  const prixAchat = projet?.prix_achat || projet?.prix_bien || 250000
  const travaux = projet?.travaux || 0
  const fraisNotaire = projet?.frais_notaire || Math.round(prixAchat * 0.075)
  const coutTotal = prixAchat + travaux + fraisNotaire
  const apport = projet?.apport || 0
  const duree = projet?.duree_souhaitee || 240
  const tauxAnnuel = projet?.taux_estime ? projet.taux_estime / 100 : 0.035
  const loyer = dossier.loyer_actuel || 900
  const estInvestissement = (projet?.usage || '').toLowerCase().includes('investissement') || (projet?.type_operation || '').includes('investissement')

  const tauxMensuel = tauxAnnuel / 12
  const besoin = coutTotal - apport
  const mensualite = besoin > 0 && tauxMensuel > 0 ? besoin * (tauxMensuel * Math.pow(1 + tauxMensuel, duree)) / (Math.pow(1 + tauxMensuel, duree) - 1) : 0
  const tauxEndettement = totalRevenus > 0 ? ((mensualite + totalCharges) / totalRevenus) * 100 : 0
  const resteAVivre = totalRevenus - mensualite - totalCharges
  const ratioApport = coutTotal > 0 ? (apport / coutTotal) * 100 : 0
  const sautDeCharge = mensualite - loyer
  const cdi = mainContrat === 'CDI' || mainContrat === 'Fonctionnaire'

  let score_stabilite = 50
  if (cdi) score_stabilite += 30
  if (mainAnciennete >= 36) score_stabilite += 20
  else if (mainAnciennete >= 12) score_stabilite += 10
  score_stabilite = clamp(score_stabilite)

  let score_endettement = 100
  if (tauxEndettement > 45) score_endettement = 10
  else if (tauxEndettement > 40) score_endettement = 25
  else if (tauxEndettement > 35) score_endettement = 45
  else if (tauxEndettement > 33) score_endettement = 65
  else if (tauxEndettement > 28) score_endettement = 80
  else score_endettement = 95
  score_endettement = clamp(score_endettement)

  let score_patrimoine = 30
  if (ratioApport >= 20) score_patrimoine = 95
  else if (ratioApport >= 15) score_patrimoine = 80
  else if (ratioApport >= 10) score_patrimoine = 65
  else if (ratioApport >= 5) score_patrimoine = 50
  score_patrimoine = clamp(score_patrimoine)

  let score_rav = 50
  if (resteAVivre >= 2000) score_rav = 95
  else if (resteAVivre >= 1500) score_rav = 80
  else if (resteAVivre >= 1200) score_rav = 65
  else if (resteAVivre >= 800) score_rav = 45
  else score_rav = 20
  score_rav = clamp(score_rav)

  let score_charge = 70
  if (sautDeCharge <= 0) score_charge = 95
  else if (sautDeCharge <= 200) score_charge = 80
  else if (sautDeCharge <= 500) score_charge = 60
  else score_charge = 35
  score_charge = clamp(score_charge)

  const score_global = clamp(score_stabilite * 0.15 + score_endettement * 0.30 + score_patrimoine * 0.20 + score_rav * 0.20 + score_charge * 0.15)

  const points_forts: string[] = []
  if (cdi && mainAnciennete >= 24) points_forts.push('Emploi stable en CDI avec ' + Math.round(mainAnciennete/12) + ' ans d\'anciennetÃ©')
  if (tauxEndettement <= 33) points_forts.push('Taux d\'endettement maÃ®trisÃ© Ã  ' + tauxEndettement.toFixed(1) + '% (seuil HCSF : 35%)')
  if (ratioApport >= 10) points_forts.push('Apport personnel solide de ' + ratioApport.toFixed(0) + '% du projet')
  if (resteAVivre >= 1500) points_forts.push('Reste Ã  vivre confortable de ' + Math.round(resteAVivre).toLocaleString('fr-FR') + ' â¬/mois')
  if (sautDeCharge <= 0) points_forts.push('Pas de saut de charge : mensualitÃ© infÃ©rieure au loyer actuel')
  if (emprunteurs.length > 1) points_forts.push('Co-emprunteur prÃ©sent â renforce la capacitÃ© d\'emprunt')
  if (points_forts.length === 0) points_forts.push('Dossier en cours d\'analyse approfondie')

  const points_vigilance: string[] = []
  if (tauxEndettement > 35) points_vigilance.push('Taux d\'endettement de ' + tauxEndettement.toFixed(1) + '% dÃ©passe le seuil HCSF de 35%')
  if (ratioApport < 10) points_vigilance.push('Apport faible (' + ratioApport.toFixed(0) + '%) â risque de refus sans garanties complÃ©mentaires')
  if (resteAVivre < 1200) points_vigilance.push('Reste Ã  vivre insuffisant (' + Math.round(resteAVivre).toLocaleString('fr-FR') + ' â¬) â seuil recommandÃ© 1 200 â¬')
  if (sautDeCharge > 500) points_vigilance.push('Saut de charge important de ' + Math.round(sautDeCharge).toLocaleString('fr-FR') + ' â¬/mois')
  if (mainAnciennete < 12) points_vigilance.push('AnciennetÃ© professionnelle insuffisante (moins de 12 mois)')
  if (duree > 300) points_vigilance.push('DurÃ©e d\'emprunt longue (' + Math.round(duree/12) + ' ans) â impact sur le coÃ»t total du crÃ©dit')

  // Match against real bank criteria
  const banquesMatch = matchBanques({
    revenus: totalRevenus,
    taux_endettement: tauxEndettement,
    ratio_apport: ratioApport,
    duree_mois: duree,
    anciennete_mois: mainAnciennete,
    type_contrat: mainContrat,
    est_investissement: estInvestissement,
  })

  const banquesEligibles = banquesMatch.filter(b => b.eligible).map(b => b.banque.nom)
  const banquesProches = banquesMatch.filter(b => !b.eligible && b.score >= 60).map(b => ({
    nom: b.banque.nom,
    raisons: b.raisons_refus,
  }))
  const meilleuresBanques = banquesMatch.slice(0, 5)

  let lecture = 'Dossier analysÃ© par le moteur CortIA. '
  if (score_global >= 75) lecture += 'Le profil emprunteur prÃ©sente des indicateurs solides avec un taux d\'endettement maÃ®trisÃ© et un patrimoine adÃ©quat. Ce dossier peut Ãªtre prÃ©sentÃ© aux grandes banques de dÃ©tail avec confiance. '
  else if (score_global >= 50) lecture += 'Le dossier est globalement acceptable mais prÃ©sente des axes d\'amÃ©lioration. Il est conseillÃ© de travailler sur le renforcement de l\'apport ou la rÃ©duction des charges avant la prÃ©sentation en banque. '
  else lecture += 'Le dossier nÃ©cessite une consolidation significative avant prÃ©sentation. Les principaux leviers sont l\'augmentation de l\'apport, la rÃ©duction du montant empruntÃ© ou l\'allongement de la durÃ©e. Un co-emprunteur pourrait Ã©galement renforcer le dossier. '

  if (banquesEligibles.length > 0) {
    lecture += 'Banques recommandÃ©es : ' + banquesEligibles.slice(0, 3).join(', ') + '. '
  } else if (banquesProches.length > 0) {
    lecture += 'Aucune banque ne correspond parfaitement au profil. Les plus proches : ' + banquesProches.slice(0, 2).map(b => b.nom).join(', ') + '. '
  }

  const bestTaux = meilleuresBanques.find(b => b.eligible)?.banque.taux_moyen
  if (bestTaux) lecture += 'Meilleur taux estimÃ© : ' + bestTaux.toFixed(2) + '%. '

  return {
    dossier_id: dossier.id, revenus_retenus: Math.round(totalRevenus), cout_total_projet: Math.round(coutTotal),
    besoin_financement: Math.round(besoin), mensualite_estimee: Math.round(mensualite),
    taux_endettement: Math.round(tauxEndettement * 10) / 10, reste_a_vivre: Math.round(resteAVivre),
    reste_a_vivre_uc: Math.round(resteAVivre * 0.7), ratio_apport: Math.round(ratioApport * 10) / 10,
    saut_de_charge: Math.round(sautDeCharge), score_global, score_stabilite, score_endettement,
    score_patrimoine, score_reste_a_vivre: score_rav, score_charge, points_forts, points_vigilance, lecture_metier: lecture,
    banques_eligibles: banquesEligibles,
    banques_proches: banquesProches.slice(0, 3),
    top_banques: meilleuresBanques.slice(0, 5).map(b => ({ nom: b.banque.nom, score: b.score, eligible: b.eligible, taux: b.banque.taux_moyen, frais: b.banque.frais_dossier })),
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // D'abord verifier s'il existe une analyse IA recente (genere_par_ia = true)
    const { data: existingIA } = await supabase
      .from('analyses_financieres')
      .select('*')
      .eq('dossier_id', params.id)
      .eq('genere_par_ia', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (existingIA && existingIA.score_global) {
      // Une analyse IA existe, on la retourne en complement de banques
      const { data: dossier } = await supabase.from('dossiers').select('*, emprunteurs(*), projets(*), charges(*)').eq('id', params.id).single()
      if (dossier) {
        const projets = Array.isArray(dossier.projets) ? dossier.projets : (dossier.projets ? [dossier.projets] : [])
        const emprunteurs = Array.isArray(dossier.emprunteurs) ? dossier.emprunteurs : (dossier.emprunteurs ? [dossier.emprunteurs] : [])
        const charges = Array.isArray(dossier.charges) ? dossier.charges : (dossier.charges ? [dossier.charges] : [])
        const scoring = computeScoring(dossier, projets[0] || null, emprunteurs, charges)
        // Merger: garder scores IA mais ajouter donnees banques
        return NextResponse.json({
          ...existingIA,
          banques_eligibles: scoring.banques_eligibles,
          banques_proches: scoring.banques_proches,
          top_banques: scoring.top_banques,
          cout_total_projet: scoring.cout_total_projet,
          revenus_retenus: existingIA.revenus_nets_mensuels_total || scoring.revenus_retenus,
        })
      }
    }

    const { data: dossier, error: dErr } = await supabase.from('dossiers').select('*, emprunteurs(*), projets(*), charges(*)').eq('id', params.id).single()
    if (dErr || !dossier) return NextResponse.json({ error: 'Dossier non trouve' }, { status: 404 })

    const projets = Array.isArray(dossier.projets) ? dossier.projets : (dossier.projets ? [dossier.projets] : [])
    const emprunteurs = Array.isArray(dossier.emprunteurs) ? dossier.emprunteurs : (dossier.emprunteurs ? [dossier.emprunteurs] : [])
    const charges = Array.isArray(dossier.charges) ? dossier.charges : (dossier.charges ? [dossier.charges] : [])
    const scoring = computeScoring(dossier, projets[0] || null, emprunteurs, charges)

    try { const { data } = await supabase.from('analyses_financieres').upsert(scoring, { onConflict: 'dossier_id' }).select().single(); if (data) return NextResponse.json(data) } catch {}
    try { const { data } = await supabase.from('analyses_financieres').insert(scoring).select().single(); if (data) return NextResponse.json(data) } catch {}
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
