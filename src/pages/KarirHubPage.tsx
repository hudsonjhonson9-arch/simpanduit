import CrudTable from '../components/CrudTable';

export default function KarirHubPage() {
  return (
    <CrudTable
      module="KarirHub"
      title="KarirHub (Data Ditarik Manual oleh Admin)"
      fields={[
        { key: 'judul_lowongan', label: 'Judul Lowongan' },
        { key: 'kompetensi', label: 'Kompetensi Dibutuhkan' },
        { key: 'perusahaan', label: 'Perusahaan' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'deadline', label: 'Deadline', type: 'date' }
      ]}
    />
  );
}
