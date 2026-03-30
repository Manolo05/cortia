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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon cabinet</h1>

      {/* Infos cabinet */}
      <div className="cortia-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cabinet?.nom}</h2>
            {cabinet?.siret && <p className="text-sm text-gray-500 mt-1">SIRET : {cabinet.siret}</p>}
            {cabinet?.email && <p className="text-sm text-gray-500">{cabinet.email}</p>}
            {cabinet?.telephone && <p className="text-sm text-gray-500">{cabinet.telephone}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            cabinet?.plan_abonnement === 'pro' ? 'bg-purple-100 text-purple-700' :
            cabinet?.plan_abonnement === 'enterprise' ? 'bg-gold-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            Plan {cabinet?.plan_abonnement}
          </span>
        </div>
      </div>

      {/* Membres */}
      <div className="cortia-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Membres ({membres?.length || 0})</h2>
          <Link href="/cabinet/membres" className="cortia-button-primary text-sm">
            + Inviter
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {membres?.map(membre => (
            <div key={membre.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{membre.nom_complet}</p>
                <p className="text-sm text-gray-500">{membre.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                membre.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                membre.role === 'courtier' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {membre.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
