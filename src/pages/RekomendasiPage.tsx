import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';

const prioritasStyle: Record<string, React.CSSProperties> = {
  Tinggi: { background: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Sedang: { background: '#d97706', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Rendah: { background: '#65a30d', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 }
};

export default function RekomendasiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [filterPrioritas, setFilterPrioritas] = useState('');

  async function load() {
    setLoading(true);
    const res = await gasApi.list('RekomendasiPelatihan');
    if (res.success) {
      const sorted = [...res.data].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setData(sorted);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = data.filter(r =>
    (!filterKecamatan || r.kecamatan === filterKecamatan) &&
    (!filterPrioritas || r.prioritas === filterPrioritas)
  );

  const kecamatanOptions = Array.from(new Set(data.map(r => r.kecamatan))).sort();

  return (
    <div className="page">
      <h2>Rekomendasi Program Pelatihan</h2>
      <p>
        Riwayat hasil Identifikasi Kebutuhan Pelatihan. Ini adalah rekomendasi — belum
        membuka pendaftaran pelatihan.
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterKecamatan} onChange={e => setFilterKecamatan(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Semua Kecamatan</option>
            {kecamatanOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={filterPrioritas} onChange={e => setFilterPrioritas(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
          <button onClick={load} className="btn-ghost">Muat Ulang</button>
        </div>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <table style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Kompetensi</th>
              <th>Kecamatan</th>
              <th>Prioritas</th>
              <th>Alasan</th>
              <th>Tanggal Analisis</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.kompetensi}</td>
                <td>{r.kecamatan}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={prioritasStyle[r.prioritas] ?? { ...prioritasStyle.Rendah, background: '#999' }}>
                    {r.prioritas}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{r.alasan}</td>
                <td style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString('id-ID')}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Belum ada riwayat rekomendasi.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
