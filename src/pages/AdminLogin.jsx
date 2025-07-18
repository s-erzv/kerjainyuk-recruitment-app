import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        navigate('/admin/dashboard');
      } else {
        setError('Login gagal. Periksa email dan password Anda.');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-blue-bg">
      <div className="bg-mid-blue-bg p-8 rounded-lg shadow-xl w-full max-w-md border border-light-blue animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-primary-blue mb-6">Login Admin</h2>
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-400 text-center mb-4 animate-fade-in">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-text-light text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border border-light-blue bg-dark-blue-bg rounded w-full py-2 px-3 text-text-light leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-text-light text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border border-light-blue bg-dark-blue-bg rounded w-full py-2 px-3 text-text-light mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-primary-blue"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary-blue hover:bg-light-blue text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors duration-300 animate-zoom-in"
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;