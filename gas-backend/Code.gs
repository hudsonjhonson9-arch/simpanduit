/**
 * SIMPANDUIT — Backend (Google Apps Script + Google Sheets sebagai DB)
 * Deploy sebagai Web App: Execute as "Me", Access "Anyone"
 *
 * Struktur Spreadsheet (nama sheet harus persis sama):
 *  - Users        : id, username, password, nama, role, created_at
 *  - PencariKerja : id, nama, kecamatan, desa, pendidikan, jenis_kelamin, umur, status, minat_kerja, minat_pelatihan, pengalaman, keterampilan, pelatihan_pernah_diikuti, kesediaan_pelatihan, created_at
 *  - DUDI         : id, nama_perusahaan, bidang_usaha, lokasi, kontak_hrd, produk, jumlah_kebutuhan, kompetensi_dibutuhkan, persyaratan, created_at
 *  - AKAD         : id, nama_perusahaan, lowongan, persyaratan, lokasi_kerja, cara_melamar, jadwal_rekrutmen, status, created_at
 *  - AKAN         : id, nama_p3mi, negara_tujuan, jabatan, gaji, persyaratan, dokumen, tahapan, kontak, created_at
 *  - KarirHub     : id, judul_lowongan, kompetensi, perusahaan, lokasi, deadline, created_at
 */

const SPREADSHEET_ID = '1JSKrQxembEDcpCqr17YQ9YIqv5nEyxvQ9Cw1PNG5nmM';
const TOKEN_SECRET = 'simpanduit-v1'; // ponytail: hardcoded secret, ganti kalau perlu

const SHEET_SCHEMAS = {
  Users: ['id', 'username', 'password', 'nama', 'role', 'created_at'],
  PencariKerja: ['id', 'nama', 'kecamatan', 'desa', 'pendidikan', 'jenis_kelamin', 'umur', 'status', 'minat_kerja', 'minat_pelatihan', 'pengalaman', 'keterampilan', 'pelatihan_pernah_diikuti', 'kesediaan_pelatihan', 'created_at'],
  DUDI: ['id', 'nama_perusahaan', 'bidang_usaha', 'lokasi', 'kontak_hrd', 'produk', 'jumlah_kebutuhan', 'kompetensi_dibutuhkan', 'persyaratan', 'pendidikan', 'pengalaman', 'created_at'],
  AKAD: ['id', 'nama_perusahaan', 'lowongan', 'persyaratan', 'lokasi_kerja', 'cara_melamar', 'jadwal_rekrutmen', 'status', 'created_at'],
  AKAN: ['id', 'nama_p3mi', 'negara_tujuan', 'jabatan', 'gaji', 'persyaratan', 'dokumen', 'tahapan', 'kontak', 'created_at'],
  KarirHub: ['id', 'judul_lowongan', 'kompetensi', 'perusahaan', 'lokasi', 'deadline', 'created_at'],
  RekomendasiPelatihan: ['id', 'kompetensi', 'kecamatan', 'jumlah_dudi_butuh', 'jumlah_lowongan', 'jumlah_minat', 'skor_total', 'prioritas', 'alasan', 'created_at'],
  Lamaran: ['id', 'lowongan_id', 'sumber', 'nama_lengkap', 'email', 'telepon', 'pendidikan', 'pengalaman', 'cv_filename', 'cv_drive_id', 'status', 'created_at'],
  InfoPelatihan: ['id', 'judul', 'deskripsi', 'kompetensi', 'lokasi', 'jadwal', 'penyelenggara', 'kontak', 'target_peserta', 'kuota', 'status', 'created_at']
};

// Modul yang butuh login untuk semua aksi selain 'login'
const PROTECTED_MODULES = ['Users', 'PencariKerja', 'DUDI', 'AKAD', 'AKAN', 'KarirHub', 'RekomendasiPelatihan', 'InfoPelatihan'];

// Bobot skor untuk Identifikasi Kebutuhan Pelatihan (total harus 1.0)
const BOBOT_DUDI = 0.4;
const BOBOT_LOWONGAN = 0.3;
const BOBOT_MINAT = 0.3;

// Kelompok posisi — 6 divisi sesuai metodologi SIMATA DUIT
const KELOMPOK_POSISI = {
  'Sewing': ['jahit', 'sewing', 'penjahit', 'operator jahit', 'operator mesin jahit'],
  'Cutting': ['potong', 'cutting', 'pemotong', 'operator cutting', 'pemotongan'],
  'Assembly Sepatu': ['lasting', 'sole', 'upper', 'assembly', 'perakitan', 'assembly sepatu'],
  'QC': ['qc', 'quality control', 'pemeriksa kualitas'],
  'Finishing': ['finishing', 'packing', 'penyelesaian', 'finishing & packing'],
  'Pattern': ['pola', 'pattern', 'pembuat pola', 'pattern maker']
};

