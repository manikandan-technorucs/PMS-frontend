import { createContext, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme: Theme = 'light';

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        localStorage.setItem('app-theme', 'light');
    }, []);

    const toggleTheme = () => {
        // Dark mode temporarily disabled
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
