import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../contexts/ThemeContext';
import { MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md';

function AdminDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');

  const { theme, toggleTheme } = useTheme();

  // === State baru untuk Modal Konfirmasi Download CV ===
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
      setError('Gagal memuat lowongan. ' + err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplicationsForJob = async (jobId) => {
    setLoadingApplications(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(prev => ({ ...prev, [jobId]: data }));
      setSelectedJobForApplicants(jobs.find(job => job.id === jobId));
      setApplicantSearchTerm('');
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
      navigate('/admin');
    }
  };

  const openAddJobModal = () => {
    setCurrentJob(null);
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobDescription('');
    setIsModalOpen(true);
  };

  const openEditJobModal = (job) => {
    setCurrentJob(job);
    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location);
    setJobDescription(job.description);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    setCurrentJob(null);
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);

    const jobData = {
      title: jobTitle,
      company: jobCompany,
      location: jobLocation,
      description: jobDescription,
    };

    try {
      if (currentJob) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', currentJob.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jobs')
          .insert(jobData);
        if (error) throw error;
      }
      closeJobModal();
      fetchJobs();
    } catch (err) {
      console.error('Error saving job:', err.message);
      setError('Gagal menyimpan lowongan. ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Anda yakin ingin menghapus lowongan ini dan semua lamarannya? Tindakan ini tidak dapat dibatalkan.')) {
      setError(null);
      try {
        const { error: deleteJobError } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId);
        if (deleteJobError) throw deleteJobError;

        fetchJobs();
        setApplications(prev => {
            const newState = { ...prev };
            delete newState[jobId];
            return newState;
        });
        setSelectedJobForApplicants(null);
      } catch (err) {
        console.error('Error deleting job:', err.message);
        setError('Gagal menghapus lowongan. ' + err.message);
      }
    }
  };

  const handleDownloadCV = async (cvUrl, fileName) => {
    setError(null);
    try {
        const pathSegments = cvUrl.split('cv-uploads/');
        if (pathSegments.length < 2) {
            throw new Error('URL CV tidak valid.');
        }
        const filePathInBucket = pathSegments[1];

        const { data, error: storageError } = await supabase.storage
            .from('cv-uploads')
            .download(filePathInBucket);

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
            
            // === Tampilkan modal konfirmasi download berhasil ===
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

  // Fungsi untuk menutup modal konfirmasi download
  const handleCloseDownloadConfirmModal = () => {
    setShowDownloadConfirmModal(false);
    setDownloadedFileName('');
  };


  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(jobSearchTerm.toLowerCase())
  );

  const filteredApplications = selectedJobForApplicants && applications[selectedJobForApplicants.id]
    ? applications[selectedJobForApplicants.id].filter(app =>
        app.applicant_name.toLowerCase().includes(applicantSearchTerm.toLowerCase()) ||
        app.applicant_email.toLowerCase().includes(applicantSearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className={`container mx-auto mt-10 p-4 max-w-6xl animate-fade-in ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-gray-100'}`}>
      {/* Header Utama Dashboard Admin */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-blue animate-slide-in-left">Dashboard Admin</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4 animate-fade-in" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Bagian Kontrol Atas: Tambah Lowongan, Search Lowongan, Logout, Toggle Tema */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Tombol Tambah Lowongan */}
        <button
          onClick={openAddJobModal}
          className="bg-accent-teal hover:bg-primary-blue text-white font-bold py-2 px-4 rounded-md transition-colors w-full sm:w-auto animate-fade-in-up"
        >
          Tambah Lowongan Baru
        </button>
        
        {/* Search Bar Lowongan */}
        <div className="relative w-full sm:w-1/2 md:w-1/3 animate-fade-in delay-200 order-last sm:order-none">
            <input
                type="text"
                placeholder="Cari lowongan..."
                className={`w-full py-2 pl-10 pr-4 rounded-full shadow-md focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                    ? 'bg-mid-blue-bg text-text-light border border-light-blue focus:ring-primary-blue'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-indigo-500'
                }`}
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
            />
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-light-blue' : 'text-gray-500'}`}>
                <MdSearch size={20} />
            </div>
        </div>

        {/* Tombol Logout & Toggle Tema */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-end">
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

      {/* Daftar Lowongan */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-text-dark dark:text-text-light mb-5 animate-slide-in-right">Daftar Lowongan Pekerjaan</h2>
      {loadingJobs ? (
        <div className="text-center p-8 text-text-light">Memuat lowongan...</div>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-text-medium animate-fade-in">Tidak ada lowongan pekerjaan yang diposting atau sesuai pencarian.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className={`rounded-lg shadow-xl p-6 border animate-zoom-in ${
              theme === 'dark'
                ? 'bg-mid-blue-bg border-light-blue hover:shadow-2xl'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}>
              <h3 className="text-xl sm:text-2xl font-semibold  text-text-dark dark:text-text-light mb-2">{job.title}</h3>
              <p className={`text-base sm:text-lg mb-2 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-600'}`}>{job.company} - {job.location}</p>
              <p className={`text-sm sm:text-base mb-4 line-clamp-3 ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'}`}>{job.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => openEditJobModal(job)}
                  className="bg-primary-blue hover:bg-light-blue text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Hapus
                </button>
                <button
                  onClick={() => fetchApplicationsForJob(job.id)}
                  className="bg-accent-purple hover:bg-light-blue text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Lihat Pelamar ({applications[job.id]?.length || '0'})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Lowongan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark-blue-bg bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-8 w-full max-w-lg md:max-w-2xl border animate-zoom-in ${
            theme === 'dark'
              ? 'bg-mid-blue-bg border-light-blue'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-xl sm:text-3xl font-bold text-primary-blue mb-6">
              {currentJob ? 'Edit Lowongan Pekerjaan' : 'Tambah Lowongan Pekerjaan Baru'}
            </h2>
            <form onSubmit={handleJobFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="jobTitle" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
                  Judul Pekerjaan:
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue ${
                    theme === 'dark'
                      ? 'border-light-blue bg-dark-blue-bg text-text-light'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="jobCompany" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
                  Perusahaan:
                </label>
                <input
                  type="text"
                  id="jobCompany"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue ${
                    theme === 'dark'
                      ? 'border-light-blue bg-dark-blue-bg text-text-light'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="jobLocation" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
                  Lokasi:
                </label>
                <input
                  type="text"
                  id="jobLocation"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue ${
                    theme === 'dark'
                      ? 'border-light-blue bg-dark-blue-bg text-text-light'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="jobDescription" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
                  Deskripsi Pekerjaan:
                </label>
                <textarea
                  id="jobDescription"
                  rows="6"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue resize-y ${
                    theme === 'dark'
                      ? 'border-light-blue bg-dark-blue-bg text-text-light'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeJobModal}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 text-sm sm:text-base"
                  disabled={formSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary-blue hover:bg-light-blue text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 text-sm sm:text-base"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Menyimpan...' : (currentJob ? 'Update Lowongan' : 'Tambah Lowongan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daftar Pelamar per Lowongan (jika ada yang dipilih) */}
      {selectedJobForApplicants && (
        <div className={`mt-12 rounded-lg shadow-xl p-6 border animate-fade-in-up ${
          theme === 'dark'
            ? 'bg-mid-blue-bg border-light-blue'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className={`text-2xl sm:text-3xl font-semibold mb-4 sm:mb-0 ${theme === 'dark' ? 'text-text-light' : 'text-gray-800'}`}>
              Pelamar untuk "{selectedJobForApplicants.title}"
            </h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Search Bar Pelamar */}
              <div className="relative flex-grow">
                  <input
                      type="text"
                      placeholder="Cari pelamar..."
                      className={`w-full py-2 pl-10 pr-4 rounded-full shadow-md focus:outline-none focus:ring-2 ${
                          theme === 'dark'
                          ? 'bg-dark-blue-bg text-text-light border border-light-blue focus:ring-primary-blue'
                          : 'bg-gray-100 text-gray-800 border border-gray-300 focus:ring-indigo-500'
                      }`}
                      value={applicantSearchTerm}
                      onChange={(e) => setApplicantSearchTerm(e.target.value)}
                  />
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-light-blue' : 'text-gray-500'}`}>
                      <MdSearch size={20} />
                  </div>
              </div>
              <button
                onClick={() => {setSelectedJobForApplicants(null); setApplicantSearchTerm('');}} // Reset search term on close
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm sm:text-base flex-shrink-0"
              >
                Tutup
              </button>
            </div>
          </div>

          {loadingApplications ? (
            <div className={`text-center p-4 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>Memuat pelamar...</div>
          ) : filteredApplications.length === 0 ? (
            <p className={`text-center ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'}`}>
              Tidak ada pelamar untuk lowongan ini atau tidak sesuai pencarian.
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