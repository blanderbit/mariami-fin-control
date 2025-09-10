import { Api } from './api.ts';
import { http, setTokens, clearTokens, getTokens, setTokenStorage, TokenStorage } from './http';

const api = new Api({
    baseURL: '/api/v1',
});
// Use shared axios instance with interceptors (auth, refresh)
api.instance = http;

export type AuthUser = {
    id: number;
    email: string;
    name?: string | null;
    last_name?: string | null;
    is_admin?: boolean;
};

export async function loginRequest(email: string, password: string, storage: TokenStorage = 'local') {
    setTokenStorage(storage);
    const res = await api.auth.authLoginCreate({ email, password }) as any;
    const tokensField: any = res.data?.data?.tokens;


    // tokens may be object or callable reference; try to normalize
    let access = '';
    let refresh = '';
    if (tokensField && typeof tokensField === 'object') {
        access = (tokensField.access as string) || '';
        refresh = (tokensField.refresh as string) || '';
    }
    if (!access && !refresh) {
        // fallback: try standard structure from simplejwt refresh view if present
        access = (res.data as any).access || '';
        refresh = (res.data as any).refresh || '';
    }
    if (!access || !refresh) {
        throw new Error('Invalid auth response: tokens missing');
    }
    setTokens({ access, refresh });

    // fetch profile
    const me = await api.profile.profileOnboardingStatusList() as any;
    const user = me.data?.data || null;
    return user as AuthUser | null;
}

export async function logoutRequest() {
    const tokens = getTokens();
    if (tokens?.refresh) {
        try {
            await api.auth.authLogoutCreate({ refresh: tokens.refresh });
        } catch (_) {
            // ignore logout errors
        }
    }
    clearTokens();
}

export async function refreshTokens() {
    const tokens = getTokens();
    if (!tokens?.refresh) throw new Error('No refresh token');
    const res = await api.auth.authRefreshCreate({ refresh: tokens.refresh });
    const access = (res.data as any).access as string;
    const refresh = ((res.data as any).refresh as string) || tokens.refresh;
    setTokens({ access, refresh });
    return { access, refresh };
}

export async function registerRequest(data: { email: string; password: string; re_password: string; country?: string; name?: string; last_name?: string; }) {
    await api.auth.authRegistrationCreate(data);
}


