'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Projet {
  id: string
  dossier_id: string
  type_bien: string
  adresse?: string
  ville?: string
  code_postal?: string
  prix_achat: number
  travaux?: number
  frais_notaire?: number
  apport?: number
  duree_souhaitee?: number
  taux_estime?: number
  usage?: string
  description?: string
}

const DEFAULT_FORM = {
  type_bien: 'Appartement',
  adresse: '',
  ville: '',
  code_postal: '',
  prix_achat: '',
  travaux: '',
  frais_notaire: '',
  apport: '',
  duree_souhaitee: '240',
  taux_estime: '',
  usage: 'Residence principale',
  description: '',
}

function formatMontant(n?: number) {
  if (!n) return '0 EUR'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function calcMensualite(capital: number, taux: number, duree: number): number {
  if (!capital || !taux || !duree) return 0
  const r = taux / 100 / 12
  return (capital * r) / (1 - Math.pow(1 + r, -duree))
}

export default function ProjetPage() {
  const params = useParams()
  const dossierId = params.id as string

  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjet()
  }, [dossierId])

  async function fetchProjet() {
    setLoading(true)
    const res = await fetch(`/api/dossiers/${dossierId}/projet`)
    if (res.ok) {
      const data = await res.json()
      setProjet(data || null)
      if (!data) setEditing(true)
      else {
        setFormData({
          ...data,
          prix_achat: data.prix_achat || '',
          travaux: data.travaux || '',
          frais_notaire: data.frais_notaire || '',
          apport: data.apport || '',
          duree_souhaitee: data.duree_souhaitee || '240',
          taux_estime: data.taux_estime || '',
        })
      }
    } else {
      setEditing(true)
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...formData,
      dossier_id: dossierId,
      prix_achat: formData.prix_achat ? parseFloat(formData.prix_achat) : 0,
      travaux: formData.travaux ? parseFloat(formData.travaux) : 0,
      frais_notaire: formData.frais_notaire ? parseFloat(formData.frais_notaire) : 0,
      apport: formData.apport ? parseFloat(formData.apport) : 0,
      duree_souhaitee: formData.duree_souhaitee ? parseInt(formData.duree_souhaitee) : 240,
      taux_estime: formData.taux_estime ? parseFloat(formData.taux_estime) : null,
    }

    const method = projet ? 'PATCH' : 'POST'
    const url = projet
      ? `/api/dossiers/${dossierId}/projet?projetId=${projet.id}`
      : `/api/dossiers/${dossierId}/projet`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      await fetchProjet()
      setEditing(false)
    } else {
      setError('Erreur lors de la sauvegarde. Veuillez reessayer.')
    }
    setSaving(false)
  }

  // Calculs projet
  const prixAchat = parseFloat(formData.prix_achat) || projet?.prix_achat || 0
  const travaux = parseFloat(formData.travaux) || projet?.travaux || 0
  const fraisNotaire = parseFloat(formData.frais_notaire) || projet?.frais_notaire || prixAchat * 0.075
  const apport = parseFloat(formData.apport) || projet?.apport || 0
  const duree = parseInt(formData.duree_souhaitee) || projet?.duree_souhaitee || 240
  const taux = parseFloat(formData.taux_estime) || projet?.taux_estime || 3.5

  const coutTotal = prixAchat + travaux + fraisNotaire
  const besoinFinancement = Math.max(0, coutTotal - apport)
  const mensualiteEstimee = calcMensualite(besoinFinancement, taux, duree)
  const ratioApport = prixAchat > 0 ? (apport / coutTotal) * 100 : 0

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du projet...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Projet immobilier</h2>
          <p className="page-subtitle">
            {projet ? `${projet.type_bien} - ${projet.ville || 'Localisation non renseignee'}` : 'Aucun projet defini'}
          </p>
        </div>
        {projet && !editing && (
          <button onClick={() => setEditing(true)} className="btn-primary">
            Modifier
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Synthese financiere (toujours visible si donnees dispo) */}
      {(prixAchat > 0) && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-label">Cout total projet</div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>{formatMontant(coutTotal)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Besoin de financement</div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>{formatMontant(besoinFinancement)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Mensualite estimee</div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>{formatMontant(mensualiteEstimee)}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--gray-500)' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Ratio apport</div>
            <div className="kpi-value" style={{ fontSize: '18px', color: ratioApport >= 10 ? '#059669' : '#DC2626' }}>
              {ratioApport.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Vue synthese projet (mode lecture) */}
      {projet && !editing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bien immobilier</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoRow label="Type de bien" value={projet.type_bien} />
              <InfoRow label="Usage" value={projet.usage || 'Non renseigne'} />
              {projet.adresse && <InfoRow label="Adresse" value={projet.adresse} />}
              {projet.ville && <InfoRow label="Ville" value={`${projet.ville}${projet.code_postal ? ' ' + projet.code_postal : ''}`} />}
              {projet.description && <InfoRow label="Description" value={projet.description} />}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Montages financier</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoRow label="Prix d achat" value={formatMontant(projet.prix_achat)} highlight />
              {projet.travaux > 0 && <InfoRow label="Travaux" value={formatMontant(projet.travaux)} />}
              <InfoRow label="Frais de notaire" value={formatMontant(projet.frais_notaire || prixAchat * 0.075)} />
              <InfoRow label="Apport personnel" value={formatMontant(projet.apport || 0)} highlight />
              <InfoRow label="Duree souhaitee" value={`${(projet.duree_souhaitee || 240) / 12} ans (${projet.duree_souhaitee || 240} mois)`} />
              {projet.taux_estime && <InfoRow label="Taux estime" value={`${projet.taux_estime}%`} />}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire edition */}
      {editing && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{projet ? 'Modifier le projet' : 'Definir le projet immobilier'}</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Bien */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Bien immobilier
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type de bien</label>
                  <select name="type_bien" value={formData.type_bien} onChange={handleChange} className="form-select">
                    <option value="Appartement">Appartement</option>
                    <option value="Maison">Maison</option>
                    <option value="Terrain">Terrain</option>
                    <option value="Immeuble">Immeuble</option>
                    <option value="Local commercial">Local commercial</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Usage</label>
                  <select name="usage" value={formData.usage} onChange={handleChange} className="form-select">
                    <option value="Residence principale">Residence principale</option>
                    <option value="Residence secondaire">Residence secondaire</option>
                    <option value="Investissement locatif">Investissement locatif</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Adresse du bien</label>
                  <input name="adresse" value={formData.adresse} onChange={handleChange} className="form-input" placeholder="12 rue de la Paix" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input name="ville" value={formData.ville} onChange={handleChange} className="form-input" placeholder="Paris" />
                </div>
                <div className="form-group">
                  <label className="form-label">Code postal</label>
                  <input name="code_postal" value={formData.code_postal} onChange={handleChange} className="form-input" placeholder="75001" />
                </div>
              </div>
            </div>

            {/* Montants */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Montages financier
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Prix d achat (EUR) *</label>
                  <input type="number" name="prix_achat" value={formData.prix_achat} onChange={handleChange} className="form-input" placeholder="250000" required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Travaux (EUR)</label>
                  <input type="number" name="travaux" value={formData.travaux} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Frais de notaire (EUR)</label>
                  <input type="number" name="frais_notaire" value={formData.frais_notaire} onChange={handleChange} className="form-input" placeholder="Auto si vide (7.5%)" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Apport personnel (EUR)</label>
                  <input type="number" name="apport" value={formData.apport} onChange={handleChange} className="form-input" placeholder="25000" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duree souhaitee (mois)</label>
                  <select name="duree_souhaitee" value={formData.duree_souhaitee} onChange={handleChange} className="form-select">
                    <option value="120">10 ans (120 mois)</option>
                    <option value="180">15 ans (180 mois)</option>
                    <option value="240">20 ans (240 mois)</option>
                    <option value="300">25 ans (300 mois)</option>
                    <option value="360">30 ans (360 mois)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Taux estime (%)</label>
                  <input type="number" name="taux_estime" value={formData.taux_estime} onChange={handleChange} className="form-input" placeholder="3.50" min="0" step="0.01" />
                </div>
              </div>
            </div>

            {/* Simulation en temps reel */}
            {prixAchat > 0 && (
              <div style={{
                background: 'var(--blue-50)',
                border: '1px solid var(--blue-200)',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Simulation en temps reel
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <SimBox label="Cout total" value={formatMontant(coutTotal)} />
                  <SimBox label="Besoin financement" value={formatMontant(besoinFinancement)} />
                  <SimBox label="Mensualite estimee" value={`${formatMontant(mensualiteEstimee)}/mois`} />
                  <SimBox label="Ratio apport" value={`${ratioApport.toFixed(1)}%`} alert={ratioApport < 10} />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Notes / Description du projet</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={3} placeholder="Informations complementaires sur le projet..." />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--gray-200)' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Enregistrement...' : projet ? 'Mettre a jour' : 'Enregistrer le projet'}
              </button>
              {projet && (
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!projet && !editing && (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
          <h3>Aucun projet defini</h3>
          <p>Definissez le projet immobilier pour lancer l analyse financiere</p>
          <button onClick={() => setEditing(true)} className="btn-primary" style={{ marginTop: '16px' }}>
            + Definir le projet
          </button>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--gray-900)' : 'var(--gray-700)' }}>{value}</span>
    </div>
  )
}

function SimBox({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: alert ? '#DC2626' : 'var(--brand-blue)' }}>{value}</div>
    </div>
  )
}
