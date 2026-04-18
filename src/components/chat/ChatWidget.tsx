'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Ce dossier est-il pr\u00eat pour la banque ?',
  'Quelles banques recommandes-tu ?',
  'Quels documents manquent ?',
  'R\u00e9dige un argumentaire bancaire',
  'Le client peut-il emprunter plus ?',
]

export default function ChatWidget({ dossierId, clientName }: { dossierId: string; clientName?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossierId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('Erreur API')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) {
                assistantContent += data.text
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'D\u00e9sol\u00e9, une erreur est survenue. R\u00e9essayez.' }])
    }
    setIsLoading(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
          borderRadius: '50%', background: '#0B1D3A', color: '#D4A843',
          border: 'none', cursor: 'pointer', fontSize: 24, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(11,29,58,0.3)', zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="Assistant IA CortIA"
      >
        {'\u{1F4AC}'}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 400, height: 560,
      background: '#fff', borderRadius: 16, boxShadow: '0 8px 48px rgba(11,29,58,0.15)',
      border: '1px solid rgba(11,29,58,0.08)', display: 'flex', flexDirection: 'column',
      zIndex: 1000, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', background: '#0B1D3A', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'rgba(212,168,67,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D4A843', fontWeight: 700, fontSize: 14,
          }}>IA</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Assistant CortIA</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              {clientName ? `Dossier ${clientName}` : 'Analyse en cours'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20, padding: 4 }}
        >{'\u2715'}</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{'\u{1F9E0}'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1D3A', marginBottom: 4 }}>
              Comment puis-je vous aider ?
            </div>
            <div style={{ fontSize: 12, color: '#8A97A8', marginBottom: 20 }}>
              Posez une question sur ce dossier
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, color: '#0B1D3A',
                    background: '#F7F4EE', border: '1px solid rgba(11,29,58,0.06)',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F7F4EE')}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
          }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
              fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              background: msg.role === 'user' ? '#0B1D3A' : '#F7F4EE',
              color: msg.role === 'user' ? '#fff' : '#0B1D3A',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
            }}>
              {msg.content || (isLoading && i === messages.length - 1 ? '\u2022\u2022\u2022' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(11,29,58,0.06)',
        display: 'flex', gap: 8,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Posez votre question..."
          disabled={isLoading}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(11,29,58,0.1)',
            fontSize: 13, outline: 'none', background: isLoading ? '#f5f5f5' : '#fff',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 10, border: 'none',
            background: input.trim() ? '#0B1D3A' : 'rgba(11,29,58,0.1)',
            color: input.trim() ? '#D4A843' : '#8A97A8',
            cursor: input.trim() ? 'pointer' : 'default', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >{'\u2191'}</button>
      </div>
    </div>
  )
}
