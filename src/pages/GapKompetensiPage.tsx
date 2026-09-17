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

  useEffect(() => {
    gasApi.listKecamatan().then(res => {
      if (res.success) setKecamatanList(res.data);
    });
  }, []);

  useEffect(() => {
    gasApi.list('GapKompetensi').then(res => {
      if (res.success) {
        const filtered = kecamatan === 'Semua'
          ? res.data
          : res.data.filter((r: any) => r.kecamatan === kecamatan);
        // Deduplicate — keep latest per kelompok
        const seen = new Map<string, any>();
        filtered.forEach((r: any) => {
          if (!seen.has(r.kelompok) || new Date(r.created_at) > new Date(seen.get(r.kelompok).created_at)) {
            seen.set(r.kelompok, r);
          }
        });
        setResults([...seen.values()].sort((a: any, b: any) => a.peringkat - b.peringkat));
      }
    });
  }, [kecamatan]);

  return (
    <div className="page">
      <h2>Analisis Kesesuaian Kebutuhan Industri & Kompetensi Masyarakat</h2>
      <p>
        Diambil dari hasil Identifikasi Kebutuhan &amp; Rekomendasi Pelatihan (Lowongan Kerja: DUDI + KarirHub,
        dikelompokkan per Jenis Pekerjaan), lalu ditambah kolom kesesuaian dan gap kompetensi hasil pencocokan
        dengan data Pencari Kerja.
      </p>

      <div className="toolbar" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0 }}>Kecamatan:</label>
          <select value={kecamatan} onChange={e => setKecamatan(e.target.value)} style={{ width: 'auto' }}>
            <option value="Semua">Semua Kecamatan</option>
            {kecamatanList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {results && (
        results.length === 0 ? (
          <p>Belum ada data yang cukup untuk dianalisis (butuh data DUDI, KarirHub, dan/atau Pencari Kerja).</p>
        ) : (
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Jenis Pekerjaan</th>
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
