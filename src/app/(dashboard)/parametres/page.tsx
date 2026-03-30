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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      <div className="cortia-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Mon profil</h2>
        <div className="space-y-4">
          <div>
            <label className="cortia-label">Nom complet</label>
            <input
              type="text"
              defaultValue={profil?.nom_complet}
              className="cortia-input"
              readOnly
            />
          </div>
          <div>
            <label className="cortia-label">Email</label>
            <input
              type="email"
              defaultValue={profil?.email}
              className="cortia-input"
              readOnly
            />
          </div>
          <div>
            <label className="cortia-label">Rôle</label>
            <input
              type="text"
              defaultValue={profil?.role}
              className="cortia-input"
              readOnly
            />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Pour modifier vos informations, contactez l'administrateur de votre cabinet.
        </p>
      </div>

      <div className="cortia-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Extension Chrome</h2>
        <p className="text-sm text-gray-600 mb-4">
          L'extension Chrome CortIA vous permet d'analyser des dossiers directement depuis les sites bancaires.
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700">Clé d'API personnelle</p>
          <p className="text-xs text-gray-500 mt-1">
            Utilisez votre adresse email et mot de passe pour connecter l'extension.
          </p>
        </div>
      </div>

      <div className="cortia-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sécurité</h2>
        <div className="space-y-3">
          <a href="/api/auth/signout" className="cortia-button-secondary w-full text-center block">
            Se déconnecter
          </a>
        </div>
      </div>
    </div>
  )
}
