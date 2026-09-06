import { useState } from 'react';
import { gasApi } from '../api/gasClient';

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

interface Props {
  pelatihan: Pelatihan;
  onClose: () => void;
}

export default function PelatihanDetailModal({ pelatihan, onClose }: Props) {
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    telepon: '',
    pendidikan: '',
    pekerjaan: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_lengkap || !form.email || !form.telepon) {
      setErrorMsg('Nama, email, dan telepon wajib diisi.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await gasApi.daftarPelatihan({
      pelatihan_id: pelatihan.id,
      pelatihan_judul: pelatihan.judul,
      ...form,
    });
    setLoading(false);
    if (res.success) {
      setResult('success');
    } else {
      setResult('error');
      setErrorMsg(res.error || 'Gagal mendaftar.');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.5)', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%',
        maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <span style={{
                display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                fontSize: '.72rem', fontWeight: 700, background: '#dcfce7', color: '#16a34a', marginBottom: 6,
              }}>{pelatihan.kompetensi || 'Umum'}</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                {pelatihan.judul}
              </h2>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
              color: 'var(--text-muted)', padding: 4, lineHeight: 1,
            }}>&times;</button>
          </div>
        </div>

        {result === 'success' ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>&#10003;</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>
              Pendaftaran Berhasil!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Data pendaftaran Anda telah kami terima. Panitia akan menghubungi Anda untuk informasi lebih lanjut.
            </p>
            <button onClick={onClose} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer',
            }}>Tutup</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Detail pelatihan */}
            <div style={{ padding: '16px 24px' }}>
              {pelatihan.deskripsi && (
                <p style={{ margin: '0 0 16px', fontSize: '.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  {pelatihan.deskripsi}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
                <Info icon="📅" label="Jadwal" value={pelatihan.jadwal} />
                <Info icon="📍" label="Lokasi" value={pelatihan.lokasi} />
                <Info icon="🏢" label="Penyelenggara" value={pelatihan.penyelenggara} />
                <Info icon="👥" label="Target Peserta" value={pelatihan.target_peserta} />
                <Info icon="🎯" label="Kuota" value={pelatihan.kuota ? `${pelatihan.kuota} orang` : undefined} />
                {pelatihan.kontak && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>📞</span>
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Kontak</div>
                      <a href={`https://wa.me/${String(pelatihan.kontak).replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.88rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{pelatihan.kontak}</a>
                    </div>
                  </div>
                )}
                <Info icon="📊" label="Status" value={pelatihan.status} />
              </div>
              {pelatihan.status === 'Ditutup' && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: '#fef2f2', color: '#dc2626', fontSize: '.85rem', fontWeight: 500, marginBottom: 8,
                }}>
                  Pendaftaran sudah ditutup
                </div>
              )}
            </div>

            {pelatihan.status !== 'Ditutup' && (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '0 24px' }} />
                {/* Form pendaftaran */}
                <div style={{ padding: '16px 24px 20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>
                    Formulir Pendaftaran
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                    <Field label="Nama Lengkap *" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} style={{ gridColumn: '1 / -1' }} />
                    <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} />
                    <Field label="No. Telepon *" name="telepon" type="tel" value={form.telepon} onChange={handleChange} />
                    <div>
                      <label style={labelStyle}>Pendidikan Terakhir</label>
                      <select name="pendidikan" value={form.pendidikan} onChange={handleChange} style={selectStyle}>
                        <option value="">Pilih...</option>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                      </select>
                    </div>
                    <Field label="Pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange} placeholder="Contoh: Karyawan, Pelajar..." />
                  </div>
                  {errorMsg && (
                    <p style={{ margin: '12px 0 0', fontSize: '.85rem', color: 'var(--danger)' }}>{errorMsg}</p>
                  )}
                  <button type="submit" disabled={loading} style={{
                    marginTop: 16, width: '100%', padding: '12px',
                    borderRadius: 'var(--radius-sm)', border: 'none',
                    background: loading ? 'var(--text-muted)' : '#16a34a',
                    color: '#fff', fontWeight: 700, fontSize: '.95rem', cursor: loading ? 'wait' : 'pointer',
                    transition: 'var(--transition)',
                  }}>
                    {loading ? 'Mengirim...' : 'Daftar Sekarang'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value?: string }) {
  if (!value || value === '-') return null;
  return (
    <div>
      <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{icon} {label}</span>
      <p style={{ margin: '2px 0 0', fontSize: '.88rem', color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, style, placeholder }: {
  label: string; name: string; type?: string; value: string; placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required style={inputStyle} />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  fontSize: '.88rem', color: 'var(--text)', outline: 'none',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--surface)',
  fontSize: '.88rem', color: 'var(--text)', outline: 'none',
};
