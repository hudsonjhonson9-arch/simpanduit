import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// ponytail: koordinat pusat 6 kecamatan Sumba Barat (hardcode, tidak berubah)
const KEC_COORDS: Record<string, [number, number]> = {
  'Kota Waikabubak': [-9.632, 119.412],
  'Loli': [-9.530, 119.420],
  'Tana Righu': [-9.493, 119.397],
  'Lamboya': [-9.780, 119.380],
  'Wanokaka': [-9.723, 119.453],
  'Laboya Barat': [-9.713, 119.256],
};

function makeIcon(count: number, max: number): L.DivIcon {
  const ratio = max > 0 ? count / max : 0;
  const size = 24 + ratio * 24;
  const color = ratio > 0.6 ? '#dc2626' : ratio > 0.3 ? '#d97706' : '#059669';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:${size > 36 ? 13 : 11}px;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ data }: { data: KecamatanData[] }) {
  const map = useMap();
  useEffect(() => {
    const coords = data
      .map(d => KEC_COORDS[d.kecamatan])
      .filter(Boolean) as [number, number][];
    if (coords.length > 1) map.fitBounds(coords, { padding: [40, 40] });
    else if (coords.length === 1) map.setView(coords[0], 12);
  }, [data, map]);
  return null;
}

export default function PetaSebaranPage() {
  const [data, setData] = useState<KecamatanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jumlah' | 'minat' | 'pelatihan'>('jumlah');

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
      <p>Sebaran minat kompetensi kerja per kecamatan di Kabupaten Sumba Barat.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={load} className="btn-ghost">Muat Ulang</button>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {(['jumlah', 'minat', 'pelatihan'] as const).map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {tab === 'jumlah' ? 'Jumlah' : tab === 'minat' ? 'Minat Kerja' : 'Pelatihan'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ marginRight: 8 }} /> Memuat data...
        </div>
      ) : data.length === 0 ? (
        <p>Belum ada data Pencari Kerja dengan kecamatan &amp; minat pelatihan terisi.</p>
      ) : (
        <>
          {/* Peta */}
          <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 20 }}>
            <MapContainer
              center={[-9.63, 119.40]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds data={data} />
              {data.map(d => {
                const coords = KEC_COORDS[d.kecamatan];
                if (!coords) return null;
                return (
                  <Marker key={d.kecamatan} position={coords} icon={makeIcon(d.total, maxTotal)}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong style={{ fontSize: 14 }}>{d.kecamatan}</strong>
                        <div style={{ margin: '6px 0', fontSize: 13 }}>
                          <b>{d.total}</b> pencari kerja berminat
                        </div>
                        {d.minat.slice(0, 3).map(m => (
                          <div key={m.kompetensi} style={{ fontSize: 12, color: '#555' }}>
                            {m.kompetensi}: {m.jumlah} orang
                          </div>
                        ))}
                        {d.minat.length > 3 && (
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                            +{d.minat.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#059669', marginRight: 4 }} /> Rendah</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#d97706', marginRight: 4 }} /> Sedang</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#dc2626', marginRight: 4 }} /> Tinggi</span>
          </div>

          {/* Detail cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {data.map(kec => (
              <div key={kec.kecamatan} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ margin: 0 }}>{kec.kecamatan}</h3>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{kec.total} orang</span>
                </div>

                <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, margin: '8px 0 16px' }}>
                  <div style={{
                    width: `${(kec.total / maxTotal) * 100}%`,
                    background: 'var(--primary)',
                    height: '100%',
                    borderRadius: 4
                  }} />
                </div>

                {kec.minat.slice(0, activeTab === 'jumlah' ? 6 : 8).map((m, i) => (
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
        </>
      )}
    </div>
  );
}
