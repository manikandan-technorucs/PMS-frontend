import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axiosInstance';

/**
 * AuthContext — Managed enterprise session state.
 * Handles JWT storage, profile hydration, and role-based access.
 */

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
    login: (token: string, profile?: AuthUser) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'pms_token';

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
            setToken(null);
            setUser(null);
        }
    }, []);

    // On mount or token change: validate session
    useEffect(() => {
        if (token) {
            fetchProfile().finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [token, fetchProfile]);

    const login = useCallback(async (newToken: string, profile?: AuthUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        // Hydrate user immediately if profile is provided (avoids loading flash)
        if (profile) {
            setUser(profile);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
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
