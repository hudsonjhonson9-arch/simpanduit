import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import CrudTable from '../components/CrudTable';
import { gasApi } from '../api/gasClient';
import { useToast } from '../components/Toast';

export default function PencariKerjaPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      // Trim trailing/leading spaces from all keys
      const rows = raw.map((r: any) => {
        const trimmed: any = {};
        Object.keys(r).forEach(k => { trimmed[k.trim()] = r[k]; });
        return trimmed;
      });

      let success = 0;
      let failed = 0;

      let errorMsgs: string[] = [];

      for (const r of rows) {
        const record: Record<string, string> = {
          nama: String((r as any)['Nama Lengkap'] || ''),
          umur: String((r as any)['Usia'] || ''),
          jenis_kelamin: String((r as any)['Jenis Kelamin'] || ''),
          kecamatan: String((r as any)['Kecamatan'] || ''),
          desa: String((r as any)['Kelurahan/Desa'] || ''),
          pendidikan: String((r as any)['Pendidikan Terakhir'] || ''),
          status: String((r as any)['Status Pekerjaan Saat Ini'] || ''),
          minat_kerja: String((r as any)['Bidang pekerjaan apa yang paling Anda minati?'] || (r as any)['Posisi pekerjaan apa yang paling Anda minati?'] || ''),
          minat_pelatihan: String((r as any)['Posisi pekerjaan apa yang paling Anda minati?'] || (r as any)['Bidang pekerjaan apa yang paling Anda minati?'] || ''),
          pengalaman: '',
          keterampilan: String((r as any)['Keterampilan apa yang sudah Anda miliki?'] || ''),
          pelatihan_pernah_diikuti: String((r as any)['Pelatihan kerja apa yang pernah Anda ikuti?'] || (r as any)['Pernah mengikuti Pelatihan'] || ''),
          kesediaan_pelatihan: String((r as any)['Apakah Anda bersedia mengikuti pelatihan untuk memenuhi persyaratan lowongan tersebut?'] || 'Ya')
        };

        if (!record.nama) { failed++; continue; }

        try {
          const res = await gasApi.create('PencariKerja', record);
          if (res.success) success++;
          else {
            failed++;
            const err = res.error || JSON.stringify(res);
            if (errorMsgs.length < 3) errorMsgs.push(`${record.nama}: ${err}`);
          }
        } catch (err: any) {
          failed++;
          const msg = err?.response?.data?.error || err?.response?.data || err?.message || String(err);
          if (errorMsgs.length < 3) errorMsgs.push(`${record.nama}: ${msg}`);
        }
      }

      const detail = errorMsgs.length > 0 ? errorMsgs.join(' | ') : '';
      toast(`Import: ${success} OK, ${failed} gagal. ${detail}`, success > 0 ? 'success' : 'error');
    } catch (err: any) {
      toast('Gagal membaca file Excel: ' + (err.message || err), 'error');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <CrudTable
        module="PencariKerja"
        title="Pendataan Pencari Kerja"
        headerExtra={
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            style={{ padding: '10px 20px' }}
          >
            {importing ? 'Mengimport...' : 'Import Excel'}
          </button>
        }
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
    </>
  );
}
