import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/admin/login', { replace: true });
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes to handle logout/session expiry
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/admin/login', { replace: true });
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="text-center p-8">Memuat halaman admin...</div>;
  }

  return children;
}

export default ProtectedRoute;