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

  const inputClass = 'cortia-input w-full'

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dossiers" className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100" style={{ color: '#64748b' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouveau dossier</h1>
          <p className="text-slate-500 text-sm mt-0.5">Créer un dossier client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl text-sm font-medium" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}

        {/* Client info section */}
        <div className="cortia-card space-y-4">
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Informations client</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet *</label>
            <input
              type="text"
              value={formData.nom_client}
              onChange={e => setFormData(p => ({ ...p, nom_client: e.target.value }))}
              className={inputClass}
              placeholder="Jean Dupont"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email_client}
                onChange={e => setFormData(p => ({ ...p, email_client: e.target.value }))}
                className={inputClass}
                placeholder="client@email.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.telephone_client}
                onChange={e => setFormData(p => ({ ...p, telephone_client: e.target.value }))}
                className={inputClass}
                placeholder="06 12 34 56 78"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Dossier info section */}
        <div className="cortia-card space-y-4">
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Détails du projet</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de bien</label>
              <select
                value={formData.type_bien}
                onChange={e => setFormData(p => ({ ...p, type_bien: e.target.value }))}
                className={inputClass}
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Montant du prêt (€)</label>
              <input
                type="number"
                value={formData.montant_pret}
                onChange={e => setFormData(p => ({ ...p, montant_pret: e.target.value }))}
                className={inputClass}
                placeholder="250000"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Statut initial</label>
            <select
              value={formData.statut}
              onChange={e => setFormData(p => ({ ...p, statut: e.target.value }))}
              className={inputClass}
              disabled={loading}
            >
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="analyse">Analyse IA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              className={inputClass}
              placeholder="Informations complémentaires..."
              rows={3}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link href="/dossiers" className="cortia-button-ghost px-5 py-2.5 text-sm font-medium">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="cortia-button-primary px-6 py-2.5 text-sm font-semibold"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Création...' : 'Créer le dossier'}
          </button>
        </div>
      </form>
    </div>
  )
}
