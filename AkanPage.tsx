import CrudTable from '../components/CrudTable';

export default function AkanPage() {
  return (
    <CrudTable
      module="AKAN"
      title="AKAN / CPMI (Antar Kerja Antar Negara)"
      fields={[
        { key: 'nama_p3mi', label: 'Nama P3MI' },
        { key: 'negara_tujuan', label: 'Negara Tujuan', type: 'select', options: ['Jepang', 'Korea', 'Taiwan'] },
        { key: 'jabatan', label: 'Jabatan' },
        { key: 'gaji', label: 'Gaji' },
        { key: 'persyaratan', label: 'Persyaratan' },
        { key: 'dokumen', label: 'Dokumen' },
        { key: 'tahapan', label: 'Tahapan Keberangkatan' },
        { key: 'kontak', label: 'Kontak Resmi' }
      ]}
    />
  );
}
