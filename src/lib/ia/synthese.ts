import { getOpenAIClient, CONFIG_SYNTHESE } from './client'
import { SYSTEM_PROMPT_SYNTHESE, buildPromptSynthese } from './prompts-synthese'
import type { DonneesSynthese, SyntheseGenereeIA } from './types-synthese'

/**
 * Génère une synthèse IA complète du dossier
 */
export async function genererSyntheseIA(donnees: DonneesSynthese): Promise<SyntheseGenereeIA> {
  const openai = getOpenAIClient()
  const prompt = buildPromptSynthese(donnees)

  const response = await openai.chat.completions.create({
    ...CONFIG_SYNTHESE,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_SYNTHESE },
      { role: 'user', content: prompt },
    ],
  })

  const content_response = response.choices[0]?.message?.content
  if (!content_response) {
    throw new Error('Aucune réponse de l\'IA')
  }

  try {
    const cleanContent = content_response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleanContent) as SyntheseGenereeIA
  } catch {
    throw new Error('Impossible de parser la synthèse IA')
  }
}

/**
 * Convertit la synthèse IA en Markdown
 */
export function synthesesVersMarkdown(synthese: SyntheseGenereeIA): string {
  const recommandationLabels: Record<string, string> = {
    accord_recommande: '✅ Accord recommandé',
    accord_sous_conditions: '⚠️ Accord sous conditions',
    etude_approfondie: '🔍 Étude approfondie recommandée',
    refus_recommande: '❌ Refus recommandé',
  }

  let markdown = `# ${synthese.titre}\n\n`
  markdown += `## Résumé exécutif\n\n${synthese.resume_executif}\n\n`

  for (const section of synthese.sections) {
    markdown += `## ${section.titre}\n\n${section.contenu}\n\n`
  }

  markdown += `## Conclusion\n\n${synthese.conclusion}\n\n`
  markdown += `---\n\n**Recommandation : ${recommandationLabels[synthese.recommandation_finale] || synthese.recommandation_finale}**\n`

  return markdown
}
