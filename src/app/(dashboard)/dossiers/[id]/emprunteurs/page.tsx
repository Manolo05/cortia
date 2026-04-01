'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Emprunteur {
  id: string
  prenom: string
  nom: string
  est_co_emprunteur: boolean
  type_contrat?: string
  employeur?: string
  salaire_net_mensuel?: number
  autres_revenus?: number
  revenus_locatifs?: number
  credits_en_cours?: number
  pension_versee?: number
  autres_charges?: number
  epargne?: number
  valeur_patrimoine_immo?: number
  email?: string
  telephone?: string
}

const DEFAULT_FORM = {
  prenom: '',
  nom: '',
  est_co_emprunteur: false,
  type_contrat: 'CDI',
  employeur: '',
  salaire_net_mensuel: '',
  autres_revenus: '',
  revenus_locatifs: '',
  credits_en_cours: '',
  pension_versee: '',
  autres_charges: '',
  epargne: '',
  valeur_patrimoine_immo: '',
  email: '',
  telephone: '',
}

function formatMontant(n?: number) {
  if (!n) return '0 EUR'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function EmprunteursPage() {
  const params = useParams()
  const dossierId = params.id as string
  const supabase = createClient()

  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmprunteurs()
  }, [dossierId])

  async function fetchEmprunteurs() {
    setLoading(true)
    const res = await fetch(`/api/dossiers/${dossierId}/emprunteurs`)
    if (res.ok) {
      const data = await res.json()
      setEmprunteurs(data)
      if (data.length === 0) setShowForm(true)
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...formData,
      dossier_id: dossierId,
      salaire_net_mensuel: formData.salaire_net_mensuel ? parseFloat(formData.salaire_net_mensuel) : null,
      autres_revenus: formData.autres_revenus ? parseFloat(formData.autres_revenus) : 0,
      revenus_locatifs: formData.revenus_locatifs ? parseFloat(formData.revenus_locatifs) : 0,
      credits_en_cours: formData.credits_en_cours ? parseFloat(formData.credits_en_cours) : 0,
      pension_versee: formData.pension_versee ? parseFloat(formData.pension_versee) : 0,
      autres_charges: formData.autres_charges ? parseFloat(formData.autres_charges) : 0,
      epargne: formData.epargne ? parseFloat(formData.epargne) : 0,
      valeur_patrimoine_immo: formData.valeur_patrimoine_immo ? parseFloat(formData.valeur_patrimoine_immo) : 0,
    }

    const url = editingId
      ? `/api/dossiers/${dossierId}/emprunteurs?emprunteurId=${editingId}`
      : `/api/dossiers/${dossierId}/emprunteurs`
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      await fetchEmprunteurs()
      resetForm()
    } else {
      setError('Erreur lors de la sauvegarde. Veuillez reessayer.')
    }
    setSaving(false)
  }

  function resetForm() {
    setFormData(DEFAULT_FORM)
    setShowForm(false)
    setEditingId(null)
  }

  function editEmprunteur(e: Emprunteur) {
    setFormData({
      ...e,
      salaire_net_mensuel: e.salaire_net_mensuel || '',
      autres_revenus: (e as any).autres_revenus || '',
      revenus_locatifs: (e as any).revenus_locatifs || '',
      credits_en_cours: e.credits_en_cours || '',
      pension_versee: (e as any).pension_versee || '',
      autres_charges: (e as any).autres_charges || '',
      epargne: (e as any).epargne || '',
      valeur_patrimoine_immo: (e as any).valeur_patrimoine_immo || '',
    })
    setEditingId(e.id)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des emprunteurs...</p>
      </div>
    )
  }

  const revenusTotal = emprunteurs.reduce((sum, e) => {
    return sum + (e.salaire_net_mensuel || 0) + ((e as any).autres_revenus || 0) + ((e as any).revenus_locatifs || 0) * 0.7
  }, 0)

  const chargesTotal = emprunteurs.reduce((sum, e) => {
    return sum + (e.credits_en_cours || 0) + ((e as any).pension_versee || 0)
  }, 0)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Emprunteurs</h2>
          <p className="page-subtitle">
            {emprunteurs.length === 0
              ? 'Aucun emprunteur — ajoutez le profil principal'
              : emprunteurs.length === 1
              ? '1 emprunteur enregistre'
              : `${emprunteurs.length} emprunteurs enregistres`}
          </p>
        </div>
        {!showForm && emprunteurs.length > 0 && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + {emprunteurs.length === 1 ? 'Ajouter co-emprunteur' : 'Ajouter emprunteur'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Synthese revenus si plusieurs emprunteurs */}
      {emprunteurs.length > 0 && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-label">Revenus retenus totaux</div>
            <div className="kpi-value">{formatMontant(revenusTotal)}<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--gray-500)' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Charges declarees</div>
            <div className="kpi-value">{formatMontant(chargesTotal)}<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--gray-500)' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Nombre d emprunteurs</div>
            <div className="kpi-value">{emprunteurs.length}</div>
          </div>
        </div>
      )}

      {/* Liste emprunteurs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {emprunteurs.map((e) => (
          <div key={e.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0
                  }}>
                    {e.prenom[0]}{e.nom[0]}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--gray-900)', margin: 0 }}>
                      {e.prenom} {e.nom}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span className={`badge ${e.est_co_emprunteur ? 'badge-info' : 'badge-success'}`}>
                        {e.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal'}
                      </span>
                      {e.type_contrat && (
                        <span className="badge badge-neutral">{e.type_contrat}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginTop: '12px' }}>
                  {e.employeur && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Employeur</span>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{e.employeur}</div>
                    </div>
                  )}
                  {e.salaire_net_mensuel && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Salaire net</span>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{formatMontant(e.salaire_net_mensuel)}/mois</div>
                    </div>
                  )}
                  {(e as any).autres_revenus > 0 && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Autres revenus</span>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{formatMontant((e as any).autres_revenus)}/mois</div>
                    </div>
                  )}
                  {e.credits_en_cours > 0 && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Credits en cours</span>
                      <div style={{ fontWeight: 600, color: '#DC2626' }}>{formatMontant(e.credits_en_cours)}/mois</div>
                    </div>
                  )}
                  {(e as any).epargne > 0 && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Epargne</span>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{formatMontant((e as any).epargne)}</div>
                    </div>
                  )}
                  {e.email && (
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Email</span>
                      <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{e.email}</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => editEmprunteur(e)}
                style={{
                  fontSize: '13px', color: 'var(--brand-blue)', fontWeight: 600,
                  background: 'none', border: '1px solid var(--brand-blue)',
                  borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
                  whiteSpace: 'nowrap', marginLeft: '16px'
                }}
              >
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingId ? 'Modifier l emprunteur' : 'Ajouter un emprunteur'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Identite */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Identite
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Prenom *</label>
                  <input name="prenom" value={formData.prenom} onChange={handleChange} className="form-input" required placeholder="Jean" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input name="nom" value={formData.nom} onChange={handleChange} className="form-input" required placeholder="Dupont" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="jean.dupont@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telephone</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="form-input" placeholder="06 00 00 00 00" />
                </div>
              </div>
              {emprunteurs.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--gray-700)', marginTop: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" name="est_co_emprunteur" checked={formData.est_co_emprunteur} onChange={handleChange} />
                  Co-emprunteur
                </label>
              )}
            </div>

            {/* Situation professionnelle */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Situation professionnelle
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type de contrat</label>
                  <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} className="form-select">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Fonctionnaire">Fonctionnaire</option>
                    <option value="Independant">Independant</option>
                    <option value="Liberal">Profession liberale</option>
                    <option value="Gerant">Gerant</option>
                    <option value="Retraite">Retraite</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employeur / Entreprise</label>
                  <input name="employeur" value={formData.employeur} onChange={handleChange} className="form-input" placeholder="Ex: SNCF, Cabinet XYZ..." />
                </div>
              </div>
            </div>

            {/* Revenus */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Revenus mensuels
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Salaire net (EUR/mois)</label>
                  <input type="number" name="salaire_net_mensuel" value={formData.salaire_net_mensuel} onChange={handleChange} className="form-input" placeholder="3500" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Autres revenus (EUR/mois)</label>
                  <input type="number" name="autres_revenus" value={formData.autres_revenus} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Revenus locatifs (EUR/mois)</label>
                  <input type="number" name="revenus_locatifs" value={formData.revenus_locatifs} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
              </div>
            </div>

            {/* Charges & patrimoine */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Charges et patrimoine
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Credits en cours (EUR/mois)</label>
                  <input type="number" name="credits_en_cours" value={formData.credits_en_cours} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pension versee (EUR/mois)</label>
                  <input type="number" name="pension_versee" value={formData.pension_versee} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Autres charges (EUR/mois)</label>
                  <input type="number" name="autres_charges" value={formData.autres_charges} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Epargne disponible (EUR)</label>
                  <input type="number" name="epargne" value={formData.epargne} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Patrimoine immobilier (EUR)</label>
                  <input type="number" name="valeur_patrimoine_immo" value={formData.valeur_patrimoine_immo} onChange={handleChange} className="form-input" placeholder="0" min="0" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--gray-200)' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Enregistrer'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {emprunteurs.length === 0 && !showForm && (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
          <h3>Aucun emprunteur</h3>
          <p>Ajoutez le profil de l emprunteur principal pour commencer l analyse</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: '16px' }}>
            + Ajouter un emprunteur
          </button>
        </div>
      )}
    </div>
  )
}
