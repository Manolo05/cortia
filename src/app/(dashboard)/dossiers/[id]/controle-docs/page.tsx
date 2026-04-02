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

interface Anomalie {
  type: string
  severite: string
  titre: string
  description: string
}

interface AnalyseResult {
  score_fiabilite: number
  resume: string
  alertes: Anomalie[]
  recommandation: string
  synthese_bancaire?: string
  documents_manquants?: string[]
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
  const [analyseResult, setAnalyseResult] = useState<AnalyseResult | null>(null)
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
      setAnalyseResult(data)
    } catch (err: any) {
      setAnalyseError(err.message || 'Erreur analyse')
    } finally {
      setAnalysing(false)
    }
  }

  function getSeveriteColor(severite: string) {
    if (severite === 'haute') return 'bg-red-50 border-red-200 text-red-800'
    if (severite === 'moyenne') return 'bg-orange-50 border-orange-200 text-orange-800'
    return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }

  function getSeveriteBadge(severite: string) {
    if (severite === 'haute') return 'bg-red-200 text-red-800'
    if (severite === 'moyenne') return 'bg-orange-200 text-orange-800'
    return 'bg-yellow-200 text-yellow-800'
  }

  function getSeveriteIcon(severite: string) {
    if (severite === 'haute') return '\u{1F534}'
    if (severite === 'moyenne') return '\u{1F7E0}'
    return '\u{1F7E1}'
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  function getScoreBg(score: number) {
    if (score >= 80) return 'bg-green-100 border-green-200'
    if (score >= 60) return 'bg-orange-100 border-orange-200'
    return 'bg-red-100 border-red-200'
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle Documentaire IA</h1>
          <p className="text-sm text-gray-500 mt-1">Televersez les PDF pour analyse et detection d&apos;anomalies</p>
        </div>
        <div className="text-sm text-gray-500">{uploadedCount}/{DOCUMENT_TYPES.length} documents</div>
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
          return (
            <div key={docType.id} className={`border-2 rounded-xl p-4 transition-all ${borderClass}`}>
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

              {docState.extractedData && (
                <div className="mb-2 text-xs bg-white border border-green-200 rounded p-2 space-y-1">
                  {docState.extractedData.identite?.nom && (
                    <div><span className="text-gray-500">Nom: </span><span className="font-medium">{docState.extractedData.identite.nom}</span></div>
                  )}
                  {Boolean(docState.extractedData.revenus?.salaire_net_mensuel) && (
                    <div><span className="text-gray-500">Salaire net: </span><span className="font-medium">{docState.extractedData.revenus.salaire_net_mensuel} EUR/mois</span></div>
                  )}
                  {Boolean(docState.extractedData.bancaire?.solde_moyen) && (
                    <div><span className="text-gray-500">Solde moyen: </span><span className="font-medium">{docState.extractedData.bancaire.solde_moyen} EUR</span></div>
                  )}
                  {Boolean(docState.extractedData.fiscal?.revenu_fiscal) && (
                    <div><span className="text-gray-500">Revenu fiscal: </span><span className="font-medium">{docState.extractedData.fiscal.revenu_fiscal} EUR</span></div>
                  )}
                  {Boolean(docState.extractedData.bien_immobilier?.prix) && (
                    <div><span className="text-gray-500">Prix: </span><span className="font-medium">{docState.extractedData.bien_immobilier.prix} EUR</span></div>
                  )}
                </div>
              )}

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
                className={`w-full text-sm py-2 px-3 rounded-lg border transition-colors ${btnClass}`}
              >
                {docState.uploading ? 'Extraction...' : docState.uploaded ? 'Remplacer' : 'Televerser le PDF'}
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
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            analysing || uploadedCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          }`}
        >
          {analysing ? 'Analyse en cours...' : 'Analyser les documents'}
        </button>
      </div>

      {analyseError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <strong>Erreur :</strong> {analyseError}
        </div>
      )}

      {analyseResult && (
        <div className="space-y-4">
          <div className={`border-2 rounded-xl p-5 ${getScoreBg(analyseResult.score_fiabilite)}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Score de Fiabilite</h2>
              <span className={`text-4xl font-bold ${getScoreColor(analyseResult.score_fiabilite)}`}>
                {analyseResult.score_fiabilite}/100
              </span>
            </div>
            <p className="text-sm text-gray-700">{analyseResult.resume}</p>
          </div>

          {analyseResult.synthese_bancaire && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Synthese Bancaire</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{analyseResult.synthese_bancaire}</p>
            </div>
          )}

          {analyseResult.documents_manquants && analyseResult.documents_manquants.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Documents manquants</h3>
              <ul className="space-y-1">
                {analyseResult.documents_manquants.map((doc, i) => (
                  <li key={i} className="text-sm text-orange-700">- {doc}</li>
                ))}
              </ul>
            </div>
          )}

          {analyseResult.alertes && analyseResult.alertes.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Anomalies Detectees</h2>
              <div className="space-y-3">
                {analyseResult.alertes.map((alerte, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${getSeveriteColor(alerte.severite)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getSeveriteIcon(alerte.severite)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{alerte.titre}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${getSeveriteBadge(alerte.severite)}`}>
                            {alerte.severite}
                          </span>
                        </div>
                        <p className="text-sm">{alerte.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analyseResult.alertes && analyseResult.alertes.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
              Aucune anomalie - tous les documents semblent coherents.
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Recommandation</h3>
            <p className="text-sm text-gray-700">{analyseResult.recommandation}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        * Documents obligatoires - Les PDF sont analyses par IA.
      </p>
    </div>
  )
}
