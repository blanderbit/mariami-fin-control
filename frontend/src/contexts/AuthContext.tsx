import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {loginRequest, logoutRequest} from '../api/auth';
import {setTokenStorage, TokenStorage} from '../api/http';

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
    clearAuthState: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загружаем юзера из storage при маунте
    useEffect(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Логин
    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            // Выполняем логин и получаем профиль
            const profile = await loginRequest(email, password);
            if (!profile) throw new Error('Failed to fetch profile');

            setUser(profile);

            // Сохраняем профиль пользователя в выбранный storage
            localStorage.setItem('user', JSON.stringify(profile));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err; // Re-throw для обработки в компоненте
        } finally {
            setLoading(false);
        }
    }, []);

    // Логаут (с API-запросом)
    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } catch (e) {
            console.warn('Logout request failed', e);
        }

        setUser(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }, []);

    // Полная очистка без редиректа (для Login useEffect)
    const clearAuthState = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }, []);

    return (
        <AuthContext.Provider value={{user, login, logout, clearAuthState, loading, error}}>
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
