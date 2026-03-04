import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router';
import { Header } from '@/shared/components/layout/Header/Header';
import { Sidebar } from '@/shared/components/layout/Sidebar/Sidebar';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAFC]">
          <Header />
          <Sidebar />
          <AppRouter />
        </div>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;