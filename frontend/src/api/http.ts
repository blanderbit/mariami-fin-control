import axios, { AxiosError, AxiosInstance } from 'axios';

type Tokens = { access: string; refresh: string };

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export type TokenStorage = 'local' | 'session';
let currentStorage: TokenStorage = 'local';
let storageRef: Storage = localStorage;

export const setTokenStorage = (strategy: TokenStorage) => {
    currentStorage = strategy;
    storageRef = strategy === 'local' ? localStorage : sessionStorage;
};

export const detectTokenStorage = () => {
    if (sessionStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(REFRESH_KEY)) {
        setTokenStorage('session');
    } else if (localStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY)) {
        setTokenStorage('local');
    }
};

export const getActiveStorage = (): Storage => storageRef;
export const getActiveStorageType = (): TokenStorage => currentStorage;

export const getTokens = (): Tokens | null => {
    const access = storageRef.getItem(ACCESS_KEY) || '';
    const refresh = storageRef.getItem(REFRESH_KEY) || '';
    if (!access || !refresh) return null;
    return { access, refresh };
};

export const setTokens = (tokens: Tokens) => {
    storageRef.setItem(ACCESS_KEY, tokens.access);
    storageRef.setItem(REFRESH_KEY, tokens.refresh);
};

export const clearTokens = () => {
    // clear from both storages to be safe
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
};

export const createHttpClient = (): AxiosInstance => {
    // initialize storage by sniffing existing tokens
    detectTokenStorage();

    const instance = axios.create({
        baseURL: '/api/v1',
    });

    // Attach access token
    instance.interceptors.request.use((config) => {
        const tokens = getTokens();
        if (tokens?.access) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
    });

    let isRefreshing = false;
    let pendingQueue: Array<{
        resolve: (value?: unknown) => void;
        reject: (reason?: any) => void;
    }> = [];

    const processQueue = (error: unknown, token?: string) => {
        pendingQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
        pendingQueue = [];
    };

    // Auto refresh on 401
    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest: any = error.config;
            const status = error.response?.status;

            if (status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        pendingQueue.push({ resolve, reject });
                    })
                        .then(() => {
                            const tokens = getTokens();
                            originalRequest.headers = originalRequest.headers ?? {};
                            if (tokens?.access) {
                                originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
                            }
                            return instance(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const tokens = getTokens();
                    if (!tokens?.refresh) throw new Error('No refresh token');

                    const resp = await axios.post('/api/v1/auth/client/refresh/tokens', {
                        refresh: tokens.refresh,
                    });

                    const newAccess = (resp.data?.access as string) || '';
                    const newRefresh = (resp.data?.refresh as string) || tokens.refresh;
                    setTokens({ access: newAccess, refresh: newRefresh });
                    processQueue(null, newAccess);
                    isRefreshing = false;

                    originalRequest.headers = originalRequest.headers ?? {};
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return instance(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError);
                    isRefreshing = false;
                    clearTokens();
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        },
    );

    return instance;
};

export const http = createHttpClient();


