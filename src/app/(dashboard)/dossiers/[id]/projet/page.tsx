'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ProjetPage() {
  const params = useParams()
  const dossierId = params.id as string
  const [projet, setProjet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    type_operation: 'achat_ancien',
    usage_bien: 'residence_principale',
    adresse_bien: '',
    code_postal_bien: '',
    ville_bien: '',
    surface_bien: '',
    prix_bien: '',
    montant_travaux: '',
    apport_personnel: '',
    montant_emprunt: '',
    duree_souhaitee: '20',
    taux_interet_cible: '',
    taux_assurance: '0.36',
  })

  useEffect(() => {
    fetch(`/api/dossiers/${dossierId}`)
      .then(r => r.json())
      .then(data => {
        if (data.projet) {
          setProjet(data.projet)
          setFormData(f => ({ ...f, ...Object.fromEntries(Object.entries(data.projet).map(([k, v]) => [k, v !== null && v !== undefined ? String(v) : ''])) }))
        }
        setLoading(false)
      })
  }, [dossierId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Auto-calculate montant_emprunt
  useEffect(() => {
    const prix = parseFloat(formData.prix_bien) || 0
    const travaux = parseFloat(formData.montant_travaux) || 0
    const apport = parseFloat(formData.apport_personnel) || 0
    const emprunt = prix + travaux - apport
    if (emprunt >= 0) {
      setFormData(prev => ({ ...prev, montant_emprunt: emprunt > 0 ? String(emprunt) : '' }))
    }
  }, [formData.prix_bien, formData.montant_travaux, formData.apport_personnel])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const payload = {
      dossier_id: dossierId,
      type_operation: formData.type_operation,
      usage_bien: formData.usage_bien,
      adresse_bien: formData.adresse_bien || null,
      code_postal_bien: formData.code_postal_bien || null,
      ville_bien: formData.ville_bien || null,
      surface_bien: formData.surface_bien ? parseFloat(formData.surface_bien) : null,
      prix_bien: parseFloat(formData.prix_bien) || 0,
      montant_travaux: formData.montant_travaux ? parseFloat(formData.montant_travaux) : 0,
      apport_personnel: parseFloat(formData.apport_personnel) || 0,
      montant_emprunt: parseFloat(formData.montant_emprunt) || 0,
      duree_souhaitee: parseInt(formData.duree_souhaitee) || 20,
      taux_interet_cible: formData.taux_interet_cible ? parseFloat(formData.taux_interet_cible) : null,
      taux_assurance: formData.taux_assurance ? parseFloat(formData.taux_assurance) : 0.36,
    }

    const method = projet ? 'PATCH' : 'POST'
    const url = projet ? `/api/dossiers/${dossierId}/projet` : `/api/dossiers/${dossierId}/projet`
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      setProjet(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Chargement...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Projet immobilier</h2>
        {saved && <span className="text-sm text-green-600">✅ Enregistré</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="cortia-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Type d'opération</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="cortia-label">Type</label>
              <select name="type_operation" value={formData.type_operation} onChange={handleChange} className="cortia-input">
                <option value="achat_neuf">Achat neuf</option>
                <option value="achat_ancien">Achat ancien</option>
                <option value="travaux">Travaux seuls</option>
                <option value="rachat_credit">Rachat de crédit</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="cortia-label">Usage du bien</label>
              <select name="usage_bien" value={formData.usage_bien} onChange={handleChange} className="cortia-input">
                <option value="residence_principale">Résidence principale</option>
                <option value="residence_secondaire">Résidence secondaire</option>
                <option value="investissement_locatif">Investissement locatif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="cortia-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Localisation du bien</h3>
          <div>
            <label className="cortia-label">Adresse</label>
            <input name="adresse_bien" value={formData.adresse_bien} onChange={handleChange} className="cortia-input" placeholder="123 rue de la Paix" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="cortia-label">Code postal</label>
              <input name="code_postal_bien" value={formData.code_postal_bien} onChange={handleChange} className="cortia-input" placeholder="75001" />
            </div>
            <div className="col-span-2">
              <label className="cortia-label">Ville</label>
              <input name="ville_bien" value={formData.ville_bien} onChange={handleChange} className="cortia-input" placeholder="Paris" />
            </div>
          </div>
          <div>
            <label className="cortia-label">Surface (m²)</label>
            <input type="number" name="surface_bien" value={formData.surface_bien} onChange={handleChange} className="cortia-input w-40" placeholder="75" />
          </div>
        </div>

        <div className="cortia-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Plan de financement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="cortia-label">Prix du bien (€) *</label>
              <input type="number" name="prix_bien" value={formData.prix_bien} onChange={handleChange} className="cortia-input" placeholder="250000" required />
            </div>
            <div>
              <label className="cortia-label">Montant travaux (€)</label>
              <input type="number" name="montant_travaux" value={formData.montant_travaux} onChange={handleChange} className="cortia-input" placeholder="0" />
            </div>
            <div>
              <label className="cortia-label">Apport personnel (€)</label>
              <input type="number" name="apport_personnel" value={formData.apport_personnel} onChange={handleChange} className="cortia-input" placeholder="25000" />
            </div>
            <div>
              <label className="cortia-label">Montant emprunté (€)</label>
              <input type="number" name="montant_emprunt" value={formData.montant_emprunt} onChange={handleChange} className="cortia-input bg-gray-50 font-medium" placeholder="Calculé auto" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="cortia-label">Durée (ans)</label>
              <select name="duree_souhaitee" value={formData.duree_souhaitee} onChange={handleChange} className="cortia-input">
                {[10, 15, 20, 25].map(d => (
                  <option key={d} value={d}>{d} ans</option>
                ))}
              </select>
            </div>
            <div>
              <label className="cortia-label">Taux cible (%)</label>
              <input type="number" step="0.01" name="taux_interet_cible" value={formData.taux_interet_cible} onChange={handleChange} className="cortia-input" placeholder="4.00" />
            </div>
            <div>
              <label className="cortia-label">Taux assurance (%)</label>
              <input type="number" step="0.01" name="taux_assurance" value={formData.taux_assurance} onChange={handleChange} className="cortia-input" placeholder="0.36" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="cortia-button-primary disabled:opacity-50 w-full py-3">
          {saving ? 'Enregistrement...' : 'Enregistrer le projet'}
        </button>
      </form>
    </div>
  )
}
