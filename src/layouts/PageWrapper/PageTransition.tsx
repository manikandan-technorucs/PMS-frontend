import React from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    const location = useLocation();

    return (
        <div
            key={location.pathname}
            className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-forwards ${className}`}
        >
            {children}
        </div>
    );
}
