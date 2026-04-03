import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CabinetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('*, cabinet:cabinets(*)')
    .eq('id', user!.id)
    .single()

  const { data: membres } = await supabase
    .from('profils_utilisateurs')
    .select('id, nom_complet, email, role, created_at')
    .eq('cabinet_id', profil?.cabinet_id)
    .order('created_at')

  const cabinet = profil?.cabinet

  return (
    <div style={{ padding: '1.5rem', maxWidth: '56rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Mon cabinet</h1>

      {/* Infos cabinet */}
      <div className="cortia-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{cabinet?.nom}</h2>
            {cabinet?.adresse && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{cabinet.adresse}</p>}
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Plan {cabinet?.plan || 'starter'}</p>
        </div>
      </div>

      {/* Membres */}
      <div className="cortia-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontWeight: 600, color: '#111827' }}>Membres ({membres?.length || 0})</h2>
          <Link href="/cabinet/membres" className="cortia-button-primary" style={{ fontSize: '0.875rem' }}>
            + Inviter
          </Link>
        </div>
        <div>
          {membres?.map(membre => (
            <div key={membre.id} style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f9fafb' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#111827' }}>{membre.nom_complet}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{membre.email}</p>
              </div>
              <span style={{
                padding: '0.125rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
                ...(membre.role === 'admin'
                  ? { background: '#f3e8ff', color: '#7e22ce' }
                  : membre.role === 'courtier'
                  ? { background: '#dbeafe', color: '#1d4ed8' }
                  : { background: '#f3f4f6', color: '#4b5563' })
              }}>
                {membre.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
