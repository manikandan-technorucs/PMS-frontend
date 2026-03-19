import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import { Header } from '@/shared/components/layout/Header/Header';
import { Sidebar } from '@/shared/components/layout/Sidebar/Sidebar';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary/ErrorBoundary';
import { useApiErrorToast } from '@/shared/hooks/useApiErrorToast';
import { useAuth } from '@/shared/context/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { MSCallbackPage } from '@/features/auth/MSCallbackPage';

/** Full-screen spinner displayed while JWT is being validated on mount. */
function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium tracking-wide">Loading TechnoRUCS PMS…</span>
      </div>
    </div>
  );
}

/**
 * The authenticated app shell — Header + Sidebar + routed content.
 */
function AppShell() {
  useApiErrorToast();
  return (
    <div className="min-h-screen bg-theme-page">
      <Header />
      <Sidebar />
      <div className="pt-[64px] min-h-screen page-layout-wrapper">
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute — reads auth state and either:
 * - Shows a full-screen loader while checking
 * - Redirects to /login if unauthenticated
 * - Renders children if authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <AppLoader />;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/ms-callback" element={<MSCallbackPage />} />
          <Route path="/redirect" element={<MSCallbackPage />} />

          {/* Protected app routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
