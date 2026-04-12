import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'autre'
    const nom = (formData.get('nom') as string) || file?.name || 'Document'
    const statut = (formData.get('statut') as string) || 'en_attente'

    let url_stockage = 'pending'

    if (file && file.size > 0) {
      const fileName = params.id + '/' + Date.now() + '_' + file.name
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 400 })
      }

      url_stockage = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        dossier_id: params.id,
        nom_fichier: nom,
        type_document: type,
        statut_verification: statut,
        url_stockage,
        taille_fichier: file?.size || null,
        mime_type: file?.type || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      id: data.id,
      dossier_id: data.dossier_id,
      nom: data.nom_fichier,
      type: data.type_document,
      url: data.url_stockage,
      taille: data.taille_fichier,
      statut: data.statut_verification,
      created_at: data.created_at,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
