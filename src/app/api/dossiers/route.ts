import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererReference } from '@/lib/utils/format'

async function getOrCreateProfil(supabase: any, user: any) {
    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('cabinet_id, id')
      .eq('id', user.id)
      .single()

  if (profil?.cabinet_id) return profil

  // Auto-create cabinet + profil
  const nomCabinet = user.user_metadata?.nom_cabinet || 'Mon Cabinet'
    const nomComplet = user.user_metadata?.nom_complet || user.email?.split('@')[0] || 'Courtier'

  const { data: cabinet } = await supabase
      .from('cabinets')
      .insert({ nom: nomCabinet, plan_abonnement: 'starter' })
      .select()
      .single()

  if (!cabinet) return null

  await supabase.from('profils_utilisateurs').upsert({
        id: user.id,
        cabinet_id: cabinet.id,
        email: user.email,
        nom_complet: nomComplet,
        role: 'admin',
  })

  return { id: user.id, cabinet_id: cabinet.id }
}

export async function GET(request: Request) {
    try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

      const profil = await getOrCreateProfil(supabase, user)
          if (!profil?.cabinet_id) return NextResponse.json([])

      const { searchParams } = new URL(request.url)
          const statut = searchParams.get('statut')
          const courtier_id = searchParams.get('courtier_id')

      let query = supabase
            .from('dossiers')
            .select(`
                    id, reference, statut, created_at, updated_at, courtier_id,
                            emprunteurs:emprunteurs(id, prenom, nom, est_co_emprunteur),
                                    projet:projets(montant_emprunt, type_operation, ville_bien, prix_bien),
                                            courtier:profils_utilisateurs(nom_complet, email)
                                                  `)
            .eq('cabinet_id', profil.cabinet_id)
            .order('created_at', { ascending: false })

      if (statut) query = query.eq('statut', statut)
          if (courtier_id) query = query.eq('courtier_id', courtier_id)

      const { data, error } = await query
          if (error) throw error
          return NextResponse.json(data)
    } catch (error) {
          return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

      const profil = await getOrCreateProfil(supabase, user)
          if (!profil?.cabinet_id) {
                  return NextResponse.json({ error: 'Profil non configuré. Veuillez contacter le support.' }, { status: 400 })
          }

      const body = await request.json()
          const reference = genererReference()

      const { data, error } = await supabase
            .from('dossiers')
            .insert({
                      cabinet_id: profil.cabinet_id,
                      courtier_id: user.id,
                      reference,
                      statut: 'nouveau',
                      ...body,
            })
            .select()
            .single()

      if (error) {
              console.error('Dossier insert error:', error)
              throw error
      }
          return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
          return NextResponse.json({ error: error.message || 'Erreur lors de la création' }, { status: 500 })
    }
}
