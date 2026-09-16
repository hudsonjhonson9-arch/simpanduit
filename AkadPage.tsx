import CrudTable from '../components/CrudTable';

export default function AkadPage() {
  return (
    <CrudTable
      module="AKAD"
      title="AKAD (Antar Kerja Antar Daerah)"
      fields={[
        { key: 'nama_perusahaan', label: 'Nama Perusahaan' },
        { key: 'lowongan', label: 'Lowongan' },
        { key: 'persyaratan', label: 'Persyaratan' },
        { key: 'lokasi_kerja', label: 'Lokasi Kerja' },
        { key: 'cara_melamar', label: 'Cara Melamar' },
        { key: 'jadwal_rekrutmen', label: 'Jadwal Rekrutmen', type: 'date' },
        { key: 'status', label: 'Status Lowongan', type: 'select', options: ['Dibuka', 'Ditutup', 'Proses Seleksi'] }
      ]}
    />
  );
}
