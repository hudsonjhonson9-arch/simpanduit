import type { Role } from '../context/AuthContext';
import type { Module } from '../api/gasClient';

/** Menu yang boleh dilihat masing-masing role. Path harus cocok dengan route di App.tsx. */
export const MENU_ACCESS: Record<Role, string[]> = {
  Admin: ['/beranda', '/beranda/dudi', '/beranda/akad', '/beranda/akan', '/beranda/karirhub', '/beranda/pencari-kerja', '/beranda/identifikasi', '/beranda/rekomendasi', '/beranda/peta-sebaran', '/beranda/dashboard', '/beranda/laporan', '/beranda/gap-kompetensi', '/pengguna'],
  Operator: ['/beranda', '/beranda/dudi', '/beranda/akad', '/beranda/akan', '/beranda/karirhub', '/beranda/pencari-kerja', '/beranda/identifikasi', '/beranda/rekomendasi', '/beranda/peta-sebaran', '/beranda/dashboard', '/beranda/laporan', '/beranda/gap-kompetensi'],
  'Kepala Bidang': ['/beranda', '/beranda/dudi', '/beranda/akad', '/beranda/akan', '/beranda/karirhub', '/beranda/pencari-kerja', '/beranda/identifikasi', '/beranda/rekomendasi', '/beranda/peta-sebaran', '/beranda/dashboard', '/beranda/laporan', '/beranda/gap-kompetensi'],
  Mentor: ['/beranda', '/beranda/rekomendasi', '/beranda/peta-sebaran', '/beranda/dashboard', '/beranda/laporan', '/beranda/gap-kompetensi']
};

/** Modul yang boleh ditulis (tambah/edit/hapus) oleh masing-masing role. Harus sinkron dengan WRITE_PERMISSIONS di Code.gs. */
export const WRITE_PERMISSIONS: Record<Role, Module[]> = {
  Admin: ['Users', 'PencariKerja', 'DUDI', 'AKAD', 'AKAN', 'KarirHub', 'RekomendasiPelatihan'],
  Operator: ['PencariKerja', 'DUDI', 'AKAD', 'AKAN', 'KarirHub'],
  'Kepala Bidang': [],
  Mentor: []
};

export function canAccessMenu(role: Role | undefined, path: string): boolean {
  if (!role) return false;
  return MENU_ACCESS[role]?.includes(path) ?? false;
}

export function canWrite(role: Role | undefined, module: Module): boolean {
  if (!role) return false;
  return WRITE_PERMISSIONS[role]?.includes(module) ?? false;
}
