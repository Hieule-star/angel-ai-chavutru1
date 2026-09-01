import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Require a verified email address (default: false) */
  requireVerifiedEmail?: boolean;
}

export function ProtectedRoute({ children, requireVerifiedEmail = false }: ProtectedRouteProps) {
  const { isAuthenticated, session } = useUserStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireVerifiedEmail && !session?.user?.email_confirmed_at) {
    return <Navigate to="/verify-email" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
