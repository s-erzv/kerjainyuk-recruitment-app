import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Tetap gunakan Link
import { useTheme } from '../contexts/ThemeContext';
import { MdSearch, MdOutlineRateReview, MdPeople, MdSecurity, MdSpeed, MdConnectWithoutContact, MdWork, MdCheckCircle, MdEmojiEmotions, MdLightMode, MdDarkMode } from 'react-icons/md';
import { supabase } from '../supabaseClient';

// --- Reusable Intersection Observer Hook ---
const useInView = (options) => {
  const [entry, setEntry] = useState(null);
  const observerRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([ent]) => {
      setEntry(ent);
    }, options);

    observerRef.current = observer;

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return [elementRef, entry];
};

// Komponen Card Fitur
const FeatureCard = ({ icon, title, description, theme }) => (
  <div
    className={`flex flex-col items-center p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300 border
                ${theme === 'dark' ? 'bg-mid-blue-bg border-light-blue' : 'bg-light-bg-card border-light-border-gray'}`}
  >
    <div className="text-primary-blue text-5xl mb-4">{icon}</div>
    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-light-text-primary'}`}>{title}</h3>
    <p className={`text-sm ${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'}`}>{description}</p>
  </div>
);

// Komponen Card Statistik
const StatCard = ({ number, label, theme }) => (
  <div
    className={`p-6 rounded-lg shadow-xl text-center border transform hover:scale-105 transition-transform duration-300
                ${theme === 'dark' ? 'bg-mid-blue-bg border-primary-blue' : 'bg-light-accent-blue border-primary-blue'}`}
  >
    <p className="text-5xl font-extrabold text-white mb-2">{number}</p>
    <p className={`text-xl ${theme === 'dark' ? 'text-text-light' : 'text-white'}`}>{label}</p>
  </div>
);


