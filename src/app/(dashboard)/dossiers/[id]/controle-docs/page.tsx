'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'

interface DocumentType {
  id: string
  label: string
  icon: string
  description: string
  required: boolean
}

interface DocumentState {
  file: File | null
  uploading: boolean
  uploaded: boolean
  extractedData: any
  error: string | null
  documentId: string | null
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'piece_identite', label: "Carte d'identite", icon: '\u{1FAA7}', description: "CNI, passeport ou titre de sejour", required: true },
  { id: 'justificatif_domicile', label: 'Justificatif de domicile', icon: '\u{1F3E0}', description: 'Facture EDF, quittance de loyer', required: true },
  { id: 'avis_imposition', label: "Avis d'imposition", icon: '\u{1F4CB}', description: "Avis d'imposition ou de non-imposition", required: true },
  { id: 'bulletin_salaire', label: 'Fiches de paie', icon: '\u{1F4B0}', description: '3 derniers bulletins de salaire', required: true },
  { id: 'releve_compte', label: 'Releves de compte', icon: '\u{1F3E6}', description: '3 derniers releves bancaires', required: true },
  { id: 'contrat_reservation', label: 'Contrat de reservation', icon: '\u{1F4DD}', description: 'Contrat de reservation du bien', required: false },
  { id: 'compromis_vente', label: 'Compromis de vente', icon: '\u{1F91D}', description: 'Compromis ou promesse de vente', required: false },
]

const REQUIRED_COUNT = DOCUMENT_TYPES.filter(d => d.required).length

function formatMontant(val: any): string {
  if (!val || val === 0) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(val))
}

function StatCard({ label, value, color = 'blue' }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  }
  return (
    <div className={"border rounded-lg p-3 " + (colors[color] || colors.blue)}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  )
}