const JENJANG_PENDIDIKAN = ['Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'SMK', 'D3', 'D1/D3', 'S1', 'S2'];

function getJenjangIndex(pendidikan) {
  const p = String(pendidikan || '').trim().toUpperCase();
  if (p === 'TIDAK SEKOLAH' || p === '') return -1;
  if (p === 'D1/D3' || p === 'D3' || p === 'D1') return 5;
  if (p === 'SMA/SMK' || p === 'SMK' || p === 'SMA') return 4;
  const idx = JENJANG_PENDIDIKAN.findIndex(j => j.toUpperCase() === p);
  return idx >= 0 ? idx : -1;
}

function getKelompokPosisi(input) {
  const lower = String(input || '').trim().toLowerCase();
  if (!lower) return null;
  for (const [kelompok, keywords] of Object.entries(KELOMPOK_POSISI)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return kelompok;
    }
  }
  return null;
}

// ---------- ENTRY POINTS ----------

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter || {};
    // Read body from POST data or from URL-encoded 'data' param
    let body = {};
    try {
      if (e.postData && e.postData.contents) {
        body = JSON.parse(e.postData.contents);
      }
    } catch (_) { /* ignore */ }
    // Merge URL params into body (URL params take precedence for routing)
    if (params.data) {
      try { body.data = JSON.parse(params.data); } catch (_) { /* ignore */ }
    }
    if (params.module) body.module = params.module;
    if (params.id) body.id = params.id;
    if (params.username) body.username = params.username;
    if (params.password) body.password = params.password;
    if (params.kecamatan) body.kecamatan = params.kecamatan;
    if (params.token) body.token = params.token;
    if (params.filters) {
      try { body.filters = JSON.parse(params.filters); } catch (_) { /* ignore */ }
    }
    const action = params.action || body.action;

    if (!action) return jsonResponse({ success: false, error: 'Parameter action wajib diisi.' });

    if (action === 'login') return jsonResponse(handleLogin(body));
    if (action === 'logout') return jsonResponse(handleLogout());
    if (action === 'validateSession') return jsonResponse(validateSession(body.token));

    if (action === 'identifikasiKebutuhan') {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });
      return jsonResponse(identifikasiKebutuhanPelatihan(body.kecamatan));
    }

    if (action === 'listKecamatan') {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });
      return jsonResponse(listKecamatan());
    }

    if (action === 'petaSebaran') {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });
      return jsonResponse(petaSebaranKebutuhan());
    }

    if (action === 'dashboardAnalisis') {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });
      return jsonResponse(dashboardAnalisis());
    }

    if (action === 'analisisKesesuaian') {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });
      return jsonResponse(analisisKesesuaian(body.kecamatan));
    }

    // Public actions — no auth required
    if (action === 'lowonganPublik') return jsonResponse(lowonganPublik());
    if (action === 'lamarLowongan') return jsonResponse(lamarLowongan(body));
    if (action === 'rekomendasiPublik') return jsonResponse(rekomendasiPublik());
    if (action === 'infoPelatihanPublik') return jsonResponse(infoPelatihanPublik());

    // Semua aksi CRUD generik: create / read / update / delete
    const module = params.module || body.module;
    if (!module || !SHEET_SCHEMAS[module]) {
      return jsonResponse({ success: false, error: 'Modul tidak dikenali: ' + module });
    }

    if (PROTECTED_MODULES.includes(module)) {
      const session = validateSession(body.token || params.token);
      if (!session.success) return jsonResponse({ success: false, error: 'Sesi tidak valid, silakan login ulang.' });

      if (['create', 'update', 'delete'].includes(action)) {
        const permError = checkWritePermission(module, session.session.role);
        if (permError) return jsonResponse({ success: false, error: permError });
      }
    }

    switch (action) {
      case 'create': return jsonResponse(createRecord(module, body.data));
      case 'read': return jsonResponse(readRecords(module, body.filters));
      case 'update': return jsonResponse(updateRecord(module, body.id, body.data));
      case 'delete': return jsonResponse(deleteRecord(module, body.id));
      default: return jsonResponse({ success: false, error: 'Aksi tidak dikenali: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ---------- ROLE & PERMISSIONS ----------

// Modul yang boleh ditulis (create/update/delete) oleh masing-masing role.
// Admin & Operator: input data operasional. Users: khusus Admin.
// Kepala Bidang & Mentor: read-only di semua modul (tidak masuk daftar ini).
const WRITE_PERMISSIONS = {
  Admin: ['Users', 'PencariKerja', 'DUDI', 'AKAD', 'AKAN', 'KarirHub', 'RekomendasiPelatihan', 'InfoPelatihan'],
  Operator: ['PencariKerja', 'DUDI', 'AKAD', 'AKAN', 'KarirHub', 'InfoPelatihan']
};

function checkWritePermission(module, role) {
  const allowed = WRITE_PERMISSIONS[role] || [];
  if (allowed.includes(module)) return null; // null = tidak ada error, diizinkan
  return 'Role "' + role + '" tidak memiliki izin untuk mengubah data pada modul ini.';
}

// ---------- AUTH ----------

function handleLogin(body) {
  const { username, password } = body;
  if (!username || !password) return { success: false, error: 'Username dan password wajib diisi.' };

  const users = getSheetData('Users');
  const user = users.find(u => u.username === username && u.password === hashPassword(password));
  if (!user) return { success: false, error: 'Username atau password salah.' };

  const token = generateToken(user);
  return {
    success: true,
    token: token,
    user: { id: user.id, username: user.username, nama: user.nama, role: user.role }
  };
}

function handleLogout() {
  return { success: true };
}

function generateToken(user) {
  const payload = user.id + '|' + user.username + '|' + user.role;
  const sig = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload + TOKEN_SECRET);
  const hex = sig.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
  return Utilities.base64Encode(payload + '|' + hex);
}

function validateSession(token) {
  if (!token) return { success: false, error: 'Token tidak ada.' };
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts = decoded.split('|');
    if (parts.length !== 4) return { success: false, error: 'Token tidak valid.' };

    const [userId, username, role, hex] = parts;
    const payload = userId + '|' + username + '|' + role;
    const expectedSig = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload + TOKEN_SECRET);
    const expectedHex = expectedSig.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');

    if (hex !== expectedHex) return { success: false, error: 'Token tidak valid.' };

    // Verify user still exists
    const users = getSheetData('Users');
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User tidak ditemukan.' };

    return { success: true, session: { user_id: userId, username: username, role: role } };
  } catch (_) {
    return { success: false, error: 'Token tidak valid.' };
  }
}

