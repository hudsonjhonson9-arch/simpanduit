import CrudTable from '../components/CrudTable';

export default function DudiPage() {
  return (
    <CrudTable
      module="DUDI"
      title="Profil Industri (DUDI)"
      fields={[
        { key: 'nama_perusahaan', label: 'Nama Perusahaan' },
        { key: 'bidang_usaha', label: 'Bidang Usaha' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'kontak_hrd', label: 'Kontak HRD' },
        { key: 'produk', label: 'Produk' },
        { key: 'jumlah_kebutuhan', label: 'Jumlah Kebutuhan Tenaga Kerja', type: 'number' },
        { key: 'kompetensi_dibutuhkan', label: 'Kompetensi Dibutuhkan' },
        { key: 'persyaratan', label: 'Persyaratan' },
        { key: 'pendidikan', label: 'Pendidikan', type: 'select', options: ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1'] },
        { key: 'pengalaman', label: 'Pengalaman' }
      ]}
    />
  );
}
