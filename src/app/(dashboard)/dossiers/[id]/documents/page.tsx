'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
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
  { value: 'identite', label: 'Piece identite', icon: 'ID', required: true },
  { value: 'domicile', label: 'Justificatif domicile', icon: 'ADR', required: true },
  { value: 'fiche_paie', label: 'Bulletins salaire', icon: 'SAL', required: true },
  { value: 'avis_imposition', label: 'Avis imposition', icon: 'AVI', required: true },
  { value: 'releve_bancaire', label: 'Releves bancaires', icon: 'BNQ', required: true },
  { value: 'compromis', label: 'Compromis vente', icon: 'CPR', required: false },
  { value: 'titre_propriete', label: 'Titre propriete', icon: 'TTR', required: false },
  { value: 'autre', label: 'Autre document', icon: 'DOC', required: false },
]

function getTypeInfo(type: string) {
  return TYPES_DOCS.find(t => t.value === type) || { value: type, label: type, icon: 'DOC', required: false }
}

function getStatutConfig(statut?: string) {
  switch (statut) {
    case 'valide': return { label: 'Valide', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' }
    case 'a_verifier': return { label: 'A verifier', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' }
    case 'refuse': return { label: 'Refuse', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
    default: return { label: 'En attente', bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' }
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
const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', type: 'fiche_paie', statut: 'en_attente' })
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [ocrLoading, setOcrLoading] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ocrResult, setOcrResult] = useState<Record<string, any>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyseGlobale, setAnalyseGlobale] = useState<any>(null)
  const [analyseLoading, setAnalyseLoading] = useState(false)

  async function lancerAnalyseGlobale() {
    setAnalyseLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/analyser-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.success) {
        setAnalyseGlobale(data)
      } else {
        setError(data.error || 'Erreur analyse globale')
      }
    } catch (err) {
      setError('Erreur: ' + String(err))
    }
    setAnalyseLoading(false)
  }

  async function analyseOCR(doc: Document) {
    if (!doc.url) return
    setOcrLoading(doc.id)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl: doc.url, documentId: doc.id }),
      })
      const data = await res.json()
      if (data.success) {
        setOcrResult(prev => ({ ...prev, [doc.id]: data.extraction }))
        await fetchDocuments()
      } else {
        setError('Erreur OCR: ' + (data.error || 'Echec'))
      }
    } catch (err) {
      setError('Erreur OCR: ' + String(err))
    }
    setOcrLoading(null)
  }

  useEffect(() => { fetchDocuments() }, [dossierId])

  async function fetchDocuments() {
    setLoading(true)
    const res = await fetch('/api/dossiers/' + dossierId + '/documents')
    if (res.ok) {
      const raw = await res.json()
      const mapped = (raw || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        dossier_id: d.dossier_id as string,
        nom: (d.nom_fichier || d.nom || 'Document') as string,
        type: (d.type_document || d.type || 'autre') as string,
        url: (d.url_stockage || d.url || null) as string | undefined,
        taille: (d.taille_fichier || d.taille || null) as number | undefined,
        statut: (d.statut_verification || d.statut || 'en_attente') as string,
        created_at: d.created_at as string,
      }))
      setDocuments(mapped)
    }
    setLoading(false)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('nom', formData.nom || file.name)
      fd.append('type', formData.type)
      fd.append('statut', formData.statut)
      const res = await fetch('/api/dossiers/' + dossierId + '/upload', {
        method: 'POST',
        body: fd
      })
      if (res.ok) {
        await fetchDocuments(); setFormData({ nom: '', type: 'fiche_paie', statut: 'en_attente' }); setShowForm(false)
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur lors du telechargement.')
      }
    } catch (err) { setError('Erreur lors du traitement.') }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function addDocumentManual() {
    if (!formData.nom) { setError('Le nom du document est requis.'); return }
    const payload = { dossier_id: dossierId, nom: formData.nom, type: formData.type, statut: formData.statut }
    const res = await fetch('/api/dossiers/' + dossierId + '/documents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    if (res.ok) { await fetchDocuments(); setFormData({ nom: '', type: 'fiche_paie', statut: 'en_attente' }); setShowForm(false) }
    else { setError('Erreur.') }
  }

  async function updateStatut(docId: string, statut: string) {
    await fetch('/api/dossiers/' + dossierId + '/documents?documentId=' + docId, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut })
    })
    fetchDocuments()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p>Chargement des documents...</p>
      </div>
    )
  }

  const typesRequis = TYPES_DOCS.filter(t => t.required)
  const typesFournis = typesRequis.filter(t => documents.some(d => d.type === t.value))
  const typeManquants = typesRequis.filter(t => !documents.some(d => d.type === t.value))
  const completionRate = Math.round((typesFournis.length / typesRequis.length) * 100)

  return (
    <div className='page-container'>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 className='page-title'>Gestion documentaire</h2>
          <p className='page-subtitle'>
            {documents.length} document{documents.length !== 1 ? 's' : ''} enregistre{documents.length !== 1 ? 's' : ''}
            {typeManquants.length > 0 ? ' - ' + typeManquants.length + ' type(s) manquant(s)' : ' - Dossier complet'}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className='btn-primary'>
          + Ajouter un document
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className='card' style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completude dossier</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: completionRate === 100 ? '#059669' : completionRate >= 60 ? '#D97706' : '#DC2626' }}>
              {completionRate}%
            </span>
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: completionRate + '%', borderRadius: '99px', background: completionRate === 100 ? '#059669' : completionRate >= 60 ? '#F59E0B' : '#EF4444', transition: 'width 0.5s ease' }}></div>
          </div>
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--gray-500)' }}>
            {typesFournis.length} / {typesRequis.length} documents obligatoires fournis
          </p>
        </div>
        <div className='card' style={{ padding: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>Statuts documents</span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Valides', val: documents.filter(d => d.statut === 'valide').length, color: '#059669' },
              { label: 'A verifier', val: documents.filter(d => d.statut === 'a_verifier').length, color: '#D97706' },
              { label: 'En attente', val: documents.filter(d => !d.statut || d.statut === 'en_attente').length, color: '#64748B' },
              { label: 'Refuses', val: documents.filter(d => d.statut === 'refuse').length, color: '#DC2626' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {typeManquants.length > 0 && (
        <div className='card' style={{ marginBottom: '24px', borderLeft: '3px solid #F59E0B', background: '#FFFBEB', padding: '16px 20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', marginBottom: '10px' }}>Documents manquants ({typeManquants.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {typeManquants.map(t => (
              <span key={t.value} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: 'white', color: '#92400E', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>{error}</div>
      )}

      {showForm && (
        <div className='card' style={{ marginBottom: '24px' }}>
          <div className='card-header'><h3 className='card-title'>Ajouter un document</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className='form-group'>
              <label className='form-label'>Type</label>
              <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className='form-select'>
                {TYPES_DOCS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label className='form-label'>Nom / Reference</label>
              <input value={formData.nom} onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))} className='form-input' placeholder='Ex: Fiche paie mars 2024' />
            </div>
            <div className='form-group'>
              <label className='form-label'>Statut initial</label>
              <select value={formData.statut} onChange={e => setFormData(p => ({ ...p, statut: e.target.value }))} className='form-select'>
                <option value='en_attente'>En attente</option>
                <option value='a_verifier'>A verifier</option>
                <option value='valide'>Valide</option>
              </select>
            </div>
          </div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed ' + (dragOver ? 'var(--brand-blue)' : 'var(--gray-300)'), borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EFF6FF' : 'var(--gray-50)', transition: 'all 0.2s ease', marginBottom: '16px' }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.1em', marginBottom: '8px' }}>PDF</div>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)', fontWeight: 500 }}>
              {uploading ? 'Telechargement en cours...' : 'Deposez un fichier ici ou cliquez pour selectionner'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>PDF, JPG, PNG, DOC acceptes</p>
            <input ref={fileInputRef} type='file' onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]) }} style={{ display: 'none' }} accept='.pdf,.jpg,.jpeg,.png,.doc,.docx' />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setError(null) }} className='btn-secondary' style={{ fontSize: '13px' }}>Annuler</button>
            <button onClick={addDocumentManual} className='btn-primary' style={{ fontSize: '13px' }}>Enregistrer sans fichier</button>
          </div>
        </div>
      )}

      {documents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {documents.map(doc => {
            const typeInfo = getTypeInfo(doc.type)
            const statutConf = getStatutConfig(doc.statut)
            return (
              <div key={doc.id} className='card' style={{ padding: '20px', borderLeft: '3px solid ' + statutConf.border }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px', color: 'var(--gray-500)', flexShrink: 0, border: '1px solid var(--gray-200)' }}>
                    {typeInfo.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.nom}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                      {typeInfo.label} - {new Date(doc.created_at).toLocaleDateString('fr-FR')}{doc.taille ? ' - ' + formatTaille(doc.taille) : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: statutConf.bg, color: statutConf.color, border: '1px solid ' + statutConf.border }}>
                        {statutConf.label}
                      </span>
                      {doc.url && (
                        <a href={doc.url} target='_blank' rel='noopener noreferrer' style={{ fontSize: '12px', color: 'var(--brand-blue)', fontWeight: 500 }}>
                          Voir le fichier
                        </a>
                      )}
                      {doc.url && (
                        <button
                          onClick={() => analyseOCR(doc)}
                          disabled={ocrLoading === doc.id}
                          style={{
                            fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                            cursor: ocrLoading === doc.id ? 'wait' : 'pointer',
                            background: ocrLoading === doc.id ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: ocrLoading === doc.id ? '#64748b' : 'white',
                            border: 'none', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          {ocrLoading === doc.id ? 'Analyse...' : 'Extraire IA'}
                        </button>
                      )}
                    </div>
                    {ocrResult[doc.id] && (
                      <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#6d28d9', marginBottom: '6px' }}>
                          {'Extraction IA â '}{ocrResult[doc.id].type_document || 'Document'}
                        </div>
                        {ocrResult[doc.id].donnees_extraites?.nom && (
                          <div>{'Nom : '}<strong>{ocrResult[doc.id].donnees_extraites.prenom || ''} {ocrResult[doc.id].donnees_extraites.nom}</strong></div>
                        )}
                        {ocrResult[doc.id].donnees_extraites?.salaire_net_mensuel && (
                          <div>{'Salaire net : '}<strong>{Number(ocrResult[doc.id].donnees_extraites.salaire_net_mensuel).toLocaleString('fr-FR')} EUR/mois</strong></div>
                        )}
                        {ocrResult[doc.id].donnees_extraites?.employeur && (
                          <div>{'Employeur : '}<strong>{ocrResult[doc.id].donnees_extraites.employeur}</strong></div>
                        )}
                        {ocrResult[doc.id].donnees_extraites?.type_contrat && (
                          <div>{'Contrat : '}<strong>{ocrResult[doc.id].donnees_extraites.type_contrat}</strong></div>
                        )}
                        {ocrResult[doc.id].donnees_extraites?.revenu_fiscal_reference && (
                          <div>{'RFR : '}<strong>{Number(ocrResult[doc.id].donnees_extraites.revenu_fiscal_reference).toLocaleString('fr-FR')} EUR</strong></div>
                        )}
                        {ocrResult[doc.id].resume && (
                          <div style={{ marginTop: '4px', color: '#64748b', fontStyle: 'italic' }}>{ocrResult[doc.id].resume}</div>
                        )}
                        {ocrResult[doc.id].auto_filled && (
                          <div style={{ marginTop: '6px', color: '#059669', fontWeight: 600 }}>{'Donnees auto-remplies dans le dossier'}</div>
                        )}
                        {!ocrResult[doc.id].auto_filled && (
                          <div style={{ marginTop: '6px', color: '#64748b' }}>{'Confiance : '}{Math.round((ocrResult[doc.id].confiance || 0) * 100)}%</div>
                        )}
                      </div>
                    )}
                  </div>
                  <select
                    value={doc.statut || 'en_attente'}
                    onChange={e => updateStatut(doc.id, e.target.value)}
                    style={{ fontSize: '11px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--gray-200)', background: 'white', color: 'var(--gray-700)', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <option value='en_attente'>En attente</option>
                    <option value='a_verifier'>A verifier</option>
                    <option value='valide'>Valide</option>
                    <option value='refuse'>Refuse</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className='empty-state'>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700, fontSize: '10px', color: 'var(--gray-400)', letterSpacing: '0.1em' }}>DOC</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '8px' }}>Aucun document</h3>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px' }}>Ajoutez les pieces justificatives du dossier pour effectuer le controle documentaire</p>
          <button onClick={() => setShowForm(true)} className='btn-primary'>+ Ajouter un document</button>
        </div>
      )}

      <div className='card' style={{ marginTop: '8px' }}>
        <div className='card-header'>
          <h3 className='card-title'>Checklist documentaire</h3>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Documents obligatoires pour constitution du dossier bancaire</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {typesRequis.map(t => {
            const fourni = documents.some(d => d.type === t.value)
            const doc = documents.find(d => d.type === t.value)
            const conf = doc ? getStatutConfig(doc.statut) : null
            return (
              <div key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: fourni ? '#F0FDF4' : 'var(--gray-50)', border: '1px solid ' + (fourni ? '#BBF7D0' : 'var(--gray-200)') }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: fourni ? '#059669' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: fourni ? 'white' : 'var(--gray-400)', fontSize: '10px', fontWeight: 700 }}>
                    {fourni ? 'OK' : '-'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: fourni ? '#065F46' : 'var(--gray-600)' }}>{t.label}</div>
                  {doc && conf && <div style={{ fontSize: '11px', color: conf.color }}>{conf.label}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>

      <div className='card' style={{ marginTop: '8px' }}>
        <div className='card-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className='card-title'>{'Analyse globale IA'}</h3>
            <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{'Analyse croisee de tous les documents'}</span>
          </div>
          <button onClick={lancerAnalyseGlobale} disabled={analyseLoading} style={{ padding: '8px 20px', borderRadius: '10px', cursor: analyseLoading ? 'wait' : 'pointer', background: analyseLoading ? '#e2e8f0' : 'linear-gradient(135deg, #0B1D3A, #1a3a6b)', color: analyseLoading ? '#64748b' : 'white', border: 'none', fontWeight: 700, fontSize: '13px' }}>
            {analyseLoading ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
          </button>
        </div>
        {analyseGlobale && analyseGlobale.analyse && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: analyseGlobale.analyse.synthese?.statut === 'favorable' ? '#F0FDF4' : analyseGlobale.analyse.synthese?.statut === 'defavorable' ? '#FEF2F2' : '#FFFBEB', borderRadius: '12px', border: '1px solid #ddd' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '10px', color: '#0B1D3A' }}>{'Synthese â Score '}{analyseGlobale.analyse.synthese?.score_global || 0}{'/100'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', fontSize: '13px' }}>
                <div>{'Revenus : '}<strong>{(analyseGlobale.analyse.synthese?.revenus_confirmes || 0).toLocaleString('fr-FR')}{' EUR'}</strong></div>
                <div>{'Charges : '}<strong>{(analyseGlobale.analyse.synthese?.charges_confirmees || 0).toLocaleString('fr-FR')}{' EUR'}</strong></div>
                <div>{'Endettement : '}<strong>{analyseGlobale.analyse.synthese?.taux_endettement || 0}{'%'}</strong></div>
                <div>{'Reste a vivre : '}<strong>{(analyseGlobale.analyse.synthese?.reste_a_vivre || 0).toLocaleString('fr-FR')}{' EUR'}</strong></div>
                <div>{'Capacite : '}<strong>{(analyseGlobale.analyse.synthese?.capacite_emprunt_mensuel || 0).toLocaleString('fr-FR')}{' EUR/mois'}</strong></div>
                <div>{'Statut : '}<strong style={{ color: analyseGlobale.analyse.synthese?.statut === 'favorable' ? '#059669' : '#dc2626' }}>{analyseGlobale.analyse.synthese?.statut || '-'}</strong></div>
              </div>
            </div>
            {analyseGlobale.analyse.coherence_revenus && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{'Coherence revenus : '}<span style={{ color: analyseGlobale.analyse.coherence_revenus.statut === 'ok' ? '#059669' : '#f59e0b' }}>{analyseGlobale.analyse.coherence_revenus.statut}</span></div>
                <div>{analyseGlobale.analyse.coherence_revenus.details}</div>
              </div>
            )}
            {analyseGlobale.analyse.anomalies && analyseGlobale.analyse.anomalies.length > 0 && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', color: '#dc2626' }}>{'Anomalies ('}{analyseGlobale.analyse.anomalies.length}{')'}</div>
                {analyseGlobale.analyse.anomalies.map((a: any, i: number) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <div><strong style={{ color: a.severite === 'haute' ? '#dc2626' : '#f59e0b' }}>{'['}{a.severite}{'] '}</strong>{a.description}</div>
                    {a.recommandation && <div style={{ color: '#059669', marginTop: '2px' }}>{a.recommandation}</div>}
                  </div>
                ))}
              </div>
            )}
            {analyseGlobale.analyse.documents_manquants && analyseGlobale.analyse.documents_manquants.length > 0 && (
              <div style={{ padding: '12px 16px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#d97706' }}>{'Documents manquants'}</div>
                {analyseGlobale.analyse.documents_manquants.map((d: string, i: number) => (<div key={i}>{'- '}{d}</div>))}
              </div>
            )}
            {analyseGlobale.analyse.banques_recommandees && analyseGlobale.analyse.banques_recommandees.length > 0 && (
              <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1d4ed8' }}>{'Banques recommandees'}</div>
                <div>{analyseGlobale.analyse.banques_recommandees.join(', ')}</div>
              </div>
            )}
            {analyseGlobale.analyse.recommandations && analyseGlobale.analyse.recommandations.length > 0 && (
              <div style={{ padding: '12px 16px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#059669' }}>{'Recommandations courtier'}</div>
                {analyseGlobale.analyse.recommandations.map((r: string, i: number) => (<div key={i} style={{ marginBottom: '4px' }}>{'- '}{r}</div>))}
              </div>
            )}
            {analyseGlobale.analyse.conclusion && (
              <div style={{ padding: '14px 16px', background: '#0B1D3A', borderRadius: '12px', color: 'white', fontSize: '14px', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#D4A843' }}>{'Conclusion'}</div>
                {analyseGlobale.analyse.conclusion}
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>{analyseGlobale.nombre_documents_analyses}{' documents analyses sur '}{analyseGlobale.total_documents}</div>
          </div>
        )}
      </div>

    </div>
  )
}
