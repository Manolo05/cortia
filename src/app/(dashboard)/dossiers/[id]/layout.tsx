// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DossierTabs } from '@/components/layout/dossier-tabs'
import { StatusBadge } from '@/components/dossier/status-badge'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'

export default async function DossierLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

  const { data: dossier } = await supabase
      .from('dossiers')
      .select(`
            id,
                  reference,
                        statut,
                              created_at,
                                    emprunteurs:emprunteurs(prenom, nom, est_co_emprunteur),
                                          courtier:profils_utilisateurs(nom_complet)
                                              `)
      .eq('id', id)
      .single()

  if (!dossier) notFound()

  const emprunteurPrincipal = dossier.emprunteurs?.find((e: any) => !e.est_co_emprunteur)
    const courtierNom = Array.isArray(dossier.courtier)
      ? (dossier.courtier[0] as any)?.nom_complet
          : (dossier.courtier as any)?.nom_complet

  return (
        <div className="flex flex-col h-full">
          {/* Header dossier */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                            <Link href="/dossiers" className="text-gray-400 hover:text-gray-600">
                                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                          </svg>
                                            </Link>
                                            <div>
                                                          <div className="flex items-center gap-3">
                                                                          <h1 className="text-lg font-bold text-gray-900">{dossier.reference}</h1>
                                                                          <StatusBadge statut={dossier.statut} />
                                                          </div>
                                                          <p className="text-sm text-gray-500 mt-0.5">
                                                            {emprunteurPrincipal
                                                                                ? `${emprunteurPrincipal.prenom} ${emprunteurPrincipal.nom}`
                                                                                : 'Emprunteur non renseigné'
                                                            }
                                                            {' · '}
                                                                          Créé le {formatDate(dossier.created_at)}
                                                            {courtierNom && ` · ${courtierNom}`}
                                                          </p>
                                            </div>
                                </div>
                      </div>
              </div>
        
          {/* Tabs */}
              <DossierTabs dossierId={id} />
        
          {/* Content */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
        </div>
      )
}