function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

// ---------- CRUD GENERIK ----------

function createRecord(module, data) {
  if (!data) return { success: false, error: 'Data kosong.' };
  const id = Utilities.getUuid();
  const record = Object.assign({}, data, { id: id, created_at: new Date().toISOString() });
  appendRow(module, record);
  return { success: true, id: id, data: record };
}

function readRecords(module, filters) {
  let records = getSheetData(module);
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        records = records.filter(r => String(r[key]).toLowerCase().includes(String(filters[key]).toLowerCase()));
      }
    });
  }
  return { success: true, data: records };
}

function updateRecord(module, id, data) {
  if (!id) return { success: false, error: 'ID wajib diisi.' };
  const sheet = getSheet(module);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === id) {
      headers.forEach((h, colIdx) => {
        if (data.hasOwnProperty(h) && h !== 'id' && h !== 'created_at') {
          sheet.getRange(i + 1, colIdx + 1).setValue(data[h]);
        }
      });
      return { success: true, id: id };
    }
  }
  return { success: false, error: 'Data dengan ID tersebut tidak ditemukan.' };
}

function deleteRecord(module, id) {
  if (!id) return { success: false, error: 'ID wajib diisi.' };
  const sheet = getSheet(module);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Data dengan ID tersebut tidak ditemukan.' };
}

// ---------- IDENTIFIKASI KEBUTUHAN PELATIHAN ----------

/**
 * Menggabungkan data DUDI (kebutuhan industri), KarirHub (lowongan tersedia),
 * dan PencariKerja (minat masyarakat) per kompetensi untuk kecamatan tertentu
 * (atau semua kecamatan jika kosong/'Semua'), lalu menghitung skor prioritas.
 */
