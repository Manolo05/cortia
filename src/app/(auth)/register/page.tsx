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
        try {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                          email: formData.email,
                          password: formData.password,
                          options: {
                                      data: {
                                                    nom_complet: formData.nomComplet,
                                                    nom_cabinet: formData.nomCabinet,
                                      },
                          },
                })
                if (signUpError) throw signUpError

          // Si pas de confirmation email requise, setup immédiat
          if (signUpData.session) {
                    const setupRes = await fetch('/api/auth/setup', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                              nomComplet: formData.nomComplet,
                                              nomCabinet: formData.nomCabinet,
                                }),
                    })
                    if (!setupRes.ok) {
                                const setupData = await setupRes.json()
                                console.warn('Setup warning:', setupData.error)
                    }
                    router.push('/')
                    router.refresh()
          } else {
                    setSuccess(true)
          }
        } catch (err: any) {
                setError(err.message || 'Erreur lors de la création du compte')
                setLoading(false)
        }
  }

  if (success) {
        return (
                <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>svg>
                        </div>div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>h2>
                        <p className="text-gray-500 mb-6">
                                  Vérifiez votre email pour confirmer votre compte puis connectez-vous.
                        </p>p>
                        <Link href="/login" className="cortia-button-primary">
                                  Se connecter
                        </Link>Link>
                </div>div>
              )
  }
  
    return (
          <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</h2>h2>
                <p className="text-gray-500 text-sm mb-6">Rejoignez CortIA et démarrez gratuitement</p>p>
            {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>div>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                                  <div>
                                              <label htmlFor="nomComplet" className="cortia-label">Nom complet</label>label>
                                              <input id="nomComplet" name="nomComplet" type="text" value={formData.nomComplet}
                                                              onChange={handleChange} className="cortia-input" placeholder="Jean Dupont" required />
                                  </div>div>
                                  <div>
                                              <label htmlFor="nomCabinet" className="cortia-label">Nom du cabinet</label>label>
                                              <input id="nomCabinet" name="nomCabinet" type="text" value={formData.nomCabinet}
                                                              onChange={handleChange} className="cortia-input" placeholder="Cabinet Dupont" required />
                                  </div>div>
                        </div>div>
                        <div>
                                  <label htmlFor="email" className="cortia-label">Email professionnel</label>label>
                                  <input id="email" name="email" type="email" value={formData.email}
                                                onChange={handleChange} className="cortia-input" placeholder="jean@cabinet.fr" required />
                        </div>div>
                        <div className="grid grid-cols-2 gap-3">
                                  <div>
                                              <label htmlFor="password" className="cortia-label">Mot de passe</label>label>
                                              <input id="password" name="password" type="password" value={formData.password}
                                                              onChange={handleChange} className="cortia-input" placeholder="8 caractères min." required />
                                  </div>div>
                                  <div>
                                              <label htmlFor="confirmPassword" className="cortia-label">Confirmation</label>label>
                                              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword}
                                                              onChange={handleChange} className="cortia-input" placeholder="••••••••" required />
                                  </div>div>
                        </div>div>
                        <button type="submit" disabled={loading}
                                    className="w-full cortia-button-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? (
                                                  <span className="flex items-center justify-center gap-2">
                                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>svg>
                                                                Création en cours...
                                                  </span>span>
                                                ) : 'Créer mon compte'}
                        </button>button>
                </form>form>
                <div className="mt-5 text-center">
                        <p className="text-sm text-gray-500">
                                  Déjà un compte ?{' '}
                                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Se connecter</Link>Link>
                        </p>p>
                </div>div>
          </>>
        )
}</></div>
