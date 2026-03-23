import React from 'react';
import { PrimeReactProvider } from 'primereact/api';

/**
 * Global PrimeReact configuration.
 * Centralizing this here allows us to configure strict unstyled mode 
 * or pass-through variables across the entire application to map Figma styles.
 */
export function PrimeUIProvider({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider value={{
            ripple: true,
            // Insert global pass-through configuration here if utilizing unstyled mode
            // pt: { ... } 
        }}>
            {children}
        </PrimeReactProvider>
    );
}
