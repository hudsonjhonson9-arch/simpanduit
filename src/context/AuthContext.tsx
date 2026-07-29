import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { gasApi } from '../api/gasClient';

export type Role = 'Admin' | 'Operator' | 'Kepala Bidang' | 'Mentor';

interface User {
  id: string;
  username: string;
  nama: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('simpanduit_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const res = await gasApi.login(username, password);
    if (res.success) {
      localStorage.setItem('simpanduit_token', res.token);
      localStorage.setItem('simpanduit_user', JSON.stringify(res.user));
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  }

  function logout() {
    gasApi.logout();
    localStorage.removeItem('simpanduit_token');
    localStorage.removeItem('simpanduit_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
