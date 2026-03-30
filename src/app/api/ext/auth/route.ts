import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Authentification pour l'extension Chrome
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('nom_complet, role, cabinet_id')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        nom_complet: profil?.nom_complet,
        role: profil?.role,
        cabinet_id: profil?.cabinet_id,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
