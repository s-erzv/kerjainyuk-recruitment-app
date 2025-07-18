import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../contexts/ThemeContext';
import { MdLightMode, MdDarkMode, MdArrowBack } from 'react-icons/md';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState(null);

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [applicationError, setApplicationError] = useState(null);

  // === State baru untuk Modal Konfirmasi ===
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState('');

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setErrorJob('Lowongan tidak ditemukan.');
          } else {
            throw error;
          }
        }
        setJob(data);
      } catch (err) {
        console.error('Error fetching job details:', err.message);
        setErrorJob('Gagal memuat detail lowongan. Silakan coba lagi nanti.');
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setUploading(true);
    setApplicationError(null);
    setShowConfirmationModal(false); // Pastikan modal tertutup sebelum submit baru

    if (!cvFile) {
      setApplicationError('Mohon unggah file CV Anda.');
      setUploading(false);
      return;
    }

    try {
      const fileExt = cvFile.name.split('.').pop();
      // Menggunakan nama file yang lebih unik dengan UUID atau timestamp
      const fileId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const fileName = `${fileId}-${applicantName.replace(/\s+/g, '-')}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, cvFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl: cvUrl }, error: getUrlError } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(filePath);

      if (getUrlError) {
        throw getUrlError;
      }

      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          cv_url: cvUrl,
        });

      if (insertError) {
        throw insertError;
      }

      // === Tampilkan Modal Konfirmasi Setelah Berhasil ===
      setSubmittedCompanyName(job.company);
      setShowConfirmationModal(true);
      
      // Reset form fields
      setApplicantName('');
      setApplicantEmail('');
      setCvFile(null);
      // Hapus redirect otomatis di sini
      // setTimeout(() => navigate('/jobs'), 5000); 

    } catch (err) {
      console.error('Error submitting application:', err.message);
      setApplicationError(`Gagal mengirim lamaran: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
    navigate('/jobs'); // Arahkan kembali ke daftar lowongan setelah menutup modal
  };


  if (loadingJob) {
    return <div className={`text-center p-8 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>Memuat detail lowongan...</div>;
  }

  if (errorJob) {
    return <div className={`text-center p-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{errorJob}</div>;
  }

  if (!job) {
    return <div className={`text-center p-8 ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'}`}>Lowongan tidak ditemukan.</div>;
  }

  return (
    <div className={`container mx-auto p-4 max-w-4xl animate-fade-in ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-gray-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/jobs')}
          className={`p-2 rounded-full transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-mid-blue-bg text-text-light hover:bg-light-blue hover:text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          aria-label="Kembali"
        >
          <MdArrowBack size={24} />
        </button>
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
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-primary-blue mb-4 animate-fade-in-up">{job.title}</h1>
      <p className={`text-lg sm:text-xl ${theme === 'dark' ? 'text-light-blue' : 'text-indigo-600'} mb-4`}>{job.company} - {job.location}</p>

      <div className={`rounded-lg shadow-xl p-6 mb-8 border animate-slide-in-left ${
        theme === 'dark'
          ? 'bg-mid-blue-bg border-light-blue'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-text-light' : 'text-gray-800'}`}>Deskripsi Pekerjaan</h2>
        <p className={`text-sm sm:text-base whitespace-pre-line ${theme === 'dark' ? 'text-text-medium' : 'text-gray-700'}`}>{job.description}</p>
        <p className={`text-xs sm:text-sm mt-4 ${theme === 'dark' ? 'text-text-medium' : 'text-gray-500'}`}>Diposting pada: {new Date(job.created_at).toLocaleDateString()}</p>
      </div>

      <div className={`rounded-lg shadow-xl p-6 border animate-slide-in-right ${
        theme === 'dark'
          ? 'bg-mid-blue-bg border-light-blue'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-text-light' : 'text-gray-800'}`}>Ajukan Lamaran Anda</h2>
        {/* Pesan sukses/error kini dihandle oleh modal atau tetap di sini jika error */}
        {applicationError && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4 animate-fade-in" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {applicationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitApplication} className="space-y-4">
          <div>
            <label htmlFor="applicantName" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              Nama Lengkap:
            </label>
            <input
              type="text"
              id="applicantName"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue ${
                theme === 'dark'
                  ? 'border-light-blue bg-dark-blue-bg text-text-light'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="applicantEmail" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              Email:
            </label>
            <input
              type="email"
              id="applicantEmail"
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue ${
                theme === 'dark'
                  ? 'border-light-blue bg-dark-blue-bg text-text-light'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="cvFile" className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              Unggah CV Anda (PDF, DOCX, dll. Max 5MB):
            </label>
            <input
              type="file"
              id="cvFile"
              accept=".pdf,.doc,.docx"
              className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold transition-colors duration-200 ${
                theme === 'dark'
                  ? 'text-text-light file:bg-light-blue file:text-dark-blue-bg hover:file:bg-primary-blue hover:file:text-white'
                  : 'text-gray-700 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
              }`}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  setApplicationError('Ukuran file CV maksimal 5MB.');
                  setCvFile(null);
                  e.target.value = '';
                } else {
                  setCvFile(file);
                  setApplicationError(null);
                }
              }}
              required
            />
            {cvFile && <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-text-medium' : 'text-gray-500'}`}>File terpilih: {cvFile.name}</p>}
          </div>
          <button
            type="submit"
            className="bg-primary-blue hover:bg-light-blue text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-300 animate-zoom-in text-sm sm:text-base"
            disabled={uploading}
          >
            {uploading ? 'Mengirim Lamaran...' : 'Kirim Lamaran'}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-dark-blue-bg bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-8 w-full max-w-sm md:max-w-md border animate-zoom-in ${
            theme === 'dark'
              ? 'bg-mid-blue-bg border-light-blue'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-700'}`}>
              Lamaran Berhasil Dikirim!
            </h2>
            <p className={`text-base sm:text-lg text-center mb-6 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              Terima kasih, lamaran Anda untuk posisi di <strong>{submittedCompanyName}</strong> telah berhasil kami terima.
              <br /><br />
              Silakan cek email Anda secara berkala untuk informasi lebih lanjut mengenai status lamaran Anda.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseConfirmationModal}
                className="bg-primary-blue hover:bg-light-blue text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
              >
                Kembali ke Daftar Lowongan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetail;