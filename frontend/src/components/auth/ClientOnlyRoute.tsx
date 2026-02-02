import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ClientOnlyRouteProps {
  children: JSX.Element;
}

/**
 * Wraps client-facing routes (Home, Cars, Booking).
 * Admins are redirected to /admin - they should only access the admin dashboard.
 */
export function ClientOnlyRoute({ children }: ClientOnlyRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
