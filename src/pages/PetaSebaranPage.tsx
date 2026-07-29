import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';

interface MinatItem {
  kompetensi: string;
  jumlah: number;
}

interface KecamatanData {
  kecamatan: string;
  total: number;
  minat: MinatItem[];
}

const barColors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export default function PetaSebaranPage() {
  const [data, setData] = useState<KecamatanData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await gasApi.petaSebaran();
    if (res.success) setData(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="page">
      <h2>Peta Sebaran Kebutuhan</h2>
      <p>
        Menampilkan sebaran minat masyarakat terhadap kompetensi kerja per kecamatan
        di Kabupaten Sumba Barat, berdasarkan data Pendataan Pencari Kerja.
      </p>
      <button onClick={load} className="btn-ghost" style={{ marginBottom: 16 }}>Muat Ulang</button>

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <p>Belum ada data Pencari Kerja dengan kecamatan &amp; minat pelatihan terisi.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {data.map(kec => (
            <div key={kec.kecamatan} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>{kec.kecamatan}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{kec.total} orang berminat</span>
              </div>

              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, margin: '8px 0 16px' }}>
                <div style={{
                  width: `${(kec.total / maxTotal) * 100}%`,
                  background: 'var(--primary)',
                  height: '100%',
                  borderRadius: 4
                }} />
              </div>

              {kec.minat.slice(0, 6).map((m, i) => (
                <div key={m.kompetensi} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{m.kompetensi}</span>
                    <span>{m.jumlah} orang</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                    <div style={{
                      width: `${(m.jumlah / kec.minat[0].jumlah) * 100}%`,
                      background: barColors[i % barColors.length],
                      height: '100%',
                      borderRadius: 4
                    }} />
                  </div>
                </div>
              ))}
              {kec.minat.length > 6 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  +{kec.minat.length - 6} kompetensi lainnya
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
        Catatan: peta ini ditampilkan sebagai kartu per kecamatan (bukan peta geografis interaktif).
        Untuk versi peta geografis sungguhan (dengan batas wilayah Kabupaten Sumba Barat), dibutuhkan
        data GeoJSON kecamatan — bisa ditambahkan kalau Anda punya sumbernya.
      </p>
    </div>
  );
}
