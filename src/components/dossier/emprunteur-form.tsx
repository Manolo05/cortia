'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react'

const emprunteurSchema = z.object({
  civilite: z.string().min(1, 'Civilité requise'),
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  date_naissance: z.string().optional(),
  situation_familiale: z.string().optional(),
  nb_enfants: z.number().min(0).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  situation_pro: z.string().optional(),
  type_contrat: z.string().optional(),
  employeur: z.string().optional(),
  anciennete_mois: z.number().min(0).optional(),
  salaire_net: z.number().min(0).optional(),
  autres_revenus: z.number().min(0).optional(),
  est_co_emprunteur: z.boolean().optional(),
})

type EmprunteurFormData = z.infer<typeof emprunteurSchema>

interface EmprunteurFormProps {
  initialData?: Partial<EmprunteurFormData>[]
  onSubmit: (data: EmprunteurFormData[]) => Promise<void>
  isLoading?: boolean
}

const situationFamilialeOptions = [
  { value: 'celibataire', label: 'Célibataire' },
  { value: 'marie', label: 'Marié(e)' },
  { value: 'pacse', label: 'Pacsé(e)' },
  { value: 'concubin', label: 'Concubin(e)' },
  { value: 'divorce', label: 'Divorcé(e)' },
  { value: 'veuf', label: 'Veuf/Veuve' },
]

const situationProOptions = [
  { value: 'salarie', label: 'Salarié(e)' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'independant', label: 'Indépendant(e)' },
  { value: 'chef_entreprise', label: "Chef d'entreprise" },
  { value: 'retraite', label: 'Retraité(e)' },
  { value: 'sans_emploi', label: 'Sans emploi' },
]

const typeContratOptions = [
  { value: 'cdi', label: 'CDI' },
  { value: 'cdd', label: 'CDD' },
  { value: 'interim', label: 'Intérim' },
  { value: 'stage', label: 'Stage' },
  { value: 'alternance', label: 'Alternance' },
]

export function EmprunteurForm({ initialData, onSubmit, isLoading }: EmprunteurFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0)

  const defaultEmprunteur: EmprunteurFormData = {
    civilite: 'M.',
    nom: '',
    prenom: '',
    date_naissance: '',
    situation_familiale: '',
    nb_enfants: 0,
    email: '',
    telephone: '',
    situation_pro: '',
    type_contrat: '',
    employeur: '',
    anciennete_mois: 0,
    salaire_net: 0,
    autres_revenus: 0,
    est_co_emprunteur: false,
  }

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(z.object({ emprunteurs: z.array(emprunteurSchema) })),
    defaultValues: {
      emprunteurs: initialData?.length ? initialData as EmprunteurFormData[] : [defaultEmprunteur],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'emprunteurs' })

  const onFormSubmit = async (data: { emprunteurs: EmprunteurFormData[] }) => {
    await onSubmit(data.emprunteurs)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {index === 0 ? 'Emprunteur principal' : `Co-emprunteur ${index}`}
                </p>
                <p className="text-sm text-gray-500">
                  Cliquez pour {expandedIndex === index ? 'réduire' : 'développer'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(index) }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {expandedIndex === index ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Form fields */}
          {expandedIndex === index && (
            <div className="p-4 border-t border-gray-100 space-y-6">
              {/* Identité */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Identité</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Civilité *</label>
                    <select
                      {...register(`emprunteurs.${index}.civilite`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                    <input
                      {...register(`emprunteurs.${index}.nom`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DUPONT"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
                    <input
                      {...register(`emprunteurs.${index}.prenom`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      {...register(`emprunteurs.${index}.date_naissance`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Situation familiale</label>
                    <select
                      {...register(`emprunteurs.${index}.situation_familiale`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      {situationFamilialeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nb. enfants à charge</label>
                    <input
                      type="number"
                      min="0"
                      {...register(`emprunteurs.${index}.nb_enfants`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      {...register(`emprunteurs.${index}.email`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                    <input
                      {...register(`emprunteurs.${index}.telephone`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>
              </div>

              {/* Situation professionnelle */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Situation professionnelle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Situation</label>
                    <select
                      {...register(`emprunteurs.${index}.situation_pro`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      {situationProOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type de contrat</label>
                    <select
                      {...register(`emprunteurs.${index}.type_contrat`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      {typeContratOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Employeur</label>
                    <input
                      {...register(`emprunteurs.${index}.employeur`)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ancienneté (mois)</label>
                    <input
                      type="number"
                      min="0"
                      {...register(`emprunteurs.${index}.anciennete_mois`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Revenus */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenus</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Salaire net mensuel (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      {...register(`emprunteurs.${index}.salaire_net`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Autres revenus mensuels (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      {...register(`emprunteurs.${index}.autres_revenus`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add co-borrower */}
      {fields.length < 2 && (
        <button
          type="button"
          onClick={() => append({ ...defaultEmprunteur, est_co_emprunteur: true })}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un co-emprunteur
        </button>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
