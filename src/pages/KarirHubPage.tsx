import CrudTable from '../components/CrudTable';

export default function KarirHubPage() {
  return (
    <CrudTable
      module="KarirHub"
      title="KarirHub (Data Ditarik Manual oleh Admin)"
      fields={[
        { key: 'judul_lowongan', label: 'Judul Lowongan' },
        { key: 'perusahaan', label: 'Nama Perusahaan' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'bidang_usaha', label: 'Bidang Pekerjaan' },
        { key: 'jenis_pekerjaan', label: 'Jenis Pekerjaan' },
        { key: 'jumlah_lowongan', label: 'Jumlah Lowongan' },
        { key: 'deadline', label: 'Batas Lamaran', type: 'date' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
        { key: 'pendidikan', label: 'Pendidikan Minimal' },
        { key: 'pengalaman', label: 'Pengalaman' },
        { key: 'kondisi_fisik', label: 'Kondisi Fisik' },
        { key: 'kompetensi', label: 'Keterampilan' },
        { key: 'sumber', label: 'Sumber' },
      ]}
    />
  );
}
