import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../contexts/ThemeContext';
import { MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md';

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { theme, toggleTheme } = useTheme();

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
        setError('Gagal memuat lowongan. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
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

  if (loading) {
    return <div className={`text-center p-8 ${theme === 'dark' ? 'text-text-light' : 'text-gray-700'}`}>Memuat lowongan...</div>;
  }

  if (error) {
    return <div className={`text-center p-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</div>;
  }

  return (
    <div className={`container mx-auto p-4 max-w-4xl mt-10 animate-fade-in ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-gray-100'}`}>
      {/* Container header: flex-row di semua ukuran layar */}
      <div className="flex justify-between items-center mb-8"> {/* Hapus flex-col dan sm:flex-row */}
        {/* H1: Tetap rata kiri, akan menyesuaikan lebar */}
        <h1 className="text-3xl sm:text-4xl font-bold text-left text-primary-blue animate-fade-in-up flex-grow"> {/* Tambah flex-grow */}
          Temukan Pekerjaan Impianmu
        </h1>
        
        {/* Tombol Tema: Sekarang akan sejajar karena parent-nya flex-row */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors duration-300 flex-shrink-0 ml-4 ${ // Tambah ml-4 untuk jarak
            theme === 'dark'
              ? 'bg-mid-blue-bg text-text-light hover:bg-light-blue hover:text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 w-full mx-auto animate-fade-in delay-200">
        <input
          type="text"
          placeholder="Cari lowongan (judul, perusahaan, lokasi, deskripsi...)"
          className={`w-full py-3 pl-12 pr-4 rounded-full shadow-lg focus:outline-none focus:ring-2 ${
            theme === 'dark'
              ? 'bg-mid-blue-bg text-text-light border border-light-blue focus:ring-primary-blue'
              : 'bg-white text-gray-800 border border-gray-300 focus:ring-indigo-500'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-light-blue' : 'text-gray-500'}`}>
          <MdSearch size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.length === 0 ? (
          <p className={`col-span-full text-center ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'} animate-fade-in`}>
            Tidak ada lowongan yang sesuai dengan pencarian Anda.
          </p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className={`rounded-lg shadow-xl p-6 border transition-shadow duration-300 animate-slide-in-left ${
              theme === 'dark'
                ? 'bg-mid-blue-bg border-light-blue hover:shadow-2xl'
                : 'bg-white border-gray-200 hover:shadow-lg'
            }`}>
              <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${theme === 'dark' ? 'text-text-light' : 'text-gray-800'}`}>{job.title}</h2>
              <p className={`text-base sm:text-lg mb-2 ${theme === 'dark' ? 'text-primary-blue' : 'text-indigo-600'}`}>{job.company} - {job.location}</p>
              <p className={`text-sm sm:text-base mb-4 line-clamp-3 ${theme === 'dark' ? 'text-text-medium' : 'text-gray-600'}`}>{job.description}</p>
              <Link to={`/job/${job.id}`} className="inline-block bg-primary-blue hover:bg-light-blue text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 animate-zoom-in text-sm sm:text-base">
                Lihat Detail
              </Link>
            </div>
          ))
        )}
      </div>
      <footer className="mt-12 text-center text-text-medium text-sm">
        <p>&copy; {new Date().getFullYear()} KERJAINYUK.</p>
      </footer>
    </div>
  );
}

export default Home;