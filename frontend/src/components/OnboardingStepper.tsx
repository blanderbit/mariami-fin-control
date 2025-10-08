import React, { useState, useEffect, useMemo } from 'react';
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
import { updateOnboardingRequest, OnboardingData, getCurrenciesRequest, Currency, getIndustriesRequest } from '../api/auth';
import { getStepData } from '../utils/onboardingUtils';
import Logo from "../assets/FinclAI Logo Blue.png";

interface ChatMessage {
    type: 'bot' | 'user';
    content: string;
    isTyping?: boolean;
}

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
    { code: 'IE', name: 'Ireland' },
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

const OnboardingStepper: React.FC<OnboardingStepperProps> = React.memo(({
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
        current_cash: null,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(true);
    const [industries, setIndustries] = useState<string[]>([]);
    const [industriesLoading, setIndustriesLoading] = useState(true);

    // Chat state for Step 2
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputValue, setTextInputValue] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [multiSelectTemp, setMultiSelectTemp] = useState<string[]>([]);

    const chatQuestions = [
        {
            question: "How often do you update your financial/business data?",
            options: ['Daily', 'Weekly', 'Monthly', 'Other'],
            field: 'update_frequency'
        },
        {
            question: "What is your main financial priority right now?",
            options: ['Cash', 'Profit', 'Growth'],
            field: 'primary_focus',
            multiSelect: true
        },
        {
            question: "How do you primarily earn revenue?",
            options: ['Subscription', 'One-time', 'Services', 'Hybrid', 'Other'],
            field: 'business_model',
            multiSelect: true
        },
        {
            question: "Some businesses keep a cash buffer — money set aside to cover slow months. How many months of reserves would you ideally like to maintain?",
            options: ['3', '6', '12', '18', 'Custom'],
            field: 'capital_reserve_target'
        },
        {
            question: "What's your current cash balance?",
            field: 'current_cash',
            textInput: true
        }
    ];

    // Загружаем список валют и индустрий при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            try {
                const [currencies, industries] = await Promise.all([
                    getCurrenciesRequest(),
                    getIndustriesRequest()
                ]);
                setCurrencies(currencies);
                setIndustries(industries);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setCurrenciesLoading(false);
                setIndustriesLoading(false);
            }
        };

        loadData();
    }, []); // Пустой массив зависимостей - выполняется только при монтировании

    // Initialize chat when entering step 2
    useEffect(() => {
        if (currentStep === 2 && chatMessages.length === 0) {
            setTimeout(() => {
                addBotMessage(chatQuestions[0].question);
            }, 500);
        }
    }, [currentStep]);

    // Chat functions
    const addBotMessage = (content: string) => {
        setChatMessages(prev => [...prev, { type: 'bot', content, isTyping: true }]);

        setTimeout(() => {
            setChatMessages(prev =>
                prev.map((msg, idx) =>
                    idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
                )
            );
            setShowOptions(true);
        }, 800);
    };

    const handleOptionSelect = (option: string) => {
        const question = chatQuestions[currentQuestion];

        if (question.multiSelect) {
            // For multiselect, toggle selection without moving to next question
            // TODO: Backend integration - handle multiselect values
            return;
        }

        setChatMessages(prev => [...prev, { type: 'user', content: option }]);
        setShowOptions(false);

        // TODO: Backend integration - save the answer
        // setProfile(prev => ({ ...prev, [question.field]: option }));

        if (option === 'Custom' && question.field === 'capital_reserve_target') {
            setTimeout(() => {
                setShowTextInput(true);
            }, 300);
            return;
        }

        if (currentQuestion < chatQuestions.length - 1) {
            setTimeout(() => {
                addBotMessage(chatQuestions[currentQuestion + 1].question);
                setCurrentQuestion(prev => prev + 1);
            }, 600);
        } else {
            showFinalSummary();
        }
    };

    const handleMultiSelectContinue = () => {
        const question = chatQuestions[currentQuestion];
        // TODO: Backend integration - get selected values
        const selected = "Selected options"; // Placeholder

        setChatMessages(prev => [...prev, { type: 'user', content: selected }]);
        setShowOptions(false);

        if (currentQuestion < chatQuestions.length - 1) {
            setTimeout(() => {
                addBotMessage(chatQuestions[currentQuestion + 1].question);
                setCurrentQuestion(prev => prev + 1);
            }, 600);
        } else {
            showFinalSummary();
        }
    };

    const handleTextSubmit = () => {
        if (!textInputValue.trim()) return;

        const question = chatQuestions[currentQuestion];

        setChatMessages(prev => [...prev, { type: 'user', content: textInputValue }]);
        // TODO: Backend integration - save the answer
        // setProfile(prev => ({ ...prev, [question.field]: textInputValue }));
        setShowTextInput(false);
        setTextInputValue('');

        if (question.field === 'capital_reserve_target') {
            if (currentQuestion < chatQuestions.length - 1) {
                setTimeout(() => {
                    addBotMessage(chatQuestions[currentQuestion + 1].question);
                    setCurrentQuestion(prev => prev + 1);
                }, 600);
            } else {
                showFinalSummary();
            }
        } else {
            showFinalSummary();
        }
    };

    const showFinalSummary = () => {
        setTimeout(() => {
            const summaryMessage = "Thanks for sharing. Based on what you told me, I'll customize your first dashboard to highlight the most important metrics — liquidity if cash is critical, margins if profitability is your focus, and scaling scenarios if growth is your goal. I'll also bring in your industry and region benchmarks. You're almost there — just one more step.";
            setChatMessages(prev => [...prev, { type: 'bot', content: summaryMessage }]);
            setTimeout(() => {
                setShowSummary(true);
            }, 100);
        }, 800);
    };

    // Определяем обязательные поля для каждого степа
    const getRequiredFieldsForStep = (step: number): string[] => {
        switch (step) {
            case 1:
                return ['country', 'currency', 'industry', 'fiscal_year_start'];
            case 2:
                return []; // TODO: Backend not ready - no validation for now
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
        if (currentStep === 2) {
            // Reset chat state when going back from step 2
            setChatMessages([]);
            setCurrentQuestion(0);
            setShowOptions(false);
            setShowTextInput(false);
            setShowSummary(false);
            setTextInputValue('');
            setMultiSelectTemp([]);
        }
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
            // Редирект на dashboard после завершения онбоардинга
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to finish onboarding:', error);
            // Все равно редиректим на dashboard даже если произошла ошибка
            navigate('/dashboard');
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
                        disabled={currenciesLoading}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.currency ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${currenciesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">
                            {currenciesLoading ? 'Loading currencies...' : 'Select currency'}
                        </option>
                        {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name} ({currency.symbol})
                            </option>
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
                        disabled={industriesLoading}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                            errors.industry ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${industriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">
                            {industriesLoading ? 'Loading industries...' : 'Select industry'}
                        </option>
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

    const renderStep2 = () => {
        return (
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                        style={{
                            animationDelay: `${idx * 100}ms`
                        }}
                    >
                        {msg.type === 'bot' && (
                            <div className="rounded-2xl p-4 max-w-[85%] bg-white dark:bg-gray-700 shadow-sm">
                                {msg.isTyping ? (
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1000ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1000ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1000ms' }} />
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">{msg.content}</p>
                                )}
                            </div>
                        )}
                        {msg.type === 'user' && (
                            <div className="rounded-2xl px-4 py-3 max-w-[75%] bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white">
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        )}
                    </div>
                ))}

                {showOptions && !chatQuestions[currentQuestion].textInput && (
                    <div className="space-y-2 pl-2">
                        {chatQuestions[currentQuestion].options?.map((option, idx) => {
                            const isSelected = chatQuestions[currentQuestion].multiSelect && multiSelectTemp.includes(option);

                            return (
                                <button
                                    key={option}
                                    onClick={() => {
                                        if (chatQuestions[currentQuestion].multiSelect) {
                                            setMultiSelectTemp(prev =>
                                                prev.includes(option)
                                                    ? prev.filter(v => v !== option)
                                                    : [...prev, option]
                                            );
                                        } else {
                                            handleOptionSelect(option);
                                        }
                                    }}
                                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isSelected ? 'border-2' : 'border'
                                    }`}
                                    style={{
                                        backgroundColor: isSelected ? (theme === 'dark' ? '#1E3A8A' : '#E8F0FE') : (theme === 'dark' ? '#374151' : '#FFFFFF'),
                                        borderColor: isSelected ? '#2561E5' : (theme === 'dark' ? '#4B5563' : '#DEE3EE'),
                                        color: theme === 'dark' ? '#F3F4F6' : '#12141A',
                                        animationDelay: `${idx * 80}ms`
                                    }}
                                >
                                    {option}
                                </button>
                            );
                        })}

                        {chatQuestions[currentQuestion].multiSelect && multiSelectTemp.length > 0 && (
                            <button
                                onClick={() => {
                                    const selected = multiSelectTemp.join(', ');
                                    setChatMessages(prev => [...prev, { type: 'user', content: selected }]);
                                    setShowOptions(false);
                                    setMultiSelectTemp([]);

                                    if (currentQuestion < chatQuestions.length - 1) {
                                        setTimeout(() => {
                                            addBotMessage(chatQuestions[currentQuestion + 1].question);
                                            setCurrentQuestion(prev => prev + 1);
                                        }, 600);
                                    } else {
                                        showFinalSummary();
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mt-4 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white hover:shadow-lg"
                            >
                                Continue →
                            </button>
                        )}
                    </div>
                )}

                {showOptions && chatQuestions[currentQuestion].textInput && (
                    <div className="pl-2 space-y-3">
                        <textarea
                            value={textInputValue}
                            onChange={(e) => setTextInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && textInputValue.trim()) {
                                    e.preventDefault();
                                    handleTextSubmit();
                                }
                            }}
                            className="w-full px-4 py-3 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            style={{ minHeight: '80px' }}
                            placeholder="Type your answer here..."
                        />
                        {!showSummary &&
                            <button
                                onClick={handleTextSubmit}
                                disabled={!textInputValue.trim()}
                                className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white hover:shadow-lg"
                            >
                                Continue →
                            </button>
                        }
                    </div>
                )}

                {showTextInput && (
                    <div className="pl-2">
                        <input
                            type="number"
                            value={textInputValue}
                            onChange={(e) => setTextInputValue(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="Enter number of months..."
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={!textInputValue.trim()}
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white hover:shadow-lg"
                        >
                            Submit →
                        </button>
                    </div>
                )}

                {showSummary && (
                    <div className="pt-4">
                        <button
                            onClick={handleNext}
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white hover:shadow-lg"
                        >
                            Continue →
                        </button>
                    </div>
                )}
            </div>
        );
    };

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
            className="relative min-h-screen overflow-hidden"
        >
            <div
                className="absolute inset-0"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(to bottom, #0F0F10 0%, #2E2E2E 100%)'
                        : 'linear-gradient(to bottom, #F2F5FB 0%, #FFFFFF 100%)'
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(ellipse at center 65%, rgba(37,97,229,0.30) 20%, rgba(37,97,229,0.00) 65%)'
                        : 'radial-gradient(ellipse at center 65%, rgba(37,97,229,0.25) 20%, rgba(37,97,229,0.00) 65%)'
                }}
            />

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
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

                    {currentStep !== 2 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {currentStep === 1 && 'Company Information'}
                                {currentStep === 3 && 'Integrations'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {currentStep === 1 && 'Tell us about your company'}
                                {currentStep === 3 && 'Connect your existing tools'}
                            </p>
                        </div>
                    )}

                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}

                    {currentStep !== 2 && (
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
                    )}

                    {currentStep === 2 && !showSummary && (
                        <div className="flex justify-start mt-8">
                            <button
                                onClick={handleBack}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

OnboardingStepper.displayName = 'OnboardingStepper';

export default OnboardingStepper;