function identifikasiKebutuhanPelatihan(kecamatan) {
  const filterKecamatan = kecamatan && kecamatan !== 'Semua' ? kecamatan : null;

  const dudi = getSheetData('DUDI');
  const karirhub = getSheetData('KarirHub');
  let pencariKerja = getSheetData('PencariKerja');
  if (filterKecamatan) {
    pencariKerja = pencariKerja.filter(p => p.kecamatan === filterKecamatan);
  }

  // map: kompetensi (lowercase, trimmed) -> { label, dudi, lowongan, minat }
  const map = {};

  function ensure(label) {
    const key = String(label).trim().toLowerCase();
    if (!key) return null;
    if (!map[key]) map[key] = { label: String(label).trim(), dudi: 0, lowongan: 0, minat: 0 };
    return map[key];
  }

  dudi.forEach(d => {
    const jumlah = Number(d.jumlah_kebutuhan) || 1;
    String(d.kompetensi_dibutuhkan || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.dudi += jumlah;
    });
  });

  karirhub.forEach(l => {
    String(l.kompetensi || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.lowongan += 1;
    });
  });

  pencariKerja.forEach(p => {
    String(p.minat_pelatihan || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.minat += 1;
    });
  });

  const entries = Object.values(map);
  if (entries.length === 0) {
    return { success: true, kecamatan: kecamatan || 'Semua', data: [] };
  }

  const maxDudi = Math.max(...entries.map(e => e.dudi), 1);
  const maxLowongan = Math.max(...entries.map(e => e.lowongan), 1);
  const maxMinat = Math.max(...entries.map(e => e.minat), 1);

  const results = entries.map(e => {
    const skorDudi = e.dudi / maxDudi;
    const skorLowongan = e.lowongan / maxLowongan;
    const skorMinat = e.minat / maxMinat;
    const skorTotal = (skorDudi * BOBOT_DUDI) + (skorLowongan * BOBOT_LOWONGAN) + (skorMinat * BOBOT_MINAT);

    let prioritas;
    if (skorTotal >= 0.66) prioritas = 'Tinggi';
    else if (skorTotal >= 0.33) prioritas = 'Sedang';
    else prioritas = 'Rendah';

    const alasanParts = [];
    if (skorDudi >= 0.5) alasanParts.push('kebutuhan industri tinggi');
    if (skorLowongan >= 0.5) alasanParts.push('lowongan tersedia cukup banyak');
    if (skorMinat >= 0.5) alasanParts.push('masyarakat berminat');
    if (alasanParts.length === 0) alasanParts.push('permintaan masih rendah di seluruh indikator');

    return {
      kompetensi: e.label,
      kecamatan: kecamatan || 'Semua',
      jumlah_dudi_butuh: e.dudi,
      jumlah_lowongan: e.lowongan,
      jumlah_minat: e.minat,
      skor_total: Math.round(skorTotal * 100) / 100,
      prioritas: prioritas,
      alasan: alasanParts.join(', ')
    };
  }).sort((a, b) => b.skor_total - a.skor_total);

  // Simpan snapshot hasil analisis ke sheet RekomendasiPelatihan
  results.forEach(r => {
    appendRow('RekomendasiPelatihan', Object.assign({}, r, {
      id: Utilities.getUuid(),
      created_at: new Date().toISOString()
    }));
  });

  return { success: true, kecamatan: kecamatan || 'Semua', data: results };
}

function listKecamatan() {
  const pencariKerja = getSheetData('PencariKerja');
  const set = {};
  pencariKerja.forEach(p => { if (p.kecamatan) set[p.kecamatan] = true; });
  return { success: true, data: Object.keys(set).sort() };
}

/**
 * Mengagregasi minat masyarakat per kecamatan per kompetensi,
 * untuk menampilkan Peta Sebaran Kebutuhan.
 * Contoh output: { kecamatan: 'Loli', minat: [{ kompetensi: 'Garmen', jumlah: 30 }, ...] }
 */
function petaSebaranKebutuhan() {
  const pencariKerja = getSheetData('PencariKerja');
  const byKecamatan = {};

  pencariKerja.forEach(p => {
    const kec = String(p.kecamatan || '').trim();
    if (!kec) return;
    if (!byKecamatan[kec]) byKecamatan[kec] = {};

    String(p.minat_pelatihan || '').split(',').forEach(raw => {
      const k = raw.trim();
      if (!k) return;
      byKecamatan[kec][k] = (byKecamatan[kec][k] || 0) + 1;
    });
  });

  const result = Object.keys(byKecamatan).sort().map(kec => {
    const minatMap = byKecamatan[kec];
    const minat = Object.keys(minatMap)
      .map(k => ({ kompetensi: k, jumlah: minatMap[k] }))
      .sort((a, b) => b.jumlah - a.jumlah);
    const total = minat.reduce((sum, m) => sum + m.jumlah, 0);
    return { kecamatan: kec, total: total, minat: minat };
  }).sort((a, b) => b.total - a.total);

  return { success: true, data: result };
}

/**
 * Agregasi lintas modul untuk Dashboard Analisis:
 * - kompetensi paling dibutuhkan (dari DUDI, dibobot jumlah_kebutuhan)
 * - perusahaan terbanyak membuka lowongan (dari KarirHub + AKAD)
 * - kecamatan asal pencari kerja
 * - jenis pelatihan prioritas (dari minat_pelatihan)
 * - persentase gender
 */
