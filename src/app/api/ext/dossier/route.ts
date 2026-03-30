import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererReference } from '@/lib/utils/format'

async function verifyExtensionToken(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('cabinet_id, role')
    .eq('id', user.id)
    .single()

  return { user, profil }
}

export async function GET(request: Request) {
  try {
    const auth = await verifyExtensionToken(request)
    if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = await createClient()
    const { data } = await supabase
      .from('dossiers')
      .select(`id, reference, statut, created_at, emprunteurs:emprunteurs(prenom, nom)`)
      .eq('cabinet_id', auth.profil?.cabinet_id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyExtensionToken(request)
    if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await request.json()
    const supabase = await createClient()
    const reference = genererReference()

    const { data, error } = await supabase
      .from('dossiers')
      .insert({
        cabinet_id: auth.profil?.cabinet_id,
        courtier_id: auth.user.id,
        reference,
        statut: 'nouveau',
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 })
  }
}
