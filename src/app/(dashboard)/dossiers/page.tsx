import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/dossier/status-badge'
import { formatDate, formatMontant } from '@/lib/utils/format'

export default async function DossiersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profil } = await supabase
    .from('profils_utilisateurs')
    .select('cabinet_id, role')
    .eq('id', user!.id)
    .single()

  const { data: dossiers } = await supabase
    .from('dossiers')
    .select(`
      id, reference, statut, created_at, updated_at,
      emprunteurs:emprunteurs(prenom, nom),
      projet:projets(montant_emprunt, type_operation, ville_bien),
      courtier:profils_utilisateurs(nom_complet)
    `)
    .eq('cabinet_id', profil?.cabinet_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers</h1>
          <p className="text-gray-500 mt-1">{dossiers?.length || 0} dossier(s) au total</p>
        </div>
        <Link href="/dossiers/nouveau" className="cortia-button-primary">
          + Nouveau dossier
        </Link>
      </div>

      <div className="cortia-card overflow-hidden">
        {dossiers && dossiers.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Emprunteur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dossiers.map((dossier: any) => (
                <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dossiers/${dossier.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                      {dossier.reference}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {dossier.emprunteurs?.[0]
                      ? `${dossier.emprunteurs[0].prenom} ${dossier.emprunteurs[0].nom}`
                      : <span className="text-gray-400 italic">Non renseigné</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {dossier.projet?.ville_bien || dossier.projet?.type_operation || '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {dossier.projet?.montant_emprunt 
                      ? formatMontant(dossier.projet.montant_emprunt)
                      : '—'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge statut={dossier.statut} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(dossier.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">Aucun dossier pour l'instant</p>
            <Link href="/dossiers/nouveau" className="cortia-button-primary">
              Créer un dossier
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