function dashboardAnalisis() {
  const dudi = getSheetData('DUDI');
  const karirhub = getSheetData('KarirHub');
  const akad = getSheetData('AKAD');
  const pencariKerja = getSheetData('PencariKerja');

  // Kompetensi paling dibutuhkan (dari DUDI)
  const kompetensiCount = {};
  dudi.forEach(d => {
    const jumlah = Number(d.jumlah_kebutuhan) || 1;
    String(d.kompetensi_dibutuhkan || '').split(',').forEach(k => {
      const key = k.trim();
      if (!key) return;
      kompetensiCount[key] = (kompetensiCount[key] || 0) + jumlah;
    });
  });
  const kompetensiPalingDibutuhkan = Object.keys(kompetensiCount)
    .map(k => ({ label: k, value: kompetensiCount[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Perusahaan terbanyak membuka lowongan (gabungan KarirHub + AKAD)
  const perusahaanCount = {};
  karirhub.forEach(l => {
    const nama = String(l.perusahaan || '').trim();
    if (nama) perusahaanCount[nama] = (perusahaanCount[nama] || 0) + 1;
  });
  akad.forEach(l => {
    const nama = String(l.nama_perusahaan || '').trim();
    if (nama) perusahaanCount[nama] = (perusahaanCount[nama] || 0) + 1;
  });
  const perusahaanTerbanyak = Object.keys(perusahaanCount)
    .map(k => ({ label: k, value: perusahaanCount[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Kecamatan asal pencari kerja
  const kecamatanCount = {};
  pencariKerja.forEach(p => {
    const kec = String(p.kecamatan || '').trim();
    if (kec) kecamatanCount[kec] = (kecamatanCount[kec] || 0) + 1;
  });
  const kecamatanAsal = Object.keys(kecamatanCount)
    .map(k => ({ label: k, value: kecamatanCount[k] }))
    .sort((a, b) => b.value - a.value);

  // Jenis pelatihan prioritas (minat_pelatihan)
  const minatCount = {};
  pencariKerja.forEach(p => {
    String(p.minat_pelatihan || '').split(',').forEach(k => {
      const key = k.trim();
      if (key) minatCount[key] = (minatCount[key] || 0) + 1;
    });
  });
  const pelatihanPrioritas = Object.keys(minatCount)
    .map(k => ({ label: k, value: minatCount[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Persentase gender
  let lakiLaki = 0, perempuan = 0;
  pencariKerja.forEach(p => {
    const g = String(p.jenis_kelamin || '').toLowerCase();
    if (g.indexOf('laki') !== -1) lakiLaki++;
    else if (g.indexOf('perempuan') !== -1) perempuan++;
  });
  const totalGender = lakiLaki + perempuan;

  // Distribusi usia
  const usiaBuckets = { '15-19': 0, '20-24': 0, '25-29': 0, '30-34': 0, '35-39': 0, '40+': 0 };
  pencariKerja.forEach(p => {
    const age = Number(p.umur);
    if (!age || isNaN(age)) return;
    if (age < 20) usiaBuckets['15-19']++;
    else if (age < 25) usiaBuckets['20-24']++;
    else if (age < 30) usiaBuckets['25-29']++;
    else if (age < 35) usiaBuckets['30-34']++;
    else if (age < 40) usiaBuckets['35-39']++;
    else usiaBuckets['40+']++;
  });
  const distribusiUsia = Object.keys(usiaBuckets).map(k => ({ label: k, value: usiaBuckets[k] }));

  // Status pekerjaan
  const statusCount = {};
  pencariKerja.forEach(p => {
    const s = String(p.status || '').trim() || 'Tidak diketahui';
    statusCount[s] = (statusCount[s] || 0) + 1;
  });
  const statusPekerjaan = Object.keys(statusCount)
    .map(k => ({ label: k, value: statusCount[k] }))
    .sort((a, b) => b.value - a.value);

  // Pendidikan
  const pendidikanCount = {};
  pencariKerja.forEach(p => {
    const d = String(p.pendidikan || '').trim() || 'Tidak diketahui';
    pendidikanCount[d] = (pendidikanCount[d] || 0) + 1;
  });
  const pendidikan = Object.keys(pendidikanCount)
    .map(k => ({ label: k, value: pendidikanCount[k] }))
    .sort((a, b) => b.value - a.value);

  // Lamaran masuk
  const lamaran = getSheetData('Lamaran');
  const lamaranPerBulan = {};
  lamaran.forEach(l => {
    if (!l.created_at) return;
    const d = new Date(l.created_at);
    const key = (d.getMonth() + 1) + '/' + d.getFullYear();
    lamaranPerBulan[key] = (lamaranPerBulan[key] || 0) + 1;
  });
  const lamaranMasuk = Object.keys(lamaranPerBulan)
    .map(k => ({ label: k, value: lamaranPerBulan[k] }))
    .sort((a, b) => {
      const [mA, yA] = a.label.split('/');
      const [mB, yB] = b.label.split('/');
      return (Number(yA) - Number(yB)) || (Number(mA) - Number(mB));
    });

  return {
    success: true,
    data: {
      kompetensiPalingDibutuhkan: kompetensiPalingDibutuhkan,
      perusahaanTerbanyak: perusahaanTerbanyak,
      kecamatanAsal: kecamatanAsal,
      pelatihanPrioritas: pelatihanPrioritas,
      gender: {
        lakiLaki: lakiLaki,
        perempuan: perempuan,
        persenLakiLaki: totalGender ? Math.round((lakiLaki / totalGender) * 100) : 0,
        persenPerempuan: totalGender ? Math.round((perempuan / totalGender) * 100) : 0
      },
      totalPencariKerja: pencariKerja.length,
      totalDudi: dudi.length,
      totalLowongan: karirhub.length + akad.length,
      totalLamaran: lamaran.length,
      distribusiUsia: distribusiUsia,
      statusPekerjaan: statusPekerjaan,
      pendidikan: pendidikan,
      lamaranMasuk: lamaranMasuk
    }
  };
}

// ---------- ANALISIS KESESUAIAN ----------

function analisisKesesuaian(kecamatan) {
  const filterKecamatan = kecamatan && kecamatan !== 'Semua' ? kecamatan : null;

  const dudi = getSheetData('DUDI');
  let pencariKerja = getSheetData('PencariKerja');
  if (filterKecamatan) {
    pencariKerja = pencariKerja.filter(p => p.kecamatan === filterKecamatan);
  }

  // Group DUDI by kelompok posisi
  const dudiByKelompok = {};
  dudi.forEach(d => {
    const bidang = String(d.bidang_usaha || '').trim();
    const produk = String(d.produk || '').trim();
    const kelompok = getKelompokPosisi(bidang) || getKelompokPosisi(produk);
    if (!kelompok) return;

    if (!dudiByKelompok[kelompok]) {
      dudiByKelompok[kelompok] = { kuota: 0, kompetensiSet: new Set(), pendidikan: '', pengalaman: '' };
    }
    const entry = dudiByKelompok[kelompok];
    entry.kuota += Number(d.jumlah_kebutuhan) || 1;
    String(d.kompetensi_dibutuhkan || '').split(',').forEach(k => {
      const kk = k.trim().toLowerCase();
      if (kk) entry.kompetensiSet.add(kk);
    });
    if (d.pendidikan && !entry.pendidikan) entry.pendidikan = d.pendidikan;
    if (d.pengalaman && !entry.pengalaman) entry.pengalaman = d.pengalaman;
  });

  // Group PencariKerja by kelompok posisi (from minat_kerja or minat_pelatihan)
  const pkByKelompok = {};
  pencariKerja.forEach(p => {
    const minat = String(p.minat_kerja || p.minat_pelatihan || '').trim();
    const kelompok = getKelompokPosisi(minat);
    if (!kelompok) return;

    if (!pkByKelompok[kelompok]) pkByKelompok[kelompok] = [];
    pkByKelompok[kelompok].push(p);
  });

  // Compute per kelompok
  const allKelompok = Object.keys(KELOMPOK_POSISI);
  const results = allKelompok.map((kelompok, idx) => {
    const dudiInfo = dudiByKelompok[kelompok] || { kuota: 0, kompetensiSet: new Set(), pendidikan: '', pengalaman: '' };
    const pks = pkByKelompok[kelompok] || [];

    let jumlahSesuai = 0;
    let jumlahBelumSesuai = 0;
    const gapKompetensi = new Set(dudiInfo.kompetensiSet);

    pks.forEach(p => {
      let matchCount = 0;

      // Cek kompetensi
      const skillStr = String(p.keterampilan || p.minat_pelatihan || '').toLowerCase();
      const skills = skillStr.split(',').map(s => s.trim()).filter(Boolean);
      const hasSkill = skills.some(s => dudiInfo.kompetensiSet.has(s));
      if (hasSkill) {
        matchCount++;
        skills.forEach(s => gapKompetensi.delete(s));
      }

      // Cek pendidikan
      const pdkMasyarakat = getJenjangIndex(p.pendidikan);
      const pdkIndustri = getJenjangIndex(dudiInfo.pendidikan);
      if (pdkMasyarakat >= 0 && pdkIndustri >= 0 && pdkMasyarakat >= pdkIndustri) {
        matchCount++;
      } else if (pdkIndustri < 0) {
        matchCount++; // industri tidak syaratkan pendidikan
      }

      // Cek pengalaman (sederhana: ada = cocok)
      if (p.pengalaman && String(p.pengalaman).trim()) {
        matchCount++;
      } else if (!dudiInfo.pengalaman) {
        matchCount++; // industri tidak syaratkan pengalaman
      }

      if (matchCount >= 2) jumlahSesuai++;
      else jumlahBelumSesuai++;
    });

    const total = jumlahSesuai + jumlahBelumSesuai;
    const persentase = total > 0 ? Math.round((jumlahSesuai / total) * 100) : 0;

    // Prioritas
    let prioritas;
    if (persentase >= 70 && dudiInfo.kuota > 0) prioritas = 'Tinggi';
    else if (persentase >= 40 || dudiInfo.kuota > 100) prioritas = 'Sedang';
    else prioritas = 'Rendah';

    return {
      peringkat: 0, // will be assigned after sort
      kelompok: kelompok,
      kuota: dudiInfo.kuota,
      minat: total,
      minat_persen: total > 0 ? Math.round((total / pencariKerja.length) * 100) : 0,
      jumlah_sesuai: jumlahSesuai,
      jumlah_belum_sesuai: jumlahBelumSesuai,
      persentase: persentase,
      gap_kompetensi: Array.from(gapKompetensi).join(', ') || '-',
      prioritas: prioritas,
      kecamatan: kecamatan || 'Semua'
    };
  }).filter(r => r.kuota > 0 || r.minat > 0)
    .sort((a, b) => b.persentase - a.persentase || b.kuota - a.kuota);

  results.forEach((r, i) => r.peringkat = i + 1);

  return { success: true, kecamatan: kecamatan || 'Semua', data: results };
}

// ---------- LOWONGAN PUBLIK ----------

function lowonganPublik() {
  const dudi = getSheetData('DUDI');
  const karirhub = getSheetData('KarirHub');

  const lowongan = [];

  // DUDI → lowongan berdasarkan jumlah_kebutuhan
  dudi.filter(d => Number(d.jumlah_kebutuhan) > 0).forEach(d => {
    lowongan.push({
      id: d.id,
      judul: d.kompetensi_dibutuhkan || 'Lowongan Kerja',
      perusahaan: d.nama_perusahaan,
      lokasi: d.lokasi,
      kompetensi: d.kompetensi_dibutuhkan,
      persyaratan: d.persyaratan,
      pendidikan: d.pendidikan || '-',
      deadline: '-',
      sumber: 'DUDI',
      kontak_hrd: d.kontak_hrd || '-',
      bidang_usaha: d.bidang_usaha || '-',
      produk: d.produk || '-'
    });
  });

  // KarirHub → semua lowongan
  karirhub.forEach(k => {
    lowongan.push({
      id: k.id,
      judul: k.judul_lowongan,
      perusahaan: k.perusahaan,
      lokasi: k.lokasi,
      kompetensi: k.kompetensi,
      persyaratan: '-',
      pendidikan: '-',
      deadline: k.deadline || '-',
      sumber: 'KarirHub',
      kontak_hrd: '-',
      bidang_usaha: '-',
      produk: '-'
    });
  });

  return { success: true, data: lowongan };
}

/**
 * Rekomendasi pelatihan untuk halaman publik — top 10 berdasarkan skor
 */
function rekomendasiPublik() {
  const dudi = getSheetData('DUDI');
  const karirhub = getSheetData('KarirHub');
  let pencariKerja = getSheetData('PencariKerja');

  const map = {};

  function ensure(label) {
    const key = String(label).trim().toLowerCase();
    if (!key) return null;
    if (!map[key]) map[key] = { label: String(label).trim(), dudi: 0, lowongan: 0, minat: 0 };
    return map[key];
  }

  dudi.forEach(d => {
    const jumlah = Number(d.jumlah_kebutuhan) || 1;
    String(d.kompetensi_dibutuhkan || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.dudi += jumlah;
    });
  });

  karirhub.forEach(l => {
    String(l.kompetensi || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.lowongan += 1;
    });
  });

  pencariKerja.forEach(p => {
    String(p.minat_pelatihan || '').split(',').forEach(k => {
      const entry = ensure(k);
      if (entry) entry.minat += 1;
    });
  });

  const entries = Object.values(map);
  if (entries.length === 0) return { success: true, data: [] };

  const maxDudi = Math.max(...entries.map(e => e.dudi), 1);
  const maxLowongan = Math.max(...entries.map(e => e.lowongan), 1);
  const maxMinat = Math.max(...entries.map(e => e.minat), 1);

  const results = entries.map(e => {
    const skorDudi = e.dudi / maxDudi;
    const skorLowongan = e.lowongan / maxLowongan;
    const skorMinat = e.minat / maxMinat;
    const skorTotal = (skorDudi * BOBOT_DUDI) + (skorLowongan * BOBOT_LOWONGAN) + (skorMinat * BOBOT_MINAT);

    let prioritas;
    if (skorTotal >= 0.66) prioritas = 'Tinggi';
    else if (skorTotal >= 0.33) prioritas = 'Sedang';
    else prioritas = 'Rendah';

    return {
      kompetensi: e.label,
      jumlah_dudi_butuh: e.dudi,
      jumlah_lowongan: e.lowongan,
      jumlah_minat: e.minat,
      skor_total: Math.round(skorTotal * 100) / 100,
      prioritas: prioritas
    };
  }).sort((a, b) => b.skor_total - a.skor_total).slice(0, 10);

  return { success: true, data: results };
}

/**
 * Info pelatihan untuk halaman publik — semua data aktif
 */
function infoPelatihanPublik() {
  const all = getSheetData('InfoPelatihan');
  const data = all.filter(r => String(r.status || '').toLowerCase() !== 'ditutup');
  return { success: true, data: data };
}

function lamarLowongan(body) {
  const { lowongan_id, sumber, nama_lengkap, email, telepon, pendidikan, pengalaman, cv_base64, cv_filename } = body;

  if (!nama_lengkap || !email || !telepon) {
    return { success: false, error: 'Nama, email, dan telepon wajib diisi.' };
  }

  // Simpan CV ke Google Drive (folder SIMPANDUIT_Lamaran)
  let cv_drive_id = '';
  if (cv_base64 && cv_filename) {
    try {
      const folder = getOrCreateFolder('SIMPANDUIT_Lamaran');
      const blob = Utilities.newBlob(Utilities.base64Decode(cv_base64), getMimeType(cv_filename), cv_filename);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      cv_drive_id = file.getId();
    } catch (e) {
      return { success: false, error: 'Gagal upload CV: ' + e.message };
    }
  }

  const record = {
    lowongan_id: lowongan_id || '',
    sumber: sumber || '',
    nama_lengkap: nama_lengkap,
    email: email,
    telepon: telepon,
    pendidikan: pendidikan || '',
    pengalaman: pengalaman || '',
    cv_filename: cv_filename || '',
    cv_drive_id: cv_drive_id,
    status: 'Baru'
  };

  const id = Utilities.getUuid();
  record.id = id;
  record.created_at = new Date().toISOString();
  appendRow('Lamaran', record);

  // Kirim email notifikasi ke HRD jika kontak tersedia
  try {
    const keterangan = sumber === 'DUDI' ? getSheetData('DUDI').find(d => d.id === lowongan_id) : null;
    const hrdEmail = keterangan && keterangan.kontak_hrd ? keterangan.kontak_hrd : null;
    if (hrdEmail && hrdEmail.includes('@')) {
      GmailApp.sendEmail(hrdEmail, 'Lamaran Baru - ' + (keterangan ? keterangan.nama_perusahaan : 'SIMPANDUIT'), 
        'Halo,\n\nAnda menerima lamaran baru melalui SIMPANDUIT.\n\n' +
        'Nama: ' + nama_lengkap + '\n' +
        'Email: ' + email + '\n' +
        'Telepon: ' + telepon + '\n' +
        'Pendidikan: ' + (pendidikan || '-') + '\n' +
        (keterangan ? 'Lowongan: ' + (keterangan.kompetensi_dibutuhkan || keterangan.nama_perusahaan) + '\n' : '') +
        '\nCV tersedia di drive: https://drive.google.com/file/d/' + cv_drive_id + '/view\n\n' +
        'Salam,\nTim SIMPANDUIT'
      );
    }
  } catch (_) { /* email gagal tidak membatalkan lamaran */ }

  return { success: true, id: id, message: 'Lamaran berhasil dikirim.' };
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function getMimeType(filename) {
  const ext = String(filename).split('.').pop().toLowerCase();
  const types = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return types[ext] || 'application/octet-stream';
}

// ---------- HELPERS ----------

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(SHEET_SCHEMAS[name]);
    return sheet;
  }
  // Add missing headers to existing sheets
  const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const needed = SHEET_SCHEMAS[name];
  const missing = needed.filter(h => !existing.includes(h));
  if (missing.length > 0) {
    sheet.getRange(1, sheet.getLastColumn() + 1, 1, missing.length).setValues([missing]);
  }
  return sheet;
}

function getSheetData(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  }).filter(r => r.id); // buang baris kosong
}

function appendRow(module, record) {
  const sheet = getSheet(module);
  const headers = SHEET_SCHEMAS[module];
  const row = headers.map(h => record[h] !== undefined ? record[h] : '');
  sheet.appendRow(row);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan sekali secara manual untuk membuat semua sheet + header,
 * dan membuat 1 akun admin default (admin / admin123 — segera ganti!).
 */
function setupInitialData() {
  Object.keys(SHEET_SCHEMAS).forEach(name => getSheet(name));

  const users = getSheetData('Users');
  if (users.length === 0) {
    appendRow('Users', {
      id: Utilities.getUuid(),
      username: 'admin',
      password: hashPassword('admin123'),
      nama: 'Administrator',
      role: 'Admin',
      created_at: new Date().toISOString()
    });
  }
}