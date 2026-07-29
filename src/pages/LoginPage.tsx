import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error ?? 'Login gagal.');
      errorRef.current?.classList.remove('login-error');
      void errorRef.current?.offsetWidth;
      errorRef.current?.classList.add('login-error');
    }
  }

  return (
    <div className="login-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg)',
    }}>
      <div className="login-card" style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="login-logo">S</div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>SIMPANDUIT</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', lineHeight: 1.5 }}>
              Sistem Informasi Mengintegrasikan<br />Talenta dengan Dunia Industri
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group login-field">
              <label>Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="form-group login-field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    fontSize: 16,
                    color: 'var(--text-muted)',
                    lineHeight: 1,
                  }}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p ref={errorRef} className="login-error" style={{
                color: 'var(--danger)',
                fontSize: '.8rem',
                marginBottom: 16,
                textAlign: 'center',
                background: 'rgba(220,38,38,.08)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
              }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="login-btn" style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px 16px',
              fontSize: '.95rem',
            }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Memproses...</> : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
