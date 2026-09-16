import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { gasApi } from '../api/gasClient';

interface DashboardData {
  kompetensiPalingDibutuhkan: { label: string; value: number }[];
  perusahaanTerbanyak: { label: string; value: number }[];
  kecamatanAsal: { label: string; value: number }[];
  pelatihanPrioritas: { label: string; value: number }[];
  gender: { lakiLaki: number; perempuan: number; persenLakiLaki: number; persenPerempuan: number };
  totalPencariKerja: number;
  totalDudi: number;
  totalLowongan: number;
  totalLamaran: number;
  distribusiUsia: { label: string; value: number }[];
  statusPekerjaan: { label: string; value: number }[];
  pendidikan: { label: string; value: number }[];
  lamaranMasuk: { label: string; value: number }[];
}

const GENDER_COLORS = ['var(--primary)', '#ec4899'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await gasApi.dashboardAnalisis();
    if (res.success) setData(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page"><p>Memuat data...</p></div>;
  if (!data) return <div className="page"><p>Gagal memuat data dashboard.</p></div>;

  const genderData = [
    { name: 'Laki-laki', value: data.gender.lakiLaki },
    { name: 'Perempuan', value: data.gender.perempuan }
  ];

  const distribusiUsia = data.distribusiUsia ?? [];
  const statusPekerjaan = data.statusPekerjaan ?? [];
  const pendidikan = data.pendidikan ?? [];
  const lamaranMasuk = data.lamaranMasuk ?? [];

  return (
    <div className="page">
      <h2>Dashboard Analisis</h2>

      <div className="grid-stats">
        <div className="card-stat">
          <div className="stat-value">{data.totalPencariKerja}</div>
          <div className="stat-label">Total Pencari Kerja</div>
        </div>
        <div className="card-stat">
          <div className="stat-value">{data.totalDudi}</div>
          <div className="stat-label">Total DUDI Terdaftar</div>
        </div>
        <div className="card-stat">
          <div className="stat-value">{data.totalLowongan}</div>
          <div className="stat-label">Total Lowongan</div>
        </div>
        <div className="card-stat">
          <div className="stat-value">{data.totalLamaran || 0}</div>
          <div className="stat-label">Total Lamaran</div>
        </div>
      </div>

      <div className="grid-charts">
        <ChartCard title="Kompetensi Paling Dibutuhkan (DUDI)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.kompetensiPalingDibutuhkan} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Perusahaan Terbanyak Membuka Lowongan">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.perusahaanTerbanyak} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Kecamatan Asal Pencari Kerja">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.kecamatanAsal} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Jenis Pelatihan Prioritas (Minat Masyarakat)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.pelatihanPrioritas} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Persentase Gender (${data.gender.persenLakiLaki}% pria / ${data.gender.persenPerempuan}% wanita)`}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={90} label>
                {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribusi Usia Pencari Kerja">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribusiUsia} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Pekerjaan">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusPekerjaan} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pendidikan Pencari Kerja">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pendidikan} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lamaran Masuk per Bulan">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={lamaranMasuk.length > 0 ? lamaranMasuk : [{ label: 'Belum ada data', value: 0 }]} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
