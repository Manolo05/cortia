'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NouveauDossierPage() {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      const dossier = await response.json()
      router.push(`/dossiers/${dossier.id}/emprunteurs`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dossiers" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Retour aux dossiers
        </Link>
      </div>

      <div className="cortia-card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouveau dossier</h1>
        <p className="text-gray-500 mb-6">
          Un numéro de référence sera automatiquement attribué à ce dossier.
          Vous pourrez ensuite renseigner les emprunteurs, le projet et les documents.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="notes" className="cortia-label">
              Notes internes (optionnel)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="cortia-input min-h-[100px] resize-none"
              placeholder="Premières observations sur le dossier..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="cortia-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer le dossier'}
            </button>
            <Link href="/dossiers" className="cortia-button-secondary">
              Annuler
            </Link>
          </div>
        </form>
      </div>

      {/* Étapes */}
      <div className="mt-6 cortia-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes après création :</h3>
        <ol className="space-y-2">
          {[
            'Renseigner les emprunteurs (revenus, charges, situation)',
            'Décrire le projet immobilier',
            'Uploader les documents justificatifs',
            'Lancer l\'analyse financière IA',
            'Générer la synthèse pour la banque',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
