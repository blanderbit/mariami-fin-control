import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {
    loginRequest,
    logoutRequest,
    registerRequest,
    getProfileRequest,
    getOnboardingStatusRequest,
    OnboardingStatus
} from '../api/auth';
import {setTokenStorage, TokenStorage, clearTokens, getTokens, setTokens} from '../api/http';

interface User {
    id: number;
    name?: string | null;
    last_name?: string | null;
    email: string;
    is_admin?: boolean;
    is_onboarded?: boolean;
    avatar?: string;
    country?: string;
    oecd_country?: string;
}

interface AuthContextType {
    user: User | null;
    onboardingStatus: OnboardingStatus | null;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    register: (email: string, password: string, re_password: string, name?: string, last_name?: string) => Promise<void>;
    logout: (suppressRedirect?: boolean) => void;
    clearAuthState: () => void;
    refreshProfile: () => Promise<void>;
    refreshOnboardingStatus: () => Promise<void>;
    loading: boolean;
    error: string | null;
    showWelcomeVideo: boolean;
    setShowWelcomeVideo: (show: boolean) => void;
    markWelcomeVideoAsSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

    // Загружаем юзера из storage при маунте и обновляем с бэкенда
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Проверяем наличие токенов
                const tokens = getTokens();
                if (!tokens?.access) {
                    setLoading(false);
                    return;
                }

                // Загружаем сохраненного пользователя для быстрого отображения
                const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Получаем актуальный профиль с бэкенда
                const profile = await getProfileRequest();
                if (profile) {
                    setUser(profile);

                    // Получаем статус онбординга
                    const onboardingStatus = await getOnboardingStatusRequest();
                    if (onboardingStatus) {
                        setOnboardingStatus(onboardingStatus);
                    }

                    // Обновляем сохраненный профиль
                    const storage = localStorage.getItem('user') ? 'local' : 'session';
                    if (storage === 'local') {
                        localStorage.setItem('user', JSON.stringify(profile));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(profile));
                    }
                } else {
                    // Если не удалось получить профиль, очищаем данные
                    setUser(null);
                    setOnboardingStatus(null);
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    clearTokens();
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                // При ошибке очищаем данные
                setUser(null);
                setOnboardingStatus(null);
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                clearTokens();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Глобальный обработчик для автоматического logout при неудачном refresh
    useEffect(() => {
        const handleTokenRefreshFailure = () => {
            setUser(null);
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            clearTokens();
        };

        // Слушаем события неудачного обновления токенов
        window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailure);

        return () => {
            window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailure);
        };
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

            // Получаем статус онбординга
            const onboardingStatus = await getOnboardingStatusRequest();
            if (onboardingStatus) {
                setOnboardingStatus(onboardingStatus);
            }

            // Сохраняем профиль пользователя в выбранный storage
            if (storage === 'local') {
                localStorage.setItem('user', JSON.stringify(profile));
            } else {
                sessionStorage.setItem('user', JSON.stringify(profile));
            }

            // Проверяем, нужно ли показать welcome видео
            if (shouldShowWelcomeVideo(profile, onboardingStatus)) {
                setShowWelcomeVideo(true);
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
            // Устанавливаем storage для токенов
            const storage: TokenStorage = 'local';
            setTokenStorage(storage);

            // Выполняем регистрацию и получаем токены
            const tokens = await registerRequest({
                email,
                password,
                re_password,
                name,
                last_name
            });

            // Сохраняем токены с помощью setTokens
            setTokens(tokens);

            // Получаем профиль пользователя
            const profile = await getProfileRequest();
            if (!profile) throw new Error('Failed to fetch profile after registration');

            setUser(profile);

            // Получаем статус онбординга
            const onboardingStatus = await getOnboardingStatusRequest();
            if (onboardingStatus) {
                setOnboardingStatus(onboardingStatus);
            }

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
        setOnboardingStatus(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }, []);

    // Полная очистка без редиректа (для Login useEffect)
    const clearAuthState = useCallback(() => {
        setUser(null);
        setOnboardingStatus(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }, []);

    // Обновление профиля пользователя
    const refreshProfile = useCallback(async () => {
        try {
            const profile = await getProfileRequest();
            if (profile) {
                setUser(profile);

                // Обновляем сохраненный профиль
                const storage = localStorage.getItem('user') ? 'local' : 'session';
                if (storage === 'local') {
                    localStorage.setItem('user', JSON.stringify(profile));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(profile));
                }
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    }, []);

    // Обновление статуса онбординга
    const refreshOnboardingStatus = useCallback(async () => {
        try {
            const onboardingStatus = await getOnboardingStatusRequest();
            if (onboardingStatus) {
                setOnboardingStatus(onboardingStatus);
            }
        } catch (error) {
            console.error('Failed to refresh onboarding status:', error);
        }
    }, []);

    // Функции для управления welcome видео
    const markWelcomeVideoAsSeen = useCallback(() => {
        localStorage.setItem('welcome_video_seen', 'true');
        setShowWelcomeVideo(false);
    }, []);

    // Проверяем, нужно ли показать welcome видео
    const shouldShowWelcomeVideo = useCallback((user: User | null, onboardingStatus: OnboardingStatus | null) => {
        // Не показываем если уже видели
        if (localStorage.getItem('welcome_video_seen') === 'true') {
            return false;
        }

        // Показываем только для новых пользователей или тех, кто не прошел онбординг
        return user && (!user.is_onboarded || !onboardingStatus?.is_onboarded);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            onboardingStatus,
            login,
            register,
            logout,
            clearAuthState,
            refreshProfile,
            refreshOnboardingStatus,
            loading,
            error,
            showWelcomeVideo,
            setShowWelcomeVideo,
            markWelcomeVideoAsSeen
        }}>
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
