import { Sidebar } from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'
import { MobileMenuWrapper } from '@/components/layout/mobile-menu'

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
  } catch (e) {}
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await ensureUserSetup(supabase, user)
  }

  return (
    <MobileMenuWrapper>
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </MobileMenuWrapper>
  )
}
