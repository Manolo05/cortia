import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some(b => b.name === 'documents')

    if (!exists) {
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 10485760,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ message: 'Bucket created', data })
    }

    return NextResponse.json({ message: 'Bucket already exists' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ buckets: buckets?.map(b => b.name) || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
