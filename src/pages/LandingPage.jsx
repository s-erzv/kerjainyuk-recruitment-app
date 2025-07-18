import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext'; // Pastikan path benar
import { MdSearch, MdOutlineRateReview, MdPeople, MdSecurity, MdSpeed, MdConnectWithoutContact, MdWork, MdCheckCircle, MdEmojiEmotions } from 'react-icons/md';

// Komponen Card Fitur - Menggunakan warna dan animasi kustom
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
  <div
    className="flex flex-col items-center p-6 bg-mid-blue-bg rounded-lg shadow-xl text-center transform hover:scale-105 transition-transform duration-300 animate-fade-in-up border border-light-blue"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-primary-blue text-5xl mb-4">{icon}</div> {/* Ganti 'blue' dengan 'primary-blue' */}
    <h3 className="text-xl font-semibold text-text-light mb-2">{title}</h3>
    <p className="text-text-medium">{description}</p>
  </div>
);

// Komponen Card Statistik - Menggunakan warna dan animasi kustom
const StatCard = ({ number, label, delay = 0 }) => (
  <div
    className="bg-mid-blue-bg p-6 rounded-lg shadow-xl text-center border border-primary-blue transform hover:scale-105 transition-transform duration-300 animate-zoom-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <p className="text-5xl font-extrabold text-white mb-2">{number}</p>
    <p className="text-xl text-text-light">{label}</p>
  </div>
);

// Komponen Card Testimonial - Menggunakan warna dan animasi kustom
const TestimonialCard = ({ quote, name, status, delay = 0 }) => (
  <div
    className="bg-mid-blue-bg p-6 rounded-lg shadow-xl flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 animate-fade-in border border-light-blue"
    style={{ animationDelay: `${delay}ms` }}
  >
    <p className="text-text-medium italic mb-4">"{quote}"</p>
    <p className="font-semibold text-primary-blue">{name}</p> {/* Ganti 'blue' dengan 'primary-blue' */}
    <p className="text-sm text-text-light">{status}</p>
  </div>
);

function LandingPage() {
  const { theme } = useTheme(); // Menggunakan theme dari context

  return (
    // Pastikan body memiliki kelas dark-blue-bg secara global dari index.css atau bisa di-override di sini
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-blue-bg' : 'bg-gray-100'} text-center transition-colors duration-300 font-sans`}>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-hero-gradient text-white">
        {/* Latar belakang pattern, disesuaikan agar terlihat di dark mode */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Mulai Kariermu Bersama <span className="text-primary-blue drop-shadow-lg">KERJAINYUK</span> {/* Ganti 'blue' dengan 'primary-blue' */}
          </h1>
          <p className="text-xl sm:text-2xl text-text-light mb-8 animate-fade-in delay-300">
            Temukan lowongan pekerjaan impian Anda dan kirim lamaran dengan mudah.
          </p>
          <Link
            to="/jobs" // Arahkan ke halaman daftar lowongan (Home.jsx)
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl animate-fade-in-up delay-600"
          >
            Lihat Lowongan Sekarang
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </Link>
        </div>
      </section>

      {/* Section Manfaat */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-blue-bg text-text-light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-blue mb-12 animate-fade-in"> {/* Ganti 'blue' dengan 'primary-blue' */}
            Manfaat KERJAINYUK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard number="Mudah" label="Upload CV/Lamaran" delay={100}/>
            <StatCard number="Cepat" label="Proses Peninjauan" delay={200}/>
            <StatCard number="Akurat" label="Rekomendasi Pekerjaan" delay={300}/>
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-hero-gradient text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Siap Menemukan Pekerjaan Impian Anda?
          </h2>
          <Link
            to="/jobs" // Arahkan ke halaman daftar lowongan (Home.jsx)
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-blue text-white font-bold rounded-full shadow-lg
                       hover:bg-light-blue transform hover:scale-105 transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-primary-blue focus:ring-opacity-50 text-xl animate-fade-in-up delay-400"
          >
            Lihat Semua Lowongan
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-dark-blue-bg text-text-medium text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>&copy; {new Date().getFullYear()} KERJAINYUK</p>
          <div className="flex space-x-4">
            <Link to="#" className="hover:text-primary-blue transition-colors duration-200">Tentang Kami</Link> {/* Ganti 'blue' dengan 'primary-blue' */}
            <Link to="#" className="hover:text-primary-blue transition-colors duration-200">Bantuan</Link>
            <Link to="#" className="hover:text-primary-blue transition-colors duration-200">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;