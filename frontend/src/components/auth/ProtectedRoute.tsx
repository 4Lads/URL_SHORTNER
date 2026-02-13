import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingOverlay } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * Protected Route wrapper component
 * Redirects to login if user is not authenticated
 * Shows loading overlay while checking auth
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingOverlay message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};
