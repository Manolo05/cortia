import { getOpenAIClient, CONFIG_ANALYSE } from './client'
import { SYSTEM_PROMPT_ANALYSE, buildPromptAnalyse } from './prompts'
import { calculerDossier } from '../calculs/engine'
import type { Emprunteur, Projet, AnalyseFinanciere } from '../types'

export interface ResultatAnalyseIA {
  points_forts: string[]
  points_vigilance: string[]
  recommandations: string[]
  commentaire_global: string
  niveau_risque: 'faible' | 'modere' | 'eleve'
  probabilite_accord: 'forte' | 'bonne' | 'moyenne' | 'faible'
  banques_recommandees?: string[]
  conditions_suggerees?: {
    taux_negociable: string
    arguments_taux: string
    garanties_recommandees: string[]
  }
}

/**
 * Lance l'analyse IA d'un dossier de prêt
 */
export async function analyserDossierIA(
  emprunteurs: Emprunteur[],
  projet: Projet
): Promise<{ calculs: ReturnType<typeof calculerDossier>; ia: ResultatAnalyseIA }> {
  // 1. Calculs financiers
  const calculs = calculerDossier(emprunteurs, projet)

  // 2. Analyse IA
  const openai = getOpenAIClient()
  const prompt = buildPromptAnalyse(emprunteurs, projet, calculs)

  const response = await openai.chat.completions.create({
    ...CONFIG_ANALYSE,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_ANALYSE },
      { role: 'user', content: prompt },
    ],
  })

  const content_response = response.choices[0]?.message?.content
  if (!content_response) {
    throw new Error('Aucune réponse de l\'IA')
  }

  let iaResult: ResultatAnalyseIA
  try {
    // Nettoyer le JSON si nécessaire
    const cleanContent = content_response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    iaResult = JSON.parse(cleanContent)
  } catch {
    throw new Error('Impossible de parser la réponse IA')
  }

  // Enrichir les calculs avec les résultats IA
  const calculsEnrichis = {
    ...calculs,
    points_forts: [...calculs.points_forts, ...(iaResult.points_forts || [])],
    points_vigilance: [...calculs.points_vigilance, ...(iaResult.points_vigilance || [])],
    recommandations: [...calculs.recommandations, ...(iaResult.recommandations || [])],
  }

  return { calculs: calculsEnrichis, ia: iaResult }
}

/**
 * Convertit le résultat d'analyse en format AnalyseFinanciere pour la DB
 */
export function resultatsVersAnalyseDB(
  dossierId: string,
  calculs: ReturnType<typeof calculerDossier>,
  generePar: boolean = true
): Omit<AnalyseFinanciere, 'id' | 'created_at' | 'updated_at'> {
  return {
    dossier_id: dossierId,
    revenus_nets_mensuels_total: calculs.revenus_nets_mensuels_total,
    charges_mensuelles_total: calculs.charges_mensuelles_total,
    reste_a_vivre: calculs.reste_a_vivre,
    taux_endettement_actuel: calculs.taux_endettement_actuel,
    taux_endettement_projet: calculs.taux_endettement_projet,
    capacite_emprunt_max: calculs.capacite_emprunt_max,
    score_global: calculs.score_global,
    score_revenus: calculs.score_revenus,
    score_stabilite: calculs.score_stabilite,
    score_endettement: calculs.score_endettement,
    score_apport: calculs.score_apport,
    score_patrimoine: calculs.score_patrimoine,
    taux_apport: calculs.taux_apport,
    mensualite_estimee: calculs.mensualite_estimee,
    points_forts: calculs.points_forts,
    points_vigilance: calculs.points_vigilance,
    recommandations: calculs.recommandations,
    genere_par_ia: generePar,
    version_modele: 'gpt-4o',
  }
}
