'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatMontant } from '@/lib/utils/format'

interface Emprunteur {
  id: string
  prenom: string
  nom: string
  est_co_emprunteur: boolean
  type_contrat?: string
  employeur?: string
  salaire_net_mensuel?: number
  autres_revenus?: number
  credits_en_cours?: number
  email?: string
  telephone?: string
}

export default function EmprunteursPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({
    prenom: '', nom: '', est_co_emprunteur: false,
    type_contrat: 'CDI', employeur: '',
    salaire_net_mensuel: '', autres_revenus: '', revenus_locatifs: '',
    credits_en_cours: '', pension_versee: '', autres_charges: '',
    epargne: '', valeur_patrimoine_immo: '',
    email: '', telephone: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmprunteurs()
  }, [dossierId])

  async function fetchEmprunteurs() {
    const res = await fetch(`/api/dossiers/${dossierId}/emprunteurs`)
    if (res.ok) {
      const data = await res.json()
      setEmprunteurs(data)
      if (data.length === 0) setShowForm(true)
    }
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

    const url = editingId ? `/api/dossiers/${dossierId}/emprunteurs?emprunteurId=${editingId}` : `/api/dossiers/${dossierId}/emprunteurs`
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
    setFormData({ prenom: '', nom: '', est_co_emprunteur: false, type_contrat: 'CDI', employeur: '', salaire_net_mensuel: '', autres_revenus: '', revenus_locatifs: '', credits_en_cours: '', pension_versee: '', autres_charges: '', epargne: '', valeur_patrimoine_immo: '', email: '', telephone: '' })
    setShowForm(false)
    setEditingId(null)
  }

  function editEmprunteur(e: Emprunteur) {
    setFormData({ ...e, salaire_net_mensuel: e.salaire_net_mensuel || '', autres_revenus: (e as any).autres_revenus || '', revenus_locatifs: (e as any).revenus_locatifs || '', credits_en_cours: e.credits_en_cours || '', pension_versee: (e as any).pension_versee || '', autres_charges: (e as any).autres_charges || '', epargne: (e as any).epargne || '', valeur_patrimoine_immo: (e as any).valeur_patrimoine_immo || '' })
    setEditingId(e.id)
    setShowForm(true)
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Chargement...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Emprunteurs</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="cortia-button-primary">
            + Ajouter {emprunteurs.length > 0 ? 'co-emprunteur' : 'emprunteur'}
          </button>
        )}
      </div>

      {/* Liste */}
      {emprunteurs.map(e => (
        <div key={e.id} className="cortia-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{e.prenom} {e.nom}</h3>
              <p className="text-sm text-gray-500">{e.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal'}</p>
              {e.employeur && <p className="text-sm text-gray-600 mt-1">{e.type_contrat} · {e.employeur}</p>}
              {e.salaire_net_mensuel && (
                <p className="text-sm font-medium text-blue-700 mt-1">
                  {formatMontant(e.salaire_net_mensuel)}/mois net
                  {e.credits_en_cours ? ` · Charges: ${formatMontant(e.credits_en_cours)}/mois` : ''}
                </p>
              )}
            </div>
            <button onClick={() => editEmprunteur(e)} className="text-sm text-blue-600 hover:text-blue-700">
              Modifier
            </button>
          </div>
        </div>
      ))}

      {/* Formulaire */}
      {showForm && (
        <div className="cortia-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier l\'emprunteur' : 'Ajouter un emprunteur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="cortia-label">Prénom *</label>
                <input name="prenom" value={formData.prenom} onChange={handleChange} className="cortia-input" required />
              </div>
              <div>
                <label className="cortia-label">Nom *</label>
                <input name="nom" value={formData.nom} onChange={handleChange} className="cortia-input" required />
              </div>
            </div>

            {emprunteurs.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="est_co_emprunteur" checked={formData.est_co_emprunteur} onChange={handleChange} className="rounded" />
                Co-emprunteur
              </label>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="cortia-label">Type de contrat</label>
                <select name="type_contrat" value={formData.type_contrat} onChange={handleChange} className="cortia-input">
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Fonctionnaire">Fonctionnaire</option>
                  <option value="Indépendant">Indépendant</option>
                  <option value="Libéral">Profession libérale</option>
                  <option value="Gérant">Gérant</option>
                  <option value="Retraité">Retraité</option>
                </select>
              </div>
              <div>
                <label className="cortia-label">Employeur</label>
                <input name="employeur" value={formData.employeur} onChange={handleChange} className="cortia-input" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="cortia-label">Salaire net/mois (€)</label>
                <input type="number" name="salaire_net_mensuel" value={formData.salaire_net_mensuel} onChange={handleChange} className="cortia-input" placeholder="3500" />
              </div>
              <div>
                <label className="cortia-label">Autres revenus (€)</label>
                <input type="number" name="autres_revenus" value={formData.autres_revenus} onChange={handleChange} className="cortia-input" placeholder="0" />
              </div>
              <div>
                <label className="cortia-label">Revenus locatifs (€)</label>
                <input type="number" name="revenus_locatifs" value={formData.revenus_locatifs} onChange={handleChange} className="cortia-input" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="cortia-label">Crédits en cours (€/mois)</label>
                <input type="number" name="credits_en_cours" value={formData.credits_en_cours} onChange={handleChange} className="cortia-input" placeholder="0" />
              </div>
              <div>
                <label className="cortia-label">Épargne disponible (€)</label>
                <input type="number" name="epargne" value={formData.epargne} onChange={handleChange} className="cortia-input" placeholder="0" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="cortia-button-primary disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={resetForm} className="cortia-button-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
