/**
 * Import data responden dari Excel ke SIMPANDUIT via GAS API.
 *
 * Usage:
 *   node scripts/import-responden.mjs <excel-path> <gas-url> <token>
 *
 * Contoh:
 *   node scripts/import-responden.mjs "C:\Users\Agil\Downloads\file.xlsx" "https://script.google.com/macros/s/xxxxx/exec" "token-dari-login"
 *
 * Atau set env vars:
 *   VITE_GAS_URL=... SIMPANDUIT_TOKEN=... node scripts/import-responden.mjs "path/to/file.xlsx"
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import XLSX from 'xlsx';

const excelPath = process.argv[2] || process.env.EXCEL_PATH;
const gasUrl = process.argv[3] || process.env.VITE_GAS_URL;
const token = process.argv[4] || process.env.SIMPANDUIT_TOKEN;

if (!excelPath || !gasUrl || !token) {
  console.error('Usage: node import-responden.mjs <excel-path> <gas-url> <token>');
  console.error('Or set VITE_GAS_URL and SIMPANDUIT_TOKEN env vars.');
  process.exit(1);
}

const wb = XLSX.readFile(resolve(excelPath));
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

console.log(`Sheet: ${sheetName}, ${rows.length} rows`);

// Map Excel columns to PencariKerja fields
// Adjust column names if your Excel uses different headers
const mapped = rows
  .filter(r => r['Nama Lengkap'] || r['Nama'])
  .map(r => ({
    nama: r['Nama Lengkap'] || r['Nama'] || '',
    umur: r['Usia'] || r['Umur'] || '',
    kecamatan: r['Kecamatan'] || '',
    pendidikan: r['Pendidikan'] || '',
    status: r['Status'] || '',
    minat_kerja: r['Minat'] || r['Minat Kerja'] || '',
    minat_pelatihan: r['Minat'] || r['Minat Kerja'] || '',
    jenis_kelamin: 'Perempuan',
    desa: r['Desa'] || '',
    pengalaman: r['Pengalaman'] || '',
    keterampilan: r['Keterampilan'] || '',
    pelatihan_pernah_diikuti: r['Pelatihan'] || r['Pelatihan Pernah Diikuti'] || '',
    kesediaan_pelatihan: r['Kesediaan'] || r['Kesediaan Pelatihan'] || 'Ya'
  }));

console.log(`Mapped ${mapped.length} records.`);

let success = 0;
let failed = 0;

for (const record of mapped) {
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'create',
        module: 'PencariKerja',
        data: record,
        token
      })
    });
    const json = await res.json();
    if (json.success) {
      success++;
    } else {
      console.error(`Failed: ${record.nama} — ${json.error}`);
      failed++;
    }
  } catch (err) {
    console.error(`Error: ${record.nama} — ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${success} success, ${failed} failed.`);
