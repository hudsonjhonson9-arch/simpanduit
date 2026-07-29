# SIMPANDUIT — Setup Guide

## 1. Backend (Google Apps Script + Google Sheets)

1. Buat Google Spreadsheet baru, catat **Spreadsheet ID**-nya (ada di URL).
2. Buka **Extensions → Apps Script**, hapus isi default, tempel isi `gas-backend/Code.gs`.
3. Ganti `SPREADSHEET_ID` di baris atas dengan ID spreadsheet Anda.
4. Jalankan fungsi `setupInitialData` sekali secara manual (pilih dari dropdown function → Run).
   - Ini akan membuat semua sheet + header otomatis.
   - Akun default: `admin` / `admin123` — **segera ganti setelah login pertama**.
5. Deploy → New deployment → Web app.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL deployment (`https://script.google.com/macros/s/xxxxx/exec`).

## 2. Frontend (React + Vite → Vercel)

1. `cd frontend && npm install`
2. Salin `.env.example` jadi `.env`, isi `VITE_GAS_URL` dengan URL deployment GAS di atas.
3. `npm run dev` untuk coba lokal.
4. Deploy ke Vercel:
   - Import project dari GitHub (push folder `frontend/` sebagai root, atau set Root Directory = `frontend` di Vercel).
   - Tambahkan environment variable `VITE_GAS_URL` di Vercel dashboard (Settings → Environment Variables).
   - Build command: `npm run build`, Output directory: `dist` (default Vite, biasanya otomatis terdeteksi).

## Status Modul (CRUD dasar)

| Modul | Status |
|---|---|
| Beranda + widget statistik | ✅ |
| Profil Industri (DUDI) | ✅ |
| AKAD | ✅ |
| AKAN (CPMI) | ✅ |
| KarirHub (input manual admin) | ✅ |
| Pendataan Pencari Kerja | ✅ |
| Auth (username/password custom) | ✅ |
| Identifikasi Kebutuhan Pelatihan | ✅ |
| Rekomendasi Program Pelatihan (riwayat) | ✅ |
| Peta Sebaran Kebutuhan | ✅ (versi kartu per kecamatan, belum peta geografis) |
| Dashboard Analisis (grafik) | ✅ |
| Laporan (PDF/Excel) | ✅ |
| Pengaturan role granular | ✅ (akses menu + izin tulis per role, dicek di frontend & backend) |

## Cara Kerja Identifikasi Kebutuhan Pelatihan

1. Data **DUDI** (`kompetensi_dibutuhkan` + `jumlah_kebutuhan`), **KarirHub** (`kompetensi`), dan **Pencari Kerja** (`minat_pelatihan`, difilter per kecamatan) dikelompokkan per nama kompetensi (dipisah koma di tiap field).
2. Tiap indikator dinormalisasi (0–1) terhadap nilai maksimum pada kumpulan data itu.
3. Skor total = `0.4 × skor_DUDI + 0.3 × skor_KarirHub + 0.3 × skor_minat_masyarakat`.
4. Prioritas: **Tinggi** (skor ≥ 0.66), **Sedang** (≥ 0.33), **Rendah** (< 0.33).
5. Alasan otomatis dihasilkan dari indikator mana saja yang tinggi (≥ 0.5).
6. Setiap kali analisis dijalankan, hasilnya disimpan sebagai snapshot baru ke sheet `RekomendasiPelatihan` — jadi riwayat menumpuk (bisa difilter berdasarkan tanggal di Google Sheets langsung jika perlu dibersihkan).

Bobot (0.4/0.3/0.3) diatur sebagai konstanta di `Code.gs` (`BOBOT_DUDI`, `BOBOT_LOWONGAN`, `BOBOT_MINAT`) — bisa disesuaikan tanpa mengubah struktur lain.

## Pembatasan Akses per Role

| Role | Menu yang bisa diakses | Bisa edit data? |
|---|---|---|
| **Admin** | Semua menu | Ya, semua modul |
| **Operator** | Semua kecuali kelola pengguna | Ya — DUDI, AKAD, AKAN, KarirHub, Pencari Kerja |
| **Kepala Bidang** | Semua kecuali kelola pengguna | Tidak — lihat saja |
| **Mentor** | Beranda, Rekomendasi, Peta Sebaran, Dashboard, Laporan | Tidak — tidak bisa lihat data mentah Pencari Kerja/DUDI/AKAD/AKAN sama sekali (untuk privasi) |

Aturan ini didefinisikan di dua tempat yang harus tetap sinkron:
- `gas-backend/Code.gs` → `WRITE_PERMISSIONS` (validasi di server, sumber kebenaran utama — tidak bisa dilewati walau UI di-bypass)
- `frontend-src/config/permissions.ts` → `MENU_ACCESS` dan `WRITE_PERMISSIONS` (kontrol tampilan UI: sembunyikan menu & tombol edit)

Kalau nanti ada role baru atau aturan berubah, edit **kedua file itu**. Backend adalah penjaga sebenarnya (frontend cuma UX); server GAS akan menolak permintaan create/update/delete kalau role tidak diizinkan, walau seseorang mencoba memanggil API langsung.

## Catatan Penting

- **Keamanan password**: saat ini di-hash dengan SHA-256 tanpa salt di sisi GAS. Cukup untuk skala kecil/internal, tapi bukan best-practice production. Bisa ditingkatkan nanti jika perlu.
- **CORS**: Apps Script Web App tidak butuh konfigurasi CORS khusus untuk request dari domain manapun, tapi pastikan deployment access-nya "Anyone".
- **Rate limit GAS**: Google Apps Script punya kuota harian (biasanya cukup untuk skala kabupaten, tapi perlu dipantau saat traffic tinggi, misal saat seminar/demo).
- Field/menu **Coming Soon** (pendaftaran online, seleksi peserta, dst.) sengaja belum dibuatkan halaman — sesuai instruksi awal Anda.
