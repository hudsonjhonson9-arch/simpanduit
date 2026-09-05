import { useState, useEffect } from 'react';
import { gasApi } from '../api/gasClient';
import LowonganDetailModal from '../components/LowonganDetailModal';

interface Lowongan {
  id: string;
  judul: string;
  perusahaan: string;
  lokasi: string;
  kompetensi: string;
  persyaratan: string;
  pendidikan: string;
  deadline: string;
  sumber: string;
  kontak_hrd: string;
  bidang_usaha: string;
  produk: string;
}

interface Pelatihan {
  id: string;
  judul: string;
  deskripsi: string;
  kompetensi: string;
  lokasi: string;
  jadwal: string;
  penyelenggara: string;
  kontak: string;
  target_peserta: string;
  kuota: number;
  status: string;
}

export default function LowonganPage() {
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [filterSumber, setFilterSumber] = useState('');
  const [selected, setSelected] = useState<Lowongan | null>(null);
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);

  useEffect(() => {
    Promise.all([
      gasApi.lowonganPublik(),
      gasApi.infoPelatihanPublik()
    ]).then(([lowRes, pelRes]) => {
      if (lowRes.success) setLowongan(lowRes.data);
      if (pelRes.success) setPelatihan(pelRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const lokasiList = [...new Set(lowongan.map(l => l.lokasi).filter(Boolean))];
  const sumberList = [...new Set(lowongan.map(l => l.sumber).filter(Boolean))];

  const filtered = lowongan.filter(l => {
    const matchSearch = !search ||
      l.judul.toLowerCase().includes(search.toLowerCase()) ||
      l.perusahaan.toLowerCase().includes(search.toLowerCase()) ||
      l.kompetensi?.toLowerCase().includes(search.toLowerCase());
    const matchLokasi = !filterLokasi || l.lokasi === filterLokasi;
    const matchSumber = !filterSumber || l.sumber === filterSumber;
    return matchSearch && matchLokasi && matchSumber;
  });

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, #1e3a5f 100%)',
        color: '#fff', padding: '48px 24px 40px', textAlign: 'center',
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>
          Temukan Karier Impianmu
        </h1>
        <p style={{ margin: '0 auto 24px', fontSize: '.95rem', color: '#94a3b8', maxWidth: 500, lineHeight: 1.6 }}>
          Lowongan kerja dari Dunia Usaha dan Dunia Industri (DUDI) di Kabupaten Sumba Barat
        </p>
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="Cari lowongan, perusahaan, atau kompetensi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 40px',
              borderRadius: 'var(--radius)', border: 'none',
              fontSize: '.9rem', outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            }}
          />
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </section>

      {/* Filters + Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <select value={filterLokasi} onChange={e => setFilterLokasi(e.target.value)} style={filterStyle}>
            <option value="">Semua Lokasi</option>
            {lokasiList.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterSumber} onChange={e => setFilterSumber(e.target.value)} style={filterStyle}>
            <option value="">Semua Sumber</option>
            {sumberList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: '.82rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
            {filtered.length} lowongan ditemukan
          </span>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 20, animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: 16, background: 'var(--border)', borderRadius: 4, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, width: '40%', marginBottom: 16 }} />
                <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '80%', marginBottom: 6 }} />
                <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: .4 }}>&#128269;</div>
            <p style={{ margin: 0, fontSize: '.95rem', color: 'var(--text-muted)' }}>
              {lowongan.length === 0
                ? 'Belum ada lowongan tersedia saat ini.'
                : 'Tidak ada lowongan yang cocok dengan pencarian Anda.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(l => (
              <LowonganCard key={l.id} data={l} onClick={() => setSelected(l)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && <LowonganDetailModal lowongan={selected} onClose={() => setSelected(null)} />}

      {/* Info Pelatihan Section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
          Info Pelatihan
        </h2>
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Pelatihan dan pengembangan kompetensi untuk masyarakat
        </p>
        {pelatihan.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Belum ada info pelatihan tersedia
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {pelatihan.map(p => (
              <div key={p.id} className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#dcfce7', color: '#16a34a' }}>
                    {p.kompetensi || 'Umum'}
                  </span>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{p.jadwal || '-'}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                  {p.judul}
                </h3>
                {p.deskripsi && (
                  <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {p.deskripsi.length > 100 ? p.deskripsi.slice(0, 100) + '...' : p.deskripsi}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>📍 {p.lokasi || '-'}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>🏢 {p.penyelenggara || '-'}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>👥 Kuota: {p.kuota || '-'}</div>
                </div>
                {p.kontak && (
                  <div style={{ fontSize: '.78rem', color: 'var(--primary)' }}>📞 {p.kontak}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LowonganCard({ data, onClick }: { data: Lowongan; onClick: () => void }) {
  const kompetensiList = data.kompetensi ? data.kompetensi.split(',').slice(0, 3) : [];

  return (
    <div className="card" style={{
      padding: 0, overflow: 'hidden', cursor: 'pointer',
      transition: 'var(--transition)', border: '1px solid var(--border)',
    }}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Sumber badge */}
      <div style={{
        padding: '14px 18px 0',
      }}>
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 20,
          fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase',
          background: data.sumber === 'DUDI' ? 'var(--primary-light)' : '#dcfce7',
          color: data.sumber === 'DUDI' ? 'var(--primary)' : '#16a34a',
        }}>{data.sumber}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 18px 16px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          {data.judul}
        </h3>
        <p style={{ margin: '0 0 10px', fontSize: '.85rem', color: 'var(--text-muted)' }}>
          {data.perusahaan}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {data.lokasi && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              {data.lokasi}
            </div>
          )}
          {data.pendidikan && data.pendidikan !== '-' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" /></svg>
              {data.pendidikan}
            </div>
          )}
          {data.deadline && data.deadline !== '-' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              Deadline: {data.deadline}
            </div>
          )}
        </div>

        {kompetensiList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {kompetensiList.map((k, i) => (
              <span key={i} style={{
                padding: '2px 9px', borderRadius: 20, fontSize: '.73rem',
                background: 'var(--bg)', color: 'var(--text-muted)',
              }}>{k.trim()}</span>
            ))}
            {data.kompetensi.split(',').length > 3 && (
              <span style={{ padding: '2px 8px', fontSize: '.73rem', color: 'var(--text-muted)' }}>
                +{data.kompetensi.split(',').length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: 14, padding: '10px 0 0', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--primary)' }}>Lamar Sekarang</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  );
}

const filterStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  fontSize: '.85rem', color: 'var(--text)', outline: 'none', cursor: 'pointer',
};
