import CrudTable from '../components/CrudTable';

export default function PencariKerjaPage() {
  return (
    <CrudTable
      module="PencariKerja"
      title="Pendataan Pencari Kerja"
      fields={[
        { key: 'nama', label: 'Nama' },
        { key: 'kecamatan', label: 'Kecamatan' },
        { key: 'desa', label: 'Desa' },
        { key: 'pendidikan', label: 'Pendidikan', type: 'select', options: ['Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'SMK', 'D3', 'S1'] },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
        { key: 'umur', label: 'Umur', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['Belum Bekerja', 'IRT'] },
        { key: 'minat_kerja', label: 'Minat Bekerja' },
        { key: 'minat_pelatihan', label: 'Minat Pelatihan' },
        { key: 'pengalaman', label: 'Pengalaman' },
        { key: 'keterampilan', label: 'Keterampilan' },
        { key: 'pelatihan_pernah_diikuti', label: 'Pelatihan Pernah Diikuti' },
        { key: 'kesediaan_pelatihan', label: 'Kesediaan Pelatihan', type: 'select', options: ['Ya', 'Tidak'] }
      ]}
    />
  );
}
