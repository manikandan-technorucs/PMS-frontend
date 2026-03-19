import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/lib/api';

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
    login: (token: string) => Promise<void>;
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
            console.log('[Auth] Fetching user profile...');
            const response = await api.get('/auth/me');
            console.log('[Auth] Profile fetched successfully:', response.data.email);
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
            console.log('[Auth] Found token, initializing session...');
            fetchProfile().finally(() => {
                console.log('[Auth] Session initialization complete.');
                setIsLoading(false);
            });
        } else {
            console.log('[Auth] No session found.');
            setIsLoading(false);
        }
    }, [token, fetchProfile]);

    const login = useCallback(async (newToken: string) => {
        console.log('[Auth] Login triggered. Storing token...');
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        // We let the useEffect or ProtectedRoutes handle the profile fetch
        // to avoid race conditions during navigation.
        console.log('[Auth] Token set. Navigation should proceed.');
    }, []);

    const logout = useCallback(() => {
        console.log('[Auth] Logging out...');
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
