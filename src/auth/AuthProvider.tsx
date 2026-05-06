import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { AUTH_TOKEN_KEY as TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY as REFRESH_TOKEN_KEY } from '@/constants/constants';

export interface AuthUser {
    id: number;
    public_id: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    role?: { id: number; name: string };
    is_external: boolean;
    is_synced: boolean;
}

interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    isLoading: boolean;
    login: (token: string, refreshToken: string, profile?: AuthUser) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (err) {
            console.warn('[Auth] Profile fetch failed. Clearing session.', err);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            setToken(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchProfile().finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [token, fetchProfile]);

    const login = useCallback(async (newToken: string, newRefreshToken: string, profile?: AuthUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        setToken(newToken);
        if (profile) {
            setUser(profile);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    }, []);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
