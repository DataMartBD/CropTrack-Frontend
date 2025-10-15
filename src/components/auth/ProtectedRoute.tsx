import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { isAuthenticated, setToken } = useAuth();

  useEffect(() => {
    // Check for token in localStorage on component mount
    const token = localStorage.getItem('jwtToken');
    if (token && !isAuthenticated) {
      setToken(token);
    }
  }, [isAuthenticated, setToken]);

  // Check both the auth context and localStorage
  const token = localStorage.getItem('jwtToken');
  if (!isAuthenticated && !token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}