import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../contexts/ThemeContext';
import { MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md';

function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]); // Langsung array untuk semua aplikasi
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [error, setError] = useState(null);

  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');

  const { theme, toggleTheme } = useTheme();

  // State untuk Modal Konfirmasi Download CV
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err.message);
      setError('Gagal memuat lamaran. ' + err.message);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      setError('Gagal logout. ' + error.message);
    } else {
      navigate('/admin/login');
    }
  };

  const handleDownloadCV = async (cvUrl, fileName) => {
    setError(null);
    try {
        // Dapatkan path file yang sebenarnya di dalam bucket
        const pathSegments = cvUrl.split('cv-uploads/');
        if (pathSegments.length < 2) {
            throw new Error('URL CV tidak valid.');
        }
        const filePathInBucket = pathSegments[1]; // Ini adalah 'public/namafile.pdf'

        const { data, error: storageError } = await supabase.storage
            .from('cv-uploads')
            .download(filePathInBucket); // Gunakan path yang benar di sini

        if (storageError) {
            if (storageError.statusCode === '404' || storageError.message.includes('not found')) {
                setError('File CV tidak ditemukan atau sudah dihapus.');
            } else {
                throw storageError;
            }
        }

        if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'cv.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setDownloadedFileName(fileName);
            setShowDownloadConfirmModal(true);

        } else {
            setError('Gagal mendownload CV: Data kosong.');
        }

    } catch (err) {
        console.error('Error downloading CV:', err.message);
        setError('Gagal mendownload CV. ' + err.message);
    }
  };

  const handleCloseDownloadConfirmModal = () => {
    setShowDownloadConfirmModal(false);
    setDownloadedFileName('');
  };

  const filteredApplications = applications.filter(app =>
    app.applicant_name.toLowerCase().includes(applicantSearchTerm.toLowerCase()) ||
    app.applicant_email.toLowerCase().includes(applicantSearchTerm.toLowerCase())
  );

  return (
    <div className={`container mx-auto mt-10 p-4 max-w-6xl animate-fade-in ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-light-bg-primary'}`}>
      {/* Header Utama Dashboard Admin */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-blue mb-4 sm:mb-0 flex-grow text-center sm:text-left order-1">
          Dashboard Admin
        </h1>
        <div className="flex items-center space-x-4 order-2 ml-auto sm:ml-0">
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-mid-blue-bg text-text-light hover:bg-light-blue hover:text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                aria-label="Toggle Tema"
            >
                {theme === 'dark' ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
            </button>
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
            >
                Logout
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4 animate-fade-in" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Search Bar Pelamar */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full  animate-fade-in delay-200">
            <input
                type="text"
                placeholder="Cari pelamar (nama, email)..."
                className={`w-full py-2 pl-10 pr-4 rounded-full shadow-md focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                    ? 'bg-mid-blue-bg text-text-light border border-light-blue focus:ring-primary-blue'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-indigo-500'
                }`}
                value={applicantSearchTerm}
                onChange={(e) => setApplicantSearchTerm(e.target.value)}
            />
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-light-blue' : 'text-gray-500'}`}>
                <MdSearch size={20} />
            </div>
        </div>
      </div>

      {/* Daftar Pelamar */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-text-dark dark:text-text-light mb-5 animate-slide-in-right">Daftar Pelamar</h2>
      {loadingApplications ? (
        <div className={`text-center p-8 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>Memuat daftar pelamar...</div>
      ) : filteredApplications.length === 0 ? (
        <p className={`text-center ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'}`}>
          Tidak ada pelamar saat ini atau tidak sesuai pencarian.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full rounded-lg ${theme === 'dark' ? 'bg-dark-blue-bg border-light-blue' : 'bg-white border-gray-300'}`}>
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'bg-mid-blue-bg border-light-blue' : 'bg-gray-100 border-gray-300'}`}>
                <th className={`py-3 px-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-text-light' : 'text-gray-600'}`}>Nama Pelamar</th>
                <th className={`py-3 px-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-text-light' : 'text-gray-600'}`}>Email</th>
                <th className={`py-3 px-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-text-light' : 'text-gray-600'}`}>Tanggal Lamaran</th>
                <th className={`py-3 px-3 sm:px-6 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-text-light' : 'text-gray-600'}`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id} className={`border-b ${theme === 'dark' ? 'border-light-blue/50 hover:bg-light-blue/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <td className={`py-3 px-3 sm:px-6 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>{app.applicant_name}</td>
                  <td className={`py-3 px-3 sm:px-6 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>{app.applicant_email}</td>
                  <td className={`py-3 px-3 sm:px-6 whitespace-nowrap text-xs ${theme === 'dark' ? 'text-text-medium' : 'text-gray-500'}`}>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3 sm:px-6 whitespace-nowrap">
                    <button
                      onClick={() => {
                        const urlParts = app.cv_url.split('/');
                        const originalFileName = urlParts[urlParts.length - 1];
                        const readableFileName = `${app.applicant_name.replace(/\s+/g, '_')}_CV.${originalFileName.split('.').pop()}`;
                        handleDownloadCV(app.cv_url, readableFileName);
                      }}
                      className="bg-accent-teal hover:bg-primary-blue text-white font-medium py-1.5 px-3 rounded-md text-xs sm:text-sm transition-colors"
                    >
                      Download CV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className={`mt-12 text-center text-sm ${theme === 'dark' ? 'text-text-medium' : 'text-gray-500'}`}>
        <p>&copy; {new Date().getFullYear()} KERJAINYUK. Dashboard Admin.</p>
      </footer>

      {/* Confirmation Modal for CV Download */}
      {showDownloadConfirmModal && (
        <div className="fixed inset-0 bg-dark-blue-bg bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-8 w-full max-w-sm md:max-w-md border animate-zoom-in ${
            theme === 'dark'
              ? 'bg-mid-blue-bg border-light-blue'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-700'}`}>
              Download Berhasil!
            </h2>
            <p className={`text-base sm:text-lg text-center mb-6 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              File CV <strong className="font-semibold text-primary-blue">{downloadedFileName}</strong> telah berhasil diunduh ke perangkat Anda.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseDownloadConfirmModal}
                className="bg-primary-blue hover:bg-light-blue text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;