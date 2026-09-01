import { useEffect, useState } from 'react';
import { gasApi, type Module } from '../api/gasClient';
import { useAuth } from '../context/AuthContext';
import { canWrite } from '../config/permissions';
import { useToast } from './Toast';

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

interface Props {
  module: Module;
  title: string;
  fields: Field[];
  headerExtra?: React.ReactNode;
}

export default function CrudTable({ module, title, fields, headerExtra }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const readOnly = !canWrite(user?.role, module);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const res = await gasApi.list(module);
    if (res.success) setRecords(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [module]);

  function startCreate() {
    setEditing('new');
    setForm({});
  }

  function startEdit(record: any) {
    setEditing(record.id);
    setForm(record);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing === 'new') {
        await gasApi.create(module, form);
        toast('Data berhasil ditambahkan', 'success');
      } else {
        await gasApi.update(module, editing, form);
        toast('Data berhasil diperbarui', 'success');
      }
      setEditing(null);
      setForm({});
      load();
    } catch (err: any) {
      toast(err?.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus data ini?')) return;
    try {
      await gasApi.remove(module, id);
      toast('Data berhasil dihapus', 'success');
      load();
    } catch (err: any) {
      toast(err?.message || 'Gagal menghapus data', 'error');
    }
  }

  const filtered = records.filter(r =>
    fields.some(f => String(r[f.key] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page">
      <div className="toolbar">
        <h2>{title}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {headerExtra}
          {!readOnly && <button onClick={startCreate} style={{ padding: '10px 20px' }}>+ Tambah Data</button>}
        </div>
      </div>

      {readOnly && (
        <p className="status-readonly" style={{ marginBottom: 16 }}>
          Anda memiliki akses lihat-saja untuk data ini.
        </p>
      )}

      <div className="search-box">
        <input
          placeholder="Cari..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {editing && (
        <div className="form-card">
          <h3>{editing === 'new' ? 'Tambah' : 'Edit'} {title}</h3>
          {fields.map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] ?? ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                >
                  <option value="">-- pilih --</option>
                  {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type ?? 'text'}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="form-actions">
            <button onClick={save} disabled={saving}>
              {saving ? <><span className="spinner" /> Menyimpan...</> : 'Simpan'}
            </button>
            <button className="btn-ghost" onClick={() => setEditing(null)} disabled={saving}>Batal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '20px 0' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton skeleton-text" style={{ width: `${70 + i * 5}%`, marginBottom: 12 }} />
          ))}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {fields.map(f => <th key={f.key}>{f.label}</th>)}
              {!readOnly && <th style={{ width: 120 }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                {fields.map(f => <td key={f.key}>{r[f.key]}</td>)}
                {!readOnly && (
                  <td>
                    <button onClick={() => startEdit(r)} style={{ padding: '4px 12px', fontSize: '.8rem' }}>Edit</button>
                    <button className="btn-danger" onClick={() => remove(r.id)} style={{ marginLeft: 4, padding: '4px 12px', fontSize: '.8rem' }}>Hapus</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={fields.length + (readOnly ? 0 : 1)} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
