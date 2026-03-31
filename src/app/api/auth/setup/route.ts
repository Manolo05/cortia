import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

          const body = await request.json()
          const { nomComplet, nomCabinet } = body

          // Vérifier si profil existe déjà
          const { data: existingProfil } = await supabase
            .from('profils_utilisateurs')
            .select('id, cabinet_id')
            .eq('id', user.id)
            .single()

          if (existingProfil?.cabinet_id) {
                  return NextResponse.json({ success: true, alreadyExists: true })
                }

          // Créer le cabinet
          const { data: cabinet, error: cabinetError } = await supabase
            .from('cabinets')
            .insert({
                      nom: nomCabinet || 'Mon Cabinet',
                      plan_abonnement: 'starter',
                    })
            .select()
            .single()

          if (cabinetError) {
                  console.error('Cabinet error:', cabinetError)
                  return NextResponse.json({ error: cabinetError.message }, { status: 500 })
                }

          // Créer ou mettre à jour le profil
          const { error: profilError } = await supabase
            .from('profils_utilisateurs')
            .upsert({
                      id: user.id,
                      cabinet_id: cabinet.id,
                      email: user.email,
                      nom_complet: nomComplet || user.email?.split('@')[0] || 'Courtier',
                      role: 'admin',
                    })

          if (profilError) {
                  console.error('Profil error:', profilError)
                  return NextResponse.json({ error: profilError.message }, { status: 500 })
                }

          return NextResponse.json({ success: true, cabinetId: cabinet.id })
        } catch (error: any) {
          console.error('Setup error:', error)
          return NextResponse.json({ error: error.message || 'Erreur setup' }, { status: 500 })
        }
  }
