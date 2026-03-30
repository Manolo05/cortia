/**
 * Moteur de calculs financiers pour les dossiers de prêt immobilier
 */

import type { Emprunteur, Projet } from '../types'

export interface ResultatCalcul {
  // Revenus
  revenus_nets_mensuels_total: number
  charges_mensuelles_total: number
  reste_a_vivre: number
  // Ratios
  taux_endettement_actuel: number
  taux_endettement_projet: number
  capacite_emprunt_max: number
  // Mensualité
  mensualite_estimee: number
  // Apport
  taux_apport: number
  // Scores
  score_global: number
  score_revenus: number
  score_stabilite: number
  score_endettement: number
  score_apport: number
  score_patrimoine: number
  // Points forts/faibles
  points_forts: string[]
  points_vigilance: string[]
  recommandations: string[]
}

/**
 * Calcule la mensualité d'un prêt
 */
export function calculerMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeAns: number
): number {
  const tauxMensuel = tauxAnnuel / 100 / 12
  const nbMensualites = dureeAns * 12
  
  if (tauxMensuel === 0) return montant / nbMensualites
  
  return montant * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) /
    (Math.pow(1 + tauxMensuel, nbMensualites) - 1)
}

/**
 * Calcule la capacité d'emprunt maximale
 */
export function calculerCapaciteEmprunt(
  revenusMensuels: number,
  chargesMensuelles: number,
  tauxEndettementMax = 35,
  tauxAnnuel = 4.0,
  dureeAns = 25
): number {
  const mensualiteMax = (revenusMensuels * tauxEndettementMax / 100) - chargesMensuelles
  if (mensualiteMax <= 0) return 0
  
  const tauxMensuel = tauxAnnuel / 100 / 12
  const nbMensualites = dureeAns * 12
  
  if (tauxMensuel === 0) return mensualiteMax * nbMensualites
  
  return mensualiteMax * (Math.pow(1 + tauxMensuel, nbMensualites) - 1) /
    (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites))
}

/**
 * Calcule les revenus totaux d'une liste d'emprunteurs
 */
export function calculerRevenusTotal(emprunteurs: Emprunteur[]): number {
  return emprunteurs.reduce((total, e) => {
    const salaire = e.salaire_net_mensuel || 0
    const autresRevenus = e.autres_revenus || 0
    const revenuLocatifs = e.revenus_locatifs || 0
    // Les revenus locatifs sont généralement pris en compte à 70%
    return total + salaire + autresRevenus + (revenuLocatifs * 0.7)
  }, 0)
}

/**
 * Calcule les charges totales d'une liste d'emprunteurs
 */
export function calculerChargesTotal(emprunteurs: Emprunteur[]): number {
  return emprunteurs.reduce((total, e) => {
    const credits = e.credits_en_cours || 0
    const pension = e.pension_versee || 0
    const autresCharges = e.autres_charges || 0
    // Le loyer actuel est compté seulement si pas de résidence principale
    return total + credits + pension + autresCharges
  }, 0)
}

/**
 * Score de revenus (0-100)
 */
function scoreRevenus(revenusMensuels: number): number {
  if (revenusMensuels >= 8000) return 100
  if (revenusMensuels >= 5000) return 85
  if (revenusMensuels >= 3500) return 70
  if (revenusMensuels >= 2500) return 55
  if (revenusMensuels >= 1800) return 40
  return 25
}

/**
 * Score de stabilité (basé sur le type de contrat)
 */
function scoreStabilite(emprunteurs: Emprunteur[]): number {
  const principalEmprunteur = emprunteurs.find(e => !e.est_co_emprunteur) || emprunteurs[0]
  if (!principalEmprunteur) return 50
  
  const typeContrat = principalEmprunteur.type_contrat?.toLowerCase() || ''
  const anciennete = principalEmprunteur.anciennete_emploi || 0
  
  let score = 50
  
  if (typeContrat.includes('cdi') || typeContrat.includes('fonctionnaire')) {
    score = 90
  } else if (typeContrat.includes('cdd')) {
    score = 50
  } else if (typeContrat.includes('independant') || typeContrat.includes('liberal')) {
    score = 60
  } else if (typeContrat.includes('interim')) {
    score = 35
  }
  
  // Bonus ancienneté
  if (anciennete >= 5) score = Math.min(100, score + 10)
  else if (anciennete >= 2) score = Math.min(100, score + 5)
  
  return score
}

/**
 * Score d'endettement (0-100)
 */
function scoreEndettement(tauxEndettementProjet: number): number {
  if (tauxEndettementProjet <= 20) return 100
  if (tauxEndettementProjet <= 25) return 90
  if (tauxEndettementProjet <= 30) return 75
  if (tauxEndettementProjet <= 33) return 60
  if (tauxEndettementProjet <= 35) return 45
  if (tauxEndettementProjet <= 40) return 25
  return 10
}

/**
 * Score d'apport (0-100)
 */
function scoreApport(tauxApport: number): number {
  if (tauxApport >= 30) return 100
  if (tauxApport >= 20) return 85
  if (tauxApport >= 10) return 65
  if (tauxApport >= 5) return 45
  return 25
}

/**
 * Score de patrimoine (0-100)
 */
