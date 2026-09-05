import { useEffect, useState } from 'react';
import { gasApi } from '../api/gasClient';
import { useToast } from '../components/Toast';

interface Pelatihan {
  id: string;
  judul: string;
  deskripsi: string;
  kompetensi: string;
  lokasi: string;
  jadwal: string;
  penyelenggara: string;
  kontak: string;
  target_peserta: string;
  kuota: number;
  status: string;
}

export default function PublicInfoPelatihanPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await gasApi.infoPelatihanPublik();
        if (res.success) setData(res.data);
        else toast(res.error || 'Gagal memuat data', 'error');
      } catch {
        toast('Gagal memuat data pelatihan', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
            <span className="bg-indigo-600 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm">S</span>
            SIMPANDUIT
          </a>
          <a href="/login" className="text-sm text-gray-600 hover:text-indigo-600">Masuk</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Info Pelatihan</h1>
        <p className="text-gray-500 mb-8">Pelatihan dan pengembangan kompetensi untuk masyarakat Kabupaten Sumba Barat</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Belum ada info pelatihan tersedia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-3 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">{p.kompetensi || '-'}</span>
                  <span className="text-xs text-gray-400">{p.jadwal || '-'}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{p.judul}</h3>
                {p.deskripsi && <p className="text-sm text-gray-600 line-clamp-2">{p.deskripsi}</p>}
                <div className="text-sm text-gray-500 space-y-1 mt-auto">
                  <div>📍 {p.lokasi || '-'}</div>
                  <div>🏢 {p.penyelenggara || '-'}</div>
                  <div>🎯 Target: {p.target_peserta || '-'}</div>
                  <div>👥 Kuota: {p.kuota || '-'}</div>
                </div>
                {p.kontak && (
                  <div className="text-xs text-indigo-600">📞 {p.kontak}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} SIMPANDUIT — Dinas Tenaga Kerja dan Perindustrian Kabupaten Sumba Barat
      </footer>
    </div>
  );
}
