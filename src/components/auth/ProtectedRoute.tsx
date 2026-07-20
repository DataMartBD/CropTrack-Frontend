import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // AuthContext is the single source of truth: it seeds itself from
  // localStorage and only keeps a token whose exp is still in the future.
  // Reading localStorage here as a fallback used to let an expired token keep
  // rendering protected pages — and write it back into the context.
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
