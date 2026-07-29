import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';

interface ResultRow {
  kompetensi: string;
  kecamatan: string;
  jumlah_dudi_butuh: number;
  jumlah_lowongan: number;
  jumlah_minat: number;
  skor_total: number;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  alasan: string;
}

const prioritasStyle: Record<string, React.CSSProperties> = {
  Tinggi: { background: '#dc2626', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Sedang: { background: '#d97706', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 },
  Rendah: { background: '#65a30d', color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 12 }
};

export default function IdentifikasiPage() {
  const [kecamatanList, setKecamatanList] = useState<string[]>([]);
  const [kecamatan, setKecamatan] = useState('Semua');
  const [results, setResults] = useState<ResultRow[] | null>(null);
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
    const res = await gasApi.identifikasiKebutuhan(kecamatan);
    setLoading(false);
    if (res.success) {
      setResults(res.data);
    } else {
      setError(res.error ?? 'Gagal menjalankan analisis.');
    }
  }

  return (
    <div className="page">
      <h2>Identifikasi Kebutuhan Pelatihan</h2>
      <p>
        Sistem menggabungkan data kebutuhan industri (DUDI), lowongan tersedia (KarirHub),
        dan minat masyarakat (Pendataan Pencari Kerja) untuk menghasilkan prioritas kompetensi
        pelatihan. Skor dihitung dari kombinasi ketiga indikator tersebut.
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
          <p>Belum ada data yang cukup untuk dianalisis (butuh data DUDI, KarirHub, dan/atau Pencari Kerja).</p>
        ) : (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Kompetensi</th>
                <th>Kebutuhan DUDI</th>
                <th>Lowongan KarirHub</th>
                <th>Minat Masyarakat</th>
                <th>Skor</th>
                <th>Prioritas</th>
                <th>Alasan</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.kompetensi}>
                  <td>{r.kompetensi}</td>
                  <td style={{ textAlign: 'center' }}>{r.jumlah_dudi_butuh}</td>
                  <td style={{ textAlign: 'center' }}>{r.jumlah_lowongan}</td>
                  <td style={{ textAlign: 'center' }}>{r.jumlah_minat}</td>
                  <td style={{ textAlign: 'center' }}>{r.skor_total}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={prioritasStyle[r.prioritas]}>
                      {r.prioritas}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{r.alasan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {results && results.length > 0 && (
        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Hasil analisis ini juga otomatis tersimpan sebagai riwayat di menu Rekomendasi Program Pelatihan.
        </p>
      )}
    </div>
  );
}
