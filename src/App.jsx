import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Ini akan jadi daftar lowongan
import LandingPage from './pages/LandingPage'; // Halaman landing baru
import AdminDashboard from './pages/AdminDashboard';
import JobDetail from './pages/JobDetail';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Halaman utama */}
        <Route path="/jobs" element={<Home />} /> {/* Daftar lowongan */}
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;