import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { gasApi, type Module } from '../api/gasClient';

interface ReportDef {
  module: Module;
  title: string;
  columns: { key: string; label: string }[];
}

const REPORTS: ReportDef[] = [
  {
    module: 'PencariKerja',
    title: 'Data Pencari Kerja',
    columns: [
      { key: 'nama', label: 'Nama' },
      { key: 'kecamatan', label: 'Kecamatan' },
      { key: 'desa', label: 'Desa' },
      { key: 'pendidikan', label: 'Pendidikan' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
      { key: 'umur', label: 'Umur' },
      { key: 'minat_kerja', label: 'Minat Kerja' },
      { key: 'minat_pelatihan', label: 'Minat Pelatihan' }
    ]
  },
  {
    module: 'DUDI',
    title: 'Data Industri (DUDI)',
    columns: [
      { key: 'nama_perusahaan', label: 'Nama Perusahaan' },
      { key: 'bidang_usaha', label: 'Bidang Usaha' },
      { key: 'lokasi', label: 'Lokasi' },
      { key: 'kontak_hrd', label: 'Kontak HRD' },
      { key: 'jumlah_kebutuhan', label: 'Kebutuhan TK' },
      { key: 'kompetensi_dibutuhkan', label: 'Kompetensi Dibutuhkan' }
    ]
  },
  {
    module: 'KarirHub',
    title: 'Data Lowongan KarirHub',
    columns: [
      { key: 'judul_lowongan', label: 'Judul Lowongan' },
      { key: 'perusahaan', label: 'Perusahaan' },
      { key: 'kompetensi', label: 'Kompetensi' },
      { key: 'lokasi', label: 'Lokasi' },
      { key: 'deadline', label: 'Deadline' }
    ]
  },
  {
    module: 'RekomendasiPelatihan',
    title: 'Hasil Identifikasi & Rekomendasi Pelatihan',
    columns: [
      { key: 'kompetensi', label: 'Kompetensi' },
      { key: 'kecamatan', label: 'Kecamatan' },
      { key: 'jumlah_dudi_butuh', label: 'Kebutuhan DUDI' },
      { key: 'jumlah_lowongan', label: 'Lowongan' },
      { key: 'jumlah_minat', label: 'Minat Masyarakat' },
      { key: 'skor_total', label: 'Skor' },
      { key: 'prioritas', label: 'Prioritas' },
      { key: 'alasan', label: 'Alasan' }
    ]
  }
];

export default function LaporanPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function fetchData(report: ReportDef) {
    const res = await gasApi.list(report.module);
    if (!res.success) throw new Error(res.error ?? 'Gagal memuat data');
    return res.data as any[];
  }

  async function exportPdf(report: ReportDef) {
    setLoadingKey(report.module + '-pdf');
    try {
      const data = await fetchData(report);
      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(14);
      doc.text('SIMPANDUIT — ' + report.title, 14, 15);
      doc.setFontSize(9);
      doc.text('Dicetak: ' + new Date().toLocaleString('id-ID'), 14, 21);

      autoTable(doc, {
        startY: 26,
        head: [report.columns.map(c => c.label)],
        body: data.map(row => report.columns.map(c => String(row[c.key] ?? ''))),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 41, 59] }
      });

      doc.save(`${report.module}_${dateStamp()}.pdf`);
    } catch (err: any) {
      alert('Gagal membuat PDF: ' + err.message);
    } finally {
      setLoadingKey(null);
    }
  }

  async function exportExcel(report: ReportDef) {
    setLoadingKey(report.module + '-excel');
    try {
      const data = await fetchData(report);
      const rows = data.map(row => {
        const obj: Record<string, any> = {};
        report.columns.forEach(c => { obj[c.label] = row[c.key] ?? ''; });
        return obj;
      });
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, report.module.slice(0, 31));
      XLSX.writeFile(workbook, `${report.module}_${dateStamp()}.xlsx`);
    } catch (err: any) {
      alert('Gagal membuat Excel: ' + err.message);
    } finally {
      setLoadingKey(null);
    }
  }

  function dateStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  return (
    <div className="page">
      <h2>Laporan</h2>
      <p>
        Cetak data dari tiap modul dalam format PDF atau Excel. File akan diunduh langsung
        ke perangkat Anda (diproses di browser, tidak melewati server tambahan).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, maxWidth: 640 }}>
        {REPORTS.map(r => (
          <div key={r.module} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{r.title}</span>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => exportPdf(r)} disabled={loadingKey === r.module + '-pdf'}>
                {loadingKey === r.module + '-pdf' ? 'Membuat...' : 'Unduh PDF'}
              </button>
              <button onClick={() => exportExcel(r)} disabled={loadingKey === r.module + '-excel'}>
                {loadingKey === r.module + '-excel' ? 'Membuat...' : 'Unduh Excel'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
