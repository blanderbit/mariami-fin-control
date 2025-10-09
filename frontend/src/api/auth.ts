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
    const res = await api.auth.authRegistrationCreate(data) as any;
    
    // Extract tokens from response
    const access = res.data?.data?.access || '';
    const refresh = res.data?.data?.refresh || '';
    
    if (!access || !refresh) {
        throw new Error('Invalid registration response: tokens missing');
    }
    
    return { access, refresh };
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

export async function getAISummaryRequest(): Promise<string | null> {
    try {
        const res = await api.profile.profileProfileAiSummaryList() as any;
        // Извлекаем AI summary из ответа
        const summary = res.data?.data?.ai_insight || res.data?.ai_insight || null;
        return typeof summary === 'string' ? summary : null;
    } catch (error) {
        console.error('Failed to fetch AI summary:', error);
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
    current_cash?: number | null;
    company_info?: string | null;
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

export type IndustriesResponse = {
    status: string;
    code: number;
    data: {
        industries: string[];
    };
    message: string | null;
};

// Кэш для индустрий
let industriesCache: string[] | null = null;
let industriesPromise: Promise<string[]> | null = null;

export async function getIndustriesRequest(): Promise<string[]> {
    // Если данные уже в кэше, возвращаем их
    if (industriesCache) {
        return industriesCache;
    }

    // Если запрос уже выполняется, ждем его результата
    if (industriesPromise) {
        return industriesPromise;
    }

    // Создаем новый запрос
    industriesPromise = (async () => {
        try {
            const res = await api.users.usersIndustriesList() as any;
            const response = res.data || res;
            const industries = response.data?.industries || response.industries || [];
            industriesCache = industries;
            return industries;
        } catch (error) {
            console.error('Failed to get industries:', error);
            industriesPromise = null;
            throw error;
        }
    })();

    return industriesPromise;
}

// Функция для очистки кэша индустрий (если нужно обновить данные)
export function clearIndustriesCache(): void {
    industriesCache = null;
    industriesPromise = null;
}

export type TemplatesResponse = {
    status: string;
    code: number;
    data: {
        pnl: string;
        transactions: string;
        invoices: string;
    };
    message: string | null;
};

export type TemplatesData = {
    pnl: string;
    transactions: string;
    invoices: string;
};

let templatesCache: TemplatesData | null = null;
let templatesPromise: Promise<TemplatesData> | null = null;

export async function getTemplatesRequest(): Promise<TemplatesData> {
    if (templatesCache) {
        return templatesCache;
    }

    if (templatesPromise) {
        return templatesPromise;
    }

    templatesPromise = (async () => {
        try {
            const res = await api.users.usersTemplatesList() as any;
            const response = res.data || res;
            const templates = response.data || response;
            templatesCache = templates;
            return templates;
        } catch (error) {
            console.error('Failed to get templates:', error);
            templatesPromise = null;
            throw error;
        }
    })();

    return templatesPromise;
}

export function clearTemplatesCache(): void {
    templatesCache = null;
    templatesPromise = null;
}

export type DocumentsResponse = {
    status: string;
    code: number;
    data: {
        terms_of_service: string;
        privacy_policy: string;
    };
    message: string | null;
};

export type DocumentsData = {
    terms_of_service: string;
    privacy_policy: string;
};

// Кэш для документов
let documentsCache: DocumentsData | null = null;
let documentsPromise: Promise<DocumentsData> | null = null;

export async function getDocumentsRequest(): Promise<DocumentsData> {
    if (documentsCache) {
        return documentsCache;
    }

    if (documentsPromise) {
        return documentsPromise;
    }

    documentsPromise = (async () => {
        try {
            const res = await api.users.usersDocumentsList() as any;
            const response = res.data || res;
            const documents = response.data || response;
            documentsCache = documents;
            return documents;
        } catch (error) {
            console.error('Failed to get documents:', error);
            documentsPromise = null;
            throw error;
        }
    })();

    return documentsPromise;
}

export function clearDocumentsCache(): void {
    documentsCache = null;
    documentsPromise = null;
}

// P&L Analysis Types
export type PnLDataItem = {
    Month: string;
    Revenue: number;
    COGS: number;
    Payroll: number;
    Rent: number;
    Marketing: number;
    Other_Expenses: number;
    Net_Profit: number;
};

export type PnLChangeData = {
    change: number;
    percentage_change: number;
};

export type PnLPeriod = {
    start_date: string;
    end_date: string;
};

export type PnLAnalysisResponse = {
    status: string;
    code: number;
    data: {
        pnl_data: PnLDataItem[];
        gross_margin: number;
        operating_margin: string;
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
        month_change: {
            revenue: PnLChangeData;
            expenses: PnLChangeData;
            net_profit: PnLChangeData;
        };
        year_change: {
            revenue: PnLChangeData;
            expenses: PnLChangeData;
            net_profit: PnLChangeData;
        };
        period: PnLPeriod;
        ai_insights: string;
    };
    message: string | null;
};

export type PnLAnalysisRequest = {
    start_date: string;
    end_date: string;
};

export async function getPnLAnalysisRequest(data: PnLAnalysisRequest): Promise<PnLAnalysisResponse> {
    try {
        const res = await api.users.getPnlAnalysis(data) as any;
        return res.data || res;
    } catch (error) {
        console.error('Failed to get P&L analysis:', error);
        throw error;
    }
}

export type InvoicesAnalysisRequest = {
    start_date: string;
    end_date: string;
};

export interface InvoicesAnalysisResponse {
    status: string;
    code: number;
    data: {
        total_count: number;
        paid_invoices: {
            total_count: number;
            total_amount: number;
        };
        overdue_invoices: {
            total_count: number;
            total_amount: number;
        };
        month_change: {
            total_count: {
                change: number;
                percentage_change: number;
            };
            paid_invoices: {
                count_change: {
                    change: number;
                    percentage_change: number;
                };
                amount_change: {
                    change: number;
                    percentage_change: number;
                };
            };
            overdue_invoices: {
                count_change: {
                    change: number;
                    percentage_change: number;
                };
                amount_change: {
                    change: number;
                    percentage_change: number;
                };
            };
        };
        year_change: {
            total_count: {
                change: number;
                percentage_change: number;
            };
            paid_invoices: {
                count_change: {
                    change: number;
                    percentage_change: number;
                };
                amount_change: {
                    change: number;
                    percentage_change: number;
                };
            };
            overdue_invoices: {
                count_change: {
                    change: number;
                    percentage_change: number;
                };
                amount_change: {
                    change: number;
                    percentage_change: number;
                };
            };
        };
        period: {
            start_date: string;
            end_date: string;
        };
    };
    message: string | null;
}

export async function getInvoicesAnalysisRequest(data: InvoicesAnalysisRequest): Promise<InvoicesAnalysisResponse> {
    try {
        const res = await api.users.usersInvoicesAnalysisList(data) as any;
        return res.data || res;
    } catch (error) {
        console.error('Failed to get invoices analysis:', error);
        throw error;
    }
}

export type CashAnalysisRequest = {
    start_date: string;
    end_date: string;
};

export interface CashAnalysisResponse {
    total_income: string;
    total_expense: string;
}

export async function getCashAnalysisRequest(data: CashAnalysisRequest): Promise<CashAnalysisResponse> {
    try {
        const res = await api.users.usersCashAnalysisList(data) as any;
        return res.data || res;
    } catch (error) {
        console.error('Failed to get cash analysis:', error);
        throw error;
    }
}

export type ExpenseCategoryData = {
    total_amount: string;  // API returns decimal as string
    spike: boolean;
    new: boolean;
};

export interface ExpenseBreakdownResponse {
    COGS?: ExpenseCategoryData;
    Payroll?: ExpenseCategoryData;
    Rent?: ExpenseCategoryData;
    Marketing?: ExpenseCategoryData;
    Other_Expenses?: ExpenseCategoryData;
}

export type ExpenseBreakdownRequest = {
    start_date: string;
    end_date: string;
};

export async function getExpenseBreakdownRequest(data: ExpenseBreakdownRequest): Promise<ExpenseBreakdownResponse> {
    try {
        const res = await api.users.usersExpenseBreakdownList(data) as any;
        // Handle both wrapped and direct response formats
        if (res.data && res.data.data) {
            return res.data.data;
        } else if (res.data) {
            return res.data;
        } else {
            return res;
        }
    } catch (error) {
        console.error('Failed to get expense breakdown:', error);
        throw error;
    }
}

export type AIInsightsRequest = {
    start_date: string;
    end_date: string;
};

export interface AIInsightsResponse {
    insights: string[];
    period: Record<string, string | null>;
    data_sources: Record<string, string | null>;
}

export async function getAIInsightsRequest(data: AIInsightsRequest): Promise<AIInsightsResponse> {
    try {
        const res = await api.users.usersAiInsightsList(data) as any;
        // The API returns wrapped response: { status, code, data: {...}, message }
        // We need to extract the data field
        return res.data?.data || res.data || res;
    } catch (error) {
        console.error('Failed to get AI insights:', error);
        throw error;
    }
}


