// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner loading={loading} />;
  }

  // Jika tidak loading dan tidak ada user, redirect ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user ada, tampilkan halaman (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;