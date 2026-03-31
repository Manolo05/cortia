'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, UserPlus, X } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'membre', 'lecteur']),
  message: z.string().optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteMemberFormProps {
  onSubmit: (data: InviteFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const roleOptions = [
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet, peut inviter des membres',
  },
  {
    value: 'membre',
    label: 'Membre',
    description: 'Peut créer et modifier des dossiers',
  },
  {
    value: 'lecteur',
    label: 'Lecteur',
    description: 'Accès en lecture seule',
  },
]

export function InviteMemberForm({ onSubmit, onCancel, isLoading }: InviteMemberFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'membre',
    },
  })

  const selectedRole = watch('role')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Inviter un membre</h2>
            <p className="text-sm text-gray-500">Envoyez une invitation par email</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              {...register('email')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="collaborateur@cabinet.fr"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôle *
          </label>
          <div className="space-y-2">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRole === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  {...register('role')}
                  value={option.value}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Message optionnel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message personnalisé{' '}
            <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            {...register('message')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Bonjour, je vous invite à rejoindre notre cabinet sur CortIA..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Envoyer l'invitation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
