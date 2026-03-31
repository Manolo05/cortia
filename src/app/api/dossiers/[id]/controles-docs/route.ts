import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { data, error } = await supabase
    .from('controles_docs')
    .select('*')
    .eq('dossier_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data || null)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const body = await req.json()

  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('cabinet_id')
    .eq('id', session.user.id)
    .single()

  // Delete existing and insert new
  await supabase.from('controles_docs').delete().eq('dossier_id', params.id)

  const { data, error } = await supabase
    .from('controles_docs')
    .insert({ ...body, dossier_id: params.id, cabinet_id: profil?.cabinet_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