function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  // State untuk data lowongan
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk form aplikasi CV (BARU DIPINDAHKAN KE SINI)
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [applicationError, setApplicationError] = useState(null);

  // State untuk Modal Form CV (BARU)
  const [showCvFormModal, setShowCvFormModal] = useState(false);
  // State untuk Modal Konfirmasi Sukses Upload CV (BARU)
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  // Intersection Observer Refs
  const [heroRef, heroEntry] = useInView({ threshold: 0.5 });
  const [manfaatRef, manfaatEntry] = useInView({ threshold: 0.2 });
  const [featuresRef, featuresEntry] = useInView({ threshold: 0.2 });
  const [jobsRef, jobsEntry] = useInView({ threshold: 0.1 });
  const [ctaRef, ctaEntry] = useInView({ threshold: 0.5 });


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err.message);
        setErrorJobs('Gagal memuat lowongan. Silakan coba lagi nanti.');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk smooth scroll
  const scrollToJobListings = (e) => {
    e.preventDefault();
    const jobListingsSection = document.getElementById('job-listings');
    if (jobListingsSection) {
      jobListingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fungsi untuk submit aplikasi CV
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setUploading(true);
    setApplicationError(null);
    setShowSuccessModal(false); // Pastikan modal sukses tertutup saat submit baru

    if (!cvFile) {
      setApplicationError('Mohon unggah file CV Anda.');
      setUploading(false);
      return;
    }

    try {
      const fileExt = cvFile.name.split('.').pop();
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

      // Insert ke tabel applications (TANPA job_id jika sudah dihapus di Supabase)
      // Jika Anda tidak menghapus job_id, Anda bisa set job_id ke null atau kolom dummy jika perlu.
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          cv_url: cvUrl,
          // job_id: null, // Tambahkan ini jika job_id masih ada tapi ingin diisi null
        });

      if (insertError) {
        throw insertError;
      }

      setShowCvFormModal(false); // Tutup modal form
      setShowSuccessModal(true); // Tampilkan modal sukses
      
      // Reset form fields
      setApplicantName('');
      setApplicantEmail('');
      setCvFile(null);

    } catch (err) {
      console.error('Error submitting application:', err.message);
      setApplicationError(`Gagal mengirim lamaran: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-light-bg-primary'} text-center transition-colors duration-300 font-sans`}>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-hero-gradient text-white
                    ${heroEntry?.isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}
      >
        {/* Tombol Tema di Hero Section */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-mid-blue-bg text-text-light hover:bg-light-blue hover:text-white'
                : 'bg-light-bg-card text-light-text-primary hover:bg-light-border-gray'
            }`}
            aria-label="Toggle Tema"
          >
            {theme === 'dark' ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </button>
        </div>

        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 
                        ${heroEntry?.isIntersecting ? 'animate-fade-in-up' : 'opacity-0 translate-y-20'}`}>
            Mulai Kariermu Bersama <span className="text-primary-blue drop-shadow-lg">KERJAINYUK</span>
          </h1>
          <p className={`text-xl sm:text-2xl text-text-light mb-8 
                       ${heroEntry?.isIntersecting ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
            Temukan lowongan pekerjaan impian Anda dan kirim lamaran dengan mudah.
          </p>
          
          {/* Tombol "Upload CV/Lamaran" yang akan membuka modal */}
          <button
            onClick={() => { setShowCvFormModal(true); setApplicationError(null); }} // Buka modal form CV
            className={`inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl 
                       ${heroEntry?.isIntersecting ? 'animate-fade-in-up delay-600' : 'opacity-0 translate-y-20'}`}
          >
            Upload CV/Lamaran
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      </section>

      {/* Section Manfaat */}
      <section 
        ref={manfaatRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-light-bg-primary'} ${manfaatEntry?.isIntersecting ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-blue mb-12 
                        ${manfaatEntry?.isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}>
            Manfaat KERJAINYUK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard number="Mudah" label="Upload CV/Lamaran" theme={theme} />
            <StatCard number="Cepat" label="Proses Peninjauan" theme={theme} />
            <StatCard number="Akurat" label="Rekomendasi Pekerjaan" theme={theme} />
          </div>
        </div>
      </section>

      {/* Section Fitur/Why Choose Us */}
      {/* <section 
        ref={featuresRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${theme === 'dark' ? 'bg-mid-blue-bg' : 'bg-light-bg-card'} ${featuresEntry?.isIntersecting ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-blue mb-12 
                        ${featuresEntry?.isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}>
            Kenapa Memilih Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<MdSearch />} title="Pencarian Mudah" description="Temukan lowongan yang sesuai dengan keahlian dan minat Anda dengan mudah." theme={theme} /> 
            <FeatureCard icon={<MdOutlineRateReview />} title="Proses Cepat" description="Kirim lamaran Anda dalam hitungan menit dan dapatkan respons lebih cepat." theme={theme} />
            <FeatureCard icon={<MdPeople />} title="Jaringan Luas" description="Akses ke berbagai perusahaan dan peluang kerja di berbagai industri." theme={theme} />
            <FeatureCard icon={<MdSecurity />} title="Keamanan Data" description="Data pribadi dan CV Anda aman bersama kami dengan enkripsi terbaik." theme={theme} />
            <FeatureCard icon={<MdSpeed />} title="Tingkat Responsivitas" description="Platform kami dirancang untuk kinerja optimal di semua perangkat." theme={theme} />
            <FeatureCard icon={<MdConnectWithoutContact />} title="Terhubung Langsung" description="Kami membantu Anda terhubung langsung dengan perekrut." theme={theme} />
          </div>
        </div>
      </section> */}

      {/* Section Call to Action */}
      <section 
        ref={ctaRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-hero-gradient text-white ${ctaEntry?.isIntersecting ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6 
                        ${ctaEntry?.isIntersecting ? 'animate-fade-in-up' : 'opacity-0 translate-y-20'}`}>
            Siap Menemukan Pekerjaan Impian Anda?
          </h2>
          {/* Tombol di CTA section akan tetap scroll ke daftar lowongan */}
          {/* <a
            href="#job-listings"
            onClick={scrollToJobListings}
            className={`inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl 
                       ${ctaEntry?.isIntersecting ? 'animate-fade-in-up delay-400' : 'opacity-0 translate-y-20'}`}
          >
            Lihat Semua Lowongan
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </a> */}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-light-bg-primary'} text-text-medium text-sm`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className={`${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'}`}>&copy; {new Date().getFullYear()} KERJAINYUK</p>
          <div className="flex space-x-4">
            <Link to="/admin" className={`hover:text-primary-blue transition-colors duration-200 ${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'}`}>Admin Login</Link>
          </div>
        </div>
      </footer>

      {/* Modal Form Unggah CV */}
      {showCvFormModal && (
        <div className="fixed inset-0 bg-dark-blue-bg bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-8 w-full max-w-sm md:max-w-md border animate-zoom-in ${
            theme === 'dark'
              ? 'bg-mid-blue-bg border-light-blue'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-700'}`}>
              Unggah CV Anda
            </h2>
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
                {uploading ? 'Mengirim CV...' : 'Kirim CV'}
              </button>
            </form>

            <div className="flex justify-end mt-4">
                <button
                    onClick={() => { setShowCvFormModal(false); setApplicationError(null); }} // Tombol "Batal" untuk modal form
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
                >
                    Batal
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Sukses Setelah Submit Berhasil */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-dark-blue-bg bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-8 w-full max-w-sm md:max-w-md border animate-zoom-in ${
            theme === 'dark'
              ? 'bg-mid-blue-bg border-light-blue'
              : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-4 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-700'}`}>
              CV Berhasil Dikirim!
            </h2>
            <p className={`text-base sm:text-lg text-center mb-6 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>
              Terima kasih, CV Anda telah berhasil kami terima.
              <br /><br />
              Silakan cek email Anda secara berkala untuk informasi lebih lanjut jika ada kecocokan peluang.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleCloseSuccessModal}
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

export default LandingPage;