import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import LoginPage from './pages/LoginPage';
import LowonganPage from './pages/LowonganPage';
import BerandaPage from './pages/BerandaPage';
import DudiPage from './pages/DudiPage';
import AkadPage from './pages/AkadPage';
import AkanPage from './pages/AkanPage';
import KarirHubPage from './pages/KarirHubPage';
import LowonganKerjaPage from './pages/LowonganKerjaPage';
import PencariKerjaPage from './pages/PencariKerjaPage';
import IdentifikasiPage from './pages/IdentifikasiPage';
import RekomendasiPage from './pages/RekomendasiPage';
import PetaSebaranPage from './pages/PetaSebaranPage';
import LaporanPage from './pages/LaporanPage';
import GapKompetensiPage from './pages/GapKompetensiPage';
import DashboardPage from './pages/DashboardPage';
import InfoPelatihanPage from './pages/InfoPelatihanPage';
import PublicInfoPelatihanPage from './pages/PublicInfoPelatihanPage';

function guarded(element: React.ReactNode) {
  return <RoleGuard>{element}</RoleGuard>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PublicLayout><LowonganPage /></PublicLayout>} />
          <Route path="/lowongan" element={<Navigate to="/" replace />} />
          <Route path="/info-pelatihan" element={<PublicInfoPelatihanPage />} />
          <Route
            path="/beranda"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={guarded(<BerandaPage />)} />
            <Route path="dudi" element={guarded(<DudiPage />)} />
            <Route path="akad" element={guarded(<AkadPage />)} />
            <Route path="akan" element={guarded(<AkanPage />)} />
            <Route path="karirhub" element={guarded(<KarirHubPage />)} />
            <Route path="lowongan-kerja" element={guarded(<LowonganKerjaPage />)} />
            <Route path="pencari-kerja" element={guarded(<PencariKerjaPage />)} />
            <Route path="identifikasi" element={guarded(<IdentifikasiPage />)} />
            <Route path="rekomendasi" element={guarded(<RekomendasiPage />)} />
            <Route path="peta-sebaran" element={guarded(<PetaSebaranPage />)} />
            <Route path="laporan" element={guarded(<LaporanPage />)} />
            <Route path="gap-kompetensi" element={guarded(<GapKompetensiPage />)} />
            <Route path="info-pelatihan" element={guarded(<InfoPelatihanPage />)} />
            <Route path="dashboard" element={guarded(<DashboardPage />)} />
          </Route>
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
