import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BANQUES_CRITERES } from '@/data/banques-criteres'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const e = rateLimitMap.get(ip)
  if (!e || now > e.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); return true }
  if (e.count >= 20) return false
  e.count++
  return true
}
function validateInput(b: any) {
  if (!b?.dossierId || typeof b.dossierId !== 'string' || !/^[0-9a-f-]{36}$/.test(b.dossierId)) return { ok: false, err: 'dossierId invalide' }
  if (!Array.isArray(b.messages) || b.messages.length > 20) return { ok: false, err: 'messages invalide' }
  for (const m of b.messages) { if (!['user','assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 5000) return { ok: false, err: 'message invalide' } }
  return { ok: true }
}

async function getDossierContext(dossierId: string) {
  const [dossierRes, projetRes, emprunteursRes, analyseRes, docsRes] = await Promise.all([
    supabase.from('dossiers').select('*').eq('id', dossierId).single(),
    supabase.from('projets').select('*').eq('dossier_id', dossierId).single(),
    supabase.from('emprunteurs').select('*').eq('dossier_id', dossierId),
    supabase.from('analyses_financieres').select('*').eq('dossier_id', dossierId).single(),
    supabase.from('documents').select('id, nom_fichier, type_document, statut_verification').eq('dossier_id', dossierId),
  ])

  return {
    dossier: dossierRes.data,
    projet: projetRes.data,
    emprunteurs: emprunteursRes.data || [],
    analyse: analyseRes.data,
    documents: docsRes.data || [],
  }
}

function buildSystemPrompt(context: Awaited<ReturnType<typeof getDossierContext>>) {
  const { dossier, projet, emprunteurs, analyse, documents } = context
  const emp = emprunteurs[0]

  const banquesInfo = BANQUES_CRITERES.map(b => 
    `- ${b.nom}: endettement max ${b.taux_endettement_max}%, apport min ${b.apport_minimum_pct}%, ` +
    `dur\u00e9e max ${b.duree_max_mois} mois, taux moyen ${b.taux_moyen}%, ` +
    `CDD: ${b.accepte_cdd ? 'oui' : 'non'}, ind\u00e9pendant: ${b.accepte_independant ? 'oui' : 'non'}, ` +
    `investissement locatif: ${b.accepte_investissement_locatif ? 'oui' : 'non'}, ` +
    `points forts: ${b.points_forts.join(', ')}`
  ).join('\n')

  const docsListe = documents.map(d => `- ${d.nom_fichier} (${d.type_document || 'non class\u00e9'}) : ${d.statut_verification}`).join('\n')

  return `Tu es l'assistant IA de CortIA, un logiciel pour courtiers en cr\u00e9dit immobilier (IOBSP).
Tu aides le courtier \u00e0 analyser et optimiser ses dossiers de pr\u00eat immobilier.

## Dossier en cours
- R\u00e9f\u00e9rence : ${dossier?.reference || 'N/A'}
- Client : ${dossier?.nom_client || 'N/A'}
- Statut : ${dossier?.statut || 'N/A'}
- Type : ${projet?.type_projet || 'N/A'}

## Emprunteur principal
- Nom : ${emp?.prenom || ''} ${emp?.nom || ''}
- Situation : ${emp?.type_contrat || 'N/A'}, anciennet\u00e9 ${emp?.anciennete_mois || 'N/A'} mois
- Revenus nets : ${emp?.revenus_nets_mensuels || 'N/A'} \u20ac/mois
- Charges : ${emp?.charges_mensuelles || 0} \u20ac/mois

## Projet immobilier
- Montant du bien : ${projet?.montant_projet || 'N/A'} \u20ac
- Montant emprunt\u00e9 : ${projet?.montant_emprunt || 'N/A'} \u20ac
- Apport personnel : ${projet?.apport_personnel || 'N/A'} \u20ac
- Dur\u00e9e souhait\u00e9e : ${projet?.duree_mois || 'N/A'} mois

## Analyse financi\u00e8re
- Score global : ${analyse?.score_global || 'N/A'}/100
- Taux d'endettement : ${analyse?.taux_endettement || 'N/A'}%
- Reste \u00e0 vivre : ${analyse?.reste_a_vivre || 'N/A'} \u20ac/mois
- Mensualit\u00e9 estim\u00e9e : ${analyse?.mensualite_estimee || 'N/A'} \u20ac
- Points forts : ${(analyse?.points_forts || []).join(', ') || 'Aucun'}
- Points de vigilance : ${(analyse?.points_vigilance || []).join(', ') || 'Aucun'}
- Lecture m\u00e9tier : ${analyse?.lecture_metier || 'Non disponible'}

## Documents fournis
${docsListe || 'Aucun document'}

## Crit\u00e8res des 12 banques partenaires
${banquesInfo}

## R\u00e8gles
- R\u00e9ponds toujours en fran\u00e7ais
- Sois pr\u00e9cis et concis, comme un analyste financier
- Cite toujours les donn\u00e9es du dossier quand tu les utilises
- Si tu recommandes une banque, explique pourquoi avec les crit\u00e8res
- Ne fais jamais de promesse d'acceptation \u2014 tu donnes des probabilit\u00e9s
- Si une information manque, dis-le clairement
- Formate tes r\u00e9ponses avec des paragraphes courts et lisibles`
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) return new Response(JSON.stringify({ error: 'Trop de requ\u00eates' }), { status: 429 })
    const body = await req.json()
    const v = validateInput(body)
    if (!v.ok) return new Response(JSON.stringify({ error: v.err }), { status: 400 })
    const { messages, dossierId } = body

    const context = await getDossierContext(dossierId)
    const systemPrompt = buildSystemPrompt(context)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages.slice(-10),
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return new Response(JSON.stringify({ error: 'Erreur API IA' }), { status: 500 })
    }

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
                }
              } catch {}
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 })
  }
}
