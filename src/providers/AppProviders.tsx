import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimeUIProvider } from './prime';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';

// Configure the query client with sensible defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true, // More responsive dashboard
            retry: 1,
            staleTime: 5000, // 5 seconds (more aggressive refresh)
        },
    },
});

import { AuthProvider } from '@/auth/AuthProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeUIProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </PrimeUIProvider>
    );
}
