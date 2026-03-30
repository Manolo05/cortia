import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusBadge } from '@/components/dossier/status-badge'
import { formatDate, formatMontant, formatDuree } from '@/lib/utils/format'
import Link from 'next/link'

export default async function DossierResumePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dossier } = await supabase
    .from('dossiers')
    .select(`
      *,
      emprunteurs:emprunteurs(*),
      projet:projets(*),
      documents:documents(id, statut_verification),
      analyse:analyses_financieres(score_global, taux_endettement_projet, mensualite_estimee)
    `)
    .eq('id', id)
    .single()

  if (!dossier) notFound()

  const docsCount = dossier.documents?.length || 0
  const docsValides = dossier.documents?.filter((d: any) => d.statut_verification === 'valide').length || 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Progression */}
      <div className="cortia-card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Progression du dossier</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Dossier', done: true, href: `/dossiers/${id}` },
            { label: 'Emprunteurs', done: (dossier.emprunteurs?.length || 0) > 0, href: `/dossiers/${id}/emprunteurs` },
            { label: 'Projet', done: !!dossier.projet?.prix_bien, href: `/dossiers/${id}/projet` },
            { label: 'Documents', done: docsCount > 0, href: `/dossiers/${id}/documents` },
            { label: 'Analyse IA', done: !!dossier.analyse, href: `/dossiers/${id}/analyse` },
          ].map(step => (
            <Link key={step.label} href={step.href}
              className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                step.done 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-1">{step.done ? '✅' : '⭕'}</div>
              {step.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Emprunteurs */}
        <div className="cortia-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Emprunteurs</h2>
            <Link href={`/dossiers/${id}/emprunteurs`} className="text-sm text-blue-600 hover:text-blue-700">
              Modifier →
            </Link>
          </div>
          {dossier.emprunteurs?.length > 0 ? (
            <div className="space-y-3">
              {dossier.emprunteurs.map((e: any) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-medium flex-shrink-0">
                    {e.prenom.charAt(0)}{e.nom.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.prenom} {e.nom}</p>
                    <p className="text-sm text-gray-500">
                      {e.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal'}
                      {e.salaire_net_mensuel && ` · ${formatMontant(e.salaire_net_mensuel)}/mois`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun emprunteur renseigné</p>
          )}
        </div>

        {/* Projet */}
        <div className="cortia-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Projet</h2>
            <Link href={`/dossiers/${id}/projet`} className="text-sm text-blue-600 hover:text-blue-700">
              Modifier →
            </Link>
          </div>
          {dossier.projet?.prix_bien ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium">{dossier.projet.type_operation}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Localisation</dt>
                <dd className="font-medium">{dossier.projet.ville_bien || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Prix du bien</dt>
                <dd className="font-medium">{formatMontant(dossier.projet.prix_bien)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Montant emprunté</dt>
                <dd className="font-medium text-blue-700">{formatMontant(dossier.projet.montant_emprunt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Durée</dt>
                <dd className="font-medium">{formatDuree(dossier.projet.duree_souhaitee * 12)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">Projet non renseigné</p>
          )}
        </div>
      </div>

      {/* Documents et Analyse */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="cortia-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Documents</h2>
            <Link href={`/dossiers/${id}/documents`} className="text-sm text-blue-600 hover:text-blue-700">
              Gérer →
            </Link>
          </div>
          <p className="text-3xl font-bold text-gray-900">{docsValides}<span className="text-lg text-gray-400">/{docsCount}</span></p>
          <p className="text-sm text-gray-500 mt-1">documents validés</p>
        </div>

        <div className="cortia-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Analyse IA</h2>
            <Link href={`/dossiers/${id}/analyse`} className="text-sm text-blue-600 hover:text-blue-700">
              Voir →
            </Link>
          </div>
          {dossier.analyse ? (
            <div>
              <p className="text-3xl font-bold text-gray-900">{dossier.analyse.score_global}<span className="text-lg text-gray-400">/100</span></p>
              <p className="text-sm text-gray-500 mt-1">
                Endettement : {dossier.analyse.taux_endettement_projet?.toFixed(1)}% · 
                Mensualité : {formatMontant(dossier.analyse.mensualite_estimee)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Analyse non effectuée</p>
          )}
        </div>
      </div>
    </div>
  )
}
