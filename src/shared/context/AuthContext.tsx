import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, usersService } from '@/features/users/services/users.api';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const userData = await usersService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If profile fetch fails, we might want to logout or just handle it
        }
    };

    useEffect(() => {
        // Check local storage for an existing token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchProfile().finally(() => setIsLoading(false));
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // Optionally redirect to a login screen
        // window.location.href = '/login';
    };

    const refreshProfile = async () => {
        await fetchProfile();
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
