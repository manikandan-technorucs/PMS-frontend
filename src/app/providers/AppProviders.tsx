import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimeUIProvider } from '@/shared/lib/prime';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import { ToastProvider } from '@/shared/context/ToastContext';

// Configure the query client with sensible defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes cache
        },
    },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeUIProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </PrimeUIProvider>
    );
}
