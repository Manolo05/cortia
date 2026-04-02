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
  extractedData: any | null
  error: string | null
  documentId: string | null
}

interface Anomalie {
  type: 'incoherence' | 'manque' | 'vigilance' | 'fraude_potentielle'
  severite: 'haute' | 'moyenne' | 'faible'
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
  { id: 'piece_identite', label: "Carte d'identité / Passeport", icon: '🪪', description: 'CNI, passeport ou titre de séjour', required: true },
  { id: 'justificatif_domicile', label: 'Justificatif de domicile', icon: '🏠', description: 'Facture EDF, quittance de loyer < 3 mois', required: true },
  { id: 'avis_imposition', label: "Avis d'imposition", icon: '📋', description: 'Dernier avis d'imposition ou de non-imposition', required: true },
  { id: 'bulletin_salaire', label: 'Fiches de paie', icon: '💰', description: '3 derniers bulletins de salaire', required: true },
  { id: 'releve_compte', label: 'Relevés de compte', icon: '🏦', description: '3 derniers relevés bancaires', required: true },
  { id: 'contrat_reservation', label: 'Contrat de réservation', icon: '📝', description: 'Contrat de réservation du bien', required: false },
  { id: 'compromis_vente', label: 'Compromis de vente', icon: '🤝', description: 'Compromis ou promesse de vente', required: false },
]

export default function ControleDocsPage() {
  const params = useParams()
  const dossierId = params.id as string
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [documents, setDocuments] = useState<Record<string, DocumentState>>(
    Object.fromEntries(
      DOCUMENT_TYPES.map(dt => [dt.id, {
        file: null, uploading: false, uploaded: false,
        extractedData: null, error: null, documentId: null
      }])
    )
  )
  const [analysing, setAnalysing] = useState(false)
  const [analyseResult, setAnalyseResult] = useState<AnalyseResult | null>(null)
  const [analyseError, setAnalyseError] = useState<string | null>(null)

  const uploadedCount = Object.values(documents).filter(d => d.uploaded).length

  async function handleFileChange(docTypeId: string, file: File) {
    if (!file || file.type !== 'application/pdf') {
      setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], error: 'Veuillez sélectionner un fichier PDF' } }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocuments(prev => ({ ...prev, [docTypeId]: { ...prev[docTypeId], error: 'Le fichier ne doit pas dépasser 10 Mo' } }))
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

      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'upload')

      setDocuments(prev => ({
        ...prev,
        [docTypeId]: {
          ...prev[docTypeId],
          uploading: false,
          uploaded: true,
          extractedData: data.extraction,
          documentId: data.document?.id || null,
          error: null
        }
      }))
    } catch (err: any) {
      setDocuments(prev => ({
        ...prev,
        [docTypeId]: { ...prev[docTypeId], uploading: false, error: err.message || 'Erreur upload' }
      }))
    }
  }

  async function handleAnalyse() {
    setAnalysing(true)
    setAnalyseError(null)
    setAnalyseResult(null)
    try {
      const response = await fetch(`/api/dossiers/${dossierId}/analyser-docs`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'analyse')
      setAnalyseResult(data)
    } catch (err: any) {
      setAnalyseError(err.message || 'Erreur analyse')
    } finally {
      setAnalysing(false)
    }
  }

  function getSeveriteColor(severite: string) {
    switch (severite) {
      case 'haute': return 'bg-red-50 border-red-200 text-red-800'
      case 'moyenne': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'faible': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  function getSeveriteIcon(severite: string) {
    switch (severite) {
      case 'haute': return '🔴'
      case 'moyenne': return '🟠'
      case 'faible': return '🟡'
      default: return '⚪'
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Contrôle Documentaire IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Téléversez les documents PDF pour analyse automatique et détection d'anomalies
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {uploadedCount}/{DOCUMENT_TYPES.length} documents uploadés
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map(docType => {
          const docState = documents[docType.id]
          return (
            <div
              key={docType.id}
              className={`border-2 rounded-xl p-4 transition-all ${
                docState.uploaded
                  ? 'border-green-300 bg-green-50'
                  : docState.error
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{docType.icon}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 text-sm">{docType.label}</span>
                      {docType.required && (
                        <span className="text-xs text-red-500 font-medium">*</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{docType.description}</p>
                  </div>
                </div>
                {docState.uploaded && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
              </div>

              {docState.uploaded && docState.file && (
                <div className="mb-2 text-xs text-green-700 bg-green-100 rounded px-2 py-1 truncate">
                  📄 {docState.file.name}
                </div>
              )}

              {docState.extractedData && (
                <div className="mb-2 text-xs bg-white border border-green-200 rounded p-2 space-y-1">
                  {docState.extractedData.nom_complet && (
                    <div><span className="text-gray-500">Nom:</span> <span className="font-medium">{docState.extractedData.nom_complet}</span></div>
                  )}
                  {docState.extractedData.revenu_mensuel_net && (
                    <div><span className="text-gray-500">Revenu net:</span> <span className="font-medium">{docState.extractedData.revenu_mensuel_net} €/mois</span></div>
                  )}
                  {docState.extractedData.solde_moyen && (
                    <div><span className="text-gray-500">Solde moyen:</span> <span className="font-medium">{docState.extractedData.solde_moyen} €</span></div>
                  )}
                  {docState.extractedData.revenu_fiscal_reference && (
                    <div><span className="text-gray-500">Revenu fiscal:</span> <span className="font-medium">{docState.extractedData.revenu_fiscal_reference} €</span></div>
                  )}
                  {docState.extractedData.prix_bien && (
                    <div><span className="text-gray-500">Prix bien:</span> <span className="font-medium">{docState.extractedData.prix_bien} €</span></div>
                  )}
                  {docState.extractedData.adresse && (
                    <div><span className="text-gray-500">Adresse:</span> <span className="font-medium">{docState.extractedData.adresse}</span></div>
                  )}
                </div>
              )}

              {docState.error && (
                <p className="text-xs text-red-600 mb-2">{docState.error}</p>
              )}

              <input
                type="file"
                accept="application/pdf"
                ref={el => { fileInputRefs.current[docType.id] = el }}
                onChange={e => e.target.files?.[0] && handleFileChange(docType.id, e.target.files[0])}
                className="hidden"
              />

              <button
                onClick={() => fileInputRefs.current[docType.id]?.click()}
                disabled={docState.uploading}
                className={`w-full text-sm py-2 px-3 rounded-lg border transition-colors ${
                  docState.uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : docState.uploaded
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                }`}
              >
                {docState.uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Extraction en cours...
                  </span>
                ) : docState.uploaded ? (
                  '✓ Remplacer le document'
                ) : (
                  '📤 Téléverser le PDF'
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{uploadedCount} document(s)</span> uploadé(s)
          {uploadedCount < DOCUMENT_TYPES.filter(d => d.required).length && (
            <span className="text-orange-600 ml-2">
              — {DOCUMENT_TYPES.filter(d => d.required).length - Object.values(documents).filter((d, i) => d.uploaded && DOCUMENT_TYPES[i]?.required).length} obligatoire(s) manquant(s)
            </span>
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
          {analysing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyse en cours...
            </span>
          ) : (
            '🔍 Analyser les documents'
          )}
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
              <h2 className="text-lg font-bold text-gray-900">Score de Fiabilité</h2>
              <span className={`text-4xl font-bold ${getScoreColor(analyseResult.score_fiabilite)}`}>
                {analyseResult.score_fiabilite}/100
              </span>
            </div>
            <p className="text-sm text-gray-700">{analyseResult.resume}</p>
          </div>

          {analyseResult.synthese_bancaire && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3">💳 Synthèse Bancaire</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{analyseResult.synthese_bancaire}</p>
            </div>
          )}

          {analyseResult.documents_manquants && analyseResult.documents_manquants.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-2">📋 Documents manquants</h3>
              <ul className="space-y-1">
                {analyseResult.documents_manquants.map((doc, i) => (
                  <li key={i} className="text-sm text-orange-700 flex items-center gap-2">
                    <span>⚠️</span> {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analyseResult.alertes && analyseResult.alertes.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">🚨 Anomalies Détectées</h2>
              <div className="space-y-3">
                {analyseResult.alertes.map((alerte, i) => (
                  <div key={i} className={`border rounded-xl p-4 ${getSeveriteColor(alerte.severite)}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getSeveriteIcon(alerte.severite)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{alerte.titre}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${
                            alerte.severite === 'haute' ? 'bg-red-200 text-red-800' :
                            alerte.severite === 'moyenne' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {alerte.severite}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {alerte.type.replace('_', ' ')}
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
              ✅ Aucune anomalie détectée — tous les documents semblent cohérents.
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Recommandation</h3>
            <p className="text-sm text-gray-700">{analyseResult.recommandation}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        * Documents obligatoires — Les PDF sont analysés par IA pour en extraire les données clés.
        Les résultats sont indicatifs et ne remplacent pas une vérification manuelle.
      </p>
    </div>
  )
}
