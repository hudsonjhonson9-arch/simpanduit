import axios from 'axios';

// Ganti dengan URL deployment Web App Google Apps Script Anda
const GAS_URL = import.meta.env.VITE_GAS_URL as string;

export type Module = 'Users' | 'PencariKerja' | 'DUDI' | 'AKAD' | 'AKAN' | 'KarirHub' | 'RekomendasiPelatihan';

function getToken(): string | null {
  return localStorage.getItem('simpanduit_token');
}

async function post<T = any>(payload: Record<string, any>): Promise<T> {
  const token = getToken();
  const res = await axios.post(GAS_URL, JSON.stringify({
    ...payload,
    token: payload.token ?? token ?? undefined
  }), { headers: { 'Content-Type': 'text/plain' } });
  return res.data;
}

export const gasApi = {
  login: (username: string, password: string) =>
    post({ action: 'login', username, password }),

  logout: () => post({ action: 'logout' }),

  list: (module: Module, filters?: Record<string, string>) =>
    post({ action: 'read', module, filters }),

  create: (module: Module, data: Record<string, any>) =>
    post({ action: 'create', module, data }),

  update: (module: Module, id: string, data: Record<string, any>) =>
    post({ action: 'update', module, id, data }),

  remove: (module: Module, id: string) =>
    post({ action: 'delete', module, id }),

  identifikasiKebutuhan: (kecamatan?: string) =>
    post({ action: 'identifikasiKebutuhan', kecamatan }),

  listKecamatan: () =>
    post({ action: 'listKecamatan' }),

  petaSebaran: () =>
    post({ action: 'petaSebaran' }),

  dashboardAnalisis: () =>
    post({ action: 'dashboardAnalisis' }),

  analisisKesesuaian: (kecamatan?: string) =>
    post({ action: 'analisisKesesuaian', kecamatan })
};
