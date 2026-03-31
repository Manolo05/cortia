'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const navItems = [
  { href: '/', icon: '⊞', label: 'Tableau de bord' },
  { href: '/dossiers', icon: '◧', label: 'Dossiers' },
  { href: '/clients', icon: '◯', label: 'Clients' },
  { href: '/analyses', icon: '◈', label: 'Analyses' },
  { href: '/parametres', icon: '⊙', label: 'Paramètres' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<{ email?: string; nomComplet?: string; nomCabinet?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        const { data: profil } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinet_id, cabinets(nom)')
          .eq('id', authUser.id)
          .single();
        setUser({
          email: authUser.email,
          nomComplet: profil?.nom_complet || authUser.email?.split('@')[0],
          nomCabinet: (profil?.cabinets as any)?.nom || 'Cabinet',
        });
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="cortia-sidebar">
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-icon">C</div>
        <div>
          <div className="sidebar-logo-name">CortIA</div>
          <div className="sidebar-logo-version">V2.5 · Courtage</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {loading ? (
          <div style={{ opacity: 0.5, fontSize: '0.75rem', color: 'var(--sidebar-text-muted)' }}>Chargement...</div>
        ) : (
          <>
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user?.nomComplet?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{user?.nomComplet || 'Utilisateur'}</div>
                <div className="sidebar-user-cabinet">{user?.nomCabinet}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="sidebar-logout-btn">
              Déconnexion
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
