import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
const FeatureCard = ({ icon, title, description, theme }) => ( // Terima theme prop
  <div
    className={`flex flex-col items-center p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300 border
                ${theme === 'dark' ? 'bg-mid-blue-bg border-light-blue' : 'bg-light-bg-card border-light-border-gray'}`}
  >
    <div className="text-primary-blue text-5xl mb-4">{icon}</div>
    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-light-text-primary'}`}>{title}</h3>
    <p className={`text-sm ${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'}`}>{description}</p> {/* Sesuaikan ukuran dan warna teks */}
  </div>
);

// Komponen Card Statistik
const StatCard = ({ number, label, theme }) => ( // Terima theme prop
  <div
    className={`p-6 rounded-lg shadow-xl text-center border transform hover:scale-105 transition-transform duration-300
                ${theme === 'dark' ? 'bg-mid-blue-bg border-primary-blue' : 'bg-light-accent-blue border-primary-blue'}`} // Gunakan light-accent-blue
  >
    <p className="text-5xl font-extrabold text-white mb-2">{number}</p>
    <p className={`text-xl ${theme === 'dark' ? 'text-text-light' : 'text-white'}`}>{label}</p> {/* Label putih di light mode stat card */}
  </div>
);


function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
                : 'bg-light-bg-card text-light-text-primary hover:bg-light-border-gray' // Warna light mode untuk tombol tema
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
          <a
            href="#job-listings"
            onClick={scrollToJobListings} // Panggil fungsi smooth scroll
            className={`inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl 
                       ${heroEntry?.isIntersecting ? 'animate-fade-in-up delay-600' : 'opacity-0 translate-y-20'}`}
          >
            Lihat Lowongan Sekarang
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </a>
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
            <StatCard number="Mudah" label="Upload CV/Lamaran" theme={theme} /> {/* Pass theme prop */}
            <StatCard number="Cepat" label="Proses Peninjauan" theme={theme} />
            <StatCard number="Akurat" label="Rekomendasi Pekerjaan" theme={theme} />
          </div>
        </div>
      </section>

      {/* Section Fitur/Why Choose Us */}
      <section 
        ref={featuresRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${theme === 'dark' ? 'bg-mid-blue-bg' : 'bg-light-bg-card'} ${featuresEntry?.isIntersecting ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-blue mb-12 
                        ${featuresEntry?.isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}>
            Kenapa Memilih Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<MdSearch />} title="Pencarian Mudah" description="Temukan lowongan yang sesuai dengan keahlian dan minat Anda dengan mudah." theme={theme} /> {/* Pass theme prop */}
            <FeatureCard icon={<MdOutlineRateReview />} title="Proses Cepat" description="Kirim lamaran Anda dalam hitungan menit dan dapatkan respons lebih cepat." theme={theme} />
            <FeatureCard icon={<MdPeople />} title="Jaringan Luas" description="Akses ke berbagai perusahaan dan peluang kerja di berbagai industri." theme={theme} />
            <FeatureCard icon={<MdSecurity />} title="Keamanan Data" description="Data pribadi dan CV Anda aman bersama kami dengan enkripsi terbaik." theme={theme} />
            <FeatureCard icon={<MdSpeed />} title="Tingkat Responsivitas" description="Platform kami dirancang untuk kinerja optimal di semua perangkat." theme={theme} />
            <FeatureCard icon={<MdConnectWithoutContact />} title="Terhubung Langsung" description="Kami membantu Anda terhubung langsung dengan perekrut." theme={theme} />
          </div>
        </div>
      </section>
      
      {/* --- BAGIAN DARI HOME.JSX YANG DIGABUNGKAN --- */}
      <section id="job-listings" 
        ref={jobsRef}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-light-bg-primary'} ${jobsEntry?.isIntersecting ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="container mx-auto p-4 max-w-4xl">
            {/* Header dengan judul dan tombol tema (dipindahkan ke Hero Section) */}
            <h1 className={`text-3xl sm:text-4xl font-bold text-left text-primary-blue mb-8 ${jobsEntry?.isIntersecting ? 'animate-fade-in-up' : 'opacity-0 translate-y-20'}`}>
                Lowongan Terbaru
            </h1>
            
            {/* Search Bar */}
            <div className={`relative mb-8 w-full mx-auto ${jobsEntry?.isIntersecting ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
                <input
                    type="text"
                    placeholder="Cari lowongan (judul, perusahaan, lokasi, deskripsi...)"
                    className={`w-full py-3 pl-12 pr-4 rounded-full shadow-lg focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                        ? 'bg-mid-blue-bg text-text-light border border-light-blue focus:ring-primary-blue'
                        : 'bg-light-bg-card text-light-text-primary border-light-border-gray focus:ring-light-accent-blue' // Warna light mode untuk search bar
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-light-blue' : 'text-gray-500'}`}>
                    <MdSearch size={24} />
                </div>
            </div>

            {loadingJobs ? (
                <div className={`text-center p-8 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>Memuat lowongan...</div>
            ) : errorJobs ? (
                <div className={`text-center p-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{errorJobs}</div>
            ) : filteredJobs.length === 0 ? (
                <p className={`col-span-full text-center ${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'} animate-fade-in`}>
                    Tidak ada lowongan yang sesuai dengan pencarian Anda.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => (
                    <div key={job.id} className={`rounded-lg shadow-xl p-6 border transition-shadow duration-300 ${jobsEntry?.isIntersecting ? 'animate-slide-in-left' : 'opacity-0 translate-x-20'} 
                        ${theme === 'dark'
                        ? 'bg-mid-blue-bg border-light-blue hover:shadow-2xl'
                        : 'bg-light-bg-card border-light-border-gray hover:shadow-lg' // Warna light mode untuk job card
                    }`}>
                        <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-light-text-primary'}`}>{job.title}</h2>
                        <p className={`text-base sm:text-lg mb-2 ${theme === 'dark' ? 'text-primary-blue' : 'text-light-accent-blue'}`}>{job.company} - {job.location}</p> {/* Primary-blue di dark, accent-blue di light */}
                        <p className={`text-sm sm:text-base mb-4 line-clamp-3 ${theme === 'dark' ? 'text-text-medium' : 'text-light-text-secondary'}`}>{job.description}</p>
                        <Link to={`/job/${job.id}`} className="inline-block bg-primary-blue hover:bg-light-blue text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 animate-zoom-in text-sm sm:text-base">
                        Lihat Detail
                        </Link>
                    </div>
                    ))}
                </div>
            )}
        </div>
      </section>
      {/* --- AKHIR BAGIAN DARI HOME.JSX YANG DIGABUNGKAN --- */}

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
          <a
            href="#job-listings"
            onClick={scrollToJobListings} // Panggil fungsi smooth scroll
            className={`inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl 
                       ${ctaEntry?.isIntersecting ? 'animate-fade-in-up delay-400' : 'opacity-0 translate-y-20'}`}
          >
            Lihat Semua Lowongan
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </a>
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
    </div>
  );
}

export default LandingPage;