export default function ControleDocsPage() {
  const params = useParams()
  const dossierId = params.id as string
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const initState: Record<string, DocumentState> = {}
  for (const dt of DOCUMENT_TYPES) {
    initState[dt.id] = { file: null, uploading: false, uploaded: false, extractedData: null, error: null, documentId: null }
  }

  const [documents, setDocuments] = useState<Record<string, DocumentState>>(initState)
  const [analysing, setAnalysing] = useState(false)
  const [analyseResult, setAnalyseResult] = useState<any>(null)
  const [analyseError, setAnalyseError] = useState<string | null>(null)

  const uploadedCount = Object.values(documents).filter(d => d.uploaded).length
  const uploadedRequiredCount = DOCUMENT_TYPES.filter(dt => dt.required && documents[dt.id]?.uploaded).length
  const missingRequired = REQUIRED_COUNT - uploadedRequiredCount

  async function handleFileChange(docTypeId: string, file: File) {
    if (!file || file.type !== 'application/pdf') {
      setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], error: 'Veuillez selectionner un fichier PDF' } }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], error: 'Fichier trop volumineux (max 10 Mo)' } }))
      return
    }
    setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], file, uploading: true, error: null } }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('dossier_id', dossierId)
      formData.append('type_document', docTypeId)
      const response = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur upload')
      setDocuments(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: false, uploaded: true, extractedData: data.extraction, documentId: data.document?.id || null, error: null }
      }))
    } catch (err: any) {
      setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], uploading: false, error: err.message || 'Erreur upload' } }))
    }
  }

  async function handleAnalyse() {
    setAnalysing(true)
    setAnalyseError(null)
    setAnalyseResult(null)
    try {
      const response = await fetch(`/api/dossiers/${dossierId}/analyser-docs`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur analyse')
      setAnalyseResult(data.analyse || data)
    } catch (err: any) {
      setAnalyseError(err.message || 'Erreur analyse')
    } finally {
      setAnalysing(false)
    }
  }

  function getSeveriteColor(s: string) {
    if (s === 'haute') return 'bg-red-50 border-red-200 text-red-800'
    if (s === 'moyenne') return 'bg-orange-50 border-orange-200 text-orange-800'
    return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }

  function getSeveriteBadge(s: string) {
    if (s === 'haute') return 'bg-red-200 text-red-800'
    if (s === 'moyenne') return 'bg-orange-200 text-orange-800'
    return 'bg-yellow-200 text-yellow-800'
  }

  function getStatutColor(s: string) {
    if (s === 'favorable') return 'bg-green-100 border-green-300 text-green-800'
    if (s === 'a_completer') return 'bg-orange-100 border-orange-300 text-orange-800'
    return 'bg-red-100 border-red-300 text-red-800'
  }

  const sb = analyseResult?.synthese_bancaire
  const conclusion = analyseResult?.conclusion_globale
  const anomalies = analyseResult?.anomalies || []
  const coherenceId = analyseResult?.coherence_identite
  const coherenceRev = analyseResult?.coherence_revenus
  const coherenceChg = analyseResult?.coherence_charges
  const analyseBien = analyseResult?.analyse_bien
  const recommandations = analyseResult?.recommandations_courtier || []
  const docsManquants = analyseResult?.documents_manquants || []
  const scoreGlobal = conclusion?.score_global || 0

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle Documentaire IA</h1>
          <p className="text-sm text-gray-500 mt-1">Televersez les PDF — analyse et detection d&apos;anomalies par GPT-4o</p>
        </div>
        <div className="text-sm text-gray-500 font-medium">{uploadedCount}/{DOCUMENT_TYPES.length} documents</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map(docType => {
          const docState = documents[docType.id]
          const borderClass = docState.uploaded
            ? 'border-green-300 bg-green-50'
            : docState.error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white hover:border-blue-300'
          const btnClass = docState.uploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : docState.uploaded
            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
          const ext = docState.extractedData
          return (
            <div key={docType.id} className={"border-2 rounded-xl p-4 transition-all " + borderClass}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 text-sm">{docType.label}</span>
                      {docType.required && <span className="text-xs text-red-500">*</span>}
                    </div>
                    <p className="text-xs text-gray-500">{docType.description}</p>
                  </div>
                </div>
                {docState.uploaded && <span className="text-green-500 text-xl">&#10003;</span>}
              </div>
              {docState.uploaded && docState.file && (
                <div className="mb-2 text-xs text-green-700 bg-green-100 rounded px-2 py-1 truncate">
                  {docState.file.name}
                </div>
              )}
              {ext && ext.resume_extraction && !ext.erreur && (
                <div className="mb-2 text-xs bg-white border border-green-200 rounded p-2 space-y-1">
                  {ext.identite?.nom && <div><span className="text-gray-500">Nom: </span><span className="font-medium">{ext.identite.nom} {ext.identite.prenom}</span></div>}
                  {ext.identite?.adresse && <div><span className="text-gray-500">Adresse: </span><span className="font-medium">{ext.identite.adresse}</span></div>}
                  {Boolean(ext.revenus?.salaire_net_mensuel) && <div><span className="text-gray-500">Salaire net: </span><span className="font-medium text-green-700">{formatMontant(ext.revenus.salaire_net_mensuel)}/mois</span></div>}
                  {ext.employeur?.nom && <div><span className="text-gray-500">Employeur: </span><span className="font-medium">{ext.employeur.nom} ({ext.employeur.type_contrat})</span></div>}
                  {Boolean(ext.bancaire?.solde_moyen) && <div><span className="text-gray-500">Solde moyen: </span><span className="font-medium">{formatMontant(ext.bancaire.solde_moyen)}</span></div>}
                  {Boolean(ext.fiscal?.revenu_fiscal_reference) && <div><span className="text-gray-500">Revenu fiscal: </span><span className="font-medium">{formatMontant(ext.fiscal.revenu_fiscal_reference)}</span></div>}
                  {Boolean(ext.bien_immobilier?.prix_vente) && <div><span className="text-gray-500">Prix bien: </span><span className="font-medium text-blue-700">{formatMontant(ext.bien_immobilier.prix_vente)}</span></div>}
                  {ext.type_document_detecte && <div className="text-gray-400 italic">{ext.type_document_detecte} — {ext.periode}</div>}
                </div>
              )}
              {ext?.erreur && <p className="mb-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">{ext.erreur}</p>}
              {docState.error && <p className="text-xs text-red-600 mb-2">{docState.error}</p>}
              <input
                type="file"
                accept="application/pdf"
                ref={(el) => { fileInputRefs.current[docType.id] = el }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(docType.id, f) }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRefs.current[docType.id]?.click()}
                disabled={docState.uploading}
                className={"w-full text-sm py-2 px-3 rounded-lg border transition-colors " + btnClass}
              >
                {docState.uploading ? 'Analyse en cours...' : docState.uploaded ? 'Remplacer' : 'Televerser le PDF'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{uploadedCount} document(s)</span> uploade(s)
          {missingRequired > 0 && (
            <span className="text-orange-600 ml-2">{missingRequired} obligatoire(s) manquant(s)</span>
          )}
        </div>
        <button
          onClick={handleAnalyse}
          disabled={analysing || uploadedCount === 0}
          className={"px-6 py-2.5 rounded-lg font-medium text-sm transition-all " + (
            analysing || uploadedCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          )}
        >
          {analysing ? 'Analyse IA en cours...' : 'Analyser tous les documents'}
        </button>
      </div>

      {analyseError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <strong>Erreur :</strong> {analyseError}
        </div>
      )}

      {analyseResult && (
        <div className="space-y-6">

          {conclusion && (
            <div className={"border-2 rounded-xl p-5 " + getStatutColor(conclusion.statut_dossier)}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Conclusion du Dossier</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 bg-white bg-opacity-60 rounded-full capitalize">
                    {conclusion.statut_dossier?.replace('_', ' ')}
                  </span>
                  <span className="text-3xl font-bold">{scoreGlobal}/100</span>
                </div>
              </div>
              <p className="text-sm">{conclusion.resume}</p>
              {conclusion.prochaines_etapes && conclusion.prochaines_etapes.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Prochaines etapes</p>
                  {conclusion.prochaines_etapes.map((e: string, i: number) => (
                    <p key={i} className="text-sm">&#x2022; {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {sb && (
            <div className="bg-white border border-blue-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">&#x1F4CA; Synthese Bancaire</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <StatCard label="Revenus confirmes/mois" value={formatMontant(sb.revenus_confirmes_mensuel)} color="green" />
                <StatCard label="Charges mensuelles" value={formatMontant(sb.charges_mensuelles)} color="orange" />
                <StatCard label="Capacite remboursement" value={formatMontant(sb.capacite_remboursement)} color="blue" />
                <StatCard label="Taux d'endettement actuel" value={sb.taux_endettement_actuel ? sb.taux_endettement_actuel + "%" : '-'} color={sb.taux_endettement_actuel > 33 ? 'red' : 'green'} />
                <StatCard label="Reste a vivre" value={formatMontant(sb.reste_a_vivre)} color="purple" />
                <StatCard label="Epargne detectee" value={formatMontant(sb.epargne_detectee)} color="blue" />
              </div>
              {sb.score_bancaire && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Score bancaire:</span>
                  <span className={"text-sm font-semibold px-2 py-0.5 rounded " + (
                    sb.score_bancaire === 'excellent' ? 'bg-green-100 text-green-800' :
                    sb.score_bancaire === 'bon' ? 'bg-blue-100 text-blue-800' :
                    sb.score_bancaire === 'moyen' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {sb.score_bancaire}
                  </span>
                  {sb.commentaire_score && <span className="text-sm text-gray-600">— {sb.commentaire_score}</span>}
                </div>
              )}
              {sb.revenus_sources && sb.revenus_sources.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Sources de revenus: </span>{sb.revenus_sources.join(', ')}
                </div>
              )}
            </div>
          )}

          {analyseBien && Boolean(analyseBien.prix_bien) && (
            <div className="bg-white border border-purple-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">&#x1F3E0; Analyse du Bien</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <StatCard label="Prix du bien" value={formatMontant(analyseBien.prix_bien)} color="purple" />
                <StatCard label="Apport disponible" value={formatMontant(analyseBien.apport_disponible)} color="green" />
                <StatCard label="Montant a emprunter" value={formatMontant(analyseBien.montant_a_emprunter)} color="blue" />
                <StatCard label="Mensualite estimee" value={formatMontant(analyseBien.mensualite_estimee)} color="orange" />
                <StatCard label="Taux endettement projete" value={analyseBien.taux_endettement_projete ? analyseBien.taux_endettement_projete + "%" : '-'} color={analyseBien.taux_endettement_projete > 35 ? 'red' : 'green'} />
                <div className={"border rounded-lg p-3 " + (analyseBien.faisabilite === 'favorable' ? 'bg-green-50 border-green-200' : analyseBien.faisabilite === 'limite' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200')}>
                  <p className="text-xs font-medium opacity-70">Faisabilite</p>
                  <p className="text-lg font-bold mt-0.5 capitalize">{analyseBien.faisabilite || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {(coherenceId || coherenceRev || coherenceChg) && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">&#x1F50D; Coherence des Documents</h2>
              <div className="space-y-3">
                {coherenceId && (
                  <div className={"rounded-lg p-3 border " + (coherenceId.statut === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{coherenceId.statut === 'ok' ? '&#x2705;' : '&#x26A0;'}</span>
                      <span className="font-medium text-sm">Identite</span>
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (coherenceId.statut === 'ok' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')}>{coherenceId.statut}</span>
                    </div>
                    {coherenceId.details && coherenceId.details.map((d: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">&#x2022; {d}</p>
                    ))}
                  </div>
                )}
                {coherenceRev && (
                  <div className={"rounded-lg p-3 border " + (coherenceRev.statut === 'ok' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{coherenceRev.statut === 'ok' ? '&#x2705;' : '&#x26A0;'}</span>
                      <span className="font-medium text-sm">Revenus</span>
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (coherenceRev.statut === 'ok' ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800')}>{coherenceRev.statut}</span>
                    </div>
                    {coherenceRev.fiches_paie_vs_impots && <p className="text-xs text-gray-600">Fiches vs impots: {coherenceRev.fiches_paie_vs_impots}</p>}
                    {coherenceRev.fiches_paie_vs_banque && <p className="text-xs text-gray-600">Fiches vs banque: {coherenceRev.fiches_paie_vs_banque}</p>}
                    {coherenceRev.details && coherenceRev.details.map((d: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">&#x2022; {d}</p>
                    ))}
                  </div>
                )}
                {coherenceChg && (
                  <div className={"rounded-lg p-3 border " + (coherenceChg.statut === 'ok' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200')}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{coherenceChg.statut === 'ok' ? '&#x2705;' : '&#x26A0;'}</span>
                      <span className="font-medium text-sm">Charges</span>
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (coherenceChg.statut === 'ok' ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800')}>{coherenceChg.statut}</span>
                    </div>
                    {Boolean(coherenceChg.charges_declarees) && <p className="text-xs text-gray-600">Declares: {formatMontant(coherenceChg.charges_declarees)}</p>}
                    {Boolean(coherenceChg.charges_detectees_banque) && <p className="text-xs text-gray-600">Detectees en banque: {formatMontant(coherenceChg.charges_detectees_banque)}</p>}
                    {coherenceChg.details && coherenceChg.details.map((d: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">&#x2022; {d}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {anomalies.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">&#x26A0; Anomalies Detectees ({anomalies.length})</h2>
              <div className="space-y-3">
                {anomalies.map((a: any, i: number) => (
                  <div key={i} className={"border rounded-xl p-4 " + getSeveriteColor(a.severite)}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{a.type}</span>
                          <span className={"text-xs px-2 py-0.5 rounded-full font-medium uppercase " + getSeveriteBadge(a.severite)}>
                            {a.severite}
                          </span>
                          {a.documents_concernes && a.documents_concernes.length > 0 && (
                            <span className="text-xs text-gray-500">[{a.documents_concernes.join(', ')}]</span>
                          )}
                        </div>
                        <p className="text-sm">{a.description}</p>
                        {a.recommandation && (
                          <p className="text-xs mt-2 opacity-80">&#x1F4A1; {a.recommandation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {anomalies.length === 0 && analyseResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
              &#x2705; Aucune anomalie detectee — les documents semblent coherents.
            </div>
          )}

          {docsManquants.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Documents manquants ou a completer</h3>
              {docsManquants.map((d: string, i: number) => (
                <p key={i} className="text-sm text-orange-700">&#x2022; {d}</p>
              ))}
            </div>
          )}

          {recommandations.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h3 className="font-semibold text-indigo-800 mb-2">&#x1F4CB; Recommandations Courtier</h3>
              {recommandations.map((r: string, i: number) => (
                <p key={i} className="text-sm text-indigo-700 mb-1">&#x2022; {r}</p>
              ))}
            </div>
          )}

        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        * Obligatoire — Analyse par GPT-4o. Verifiez toujours les informations extraites.
      </p>
    </div>
  )
}
