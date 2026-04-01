import React from 'react';
import { PrimeReactProvider } from 'primereact/api';

export function PrimeUIProvider({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider value={{
            ripple: true,
        }}>
            {children}
        </PrimeReactProvider>
    );
}
