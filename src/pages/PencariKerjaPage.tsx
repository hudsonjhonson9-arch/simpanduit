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
        { key: 'pendidikan', label: 'Pendidikan', type: 'select', options: ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2'] },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
        { key: 'umur', label: 'Umur', type: 'number' },
        { key: 'minat_kerja', label: 'Minat Bekerja' },
        { key: 'minat_pelatihan', label: 'Minat Pelatihan' },
        { key: 'pengalaman', label: 'Pengalaman' }
      ]}
    />
  );
}
