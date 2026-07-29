import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';

export default function BerandaPage() {
  const [counts, setCounts] = useState({
    pencariKerja: 0,
    dudi: 0,
    karirhub: 0,
    akad: 0,
    akan: 0
  });

  useEffect(() => {
    async function loadCounts() {
      const [pk, dudi, kh, akad, akan] = await Promise.all([
        gasApi.list('PencariKerja'),
        gasApi.list('DUDI'),
        gasApi.list('KarirHub'),
        gasApi.list('AKAD'),
        gasApi.list('AKAN')
      ]);
      setCounts({
        pencariKerja: pk.data?.length ?? 0,
        dudi: dudi.data?.length ?? 0,
        karirhub: kh.data?.length ?? 0,
        akad: akad.data?.length ?? 0,
        akan: akan.data?.length ?? 0
      });
    }
    loadCounts();
  }, []);

  const widgets = [
    { label: 'Pencari Kerja', value: counts.pencariKerja },
    { label: 'DUDI', value: counts.dudi },
    { label: 'Lowongan KarirHub', value: counts.karirhub },
    { label: 'AKAD', value: counts.akad },
    { label: 'AKAN (CPMI)', value: counts.akan },
    { label: 'Rekomendasi Pelatihan', value: '—' }
  ];

  return (
    <div className="page">
      <h2>Beranda</h2>
      <p>
        SIMPANDUIT mengintegrasikan data pencari kerja, dunia usaha/industri (DUDI),
        penempatan kerja dalam negeri (AKAD), penempatan kerja luar negeri (AKAN/CPMI),
        dan lowongan KarirHub untuk menghasilkan rekomendasi pelatihan berbasis kebutuhan nyata pasar kerja.
      </p>
      <div className="grid-stats" style={{ marginTop: 24 }}>
        {widgets.map(w => (
          <div key={w.label} className="card-stat">
            <div className="stat-value">{w.value}</div>
            <div className="stat-label">{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
