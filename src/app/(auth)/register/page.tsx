'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nomComplet: '',
    nomCabinet: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nom_complet: formData.nomComplet,
          nom_cabinet: formData.nomCabinet,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
        <p className="text-gray-500 mb-6">
          Vérifiez votre email pour confirmer votre compte puis connectez-vous.
        </p>
        <Link href="/login" className="cortia-button-primary">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
      <p className="text-gray-500 text-sm mb-6">Rejoignez CortIA et démarrez gratuitement</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="nomComplet" className="cortia-label">Nom complet</label>
          <input
            id="nomComplet"
            name="nomComplet"
            type="text"
            value={formData.nomComplet}
            onChange={handleChange}
            className="cortia-input"
            placeholder="Jean Dupont"
            required
          />
        </div>

        <div>
          <label htmlFor="nomCabinet" className="cortia-label">Nom du cabinet</label>
          <input
            id="nomCabinet"
            name="nomCabinet"
            type="text"
            value={formData.nomCabinet}
            onChange={handleChange}
            className="cortia-input"
            placeholder="Cabinet Dupont Immobilier"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="cortia-label">Email professionnel</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="cortia-input"
            placeholder="jean@cabinet.fr"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="cortia-label">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="cortia-input"
            placeholder="8 caractères minimum"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="cortia-label">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="cortia-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cortia-button-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </>
  )
}
