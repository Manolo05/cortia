'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const projetSchema = z.object({
  type_bien: z.string().min(1, 'Type de bien requis'),
  usage: z.string().min(1, 'Usage requis'),
  localisation: z.string().optional(),
  surface_m2: z.number().min(1).optional(),
  prix_achat: z.number().min(0, 'Prix requis'),
  travaux: z.number().min(0).optional(),
  frais_notaire: z.number().min(0).optional(),
  apport: z.number().min(0).optional(),
  montant_emprunte: z.number().min(0).optional(),
  duree_mois: z.number().min(12).max(360).optional(),
  taux_souhaite: z.number().min(0).max(20).optional(),
  mensualite_max: z.number().min(0).optional(),
  charges_actuelles: z.number().min(0).optional(),
  valeur_patrimoine: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type ProjetFormData = z.infer<typeof projetSchema>

interface ProjetFormProps {
  initialData?: Partial<ProjetFormData>
  onSubmit: (data: ProjetFormData) => Promise<void>
  isLoading?: boolean
}

const typeBienOptions = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'immeuble', label: 'Immeuble' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'neuf', label: 'Neuf (VEFA)' },
]

const usageOptions = [
  { value: 'residence_principale', label: 'Résidence principale' },
  { value: 'residence_secondaire', label: 'Résidence secondaire' },
  { value: 'investissement_locatif', label: 'Investissement locatif' },
]

export function ProjetForm({ initialData, onSubmit, isLoading }: ProjetFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjetFormData>({
    resolver: zodResolver(projetSchema),
    defaultValues: {
      type_bien: initialData?.type_bien || '',
      usage: initialData?.usage || '',
      localisation: initialData?.localisation || '',
      surface_m2: initialData?.surface_m2,
      prix_achat: initialData?.prix_achat || 0,
      travaux: initialData?.travaux || 0,
      frais_notaire: initialData?.frais_notaire || 0,
      apport: initialData?.apport || 0,
      montant_emprunte: initialData?.montant_emprunte,
      duree_mois: initialData?.duree_mois || 240,
      taux_souhaite: initialData?.taux_souhaite,
      mensualite_max: initialData?.mensualite_max,
      charges_actuelles: initialData?.charges_actuelles || 0,
      valeur_patrimoine: initialData?.valeur_patrimoine || 0,
      notes: initialData?.notes || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type de projet */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Type de projet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type de bien *</label>
            <select
              {...register('type_bien')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              {typeBienOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.type_bien && <p className="mt-1 text-xs text-red-500">{errors.type_bien.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usage *</label>
            <select
              {...register('usage')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner</option>
              {usageOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.usage && <p className="mt-1 text-xs text-red-500">{errors.usage.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Localisation</label>
            <input
              {...register('localisation')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paris 15e, Lyon..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Surface (m²)</label>
            <input
              type="number"
              min="1"
              {...register('surface_m2', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="75"
            />
          </div>
        </div>
      </div>

      {/* Financement */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Financement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Prix d'achat (€) *</label>
            <input
              type="number"
              min="0"
              step="1000"
              {...register('prix_achat', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250000"
            />
            {errors.prix_achat && <p className="mt-1 text-xs text-red-500">{errors.prix_achat.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Travaux (€)</label>
            <input
              type="number"
              min="0"
              step="500"
              {...register('travaux', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Frais de notaire (€)</label>
            <input
              type="number"
              min="0"
              step="500"
              {...register('frais_notaire', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="18000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Apport personnel (€)</label>
            <input
              type="number"
              min="0"
              step="1000"
              {...register('apport', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Montant à emprunter (€)</label>
            <input
              type="number"
              min="0"
              step="1000"
              {...register('montant_emprunte', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="220000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Durée souhaitée (mois)</label>
            <select
              {...register('duree_mois', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={120}>10 ans (120 mois)</option>
              <option value={180}>15 ans (180 mois)</option>
              <option value={200}>16 ans 8 mois (200 mois)</option>
              <option value={240}>20 ans (240 mois)</option>
              <option value={264}>22 ans (264 mois)</option>
              <option value={300}>25 ans (300 mois)</option>
              <option value={360}>30 ans (360 mois)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Taux souhaité (%)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.01"
              {...register('taux_souhaite', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3.50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mensualité max souhaitée (€)</label>
            <input
              type="number"
              min="0"
              step="50"
              {...register('mensualite_max', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1200"
            />
          </div>
        </div>
      </div>

      {/* Situation patrimoniale */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Situation patrimoniale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Charges mensuelles actuelles (€)</label>
            <input
              type="number"
              min="0"
              step="50"
              {...register('charges_actuelles', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valeur patrimoine immobilier (€)</label>
            <input
              type="number"
              min="0"
              step="10000"
              {...register('valeur_patrimoine', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Notes complémentaires</h3>
        <textarea
          {...register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Informations complémentaires sur le projet..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer le projet'}
        </button>
      </div>
    </form>
  )
}
