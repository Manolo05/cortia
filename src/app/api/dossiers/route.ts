import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererReference } from '@/lib/utils/format'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('cabinet_id')
      .eq('id', user.id)
      .single()

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
      .eq('cabinet_id', profil?.cabinet_id)
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

    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('cabinet_id')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const reference = genererReference()

    const { data, error } = await supabase
      .from('dossiers')
      .insert({
        cabinet_id: profil?.cabinet_id,
        courtier_id: user.id,
        reference,
        statut: 'nouveau',
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
