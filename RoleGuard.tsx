import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../config/permissions';

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!canAccessMenu(user?.role, location.pathname)) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Akses Ditolak</h2>
        <p>Role Anda ({user?.role}) tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    );
  }

  return <>{children}</>;
}
