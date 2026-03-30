import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const dossierId = formData.get('dossier_id') as string
    const typeDocument = formData.get('type_document') as string
    const emprunteurId = formData.get('emprunteur_id') as string | null

    if (!file || !dossierId || !typeDocument) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Upload vers Supabase Storage
    const fileName = `${dossierId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Créer l'entrée en base
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        dossier_id: dossierId,
        emprunteur_id: emprunteurId || null,
        type_document: typeDocument,
        nom_fichier: file.name,
        url_stockage: uploadData.path,
        taille_fichier: file.size,
        mime_type: file.type,
        statut_verification: 'en_attente',
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json(document, { status: 201 })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error?.message || 'Erreur upload' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const dossierId = searchParams.get('dossier_id')

    let query = supabase.from('documents').select('*, emprunteur:emprunteurs(prenom, nom)').order('created_at', { ascending: false })
    if (dossierId) query = query.eq('dossier_id', dossierId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
