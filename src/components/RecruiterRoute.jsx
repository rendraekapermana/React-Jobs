// src/components/RecruiterRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const RecruiterRoute = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <Spinner loading={loading} />;
  }

  // 1. Cek jika user login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cek jika user adalah recruiter
  if (userProfile?.role !== 'recruiter') {
    toast.error('Anda tidak punya akses ke halaman ini.');
    return <Navigate to="/" replace />;
  }

  // Jika lolos semua, tampilkan halaman
  return <Outlet />;
};

export default RecruiterRoute;