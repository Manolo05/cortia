import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) return NextResponse.json({ error: 'No service key' }, { status: 500 })

  // Step 1: List all triggers on auth.users
  const listRes = await fetch(supabaseUrl + '/rest/v1/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': 'Bearer ' + serviceKey,
    },
  })

  // Use the Supabase SQL API to find and fix triggers
  const sqlUrl = supabaseUrl.replace('.supabase.co', '.supabase.co') + '/pg'

  // Alternative: use the management API
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

  return NextResponse.json({
    projectRef,
    message: 'Use Supabase Dashboard SQL Editor to run: SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_schema = \'auth\' AND event_object_table = \'users\';',
    fix: 'Then DROP the failing trigger or fix its function',
  })
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]

  if (!projectRef || !serviceKey) {
    return NextResponse.json({ error: 'Missing config' }, { status: 500 })
  }

  // Use Supabase Management API to run SQL
  const sqlStatements = [
    // List triggers
    "SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_schema = 'auth' AND event_object_table = 'users';",
  ]

  const { action } = await req.json().catch(() => ({ action: 'list' }))

  if (action === 'fix') {
    // Drop the problematic trigger and recreate a safe version
    sqlStatements.push(
      "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;",
      "DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;",
      `CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profils_utilisateurs (id, email, nom_complet, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom_complet', split_part(NEW.email, '@', 1)),
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
      `CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();`
    )
  }

  const results = []
  for (const sql of sqlStatements) {
    try {
      const res = await fetch('https://api.supabase.com/v1/projects/' + projectRef + '/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + serviceKey,
        },
        body: JSON.stringify({ query: sql }),
      })
      const data = await res.json().catch(() => ({ status: res.status }))
      results.push({ sql: sql.substring(0, 80), status: res.status, data })
    } catch (e: any) {
      results.push({ sql: sql.substring(0, 80), error: e.message })
    }
  }

  return NextResponse.json({ results })
}
