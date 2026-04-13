import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, password, nomComplet, nomCabinet } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // 1. Create user with admin API (bypasses triggers)
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom_complet: nomComplet || email.split('@')[0],
        nom_cabinet: nomCabinet || 'Mon Cabinet',
      },
    })

    if (authError) {
      // Handle duplicate email
      if (authError.message.includes('already') || authError.message.includes('exists')) {
        return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    const userId = userData.user.id

    // 2. Create cabinet
    let cabinetId = null
    try {
      const { data: cabinet } = await supabaseAdmin
        .from('cabinets')
        .insert({ nom: nomCabinet || 'Mon Cabinet', plan_abonnement: 'starter' })
        .select('id')
        .single()
      if (cabinet) cabinetId = cabinet.id
    } catch {}

    // 3. Create user profile
    try {
      await supabaseAdmin
        .from('profils_utilisateurs')
        .upsert({
          id: userId,
          email,
          nom_complet: nomComplet || email.split('@')[0],
          role: 'admin',
          cabinet_id: cabinetId,
        })
    } catch {}

    return NextResponse.json({
      success: true,
      user: { id: userId, email },
      message: 'Compte créé avec succès',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
