import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../config/permissions';
import { useToast } from '../components/Toast';

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

const FIELDS = [
  { key: 'judul', label: 'Judul Lowongan' },
  { key: 'perusahaan', label: 'Perusahaan' },
  { key: 'lokasi', label: 'Lokasi' },
  { key: 'kompetensi', label: 'Kompetensi' },
  { key: 'persyaratan', label: 'Persyaratan' },
  { key: 'pendidikan', label: 'Pendidikan', type: 'select' as const, options: ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1'] },
  { key: 'deadline', label: 'Deadline' },
  { key: 'sumber', label: 'Sumber', type: 'select' as const, options: ['DUDI', 'KarirHub'] },
  { key: 'kontak_hrd', label: 'Kontak HRD' },
  { key: 'bidang_usaha', label: 'Bidang Usaha' },
  { key: 'produk', label: 'Produk' },
];

export default function LowonganKerjaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const readOnly = !canWrite(user?.role, 'DUDI') && !canWrite(user?.role, 'KarirHub');
  const [data, setData] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [filterSumber, setFilterSumber] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [dudiRes, karirRes] = await Promise.all([
        gasApi.list('DUDI'),
        gasApi.list('KarirHub')
      ]);
      const dudi = (dudiRes.success ? dudiRes.data : []).map((r: any) => ({ ...r, sumber: 'DUDI' }));
      const karir = (karirRes.success ? karirRes.data : []).map((r: any) => ({ ...r, sumber: 'KarirHub' }));
      setData([...dudi, ...karir]);
    } catch {
      toast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r => {
    const matchSearch = !search ||
      r.judul?.toLowerCase().includes(search.toLowerCase()) ||
      r.perusahaan?.toLowerCase().includes(search.toLowerCase()) ||
      r.kompetensi?.toLowerCase().includes(search.toLowerCase());
    const matchSumber = !filterSumber || r.sumber === filterSumber;
    return matchSearch && matchSumber;
  });

  function startCreate() { setEditing('new'); setForm({}); }
  function startEdit(r: any) { setEditing(r.id); setForm(r); }
  function cancel() { setEditing(null); setForm({}); }

  async function save() {
    setSaving(true);
    try {
      const module = (form.sumber || 'DUDI') as 'DUDI' | 'KarirHub';
      if (editing === 'new') {
        const res = await gasApi.create(module, form);
        if (res.success) { toast('Berhasil ditambahkan', 'success'); await load(); cancel(); }
        else toast(res.error || 'Gagal', 'error');
      } else {
        const res = await gasApi.update(module, editing, form);
        if (res.success) { toast('Berhasil diupdate', 'success'); await load(); cancel(); }
        else toast(res.error || 'Gagal', 'error');
      }
    } catch { toast('Gagal menyimpan', 'error'); }
    finally { setSaving(false); }
  }

  async function remove(id: string, sumber: string) {
    if (!confirm('Hapus data ini?')) return;
    const res = await gasApi.remove(sumber as 'DUDI' | 'KarirHub', id);
    if (res.success) { toast('Berhasil dihapus', 'success'); await load(); }
    else toast(res.error || 'Gagal hapus', 'error');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Lowongan Kerja</h2>
          <p style={{ margin: '4px 0 0', fontSize: '.82rem', color: 'var(--text-muted)' }}>
            Gabungan data dari DUDI dan KarirHub
          </p>
        </div>
        {!readOnly && (
          <button className="btn btn-primary" onClick={startCreate}>+ Tambah Data</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '.85rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none', minWidth: 200 }}
        />
        <select
          value={filterSumber}
          onChange={e => setFilterSumber(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '.85rem', background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Semua Sumber</option>
          <option value="DUDI">DUDI</option>
          <option value="KarirHub">KarirHub</option>
        </select>
        <span style={{ fontSize: '.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} data</span>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>{editing === 'new' ? 'Tambah Lowongan' : 'Edit Lowongan'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 500, marginBottom: 4, color: 'var(--text-muted)' }}>{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '.85rem', background: 'var(--surface)', color: 'var(--text)' }}
                  >
                    <option value="">Pilih...</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '.85rem', background: 'var(--surface)', color: 'var(--text)' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button className="btn btn-ghost" onClick={cancel}>Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada data.</div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Judul</th>
                <th style={thStyle}>Perusahaan</th>
                <th style={thStyle}>Lokasi</th>
                <th style={thStyle}>Kompetensi</th>
                <th style={thStyle}>Sumber</th>
                <th style={thStyle}>Deadline</th>
                {!readOnly && <th style={thStyle}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>{r.judul}</td>
                  <td style={tdStyle}>{r.perusahaan}</td>
                  <td style={tdStyle}>{r.lokasi}</td>
                  <td style={tdStyle}>{r.kompetensi}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: '.72rem', fontWeight: 600,
                      background: r.sumber === 'DUDI' ? 'var(--primary-light)' : '#dcfce7',
                      color: r.sumber === 'DUDI' ? 'var(--primary)' : '#16a34a',
                    }}>{r.sumber}</span>
                  </td>
                  <td style={tdStyle}>{r.deadline || '-'}</td>
                  {!readOnly && (
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <button onClick={() => startEdit(r)} style={actionBtn}>Edit</button>
                      <button onClick={() => remove(r.id, r.sumber)} style={{ ...actionBtn, color: '#dc2626' }}>Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '.78rem', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)' };
const actionBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '.8rem', fontWeight: 500, padding: '4px 8px', borderRadius: 'var(--radius-sm)' };
