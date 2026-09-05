import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../config/permissions';

const menu = [
  { to: '/', label: 'Beranda' },
  { to: '/dudi', label: 'Profil Industri (DUDI)' },
  { to: '/akad', label: 'AKAD' },
  { to: '/akan', label: 'AKAN (CPMI)' },
  { to: '/karirhub', label: 'KarirHub' },
  { to: '/pencari-kerja', label: 'Pendataan Pencari Kerja' },
  { to: '/identifikasi', label: '⭐ Identifikasi Kebutuhan' },
  { to: '/rekomendasi', label: '⭐ Rekomendasi Pelatihan' },
  { to: '/peta-sebaran', label: '⭐ Peta Sebaran Kebutuhan' },
  { to: '/gap-kompetensi', label: '⭐ Gap Kompetensi' },
  { to: '/laporan', label: 'Laporan' },
];

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  overlay: (open: boolean) => ({
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,.4)',
    zIndex: 98,
    display: open ? 'block' : 'none',
  }),
  sidebar: (open: boolean) => ({
    width: 'var(--sidebar-width)',
    background: 'var(--sidebar-bg)',
    color: 'var(--sidebar-text)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 99,
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform .25s ease',
  }),
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--sidebar-active)',
  },
  brand: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    padding: '12px 12px',
    flex: 1,
    overflowY: 'auto' as const,
  },
  link: (isActive: boolean) => ({
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--sidebar-text)',
    textDecoration: 'none',
    fontSize: '.875rem',
    background: isActive ? 'var(--sidebar-active)' : 'transparent',
    transition: 'background .15s',
  }),
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--sidebar-active)',
    fontSize: '.8rem',
  },
  userName: { fontWeight: 500, marginBottom: 2 },
  userRole: { color: 'var(--text-muted)', fontSize: '.75rem', marginBottom: 8 },
  main: {
    flex: 1,
    marginLeft: 0,
    transition: 'margin-left .25s ease',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  topbar: {
    height: 'var(--header-height)',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: 12,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    color: 'var(--text)',
    padding: '4px 8px',
  },
  content: {
    flex: 1,
  },
};

const mediaQuery = '(min-width: 769px)';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const visibleMenu = menu.filter(m => canAccessMenu(user?.role, m.to));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const mql = window.matchMedia(mediaQuery);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarOpen(false);
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function closeSidebar() {
    if (!window.matchMedia(mediaQuery).matches) setSidebarOpen(false);
  }

  return (
    <div style={styles.layout}>
      <div style={styles.overlay(sidebarOpen)} onClick={() => setSidebarOpen(false)} />

      <aside style={styles.sidebar(sidebarOpen)}>
        <div style={styles.header}>
          <h3 style={styles.brand}>SIMPANDUIT</h3>
        </div>
        <nav style={styles.nav}>
          {visibleMenu.map(m => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/'}
              style={({ isActive }) => styles.link(isActive)}
              onClick={closeSidebar}
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.footer}>
          <div style={styles.userName}>{user?.nama}</div>
          <div style={styles.userRole}>{user?.role}</div>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', marginTop: 4 }}>
            Keluar
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <button style={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span style={{ flex: 1 }} />
          <button
            className="btn-ghost"
            onClick={() => setDark(d => !d)}
            style={{ fontSize: 18, padding: '4px 10px' }}
            title="Toggle tema"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
        <div style={styles.content} className="fade-in">
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (min-width: 769px) {
          aside { transform: translateX(0) !important; }
          main { margin-left: var(--sidebar-width) !important; }
          .topbar-hamburger { display: none !important; }
        }
      `}</style>
    </div>
  );
}
