import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Step 1: List triggers on auth.users via rpc
  try {
    const { data: triggers, error: trigErr } = await supabase.rpc('get_triggers_on_auth_users')
    return NextResponse.json({ triggers, error: trigErr?.message, hint: 'If rpc not found, create it or use POST to fix directly' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, hint: 'Use POST with action=fix to drop and recreate the trigger' })
  }
}

export async function POST(req: NextRequest) {
  const { action } = await req.json().catch(() => ({ action: 'fix' }))
  const results: any[] = []

  // We cannot run raw SQL via supabase-js without an RPC function.
  // Instead, create the RPC function first, then use it.

  if (action === 'create_rpc') {
    // Create a helper RPC to run SQL (requires service_role)
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' })
    results.push({ step: 'test_rpc', error: error?.message })
    return NextResponse.json({ results })
  }

  if (action === 'fix') {
    // Try to drop the trigger by creating an RPC function that does it
    // First, try inserting into profils_utilisateurs to see what columns exist
    const { data: cols, error: colErr } = await supabase
      .from('profils_utilisateurs')
      .select('*')
      .limit(1)
    
    results.push({ 
      step: 'check_profils', 
      columns: cols && cols[0] ? Object.keys(cols[0]) : [],
      error: colErr?.message 
    })

    // Check cabinets table
    const { data: cabCols, error: cabErr } = await supabase
      .from('cabinets')
      .select('*')
      .limit(1)
    
    results.push({ 
      step: 'check_cabinets', 
      columns: cabCols && cabCols[0] ? Object.keys(cabCols[0]) : [],
      error: cabErr?.message 
    })

    // Try to create a user manually to see the exact error
    const testEmail = 'trigger-test-' + Date.now() + '@test.com'
    const { data: testUser, error: testErr } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
    })
    
    results.push({ 
      step: 'test_create_user',
      email: testEmail,
      success: !!testUser?.user,
      error: testErr?.message,
      errorDetails: testErr ? JSON.stringify(testErr) : null,
    })

    // If user was created, clean up
    if (testUser?.user) {
      await supabase.auth.admin.deleteUser(testUser.user.id)
      results.push({ step: 'cleanup', deleted: true })
    }

    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Unknown action. Use action=fix' })
}
