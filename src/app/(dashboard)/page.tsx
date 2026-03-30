import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/dossier/status-badge'
import { formatDate, formatMontant } from '@/lib/utils/format'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Récupérer le profil
  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('*, cabinet:cabinets(*)')
    .eq('id', user!.id)
    .single()

  // Statistiques
  const { data: dossiers } = await supabase
    .from('dossiers')
    .select('id, statut, created_at, reference, emprunteurs:emprunteurs(prenom, nom), projet:projets(montant_emprunt)')
    .eq('cabinet_id', profil?.cabinet_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalDossiers } = await supabase
    .from('dossiers')
    .select('*', { count: 'exact', head: true })
    .eq('cabinet_id', profil?.cabinet_id)

  const { count: dossiersEnCours } = await supabase
    .from('dossiers')
    .select('*', { count: 'exact', head: true })
    .eq('cabinet_id', profil?.cabinet_id)
    .eq('statut', 'en_cours')

  const { count: dossiersAcceptes } = await supabase
    .from('dossiers')
    .select('*', { count: 'exact', head: true })
    .eq('cabinet_id', profil?.cabinet_id)
    .eq('statut', 'accepte')

  const stats = [
    { label: 'Total dossiers', value: totalDossiers || 0, color: 'blue' },
    { label: 'En cours', value: dossiersEnCours || 0, color: 'yellow' },
    { label: 'Acceptés', value: dossiersAcceptes || 0, color: 'green' },
    { label: 'Taux acceptation', value: totalDossiers ? `${Math.round((dossiersAcceptes || 0) / totalDossiers * 100)}%` : '0%', color: 'purple' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {profil?.nom_complet?.split(' ')[0] || 'Courtier'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {profil?.cabinet?.nom} — Voici votre tableau de bord
          </p>
        </div>
        <Link href="/dossiers/nouveau" className="cortia-button-primary">
          + Nouveau dossier
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="cortia-card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Dossiers récents */}
      <div className="cortia-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Dossiers récents</h2>
          <Link href="/dossiers" className="text-sm text-blue-600 hover:text-blue-700">
            Voir tous →
          </Link>
        </div>

        {dossiers && dossiers.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {dossiers.map((dossier: any) => (
              <Link
                key={dossier.id}
                href={`/dossiers/${dossier.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{dossier.reference}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {dossier.emprunteurs?.[0] 
                      ? `${dossier.emprunteurs[0].prenom} ${dossier.emprunteurs[0].nom}`
                      : 'Emprunteur non renseigné'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {dossier.projet?.montant_emprunt && (
                    <span className="text-sm font-medium text-gray-700">
                      {formatMontant(dossier.projet.montant_emprunt)}
                    </span>
                  )}
                  <StatusBadge statut={dossier.statut} />
                  <span className="text-xs text-gray-400">{formatDate(dossier.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">Aucun dossier pour l'instant</p>
            <Link href="/dossiers/nouveau" className="cortia-button-primary">
              Créer mon premier dossier
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
