import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';

interface GapRow {
  peringkat: number;
  kelompok: string;
  kuota: number;
  minat: number;
  minat_persen: number;
  jumlah_sesuai: number;
  jumlah_belum_sesuai: number;
  persentase: number;
  gap_kompetensi: string;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
}

const prioritasStyle: Record<string, React.CSSProperties> = {
  Tinggi: { background: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Sedang: { background: '#d97706', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Rendah: { background: '#65a30d', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 }
};

export default function GapKompetensiPage() {
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [kecamatan, setKecamatan] = useState('Semua');
  const [results, setResults] = useState<GapRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    gasApi.listKecamatan().then(res => {
      if (res.success) setKecamatanList(res.data);
    });
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError('');
    const res = await gasApi.analisisKesesuaian(kecamatan);
    setLoading(false);
    if (res.success) {
      setResults(res.data);
    } else {
      setError(res.error ?? 'Gagal menjalankan analisis.');
    }
  }

  return (
    <div className="page">
      <h2>Analisis Kesesuaian Kebutuhan Industri & Kompetensi Masyarakat</h2>
      <p>
        Menganalisis kesesuaian antara kebutuhan industri (DUDI) dengan kompetensi masyarakat
        (Pencari Kerja) per kelompok posisi. Menampilkan jumlah sesuai, gap kompetensi,
        dan prioritas pelatihan.
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0 }}>Kecamatan:</label>
          <select value={kecamatan} onChange={e => setKecamatan(e.target.value)} style={{ width: 'auto' }}>
            <option value="Semua">Semua Kecamatan</option>
            {kecamatanList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button onClick={runAnalysis} disabled={loading}>
            {loading ? 'Menganalisis...' : 'Jalankan Analisis'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {results && (
        results.length === 0 ? (
          <p>Belum ada data yang cukup untuk dianalisis (butuh data DUDI dan Pencari Kerja).</p>
        ) : (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Divisi / Kategori Lowongan</th>
                <th>Total Kuota</th>
                <th>Minat Responden</th>
                <th>Sesuai</th>
                <th>Belum Sesuai</th>
                <th>Persentase</th>
                <th>Gap Kompetensi</th>
                <th>Prioritas</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.kelompok}>
                  <td style={{ textAlign: 'center' }}>{r.peringkat}</td>
                  <td><strong>{r.kelompok}</strong></td>
                  <td style={{ textAlign: 'center' }}>{r.kuota} orang</td>
                  <td style={{ textAlign: 'center' }}>{r.minat_persen}% ({r.minat} orang)</td>
                  <td style={{ textAlign: 'center' }}>{r.jumlah_sesuai}</td>
                  <td style={{ textAlign: 'center' }}>{r.jumlah_belum_sesuai}</td>
                  <td style={{ textAlign: 'center' }}>{r.persentase}%</td>
                  <td style={{ fontSize: 13 }}>{r.gap_kompetensi}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={prioritasStyle[r.prioritas]}>
                      {r.prioritas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {results && results.length > 0 && (
        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Analisis berdasarkan kesesuaian kompetensi, pendidikan, dan pengalaman antara kebutuhan industri dengan profil masyarakat.
        </p>
      )}
    </div>
  );
}
