import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import { Header } from '@/shared/components/layout/Header/Header';
import { Sidebar } from '@/shared/components/layout/Sidebar/Sidebar';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary/ErrorBoundary';
import { useApiErrorToast } from '@/shared/hooks/useApiErrorToast';

/** Inner shell that has access to context providers (Toast, Auth, etc.) */
function AppShell() {
  useApiErrorToast();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Sidebar />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

