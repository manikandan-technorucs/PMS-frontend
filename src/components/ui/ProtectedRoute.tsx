import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  
  allowedRoles: string[];
  
  redirectTo?: string;
}

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
