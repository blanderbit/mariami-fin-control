import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest, logoutRequest } from '../api/auth';
import { getActiveStorageType, setTokenStorage, TokenStorage } from '../api/http';

interface User {
    id: number;
    name?: string | null;
    last_name?: string | null;
    email: string;
    is_admin?: boolean;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: (suppressRedirect?: boolean) => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check if user is already logged in on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string, remember: boolean = true) => {
        setLoading(true);
        setError(null);

        try {
            const storage: TokenStorage = remember ? 'local' : 'session';
            setTokenStorage(storage);
            const profile = await loginRequest(email, password, storage);
            if (!profile) throw new Error('Failed to fetch profile');

            const userData: User = {
                id: profile.id,
                name: profile.name,
                last_name: profile.last_name,
                email: profile.email,
                is_admin: profile.is_admin,
            };

            setUser(userData);
            if (remember) {
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('user', JSON.stringify(userData));
            }
            navigate('/revenues');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const logout = async (suppressRedirect: boolean = false) => {
        await logoutRequest();
        setUser(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        if (!suppressRedirect) {
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, error }}>
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
