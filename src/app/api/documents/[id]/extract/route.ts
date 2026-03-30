import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient, CONFIG_EXTRACTION } from '@/lib/ia/client'
import { SYSTEM_PROMPT_EXTRACTION, buildPromptExtraction } from '@/lib/ia/prompts'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (!document) return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })

    // Pour un vrai OCR, il faudrait utiliser un service comme AWS Textract
    // Ici on fait une extraction simple via GPT-4V si c'est une image
    const { contenuOCR } = await request.json().catch(() => ({ contenuOCR: '' }))

    if (!contenuOCR) {
      return NextResponse.json({ error: 'Contenu OCR requis' }, { status: 400 })
    }

    const openai = getOpenAIClient()
    const prompt = buildPromptExtraction(document.type_document, contenuOCR)

    const response = await openai.chat.completions.create({
      ...CONFIG_EXTRACTION,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_EXTRACTION },
        { role: 'user', content: prompt },
      ],
    })

    const content_response = response.choices[0]?.message?.content
    let extracted = {}
    try {
      extracted = JSON.parse(content_response?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}')
    } catch {
      extracted = { raw: content_response }
    }

    // Sauvegarder les données extraites
    await supabase
      .from('documents')
      .update({ contenu_extrait: extracted })
      .eq('id', id)

    return NextResponse.json({ extracted })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur extraction' }, { status: 500 })
  }
}
