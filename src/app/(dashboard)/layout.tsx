import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'

async function ensureUserSetup(supabase: any, user: any) {
  try {
    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('id, cabinet_id')
      .eq('id', user.id)
      .single()

    if (profil?.cabinet_id) return

    const nomCabinet = user.user_metadata?.nom_cabinet || 'Mon Cabinet'
    const nomComplet = user.user_metadata?.nom_complet || user.email?.split('@')[0] || 'Courtier'

    const { data: cabinet } = await supabase
      .from('cabinets')
      .insert({ nom: nomCabinet, plan_abonnement: 'starter' })
      .select()
      .single()

    if (cabinet) {
      await supabase
        .from('profils_utilisateurs')
        .upsert({
          id: user.id,
          cabinet_id: cabinet.id,
          email: user.email,
          nom_complet: nomComplet,
          role: 'admin',
        })
    }
  } catch (e) {
    // Silent fail
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, ensure setup - but don’t block if not
  if (user) {
    await ensureUserSetup(supabase, user)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '220px', overflowY: 'auto', overflowX: 'hidden', minHeight: '100vh', background: 'var(--bg-app)' }}>
        {children}
      </main>
    </div>
  )
}
