import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {loginRequest, logoutRequest, registerRequest} from '../api/auth';
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
    register: (email: string, password: string, re_password: string, name?: string, last_name?: string) => Promise<void>;
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
    const login = useCallback(async (email: string, password: string, remember: boolean = true) => {
        setLoading(true);
        setError(null);

        try {
            const storage: TokenStorage = remember ? 'local' : 'session';
            setTokenStorage(storage);
            
            // Выполняем логин и получаем профиль
            const profile = await loginRequest(email, password, storage);
            if (!profile) throw new Error('Failed to fetch profile');

            setUser(profile);

            // Сохраняем профиль пользователя в выбранный storage
            if (storage === 'local') {
                localStorage.setItem('user', JSON.stringify(profile));
            } else {
                sessionStorage.setItem('user', JSON.stringify(profile));
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err; // Re-throw для обработки в компоненте
        } finally {
            setLoading(false);
        }
    }, []);

    // Регистрация
    const register = useCallback(async (email: string, password: string, re_password: string, name?: string, last_name?: string) => {
        setLoading(true);
        setError(null);

        try {
            // Выполняем регистрацию
            await registerRequest({
                email,
                password,
                re_password,
                name,
                last_name
            });

            // После успешной регистрации автоматически логинимся
            const storage: TokenStorage = 'local';
            setTokenStorage(storage);
            
            const profile = await loginRequest(email, password, storage);
            if (!profile) throw new Error('Failed to fetch profile after registration');

            setUser(profile);

            // Сохраняем профиль пользователя
            localStorage.setItem('user', JSON.stringify(profile));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
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
        <AuthContext.Provider value={{user, login, register, logout, clearAuthState, loading, error}}>
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
