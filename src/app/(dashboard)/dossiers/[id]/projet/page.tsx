'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

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

function formatMontant(v?: number) {
  if (!v) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

const CONTRATS = ['CDI', 'CDD', 'Fonctionnaire', 'Independant', 'Liberal', 'Gerant', 'Retraite']

const CONTRAT_LABELS: Record<string, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  Fonctionnaire: 'Fonctionnaire',
  Independant: 'Independant',
  Liberal: 'Profession liberale',
  Gerant: 'Gerant',
  Retraite: 'Retraite',
}

const CONTRAT_COLORS: Record<string, string> = {
  CDI: '#16a34a',
  CDD: '#d97706',
  Fonctionnaire: '#2563eb',
  Independant: '#7c3aed',
  Liberal: '#0891b2',
  Gerant: '#be185d',
  Retraite: '#64748b',
}

export default function EmprunteursPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({
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
  })

  useEffect(() => { fetchEmprunteurs() }, [dossierId])

  async function fetchEmprunteurs() {
    setLoading(true)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/emprunteurs')
      if (res.ok) {
        const data = await res.json()
        setEmprunteurs(data)
        if (data.length === 0) setShowForm(true)
      }
    } catch (e) {}
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
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
      ? '/api/dossiers/' + dossierId + '/emprunteurs?emprunteurId=' + editingId
      : '/api/dossiers/' + dossierId + '/emprunteurs'
    const method = editingId ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await fetchEmprunteurs()
      resetForm()
    }
    setSaving(false)
  }

  function resetForm() {
    setFormData({
      prenom: '', nom: '', est_co_emprunteur: false, type_contrat: 'CDI',
      employeur: '', salaire_net_mensuel: '', autres_revenus: '',
      revenus_locatifs: '', credits_en_cours: '', pension_versee: '',
      autres_charges: '', epargne: '', valeur_patrimoine_immo: '',
      email: '', telephone: '',
    })
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

  const totalRevenus = emprunteurs.reduce((sum, e) => {
    const s = e.salaire_net_mensuel || 0
    const a = (e as any).autres_revenus || 0
    const l = (e as any).revenus_locatifs || 0
    return sum + s + a + l
  }, 0)
  const totalCharges = emprunteurs.reduce((sum, e) => {
    return sum + (e.credits_en_cours || 0) + ((e as any).pension_versee || 0) + ((e as any).autres_charges || 0)
  }, 0)

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Chargement des emprunteurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">Emprunteurs</h2>
            <p className="page-subtitle">
              {emprunteurs.length === 0
                ? 'Aucun emprunteur - ajoutez le profil financier'
                : emprunteurs.length === 1
                  ? '1 emprunteur enregistre'
                  : emprunteurs.length + ' emprunteurs enregistres'}
            </p>
          </div>
          {!showForm && emprunteurs.length > 0 && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              + {emprunteurs.length > 0 ? 'Ajouter co-emprunteur' : 'Ajouter emprunteur'}
            </button>
          )}
        </div>
      </div>

      {emprunteurs.length > 0 && (
        <div className="kpi-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-label">Revenus totaux</div>
            <div className="kpi-value" style={{ color: '#16a34a' }}>{formatMontant(totalRevenus)}<span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Charges totales</div>
            <div className="kpi-value" style={{ color: '#ef4444' }}>{formatMontant(totalCharges)}<span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b' }}>/mois</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Capacite nette</div>
            <div className="kpi-value" style={{ color: totalRevenus - totalCharges > 0 ? '#2563eb' : '#ef4444' }}>
              {formatMontant(totalRevenus - totalCharges)}<span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b' }}>/mois</span>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Emprunteurs</div>
            <div className="kpi-value">{emprunteurs.length}</div>
          </div>
        </div>
      )}

      {emprunteurs.map((emp) => {
        const totalRev = (emp.salaire_net_mensuel || 0) + ((emp as any).autres_revenus || 0) + ((emp as any).revenus_locatifs || 0)
        const totalCh = (emp.credits_en_cours || 0) + ((emp as any).pension_versee || 0) + ((emp as any).autres_charges || 0)
        const contratColor = CONTRAT_COLORS[emp.type_contrat || 'CDI'] || '#64748b'
        const contratLabel = CONTRAT_LABELS[emp.type_contrat || 'CDI'] || emp.type_contrat || '-'
        return (
          <div key={emp.id} className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0
                }}>
                  {emp.prenom?.[0]?.toUpperCase()}{emp.nom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{emp.prenom} {emp.nom}</span>
                    <span className={'badge ' + (emp.est_co_emprunteur ? 'badge-neutral' : 'badge-info')}>
                      {emp.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: contratColor, background: contratColor + '18', padding: '2px 8px', borderRadius: '10px' }}>
                      {contratLabel}
                    </span>
                    {emp.employeur && (
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{emp.employeur}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => editEmprunteur(emp)}
                style={{ fontSize: '13px', color: '#2563eb', background: 'transparent', border: '1px solid #2563eb', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
              >
                Modifier
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Revenus mensuels</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{formatMontant(totalRev)}</div>
                {(emp.salaire_net_mensuel || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Salaire net: {formatMontant(emp.salaire_net_mensuel)}</div>}
                {((emp as any).autres_revenus || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b' }}>Autres: {formatMontant((emp as any).autres_revenus)}</div>}
                {((emp as any).revenus_locatifs || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b' }}>Locatifs: {formatMontant((emp as any).revenus_locatifs)}</div>}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Charges mensuelles</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: totalCh > 0 ? '#ef4444' : '#94a3b8' }}>{formatMontant(totalCh)}</div>
                {(emp.credits_en_cours || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Credits: {formatMontant(emp.credits_en_cours)}</div>}
                {((emp as any).pension_versee || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b' }}>Pension: {formatMontant((emp as any).pension_versee)}</div>}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Patrimoine</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{formatMontant((emp as any).valeur_patrimoine_immo)}</div>
                {((emp as any).epargne || 0) > 0 && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Epargne: {formatMontant((emp as any).epargne)}</div>}
              </div>
            </div>

            {(emp.email || emp.telephone) && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                {emp.email && <span style={{ fontSize: '13px', color: '#475569' }}>Email: <strong>{emp.email}</strong></span>}
                {emp.telephone && <span style={{ fontSize: '13px', color: '#475569' }}>Tel: <strong>{emp.telephone}</strong></span>}
              </div>
            )}
          </div>
        )
      })}

      {showForm && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingId ? 'Modifier emprunteur' : emprunteurs.length === 0 ? 'Ajouter emprunteur principal' : 'Ajouter co-emprunteur'}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Prenom *</label>
                <input name="prenom" value={formData.prenom} onChange={handleChange} className="form-input" required placeholder="Jean" />
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input name="nom" value={formData.nom} onChange={handleChange} className="form-input" required placeholder="Dupont" />
              </div>
            </div>

            {emprunteurs.length > 0 && !editingId && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  <input type="checkbox" name="est_co_emprunteur" checked={formData.est_co_emprunteur} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                  Co-emprunteur
                </label>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Type de contrat</label>
                <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} className="form-select">
                  {CONTRATS.map(c => <option key={c} value={c}>{CONTRAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Employeur / Entreprise</label>
                <input name="employeur" value={formData.employeur} onChange={handleChange} className="form-input" placeholder="SNCF, Hopital, etc." />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Revenus mensuels</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Salaire net mensuel (EUR)</label>
                  <input type="number" name="salaire_net_mensuel" value={formData.salaire_net_mensuel} onChange={handleChange} className="form-input" placeholder="3500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Autres revenus (EUR)</label>
                  <input type="number" name="autres_revenus" value={formData.autres_revenus} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Revenus locatifs (EUR)</label>
                  <input type="number" name="revenus_locatifs" value={formData.revenus_locatifs} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Charges mensuelles</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Credits en cours (EUR/mois)</label>
                  <input type="number" name="credits_en_cours" value={formData.credits_en_cours} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pension versee (EUR/mois)</label>
                  <input type="number" name="pension_versee" value={formData.pension_versee} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Autres charges (EUR/mois)</label>
                  <input type="number" name="autres_charges" value={formData.autres_charges} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Patrimoine et contact</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Epargne disponible (EUR)</label>
                  <input type="number" name="epargne" value={formData.epargne} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Patrimoine immo (EUR)</label>
                  <input type="number" name="valeur_patrimoine_immo" value={formData.valeur_patrimoine_immo} onChange={handleChange} className="form-input" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="jean@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telephone</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="form-input" placeholder="06 12 34 56 78" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Enregistrer emprunteur'}
              </button>
              {emprunteurs.length > 0 && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {emprunteurs.length === 0 && !showForm && (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Aucun emprunteur</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Ajoutez le profil financier du demandeur</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Ajouter emprunteur
          </button>
        </div>
      )}
    </div>
  )
}
