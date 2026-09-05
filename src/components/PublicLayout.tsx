import { Link } from 'react-router-dom';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--sidebar-bg)',
        color: '#fff',
        padding: '0 24px',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <span style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '.85rem',
          }}>S</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>SIMPANDUIT</span>
        </Link>
        <Link to="/info-pelatihan" style={{
          fontSize: '.85rem',
          color: '#94a3b8',
          textDecoration: 'none',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Info Pelatihan
        </Link>
        <Link to="/login" style={{
          fontSize: '.85rem',
          color: '#94a3b8',
          textDecoration: 'none',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Masuk
        </Link>
      </header>

      <main style={{ flex: 1, background: 'var(--bg)' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '.8rem',
        color: 'var(--text-muted)',
        background: 'var(--surface)',
      }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} SIMPANDUIT &mdash; Dinas Tenaga Kerja dan Perindustrian Kabupaten Sumba Barat
        </p>
      </footer>
    </div>
  );
}
