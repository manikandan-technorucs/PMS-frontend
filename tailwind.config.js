/**
 * tailwind.config.js — Tailwind v4 Compatibility Shim
 *
 * In Tailwind v4 (used via @tailwindcss/vite), the design system is configured
 * through the @theme block in tailwind.css. This file is kept for:
 *   1. IDE autocomplete (some editors still read this for class suggestions)
 *   2. Backward compatibility with any tooling expecting a config file
 *
 * The CANONICAL design tokens are in: src/styles/tailwind.css @theme { ... }
 * Changes to colors/fonts MUST be made there, not here.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                // Must match --font-sans in tailwind.css @theme and fonts.css
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'ui-monospace', 'monospace'],
            },
            colors: {
                'brand-teal': {
                    50:  '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                'brand-lime': {
                    50:  '#f7fee7',
                    100: '#ecfccb',
                    200: '#d9f99d',
                    300: '#bef264',
                    400: '#a3e635',
                    500: '#84cc16',
                    600: '#65a30d',
                    700: '#4d7c0f',
                },
            },
            borderRadius: {
                'card': '14px',
                'sm':   '6px',
                'md':   '10px',
                'lg':   '14px',
                'xl':   '20px',
            },
            boxShadow: {
                'card':       '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
                'card-hover': '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
                'elevated':   '0 10px 40px rgba(0,0,0,0.10)',
                'modal':      '0 20px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.10)',
            },
        },
    },
    plugins: [],
};
