# Design: Gap Kompetensi & Enhanced Matching

## Problem

The requirements doc (LAPORAN KEBUTUHAN DATA SIMATA DUIT) defines a methodology for matching industry needs with community competency. The current system only matches by kompetensi strings — it doesn't compare education, experience, or group positions. Several fields and a dedicated Gap Kompetensi page are missing.

## Changes

### 1. Data Model — DUDI (add 2 fields)

| Field | Type | Values |
|---|---|---|
| `pendidikan` | select | SD / SMP / SMA/SMK / D3 / S1 |
| `pengalaman` | text | Free text (e.g. "0-1 tahun", "1-3 tahun") |

### 2. Data Model — PencariKerja (add 4 fields)

| Field | Type | Values |
|---|---|---|
| `status` | select | Belum Bekerja / IRT |
| `keterampilan` | text | Comma-separated skills |
| `pelatihan_pernah_diikuti` | text | Training history |
| `kesediaan_pelatihan` | select | Ya / Tidak |

`jenis_kelamin` stays. All fields from the Excel source (Nama, Usia, Kecamatan, Pendidikan, Status, Minat) are covered.

### 3. Position Grouping (Code.gs)

6 groups (not 8 — Assembly Sepatu combines Lasting, Sole, Upper):

```javascript
const KELOMPOK_POSISI = {
  'Sewing': ['jahit', 'sewing', 'penjahit', 'operator jahit', 'operator mesin jahit'],
  'Cutting': ['potong', 'cutting', 'pemotong', 'operator cutting', 'pemotongan'],
  'Assembly Sepatu': ['lasting', 'sole', 'upper', 'assembly', 'perakitan', 'assembly sepatu'],
  'QC': ['qc', 'quality control', 'pemeriksa kualitas'],
  'Finishing': ['finishing', 'packing', 'penyelesaian', 'finishing & packing'],
  'Pattern': ['pola', 'pattern', 'pembuat pola', 'pattern maker']
};
```

Fuzzy match: lowercase + trim, check if any keyword is contained in the input string.

### 4. Matching Engine — `analisisKesesuaian(kecamatan)`

**Logic:**
1. Load DUDI (with `pendidikan`, `pengalaman`) and PencariKerja (with new fields)
2. Group both by KelompokPosisi (fuzzy match on position/minat strings)
3. For each position group, compare per-person:
   - **Kompetensi**: community `keterampilan` vs DUDI `kompetensi_dibutuhkan` (overlap check)
   - **Pendidikan**: community `pendidikan` ≥ DUDI `pendidikan` (ordinal: SD < SMP < SMA < D3 < S1)
   - **Pengalaman**: community `pengalaman` meets DUDI requirement (text match)
4. Count: `jumlah_sesuai` (≥2 of 3 criteria), `jumlah_belum_sesuai`
5. Compute `persentase`, `gap_kompetensi` (competencies industry needs but community lacks)
6. Rank by priority (combination of kuota, interest, gap)

**New GAS action:** `analisisKesesuaian`
**Saved to:** `RekomendasiPelatihan` sheet (existing, reused for history)

### 5. New Page — GapKompetensiPage.tsx

Route: `/gap-kompetensi`

**Table columns:**
| Peringkat | Divisi/Kategori Lowongan | Total Kuota | Minat Responden | Jumlah Sesuai | Belum Sesuai | Persentase | Gap Kompetensi | Prioritas |

**Features:**
- Filter by kecamatan
- Color-coded prioritas (Tinggi/Sedang/Rendah)
- Gap column shows missing competencies
- Export to PDF/Excel (reuse LaporanPage patterns)

### 6. Permissions

| Role | Access | Write |
|---|---|---|
| Admin | ✓ | Read-only (analysis output) |
| Operator | ✓ | Read-only |
| Kepala Bidang | ✓ | Read-only |
| Mentor | ✓ | Read-only |

### 7. Files to modify

| File | Change |
|---|---|
| `gas-backend/Code.gs` | Add KELOMPOK_POSISI, add `analisisKesesuaian` function, update SHEET_SCHEMAS |
| `src/api/gasClient.ts` | Add `analisisKesesuaian` API call |
| `src/pages/DudiPage.tsx` | Add `pendidikan`, `pengalaman` fields |
| `src/pages/PencariKerjaPage.tsx` | Add `status`, `keterampilan`, `pelatihan_pernah_diikuti`, `kesediaan_pelatihan` fields |
| `src/pages/GapKompetensiPage.tsx` | **New file** |
| `src/App.tsx` | Add route `/gap-kompetensi` |
| `src/config/permissions.ts` | Add `GapKompetensi` to MENU_ACCESS for all roles |
