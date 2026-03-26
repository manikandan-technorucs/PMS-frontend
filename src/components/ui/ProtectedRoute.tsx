import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Role names that are allowed to access this route */
  allowedRoles: string[];
  /** Where to redirect on access denial. Defaults to /unauthorized */
  redirectTo?: string;
}

/**
 * ProtectedRoute — wraps a route and redirects to /unauthorized
 * if the current user's role is not in allowedRoles.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/unauthorized',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const roleName = user?.role?.name ?? '';

  if (!allowedRoles.includes(roleName)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
