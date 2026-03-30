'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { formatTailleFichier, formatDate } from '@/lib/utils/format'

const TYPES_DOCUMENTS = [
  { value: 'bulletin_salaire', label: 'Bulletin de salaire' },
  { value: 'avis_imposition', label: 'Avis d\'imposition' },
  { value: 'releve_compte', label: 'Relevé de compte' },
  { value: 'justificatif_domicile', label: 'Justificatif de domicile' },
  { value: 'piece_identite', label: 'Pièce d\'identité' },
  { value: 'compromis_vente', label: 'Compromis de vente' },
  { value: 'titre_propriete', label: 'Titre de propriété' },
  { value: 'devis_travaux', label: 'Devis travaux' },
  { value: 'autre', label: 'Autre' },
]

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  valide: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
  a_remplacer: 'bg-orange-100 text-orange-700',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  valide: '✅ Validé',
  refuse: '❌ Refusé',
  a_remplacer: '⚠️ À remplacer',
}

export default function DocumentsPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [typeDoc, setTypeDoc] = useState('bulletin_salaire')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [dossierId])

  async function fetchDocuments() {
    const res = await fetch(`/api/documents?dossier_id=${dossierId}`)
    if (res.ok) {
      const data = await res.json()
      setDocuments(data)
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('dossier_id', dossierId)
      fd.append('type_document', typeDoc)

      await fetch('/api/documents', { method: 'POST', body: fd })
    }
    await fetchDocuments()
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function updateStatut(docId: string, statut: string) {
    await fetch(`/api/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut_verification: statut }),
    })
    await fetchDocuments()
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Chargement...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Documents</h2>

      {/* Zone d'upload */}
      <div className="cortia-card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Ajouter des documents</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="cortia-label">Type de document</label>
            <select value={typeDoc} onChange={e => setTypeDoc(e.target.value)} className="cortia-input">
              {TYPES_DOCUMENTS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cortia-button-primary cursor-pointer ${uploading ? 'opacity-50' : ''}`}
            >
              {uploading ? 'Upload...' : '📎 Sélectionner fichiers'}
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG acceptés · Max 10 Mo par fichier</p>
      </div>

      {/* Liste documents */}
      {documents.length > 0 ? (
        <div className="cortia-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Taille</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-gray-900">{doc.nom_fichier}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-600">
                      {TYPES_DOCUMENTS.find(t => t.value === doc.type_document)?.label || doc.type_document}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {doc.taille_fichier ? formatTailleFichier(doc.taille_fichier) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={doc.statut_verification}
                      onChange={e => updateStatut(doc.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${STATUT_COLORS[doc.statut_verification]}`}
                    >
                      {Object.entries(STATUT_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {formatDate(doc.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cortia-card p-12 text-center">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-500">Aucun document uploadé</p>
        </div>
      )}
    </div>
  )
}
