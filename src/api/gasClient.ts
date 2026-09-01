import axios from 'axios';

const GAS_URL = import.meta.env.VITE_GAS_URL as string;

export type Module = 'Users' | 'PencariKerja' | 'DUDI' | 'AKAD' | 'AKAN' | 'KarirHub' | 'RekomendasiPelatihan';

function getToken(): string | null {
  return localStorage.getItem('simpanduit_token');
}

/**
 * ponytail: GAS web app redirects strip POST body.
 * Use GET + URL params — they survive redirects.
 * Data payload is JSON-encoded into a single param.
 */
async function gasRequest<T = any>(payload: Record<string, any>): Promise<T> {
  const token = getToken();
  const fullPayload = {
    ...payload,
    token: payload.token ?? token ?? undefined
  };
  const params = new URLSearchParams();
  params.set('action', fullPayload.action || '');
  if (fullPayload.module) params.set('module', fullPayload.module);
  if (fullPayload.token) params.set('token', fullPayload.token);
  if (fullPayload.id) params.set('id', fullPayload.id);
  if (fullPayload.username) params.set('username', fullPayload.username);
  if (fullPayload.password) params.set('password', fullPayload.password);
  if (fullPayload.kecamatan) params.set('kecamatan', fullPayload.kecamatan);
  if (fullPayload.data) params.set('data', JSON.stringify(fullPayload.data));
  if (fullPayload.filters) params.set('filters', JSON.stringify(fullPayload.filters));

  const url = `${GAS_URL}?${params.toString()}`;
  console.log('[GAS REQUEST]', fullPayload.action, fullPayload.module || '');
  const res = await axios.get(url);
  console.log('[GAS RESPONSE]', JSON.stringify(res.data).substring(0, 200));
  return res.data;
}

export const gasApi = {
  login: (username: string, password: string) =>
    gasRequest({ action: 'login', username, password }),

  logout: () => gasRequest({ action: 'logout' }),

  list: (module: Module, filters?: Record<string, string>) =>
    gasRequest({ action: 'read', module, filters }),

  create: (module: Module, data: Record<string, any>) =>
    gasRequest({ action: 'create', module, data }),

  update: (module: Module, id: string, data: Record<string, any>) =>
    gasRequest({ action: 'update', module, id, data }),

  remove: (module: Module, id: string) =>
    gasRequest({ action: 'delete', module, id }),

  identifikasiKebutuhan: (kecamatan?: string) =>
    gasRequest({ action: 'identifikasiKebutuhan', kecamatan }),

  listKecamatan: () =>
    gasRequest({ action: 'listKecamatan' }),

  petaSebaran: () =>
    gasRequest({ action: 'petaSebaran' }),

  dashboardAnalisis: () =>
    gasRequest({ action: 'dashboardAnalisis' }),

  analisisKesesuaian: (kecamatan?: string) =>
    gasRequest({ action: 'analisisKesesuaian', kecamatan })
};
