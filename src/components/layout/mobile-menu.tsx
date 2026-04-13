'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function MobileMenuWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Toggle sidebar class on the aside element
  useEffect(() => {
    const aside = document.querySelector('aside')
    if (aside) {
      aside.classList.add('sidebar')
      if (sidebarOpen) {
        aside.classList.add('open')
      } else {
        aside.classList.remove('open')
      }
    }
  }, [sidebarOpen])

  return (
    <div className="app-shell">
      {/* Hamburger button - visible only on mobile via CSS */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Menu"
      >
        {sidebarOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Overlay - visible on mobile when sidebar is open */}
      <div
        className={'sidebar-overlay' + (sidebarOpen ? ' open' : '')}
        onClick={() => setSidebarOpen(false)}
      />

      {children}
    </div>
  )
}
