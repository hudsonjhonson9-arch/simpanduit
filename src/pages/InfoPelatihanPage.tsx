import CrudTable from '../components/CrudTable';

export default function InfoPelatihanPage() {
  return (
    <CrudTable
      module="InfoPelatihan"
      title="Info Pelatihan"
      fields={[
        { key: 'judul', label: 'Judul Pelatihan' },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'kompetensi', label: 'Kompetensi' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'jadwal', label: 'Jadwal' },
        { key: 'penyelenggara', label: 'Penyelenggara' },
        { key: 'kontak', label: 'Kontak' },
        { key: 'target_peserta', label: 'Target Peserta' },
        { key: 'kuota', label: 'Kuota', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['Dibuka', 'Ditutup'] }
      ]}
    />
  );
}
