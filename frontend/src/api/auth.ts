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
    is_onboarded?: boolean;
};

export async function loginRequest(email: string, password: string, storage?: TokenStorage) {
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

    // Set token storage if provided
    if (storage) {
        setTokenStorage(storage);
    }

    // fetch profile with onboarding status
    const profileRes = await api.profile.profileProfileList() as any;
    const user = profileRes.data?.results?.[0] || profileRes.data;
    
    // Получаем статус онбординга для получения is_onboarded
    const onboardingStatus = await getOnboardingStatusRequest();
    if (onboardingStatus && user) {
        user.is_onboarded = onboardingStatus.is_onboarded;
    }
    
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
    const access = (res.data.data as any).access as string;
    const refresh = ((res.data.data as any).refresh as string) || tokens.refresh;
    setTokens({ access, refresh });
    return { access, refresh };
}

export async function registerRequest(data: { email: string; password: string; re_password: string; country?: string; name?: string; last_name?: string; }) {
    await api.auth.authRegistrationCreate(data);
}

export async function getProfileRequest(): Promise<AuthUser | null> {
    try {
        const res = await api.profile.profileProfileList() as any;
        const profile = res.data?.results?.[0] || res.data;
        
        // Получаем статус онбординга для получения is_onboarded
        const onboardingStatus = await getOnboardingStatusRequest();
        if (onboardingStatus && profile) {
            profile.is_onboarded = onboardingStatus.is_onboarded;
        }
        
        return profile as AuthUser | null;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return null;
    }
}

export async function getOnboardingStatusRequest() {
    try {
        const res = await api.profile.profileOnboardingStatusList() as any;
        return res.data?.results?.[0] || res.data?.data || null;
    } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        return null;
    }
}

export type OnboardingData = {
    name?: string;
    last_name?: string;
    country?: string;
    company_name?: string;
    employees_count?: number | null;
    industry?: string;
    currency?: string;
    fiscal_year_start?: string | null;
    update_frequency?: "daily" | "weekly" | "monthly";
    primary_focus?: "cash" | "profit" | "growth";
    business_model?: string;
    multicurrency?: boolean;
    capital_reserve_target?: string | null;
    current_cash?: string | null;
};

export type OnboardingStatus = {
    profile: OnboardingData;
    is_onboarding_complete: boolean;
    is_onboarded: boolean;
    required_fields: string[];
};

export async function updateOnboardingRequest(data: any) {
    try {
        const res = await api.profile.profileOnboardingPartialUpdate(data) as any;
        return res.data || null;
    } catch (error) {
        console.error('Failed to update onboarding:', error);
        throw error;
    }
}

export type UploadDataFilesRequest = {
    pnl_file?: File;
    transactions_file?: File;
    invoices_file?: File;
};

export type UploadDataFilesResponse = {
    success: boolean;
    message: string;
    uploaded_files?: Record<string, string | null>[];
    errors?: string[];
};

export async function uploadDataFilesRequest(data: UploadDataFilesRequest): Promise<UploadDataFilesResponse> {
    try {
        const res = await api.users.usersUploadDataFilesCreate(data) as any;
        return res.data || res;
    } catch (error) {
        console.error('Failed to upload data files:', error);
        throw error;
    }
}

export type FinancialAnalysisRequest = {
    period: 'month' | 'year';
};

export type FinancialMetric = {
    current: number;
    previous: number;
    change: number;
    percentage_change: number;
    is_positive_change: boolean;
};

export type FinancialAnalysisResponse = {
    period_type: string;
    revenue_data: FinancialMetric;
    expenses_data: FinancialMetric;
    net_profit_data: FinancialMetric;
    currency: string;
};

export async function getFinancialAnalysisRequest(data: FinancialAnalysisRequest): Promise<FinancialAnalysisResponse> {
    try {
        const res = await api.users.usersFinancialAnalysisList(data) as any;
        return res.data || res;
    } catch (error) {
        console.error('Failed to get financial analysis:', error);
        throw error;
    }
}

export type Currency = {
    code: string;
    name: string;
    symbol: string;
};

export type CurrenciesResponse = {
    status: string;
    code: number;
    data: {
        currencies: Currency[];
        count: number;
    };
    message: string | null;
};

// Кэш для валют
let currenciesCache: Currency[] | null = null;
let currenciesPromise: Promise<Currency[]> | null = null;

export async function getCurrenciesRequest(): Promise<Currency[]> {
    // Если данные уже в кэше, возвращаем их
    if (currenciesCache) {
        return currenciesCache;
    }

    // Если запрос уже выполняется, ждем его результата
    if (currenciesPromise) {
        return currenciesPromise;
    }

    // Создаем новый запрос
    currenciesPromise = (async () => {
        try {
            const res = await api.profile.profileCurrenciesList() as any;
            const response = res.data || res;
            const currencies = response.data?.currencies || [];
            currenciesCache = currencies;
            return currencies;
        } catch (error) {
            console.error('Failed to get currencies:', error);
            currenciesPromise = null; // Сбрасываем промис при ошибке
            throw error;
        }
    })();

    return currenciesPromise;
}

// Функция для очистки кэша валют (если нужно обновить данные)
export function clearCurrenciesCache(): void {
    currenciesCache = null;
    currenciesPromise = null;
}


