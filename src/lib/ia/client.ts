import OpenAI from 'openai'

let clientInstance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!clientInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    clientInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return clientInstance
}

export const MODELE_ANALYSE = 'gpt-4o'
export const MODELE_SYNTHESE = 'gpt-4o'
export const MODELE_EXTRACTION = 'gpt-4o-mini'

export const CONFIG_ANALYSE = {
  model: MODELE_ANALYSE,
  temperature: 0.3,
  max_tokens: 3000,
}

export const CONFIG_SYNTHESE = {
  model: MODELE_SYNTHESE,
  temperature: 0.4,
  max_tokens: 4000,
}

export const CONFIG_EXTRACTION = {
  model: MODELE_EXTRACTION,
  temperature: 0.1,
  max_tokens: 2000,
}
