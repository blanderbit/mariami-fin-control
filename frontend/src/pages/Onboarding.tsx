import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentOnboardingStep } from '../utils/onboardingUtils';
import OnboardingStepper from '../components/OnboardingStepper';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { user, onboardingStatus, loading } = useAuth();

    // Используем ref для хранения начальных данных
    // чтобы они не изменялись при обновлении onboardingStatus
    const initialDataRef = useRef(onboardingStatus?.profile);
    const initialStepRef = useRef(
        onboardingStatus?.profile
            ? getCurrentOnboardingStep(onboardingStatus.profile) || 1
            : 1
    );

    // Обновляем ref только если данных еще не было
    if (!initialDataRef.current && onboardingStatus?.profile) {
        initialDataRef.current = onboardingStatus.profile;
        initialStepRef.current = getCurrentOnboardingStep(onboardingStatus.profile) || 1;
    }

    // Мемоизируем пропсы для OnboardingStepper с использованием ref
    const stepperProps = useMemo(() => ({
        initialStep: initialStepRef.current,
        initialData: initialDataRef.current
    }), []); // Пустой массив зависимостей - создается один раз

    useEffect(() => {
        // Не редиректим пока данные загружаются
        if (loading) {
            return;
        }

        // Если пользователь не авторизован после загрузки, перенаправляем на логин
        if (!user) {
            navigate('/login');
            return;
        }

        // Если пользователь уже прошел онбординг, перенаправляем на дашборд
        if (user.is_onboarded) {
            navigate('/overview');
            return;
        }

        // Если нет данных онбординга, загружаем их
        if (!onboardingStatus) {
            // Данные будут загружены через AuthContext
            return;
        }
    }, [user, loading, navigate]);

    // Если данные еще загружаются, показываем загрузку
    if (loading || !user || !onboardingStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading onboarding...</p>
            </div>
        </div>
    );
    }

    return (
        <OnboardingStepper {...stepperProps} />
    );
};

export default Onboarding;
