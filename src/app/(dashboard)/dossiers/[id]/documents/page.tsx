'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Document {
  id: string
  dossier_id: string
  nom: string
  type: string
  url?: string
  taille?: number
  statut?: string
  created_at: string
}

const TYPES_DOCS = [
  { value: 'identite', label: 'Piece d identite' },
  { value: 'domicile', label: 'Justificatif de domicile' },
  { value: 'fiche_paie', label: 'Fiche de paie' },
  { value: 'avis_imposition', label: 'Avis d imposition' },
  { value: 'releve_bancaire', label: 'Releve bancaire' },
  { value: 'compromis', label: 'Compromis / Promesse de vente' },
  { value: 'titre_propriete', label: 'Titre de propriete' },
  { value: 'autre', label: 'Autre document' },
]

function getTypeLabel(type: string) {
  return TYPES_DOCS.find(t => t.value === type)?.label || type
}

function getStatutBadge(statut?: string) {
  switch (statut) {
    case 'valide': return 'badge-success'
    case 'a_verifier': return 'badge-warning'
    case 'refuse': return 'badge-danger'
    default: return 'badge-neutral'
  }
}

function getStatutLabel(statut?: string) {
  switch (statut) {
    case 'valide': return 'Valide'
    case 'a_verifier': return 'A verifier'
    case 'refuse': return 'Refuse'
    default: return 'En attente'
  }
}

function formatTaille(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}

export default function DocumentsPage() {
  const params = useParams()
  const dossierId = params.id as string
  const supabase = createClientComponentClient()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', type: 'fiche_paie', statut: 'en_attente' })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [dossierId])

  async function fetchDocuments() {
    setLoading(true)
    const res = await fetch(`/api/dossiers/${dossierId}/documents`)
    if (res.ok) {
      const data = await res.json()
      setDocuments(data)
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setError(null)

    try {
      const fileName = `${dossierId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

      const payload = {
        dossier_id: dossierId,
        nom: formData.nom || file.name,
        type: formData.type,
        statut: formData.statut,
        url: urlData.publicUrl,
        taille: file.size,
      }

      const res = await fetch(`/api/dossiers/${dossierId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchDocuments()
        setFormData({ nom: '', type: 'fiche_paie', statut: 'en_attente' })
        setShowForm(false)
      } else {
        setError('Erreur lors de l enregistrement du document.')
      }
    } catch (err: any) {
      // Fallback: save without file upload if storage not configured
      const payload = {
        dossier_id: dossierId,
        nom: formData.nom || file.name,
        type: formData.type,
        statut: formData.statut,
        taille: file.size,
      }

      const res = await fetch(`/api/dossiers/${dossierId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchDocuments()
        setFormData({ nom: '', type: 'fiche_paie', statut: 'en_attente' })
        setShowForm(false)
      } else {
        setError('Erreur lors de l enregistrement.')
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function addDocumentManual() {
    setError(null)
    if (!formData.nom) {
      setError('Le nom du document est requis.')
      return
    }

    const payload = {
      dossier_id: dossierId,
      nom: formData.nom,
      type: formData.type,
      statut: formData.statut,
    }

    const res = await fetch(`/api/dossiers/${dossierId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      await fetchDocuments()
      setFormData({ nom: '', type: 'fiche_paie', statut: 'en_attente' })
      setShowForm(false)
    } else {
      setError('Erreur lors de l enregistrement.')
    }
  }

  async function updateStatut(docId: string, statut: string) {
    await fetch(`/api/dossiers/${dossierId}/documents?documentId=${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    })
    fetchDocuments()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des documents...</p>
      </div>
    )
  }

  const typesComplets = TYPES_DOCS.filter(t => 
    t.value !== 'autre' && documents.some(d => d.type === t.value)
  )
  const typeManquants = TYPES_DOCS.filter(t => 
    t.value !== 'autre' && !documents.some(d => d.type === t.value)
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Documents</h2>
          <p className="page-subtitle">
            {documents.length} document{documents.length !== 1 ? 's' : ''} enregistre{documents.length !== 1 ? 's' : ''}
            {typeManquants.length > 0 && ` · ${typeManquants.length} type(s) manquant(s)`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + Ajouter un document
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Checklist types */}
      {typeManquants.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#D97706' }}>Documents a fournir</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {typeManquants.map(t => (
              <span key={t.value} style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
                background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span>⚠️</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Ajouter un document</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Type de document</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                  className="form-select"
                >
                  {TYPES_DOCS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nom / Reference</label>
                <input
                  value={formData.nom}
                  onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                  className="form-input"
                  placeholder="Ex: Fiche paie mars 2024"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  value={formData.statut}
                  onChange={e => setFormData(p => ({ ...p, statut: e.target.value }))}
                  className="form-select"
                >
                  <option value="en_attente">En attente</option>
                  <option value="a_verifier">A verifier</option>
                  <option value="valide">Valide</option>
                  <option value="refuse">Refuse</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '8px',
                background: 'var(--gray-100)', border: '1px dashed var(--gray-300)',
                cursor: 'pointer', fontSize: '13px', color: 'var(--gray-600)',
                fontWeight: 500
              }}>
                <span>📎</span>
                {uploading ? 'Telechargement...' : 'Choisir un fichier'}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </label>
              <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>ou</span>
              <button onClick={addDocumentManual} className="btn-primary" style={{ fontSize: '13px' }}>
                Enregistrer sans fichier
              </button>
              <button onClick={() => { setShowForm(false); setError(null) }} className="btn-secondary" style={{ fontSize: '13px' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste documents */}
      {documents.length > 0 ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>📄</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>{doc.nom}</div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--brand-blue)' }}>
                            Voir le fichier
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{getTypeLabel(doc.type)}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{formatTaille(doc.taille) || '-'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                      {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatutBadge(doc.statut)}`}>
                      {getStatutLabel(doc.statut)}
                    </span>
                  </td>
                  <td>
                    <select
                      value={doc.statut || 'en_attente'}
                      onChange={e => updateStatut(doc.id, e.target.value)}
                      style={{
                        fontSize: '12px', padding: '4px 8px', borderRadius: '6px',
                        border: '1px solid var(--gray-200)', background: 'white',
                        color: 'var(--gray-700)', cursor: 'pointer'
                      }}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="a_verifier">A verifier</option>
                      <option value="valide">Valide</option>
                      <option value="refuse">Refuse</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
          <h3>Aucun document</h3>
          <p>Ajoutez les pieces justificatives du dossier pour effectuer le controle documentaire</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: '16px' }}>
            + Ajouter un document
          </button>
        </div>
      )}
    </div>
  )
}