function scorePatrimoine(emprunteurs: Emprunteur[], montantEmprunt: number): number {
  const epargneTotal = emprunteurs.reduce((sum, e) => sum + (e.epargne || 0), 0)
  const patrimoineImmo = emprunteurs.reduce((sum, e) => sum + (e.valeur_patrimoine_immo || 0), 0)
  const patrimoineTotal = epargneTotal + patrimoineImmo
  
  const ratioPatrimoine = patrimoineTotal / montantEmprunt
  
  if (ratioPatrimoine >= 1) return 100
  if (ratioPatrimoine >= 0.5) return 80
  if (ratioPatrimoine >= 0.3) return 65
  if (ratioPatrimoine >= 0.1) return 50
  return 35
}

/**
 * Moteur de calcul principal
 */
export function calculerDossier(
  emprunteurs: Emprunteur[],
  projet: Projet
): ResultatCalcul {
  // Revenus et charges
  const revenusMensuels = calculerRevenusTotal(emprunteurs)
  const chargesMensuelles = calculerChargesTotal(emprunteurs)
  const resteAVivre = revenusMensuels - chargesMensuelles
  
  // Taux d'endettement
  const tauxEndettementActuel = revenusMensuels > 0 
    ? (chargesMensuelles / revenusMensuels) * 100 
    : 0
  
  // Mensualité estimée (taux par défaut 4% si non fourni)
  const taux = projet.taux_interet_cible || 4.0
  const tauxAssurance = projet.taux_assurance || 0.36
  const mensualiteCapital = calculerMensualite(projet.montant_emprunt, taux, projet.duree_souhaitee)
  const mensualiteAssurance = (projet.montant_emprunt * tauxAssurance / 100) / 12
  const mensualiteTotal = mensualiteCapital + mensualiteAssurance
  
  // Taux d'endettement avec projet
  const tauxEndettementProjet = revenusMensuels > 0
    ? ((chargesMensuelles + mensualiteTotal) / revenusMensuels) * 100
    : 0
  
  // Capacité d'emprunt
  const capaciteEmprunt = calculerCapaciteEmprunt(revenusMensuels, chargesMensuelles, 35, taux, projet.duree_souhaitee)
  
  // Taux d'apport
  const prixTotal = projet.prix_bien + (projet.montant_travaux || 0)
  const tauxApport = prixTotal > 0 ? (projet.apport_personnel / prixTotal) * 100 : 0
  
  // Calcul des scores
  const sRevenus = scoreRevenus(revenusMensuels)
  const sStabilite = scoreStabilite(emprunteurs)
  const sEndettement = scoreEndettement(tauxEndettementProjet)
  const sApport = scoreApport(tauxApport)
  const sPatrimoine = scorePatrimoine(emprunteurs, projet.montant_emprunt)
  
  // Score global pondéré
  const scoreGlobal = Math.round(
    sRevenus * 0.25 +
    sStabilite * 0.20 +
    sEndettement * 0.30 +
    sApport * 0.15 +
    sPatrimoine * 0.10
  )
  
  // Points forts et vigilance
  const pointsForts: string[] = []
  const pointsVigilance: string[] = []
  const recommandations: string[] = []
  
  if (sRevenus >= 70) pointsForts.push('Revenus mensuels solides')
  else pointsVigilance.push('Revenus mensuels à consolider')
  
  if (sStabilite >= 80) pointsForts.push('Situation professionnelle stable (CDI)')
  else if (sStabilite < 60) pointsVigilance.push('Stabilité professionnelle à vérifier')
  
  if (tauxEndettementProjet <= 33) pointsForts.push(`Taux d'endettement maîtrisé (${tauxEndettementProjet.toFixed(1)}%)`)
  else if (tauxEndettementProjet > 35) {
    pointsVigilance.push(`Taux d'endettement élevé (${tauxEndettementProjet.toFixed(1)}%)`)
    recommandations.push('Envisager une durée plus longue ou un apport supplémentaire pour réduire le taux d'endettement')
  }
  
  if (tauxApport >= 20) pointsForts.push(`Apport personnel significatif (${tauxApport.toFixed(0)}%)`)
  else if (tauxApport < 10) {
    pointsVigilance.push(`Apport personnel faible (${tauxApport.toFixed(0)}%)`)
    recommandations.push('Augmenter l'apport personnel pour améliorer les conditions de financement')
  }
  
  if (projet.montant_emprunt > capaciteEmprunt * 1.1) {
    pointsVigilance.push('Montant emprunté supérieur à la capacité théorique')
    recommandations.push(`La capacité d'emprunt estimée est de ${Math.round(capaciteEmprunt).toLocaleString('fr-FR')} €`)
  }
  
  return {
    revenus_nets_mensuels_total: Math.round(revenusMensuels),
    charges_mensuelles_total: Math.round(chargesMensuelles),
    reste_a_vivre: Math.round(resteAVivre),
    taux_endettement_actuel: Math.round(tauxEndettementActuel * 10) / 10,
    taux_endettement_projet: Math.round(tauxEndettementProjet * 10) / 10,
    capacite_emprunt_max: Math.round(capaciteEmprunt),
    mensualite_estimee: Math.round(mensualiteTotal),
    taux_apport: Math.round(tauxApport * 10) / 10,
    score_global: scoreGlobal,
    score_revenus: sRevenus,
    score_stabilite: sStabilite,
    score_endettement: sEndettement,
    score_apport: sApport,
    score_patrimoine: sPatrimoine,
    points_forts: pointsForts,
    points_vigilance: pointsVigilance,
    recommandations,
  }
}
