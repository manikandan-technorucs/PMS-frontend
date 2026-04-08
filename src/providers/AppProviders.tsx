import React from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { AuthProvider } from '@/auth/AuthProvider';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Prevent hammering the API on every tab switch in production
            refetchOnWindowFocus: false,
            // Retry once with a 1s delay — avoids pile-up on transient failures
            retry: 1,
            retryDelay: 1_000,
            // Data stays fresh for 60s — dramatically reduces redundant requests
            staleTime: 60_000,
            // Keep unused query results cached for 5 minutes
            gcTime: 5 * 60 * 1_000,
        },
        mutations: {
            retry: 0,
        },
    },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider value={{ ripple: true }}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </PrimeReactProvider>
    );
}
