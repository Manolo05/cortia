'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 lg:hidden" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Bon retour !</h2>
        <p className="text-slate-500 mt-1">Connectez-vous à votre espace CortIA</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl text-sm font-medium" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="cortia-input w-full"
            placeholder="votre@email.com"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="cortia-input w-full"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="cortia-button-primary w-full py-3 text-sm font-semibold"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
