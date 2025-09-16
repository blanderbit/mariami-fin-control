import { OnboardingData } from '../api/auth';

// Обязательные поля для каждого степа
const STEP_REQUIRED_FIELDS = {
    1: ['country', 'currency', 'industry', 'fiscal_year_start'],
    2: ['update_frequency', 'primary_focus', 'business_model'],
    3: [] // Интеграции не обязательны
};

/**
 * Определяет текущий степ онбординга на основе заполненных полей
 * @param profile - данные профиля
 * @returns номер степа (1, 2, 3) или null если все заполнено
 */
export function getCurrentOnboardingStep(profile: OnboardingData): number | null {
    // Проверяем обязательные степы (1 и 2)
    for (let step = 1; step <= 2; step++) {
        const requiredFields = STEP_REQUIRED_FIELDS[step as keyof typeof STEP_REQUIRED_FIELDS];

        // Проверяем, заполнены ли все обязательные поля для этого степа
        const isStepComplete = requiredFields.every(field => {
            const value = profile[field as keyof OnboardingData];
            return value !== null && value !== undefined && value !== '';
        });

        // Если степ не завершен, возвращаем его номер
        if (!isStepComplete) {
            return step;
        }
    }

    // Если обязательные степы (1 и 2) завершены, показываем 3-й степ
    return 3;
}

/**
 * Проверяет, завершен ли онбординг
 * @param profile - данные профиля
 * @returns true если онбординг завершен
 */
export function isOnboardingComplete(profile: OnboardingData): boolean {
    // Онбординг завершен только когда все обязательные поля заполнены
    // (степы 1 и 2), независимо от 3-го степа
    for (let step = 1; step <= 2; step++) {
        const requiredFields = STEP_REQUIRED_FIELDS[step as keyof typeof STEP_REQUIRED_FIELDS];

        const isStepComplete = requiredFields.every(field => {
            const value = profile[field as keyof OnboardingData];
            return value !== null && value !== undefined && value !== '';
        });

        if (!isStepComplete) {
            return false;
        }
    }

    return true;
}

/**
 * Получает прогресс онбординга в процентах
 * @param profile - данные профиля
 * @returns процент завершения (0-100)
 */
export function getOnboardingProgress(profile: OnboardingData): number {
    let completedSteps = 0;

    // Считаем только обязательные степы (1 и 2)
    for (let step = 1; step <= 2; step++) {
        const requiredFields = STEP_REQUIRED_FIELDS[step as keyof typeof STEP_REQUIRED_FIELDS];

        const isStepComplete = requiredFields.every(field => {
            const value = profile[field as keyof OnboardingData];
            return value !== null && value !== undefined && value !== '';
        });

        if (isStepComplete) {
            completedSteps++;
        }
    }

    return Math.round((completedSteps / 2) * 100);
}

/**
 * Получает список незаполненных обязательных полей для степа
 * @param profile - данные профиля
 * @param step - номер степа
 * @returns массив незаполненных полей
 */
export function getMissingFieldsForStep(profile: OnboardingData, step: number): string[] {
    const requiredFields = STEP_REQUIRED_FIELDS[step as keyof typeof STEP_REQUIRED_FIELDS];

    return requiredFields.filter(field => {
        const value = profile[field as keyof OnboardingData];
        return value === null || value === undefined || value === '';
    });
}

/**
 * Получает данные профиля для конкретного степа
 * @param profile - полные данные профиля
 * @param step - номер степа
 * @returns данные профиля для степа
 */
export function getStepData(profile: OnboardingData, step: number): Partial<OnboardingData> {
    switch (step) {
        case 1:
            return {
                country: profile.country,
                currency: profile.currency,
                industry: profile.industry,
                employees_count: profile.employees_count,
                fiscal_year_start: profile.fiscal_year_start,
            };
        case 2:
            return {
                update_frequency: profile.update_frequency,
                primary_focus: profile.primary_focus,
                business_model: profile.business_model,
                multicurrency: profile.multicurrency,
                capital_reserve_target: profile.capital_reserve_target,
            };
        case 3:
            return {}; // Интеграции пока не реализованы
        default:
            return {};
    }
}
