'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Projet {
  id: string
  dossier_id: string
  type_bien: string
  usage: string
  adresse?: string
  ville?: string
  code_postal?: string
  surface?: number
  prix_bien: number
  travaux?: number
  frais_notaire?: number
  frais_agence?: number
  apport?: number
  besoin_financement?: number
  duree_souhaitee?: number
  taux_envisage?: number
  mensualite_cible?: number
  description?: string
}

function formatMontant(v?: number) {
  if (!v && v !== 0) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function formatPct(v?: number) {
  if (!v && v !== 0) return '-'
  return v.toFixed(2) + '%'
}

const TYPES_BIEN = [
  'Appartement', 'Maison', 'Terrain', 'Immeuble', 'Commerce', 'Bureau', 'Parking', 'Autre'
]
const USAGES = ['Residence principale', 'Residence secondaire', 'Investissement locatif', 'Professionnel']
const DUREES = [10, 15, 20, 25, 30]

export default function ProjetPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({
    type_bien: 'Appartement',
    usage: 'Residence principale',
    adresse: '',
    ville: '',
    code_postal: '',
    surface: '',
    prix_bien: '',
    travaux: '',
    frais_notaire: '',
    frais_agence: '',
    apport: '',
    duree_souhaitee: 20,
    taux_envisage: '',
    mensualite_cible: '',
    description: '',
  })

  useEffect(() => { fetchProjet() }, [dossierId])

  async function fetchProjet() {
    setLoading(true)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/projet')
      if (res.ok) {
        const data = await res.json()
        if (data && data.id) {
          setProjet(data)
          setFormData({
            type_bien: data.type_bien || 'Appartement',
            usage: data.usage || 'Residence principale',
            adresse: data.adresse || '',
            ville: data.ville || '',
            code_postal: data.code_postal || '',
            surface: data.surface || '',
            prix_bien: data.prix_bien || '',
            travaux: data.travaux || '',
            frais_notaire: data.frais_notaire || '',
            frais_agence: data.frais_agence || '',
            apport: data.apport || '',
            duree_souhaitee: data.duree_souhaitee || 20,
            taux_envisage: data.taux_envisage || '',
            mensualite_cible: data.mensualite_cible || '',
            description: data.description || '',
          })
        } else {
          setEditing(true)
        }
      } else {
        setEditing(true)
      }
    } catch (e) {
      setEditing(true)
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const coutTotal = () => {
    const prix = parseFloat(formData.prix_bien) || 0
    const travaux = parseFloat(formData.travaux) || 0
    const notaire = parseFloat(formData.frais_notaire) || (prix * 0.08)
    const agence = parseFloat(formData.frais_agence) || 0
    return prix + travaux + notaire + agence
  }

  const besoinFinancement = () => {
    const apport = parseFloat(formData.apport) || 0
    return Math.max(0, coutTotal() - apport)
  }

  const ratioApport = () => {
    const c = coutTotal()
    const a = parseFloat(formData.apport) || 0
    if (c === 0) return 0
    return (a / c) * 100
  }

  const mensualiteEstimee = () => {
    const capital = besoinFinancement()
    const duree = parseInt(formData.duree_souhaitee) || 20
    const taux = parseFloat(formData.taux_envisage) || 3.5
    const tauxMensuel = taux / 100 / 12
    const nbMois = duree * 12
    if (tauxMensuel === 0 || capital === 0) return 0
    return capital * (tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) / (Math.pow(1 + tauxMensuel, nbMois) - 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...formData,
      dossier_id: dossierId,
      surface: formData.surface ? parseFloat(formData.surface) : null,
      prix_bien: formData.prix_bien ? parseFloat(formData.prix_bien) : 0,
      travaux: formData.travaux ? parseFloat(formData.travaux) : 0,
      frais_notaire: formData.frais_notaire ? parseFloat(formData.frais_notaire) : Math.round((parseFloat(formData.prix_bien) || 0) * 0.08),
      frais_agence: formData.frais_agence ? parseFloat(formData.frais_agence) : 0,
      apport: formData.apport ? parseFloat(formData.apport) : 0,
      besoin_financement: besoinFinancement(),
      duree_souhaitee: parseInt(formData.duree_souhaitee) || 20,
      taux_envisage: formData.taux_envisage ? parseFloat(formData.taux_envisage) : null,
      mensualite_cible: formData.mensualite_cible ? parseFloat(formData.mensualite_cible) : null,
    }
    const method = projet ? 'PATCH' : 'POST'
    const url = projet
      ? '/api/dossiers/' + dossierId + '/projet?projetId=' + projet.id
      : '/api/dossiers/' + dossierId + '/projet'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await fetchProjet()
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!editing && projet) {
    const cout = coutTotal()
    const besoin = besoinFinancement()
    const apportPct = ratioApport()
    const mensualite = mensualiteEstimee()

    return (
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 className="page-title">Projet immobilier</h2>
              <p className="page-subtitle">
                {projet.type_bien} - {projet.usage}
                {projet.ville ? ' - ' + projet.ville : ''}
              </p>
            </div>
            <button onClick={() => setEditing(true)} className="btn-primary">
              Modifier le projet
            </button>
          </div>
        </div>

        <div className="kpi-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-label">Prix du bien</div>
            <div className="kpi-value">{formatMontant(projet.prix_bien)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Cout total projet</div>
            <div className="kpi-value">{formatMontant(cout)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Apport</div>
            <div className="kpi-value" style={{ color: apportPct >= 10 ? '#16a34a' : '#ef4444' }}>
              {formatMontant(projet.apport)}
              <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '6px' }}>
                ({apportPct.toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Besoin financement</div>
            <div className="kpi-value" style={{ color: '#2563eb' }}>{formatMontant(besoin)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Mensualite estimee</div>
            <div className="kpi-value">{formatMontant(mensualite)}<span style={{ fontSize: '13px', color: '#64748b' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Duree souhaitee</div>
            <div className="kpi-value">{projet.duree_souhaitee || 20} <span style={{ fontSize: '14px', color: '#64748b' }}>ans</span></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Details du bien</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Type de bien', projet.type_bien],
                  ['Usage', projet.usage],
                  ['Surface', projet.surface ? projet.surface + ' m2' : '-'],
                  ['Adresse', projet.adresse || '-'],
                  ['Ville', projet.ville ? projet.ville + (projet.code_postal ? ' (' + projet.code_postal + ')' : '') : '-'],
                ].map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#64748b', width: '45%' }}>{label}</td>
                    <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Plan de financement</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Prix du bien', formatMontant(projet.prix_bien)],
                  ['Travaux', formatMontant(projet.travaux)],
                  ['Frais de notaire', formatMontant(projet.frais_notaire)],
                  ['Frais d agence', formatMontant(projet.frais_agence)],
                  ['Cout total', formatMontant(cout)],
                  ['Apport personnel', formatMontant(projet.apport) + ' (' + apportPct.toFixed(0) + '%)'],
                  ['Pret demande', formatMontant(besoin)],
                ].map(([label, value], i) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f1f5f9', background: i === 4 || i === 6 ? '#f8fafc' : 'transparent' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: i === 4 || i === 6 ? '#0f172a' : '#64748b', fontWeight: i === 4 || i === 6 ? 600 : 400, width: '55%' }}>{label}</td>
                    <td style={{ padding: '10px 0', fontSize: '14px', fontWeight: i === 4 || i === 6 ? 700 : 500, color: i === 6 ? '#2563eb' : '#0f172a' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {projet.description && (
          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              <h3 className="card-title">Notes sur le projet</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{projet.description}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">{projet ? 'Modifier le projet' : 'Saisir le projet immobilier'}</h2>
        <p className="page-subtitle">Renseignez les caracteristiques du bien et le plan de financement</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Caracteristiques du bien</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Type de bien *</label>
              <select name="type_bien" value={formData.type_bien} onChange={handleChange} className="form-select">
                {TYPES_BIEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Usage *</label>
              <select name="usage" value={formData.usage} onChange={handleChange} className="form-select">
                {USAGES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Surface (m2)</label>
              <input type="number" name="surface" value={formData.surface} onChange={handleChange} className="form-input" placeholder="65" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Adresse</label>
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

        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Plan de financement</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Prix du bien (EUR) *</label>
              <input type="number" name="prix_bien" value={formData.prix_bien} onChange={handleChange} className="form-input" required placeholder="280000" />
            </div>
            <div className="form-group">
              <label className="form-label">Travaux (EUR)</label>
              <input type="number" name="travaux" value={formData.travaux} onChange={handleChange} className="form-input" placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Frais de notaire (EUR)</label>
              <input type="number" name="frais_notaire" value={formData.frais_notaire} onChange={handleChange} className="form-input" placeholder="Auto (8%)" />
            </div>
            <div className="form-group">
              <label className="form-label">Frais d agence (EUR)</label>
              <input type="number" name="frais_agence" value={formData.frais_agence} onChange={handleChange} className="form-input" placeholder="0" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Apport personnel (EUR)</label>
              <input type="number" name="apport" value={formData.apport} onChange={handleChange} className="form-input" placeholder="28000" />
            </div>
            <div className="form-group">
              <label className="form-label">Duree souhaitee (ans)</label>
              <select name="duree_souhaitee" value={formData.duree_souhaitee} onChange={handleChange} className="form-select">
                {DUREES.map(d => <option key={d} value={d}>{d} ans</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Taux envisage (%)</label>
              <input type="number" step="0.01" name="taux_envisage" value={formData.taux_envisage} onChange={handleChange} className="form-input" placeholder="3.50" />
            </div>
            <div className="form-group">
              <label className="form-label">Mensualite cible (EUR)</label>
              <input type="number" name="mensualite_cible" value={formData.mensualite_cible} onChange={handleChange} className="form-input" placeholder="1200" />
            </div>
          </div>

          {formData.prix_bien && (
            <div style={{ marginTop: '20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Simulation en temps reel
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Cout total', value: formatMontant(coutTotal()), color: '#0f172a' },
                  { label: 'Apport (' + ratioApport().toFixed(0) + '%)', value: formatMontant(parseFloat(formData.apport) || 0), color: ratioApport() >= 10 ? '#16a34a' : '#ef4444' },
                  { label: 'Besoin financement', value: formatMontant(besoinFinancement()), color: '#2563eb' },
                  { label: 'Mensualite estimee', value: formatMontant(mensualiteEstimee()) + '/mois', color: '#7c3aed' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: 700, color: item.color, fontSize: '16px' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Notes complementaires</h3>
          </div>
          <div className="form-group">
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows={3} placeholder="Informations complementaires sur le projet (negociation en cours, diagnostics, specificites...)" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Enregistrement...' : projet ? 'Mettre a jour le projet' : 'Enregistrer le projet'}
          </button>
          {projet && (
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
