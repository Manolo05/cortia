import { createClient } from '@/lib/supabase/server'

export default async function ParametresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div style={{ padding: '1.5rem', maxWidth: '42rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Paramètres</h1>

      {/* Profil section */}
      <div className="cortia-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Profil</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Nom</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{profil?.nom_complet || '-'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user?.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Rôle</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{profil?.role}</p>
          </div>
        </div>
      </div>

      {/* Extension Chrome section */}
      <div className="cortia-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Extension Chrome</h2>
        <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
          {"L'extension Chrome CortIA vous permet d'analyser des dossiers directement depuis les sites bancaires."}
        </p>
        <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{"Clé d'API personnelle"}</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {"Utilisez votre adresse email et mot de passe pour connecter l'extension."}
          </p>
        </div>
      </div>

      {/* Security section */}
      <div className="cortia-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{"Sécurité"}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a href="/api/auth/signout" className="cortia-button-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
            {"Se déconnecter"}
          </a>
        </div>
      </div>
    </div>
  )
}
