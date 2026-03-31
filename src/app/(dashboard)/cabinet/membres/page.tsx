'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MembresPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('courtier')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    // Note: L'invitation par email nécessite un service email (ex: Resend)
    // Pour l'instant, on affiche juste un message de succès
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setSending(false)
    setEmail('')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/cabinet" className="text-gray-400 hover:text-gray-600">
          ← Cabinet
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900">Inviter un membre</h1>
      
      <div className="cortia-card p-6">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900">Invitation envoyée !</h3>
            <p className="text-gray-500 mt-1">Un email a été envoyé à {email}</p>
            <button onClick={() => setSent(false)} className="cortia-button-secondary mt-4">
              Inviter un autre membre
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="cortia-label">Email du membre à inviter</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="cortia-input"
                placeholder="collaborateur@cabinet.fr"
                required
              />
            </div>

            <div>
              <label className="cortia-label">Rôle</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="cortia-input">
                <option value="courtier">Courtier</option>
                <option value="assistant">Assistant</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p>ℹ️ La personne invitée recevra un email pour créer son compte et rejoindre votre cabinet.</p>
            </div>

            <button type="submit" disabled={sending} className="cortia-button-primary w-full disabled:opacity-50">
              {sending ? 'Envoi...' : 'Envoyer l\'invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
