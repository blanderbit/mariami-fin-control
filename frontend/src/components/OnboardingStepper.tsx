import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    ArrowLeft,
    ArrowRight,
    Check,
    Globe,
    DollarSign,
    Building,
    Users,
    Calendar,
    TrendingUp,
    ToggleLeft,
    ToggleRight,
    CreditCard,
    FileText,
    Phone,
    ShoppingCart,
    Sun,
    Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { updateOnboardingRequest, OnboardingData } from '../api/auth';
import { getStepData } from '../utils/onboardingUtils';
import Logo from "../assets/FinclAI Logo Blue.png";

const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
];

const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
];

const industries = [
    'Services',
    'E-commerce / Retail',
    'Trading',
    'Manufacturing / Production',
    'Freelancer / Self-employed',
    'Technology / SaaS / IT',
    'Healthcare / Wellness / Beauty',
    'Hospitality / Food & Beverage',
    'Consulting / Professional Services',
    'Education / Nonprofit'
];

const businessModels = [
    { label: 'Subscription / Recurring revenue', value: 'recurring' },
    { label: 'One-time sales', value: 'one_time' },
    { label: 'Services (time-based/project-based)', value: 'services' },
    { label: 'Hybrid', value: 'hybrid' }
];

const updateFrequencyOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
];

const primaryFocusOptions = [
    { label: 'Cash – focus on liquidity', value: 'cash' },
    { label: 'Profit – focus on margins', value: 'profit' },
    { label: 'Growth – focus on scaling', value: 'growth' }
];

interface OnboardingStepperProps {
    initialStep?: number;
    initialData?: OnboardingData;
}

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
    initialStep = 1,
    initialData
}) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { refreshOnboardingStatus, refreshProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [profile, setProfile] = useState<OnboardingData>(initialData || {
        country: '',
        currency: '',
        industry: '',
        employees_count: null,
        fiscal_year_start: null,
        update_frequency: undefined,
        primary_focus: undefined,
        business_model: '',
        multicurrency: false,
        capital_reserve_target: null,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // Определяем обязательные поля для каждого степа
    const getRequiredFieldsForStep = (step: number): string[] => {
        switch (step) {
            case 1:
                return ['country', 'currency', 'industry', 'fiscal_year_start'];
            case 2:
                return ['update_frequency', 'primary_focus', 'business_model'];
            case 3:
                return []; // Интеграции не обязательны
            default:
                return [];
        }
    };

    const handleInputChange = (field: keyof OnboardingData, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (step: number) => {
        const newErrors: { [key: string]: string } = {};
        const requiredFields = getRequiredFieldsForStep(step);

        requiredFields.forEach(field => {
            const value = profile[field as keyof OnboardingData];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                newErrors[field] = `${field.replace('_', ' ')} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveStepData = async (stepData: Partial<OnboardingData>) => {
        try {
            setLoading(true);
            await updateOnboardingRequest(stepData);
            await refreshOnboardingStatus();
        } catch (error) {
            console.error('Failed to save step data:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        try {
            // Получаем данные для текущего степа
            const stepData = getStepData(profile, currentStep);

            // Сохраняем данные степа
            if (Object.keys(stepData).length > 0) {
                await saveStepData(stepData);
            }

            setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error('Failed to proceed to next step:', error);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            // Завершаем онбординг - отправляем запрос на завершение
            // Бэкенд автоматически установит is_onboarded = true если все обязательные поля заполнены
            await refreshOnboardingStatus();
            // Обновляем профиль пользователя чтобы получить актуальный is_onboarded
            await refreshProfile();
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to finish onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                </label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={profile.country || ''}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.country ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        <option value="">Select country</option>
                        {countries.map(country => (
                            <option key={country.code} value={country.code}>{country.name}</option>
                        ))}
                    </select>
                </div>
                {errors.country && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Currency *
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={profile.currency || ''}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.currency ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        <option value="">Select currency</option>
                        {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>
                        ))}
                    </select>
                </div>
                {errors.currency && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currency}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry *
                </label>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={profile.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.industry ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                </div>
                {errors.industry && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Size - Employees
                </label>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="number"
                        min="0"
                        value={profile.employees_count || ''}
                        onChange={(e) => handleInputChange('employees_count', parseInt(e.target.value) || null)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Number of employees"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fiscal Year Start (YYYY-MM-DD) *
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="date"
                        value={profile.fiscal_year_start || ''}
                        onChange={(e) => handleInputChange('fiscal_year_start', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.fiscal_year_start ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    />
                </div>
                {errors.fiscal_year_start && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fiscal_year_start}</p>}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    How often do you update your financial/business data? *
                </label>
                <div className="space-y-3">
                    {updateFrequencyOptions.map(option => (
                        <label key={option.value} className="flex items-center">
                            <input
                                type="radio"
                                name="updateFrequency"
                                value={option.value}
                                checked={profile.update_frequency === option.value}
                                onChange={(e) => handleInputChange('update_frequency', e.target.value as "daily" | "weekly" | "monthly")}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                        </label>
                    ))}
                </div>
                {errors.update_frequency && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.update_frequency}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    What is your main financial priority right now? *
                </label>
                <div className="space-y-3">
                    {primaryFocusOptions.map(option => (
                        <label key={option.value} className="flex items-center">
                            <input
                                type="radio"
                                name="primaryFocus"
                                value={option.value}
                                checked={profile.primary_focus === option.value}
                                onChange={(e) => handleInputChange('primary_focus', e.target.value as "cash" | "profit" | "growth")}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
                        </label>
                    ))}
                </div>
                {errors.primary_focus && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.primary_focus}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How do you primarily earn revenue? This helps us tailor metrics and dashboards to your business model. *
                </label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={profile.business_model || ''}
                        onChange={(e) => handleInputChange('business_model', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.business_model ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                    >
                        <option value="">Select business model</option>
                        {businessModels.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </div>
                {errors.business_model && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_model}</p>}
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Multicurrency</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleInputChange('multicurrency', !profile.multicurrency)}
                        className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
                    >
                        {profile.multicurrency ? (
                            <ToggleRight className="w-8 h-8 text-indigo-600" />
                        ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capital Reserve Target
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={profile.capital_reserve_target || ''}
                        onChange={(e) => handleInputChange('capital_reserve_target', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Connect Your Tools</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect your existing tools to get started faster</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Banking</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Connect your bank accounts</p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Connect
                    </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Accounting</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">QuickBooks, Xero, Zoho</p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Connect
                    </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Phone className="w-8 h-8 text-purple-600" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">CRM</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Customer relationship management</p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Connect
                    </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-8 h-8 text-orange-600" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">E-commerce</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Shopify and other platforms</p>
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center px-4"
        >
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <img src={Logo} alt="FinclAI Logo" className="w-20 h-20 object-contain"/>
                    </div>
                    <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100">Setup Your Account</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Let's configure your financial AI assistant</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-8">
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step <= currentStep
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                                </div>
                                {step < 3 && (
                                    <div className="flex-1 mx-4">
                                        <div
                                            className={`h-1 ${
                                                step < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {currentStep === 1 && 'Company Information'}
                            {currentStep === 2 && 'Profile Setup'}
                            {currentStep === 3 && 'Integrations'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currentStep === 1 && 'Tell us about your company'}
                            {currentStep === 2 && 'Configure your preferences'}
                            {currentStep === 3 && 'Connect your existing tools'}
                        </p>
                    </div>

                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>

                        {currentStep < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Next'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Finishing...' : 'Finish onboarding'}
                                <Check className="w-4 h-4 ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OnboardingStepper;
