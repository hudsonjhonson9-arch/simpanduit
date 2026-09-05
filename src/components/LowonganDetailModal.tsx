import { useState, useRef } from 'react';
import { gasApi } from '../api/gasClient';

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

interface Props {
  lowongan: Lowongan;
  onClose: () => void;
}

export default function LowonganDetailModal({ lowongan, onClose }: Props) {
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    telepon: '',
    pendidikan: '',
    pengalaman: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const allowedExts = ['.pdf', '.doc', '.docx'];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!allowedExts.includes(ext)) {
      setErrorMsg('Hanya file PDF, DOC, DOCX yang diterima.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB.');
      return;
    }
    setFile(f);
    setErrorMsg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_lengkap || !form.email || !form.telepon) {
      setErrorMsg('Nama, email, dan telepon wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    let cv_base64 = '';
    let cv_filename = '';
    if (file) {
      const reader = new FileReader();
      cv_base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      cv_filename = file.name;
    }

    const res = await gasApi.lamarLowongan({
      lowongan_id: lowongan.id,
      sumber: lowongan.sumber,
      ...form,
      cv_base64,
      cv_filename,
    });

    setLoading(false);
    if (res.success) {
      setResult('success');
    } else {
      setResult('error');
      setErrorMsg(res.error || 'Gagal mengirim lamaran.');
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
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                {lowongan.judul}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '.9rem', color: 'var(--text-muted)' }}>
                {lowongan.perusahaan}
              </p>
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
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
              Lamaran Berhasil Dikirim!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Data lamaran Anda telah kami terima. HRD perusahaan akan menghubungi Anda jika sesuai dengan kualifikasi.
            </p>
            <button onClick={onClose} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer',
            }}>Tutup</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Detail lowongan */}
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
                <Detail label="Lokasi" value={lowongan.lokasi} />
                <Detail label="Pendidikan" value={lowongan.pendidikan} />
                <Detail label="Deadline" value={lowongan.deadline} />
                <Detail label="Sumber" value={lowongan.sumber} />
              </div>
              {lowongan.kompetensi && lowongan.kompetensi !== '-' && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kompetensi</span>
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {lowongan.kompetensi.split(',').map((k, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '.78rem', fontWeight: 500,
                        background: 'var(--primary-light)', color: 'var(--primary)',
                      }}>{k.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {lowongan.persyaratan && lowongan.persyaratan !== '-' && (
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Persyaratan</span>
                  <p style={{ margin: '4px 0 0', fontSize: '.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                    {lowongan.persyaratan}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 24px' }} />

            {/* Form lamaran */}
            <div style={{ padding: '16px 24px 20px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '.95rem', fontWeight: 700, color: 'var(--text)' }}>
                Formulir Lamaran
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
                <div>
                  <label style={labelStyle}>Upload CV/Resume</label>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileRef.current?.click()} style={{
                    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border)', background: 'var(--bg)',
                    cursor: 'pointer', fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'left',
                  }}>
                    {file ? file.name : 'Pilih file (PDF/DOC/DOCX, max 5MB)'}
                  </button>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Pengalaman Kerja</label>
                  <textarea name="pengalaman" value={form.pengalaman} onChange={handleChange} rows={3}
                    placeholder="Ceritakan pengalaman kerja Anda..."
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>

              {errorMsg && (
                <p style={{ margin: '12px 0 0', fontSize: '.85rem', color: 'var(--danger)' }}>{errorMsg}</p>
              )}

              <button type="submit" disabled={loading} style={{
                marginTop: 16, width: '100%', padding: '12px',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: loading ? 'var(--text-muted)' : 'var(--primary)',
                color: '#fff', fontWeight: 700, fontSize: '.95rem', cursor: loading ? 'wait' : 'pointer',
                transition: 'var(--transition)',
              }}>
                {loading ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value || value === '-') return null;
  return (
    <div>
      <span style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      <p style={{ margin: '2px 0 0', fontSize: '.88rem', color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, style }: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} required style={inputStyle} />
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
