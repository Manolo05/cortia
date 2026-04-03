'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NouveauDossierPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom_client: '',
    email_client: '',
    telephone_client: '',
    type_bien: 'appartement',
    montant_pret: '',
    statut: 'en_attente',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Non authentifié')
      setLoading(false)
      return
    }

    const response = await fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        montant_pret: formData.montant_pret ? parseFloat(formData.montant_pret) : null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Erreur lors de la création')
      setLoading(false)
    } else {
      router.push('/dossiers')
      router.refresh()
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '42rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/dossiers" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'background 0.2s' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Nouveau dossier</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.125rem' }}>{"Créer un dossier client"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {error && (
          <div style={{ padding: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}

        {/* Client info section */}
        <div className="cortia-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.1)' }}>
              <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 style={{ fontWeight: 600, color: '#1e293b' }}>Informations client</h2>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Nom complet *</label>
            <input
              type="text"
              value={formData.nom_client}
              onChange={e => setFormData(p => ({ ...p, nom_client: e.target.value }))}
              className="cortia-input"
              style={{ width: '100%' }}
              placeholder="Jean Dupont"
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                value={formData.email_client}
                onChange={e => setFormData(p => ({ ...p, email_client: e.target.value }))}
                className="cortia-input"
                style={{ width: '100%' }}
                placeholder="client@email.com"
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>{"Téléphone"}</label>
              <input
                type="tel"
                value={formData.telephone_client}
                onChange={e => setFormData(p => ({ ...p, telephone_client: e.target.value }))}
                className="cortia-input"
                style={{ width: '100%' }}
                placeholder="06 12 34 56 78"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Dossier info section */}
        <div className="cortia-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)' }}>
              <svg width="16" height="16" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h2 style={{ fontWeight: 600, color: '#1e293b' }}>{"Détails du projet"}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Type de bien</label>
              <select
                value={formData.type_bien}
                onChange={e => setFormData(p => ({ ...p, type_bien: e.target.value }))}
                className="cortia-input"
                style={{ width: '100%' }}
                disabled={loading}
              >
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="terrain">Terrain</option>
                <option value="commercial">Local commercial</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>{"Montant du prêt (€)"}</label>
              <input
                type="number"
                value={formData.montant_pret}
                onChange={e => setFormData(p => ({ ...p, montant_pret: e.target.value }))}
                className="cortia-input"
                style={{ width: '100%' }}
                placeholder="250000"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Statut initial</label>
            <select
              value={formData.statut}
              onChange={e => setFormData(p => ({ ...p, statut: e.target.value }))}
              className="cortia-input"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="analyse">Analyse IA</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#334155', marginBottom: '0.5rem' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              className="cortia-input"
              style={{ width: '100%', resize: 'vertical' }}
              placeholder={"Informations complémentaires..."}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Link href="/dossiers" className="cortia-button-ghost" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="cortia-button-primary"
            style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Création...' : 'Créer le dossier'}
          </button>
        </div>
      </form>
    </div>
  )
}
