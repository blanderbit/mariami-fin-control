import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    TrendingUp,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    Zap,
    Target,
    Eye,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    HelpCircle,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    getBenchmarkConsumerConfidenceRequest,
    getBenchmarkEnergyUtilitiesRequest,
    getBenchmarkInflationRequest,
    getBenchmarkLongTermRateRequest,
    getBenchmarkRentIndexRequest,
    getBenchmarkShortTermRateRequest,
    getBenchmarkTaxBurdenRequest,
    getBenchmarkWageGrowthRequest
} from '../api/auth';

// Loading component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
        </div>
    );
};

// Loading overlay component for sections
const LoadingOverlay: React.FC<{ isLoading: boolean; children: React.ReactNode }> = ({ isLoading, children }) => {
    if (isLoading) {
        return (
            <div className="relative">
                <div className="opacity-50 pointer-events-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center space-y-2">
                        <LoadingSpinner size="lg" />
                        <span className="text-sm text-gray-600">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }
    return <>{children}</>;
};

interface MarketData {
    inflation: {
        value: number;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
    wageGrowth: {
        value: number;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
    ecommercePenetration: {
        value: string;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
    consumerConfidence: {
        value: number;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
    energyCosts: {
        value: string;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
    interestRate: {
        value: number;
        explanation: string;
        risk: string;
        opportunity: string;
        tooltip: string;
    };
}

interface BenchmarkKPI {
    title: string;
    yourValue: number;
    sectorNorm: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
    tooltip: string;
}

interface ExpenseMix {
    category: string;
    yourPct: number;
    sectorPct: number;
    deviation: number;
}

interface Signal {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    link: string;
}

interface SWOTItem {
    text: string;
}

interface SWOT {
    strengths: SWOTItem[];
    weaknesses: SWOTItem[];
    opportunities: SWOTItem[];
    threats: SWOTItem[];
}

interface PorterForce {
    name: string;
    description: string;
    pressure: 'low' | 'medium' | 'high';
}

const Benchmark: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'market' | 'strategic'>('market');
    const [activeMarketTab, setActiveMarketTab] = useState<'macro' | 'operating'>('macro');

    // Benchmark data states
    const [benchmarkData, setBenchmarkData] = useState({
        consumerConfidence: null,
        energyUtilities: null,
        inflation: null,
        longTermRate: null,
        rentIndex: null,
        shortTermRate: null,
        taxBurden: null,
        wageGrowth: null
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const hasLoadedRef = useRef(false);

    // Individual loading states for Market Overview cards
    const [isLoadingInflation, setIsLoadingInflation] = useState(false);
    const [isLoadingShortTermRate, setIsLoadingShortTermRate] = useState(false);
    const [isLoadingLongTermRate, setIsLoadingLongTermRate] = useState(false);
    const [isLoadingUnemployment, setIsLoadingUnemployment] = useState(false);
    const [isLoadingConsumerConfidence, setIsLoadingConsumerConfidence] = useState(false);
    const [isLoadingWageGrowth, setIsLoadingWageGrowth] = useState(false);
    const [isLoadingRentIndex, setIsLoadingRentIndex] = useState(false);
    const [isLoadingEnergyUtilities, setIsLoadingEnergyUtilities] = useState(false);
    const [isLoadingTaxBurden, setIsLoadingTaxBurden] = useState(false);

    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';
    const industry = company.profile?.industry || 'Services';


    // Individual loading functions for Market Overview cards
    const loadInflationData = async () => {
        setIsLoadingInflation(true);
        try {
            const data = await getBenchmarkInflationRequest();
            setBenchmarkData(prev => ({ ...prev, inflation: data }));
        } catch (error) {
            console.error('Failed to load inflation data:', error);
            setErrors(prev => ({ ...prev, inflation: 'Failed to load inflation data' }));
        } finally {
            setIsLoadingInflation(false);
        }
    };

    const loadShortTermRateData = async () => {
        setIsLoadingShortTermRate(true);
        try {
            const data = await getBenchmarkShortTermRateRequest();
            setBenchmarkData(prev => ({ ...prev, shortTermRate: data }));
        } catch (error) {
            console.error('Failed to load short-term rate data:', error);
            setErrors(prev => ({ ...prev, shortTermRate: 'Failed to load short-term rate data' }));
        } finally {
            setIsLoadingShortTermRate(false);
        }
    };

    const loadLongTermRateData = async () => {
        setIsLoadingLongTermRate(true);
        try {
            const data = await getBenchmarkLongTermRateRequest();
            setBenchmarkData(prev => ({ ...prev, longTermRate: data }));
        } catch (error) {
            console.error('Failed to load long-term rate data:', error);
            setErrors(prev => ({ ...prev, longTermRate: 'Failed to load long-term rate data' }));
        } finally {
            setIsLoadingLongTermRate(false);
        }
    };

    const loadUnemploymentData = async () => {
        setIsLoadingUnemployment(true);
        // Simulate loading since unemployment data is not available in API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoadingUnemployment(false);
    };

    const loadConsumerConfidenceData = async () => {
        setIsLoadingConsumerConfidence(true);
        try {
            const data = await getBenchmarkConsumerConfidenceRequest();
            setBenchmarkData(prev => ({ ...prev, consumerConfidence: data }));
        } catch (error) {
            console.error('Failed to load consumer confidence data:', error);
            setErrors(prev => ({ ...prev, consumerConfidence: 'Failed to load consumer confidence data' }));
        } finally {
            setIsLoadingConsumerConfidence(false);
        }
    };

    const loadWageGrowthData = async () => {
        setIsLoadingWageGrowth(true);
        try {
            const data = await getBenchmarkWageGrowthRequest();
            setBenchmarkData(prev => ({ ...prev, wageGrowth: data }));
        } catch (error) {
            console.error('Failed to load wage growth data:', error);
            setErrors(prev => ({ ...prev, wageGrowth: 'Failed to load wage growth data' }));
        } finally {
            setIsLoadingWageGrowth(false);
        }
    };

    const loadRentIndexData = async () => {
        setIsLoadingRentIndex(true);
        try {
            const data = await getBenchmarkRentIndexRequest();
            setBenchmarkData(prev => ({ ...prev, rentIndex: data }));
        } catch (error) {
            console.error('Failed to load rent index data:', error);
            setErrors(prev => ({ ...prev, rentIndex: 'Failed to load rent index data' }));
        } finally {
            setIsLoadingRentIndex(false);
        }
    };

    const loadEnergyUtilitiesData = async () => {
        setIsLoadingEnergyUtilities(true);
        try {
            const data = await getBenchmarkEnergyUtilitiesRequest();
            setBenchmarkData(prev => ({ ...prev, energyUtilities: data }));
        } catch (error) {
            console.error('Failed to load energy utilities data:', error);
            setErrors(prev => ({ ...prev, energyUtilities: 'Failed to load energy utilities data' }));
        } finally {
            setIsLoadingEnergyUtilities(false);
        }
    };

    const loadTaxBurdenData = async () => {
        setIsLoadingTaxBurden(true);
        try {
            const data = await getBenchmarkTaxBurdenRequest();
            setBenchmarkData(prev => ({ ...prev, taxBurden: data }));
        } catch (error) {
            console.error('Failed to load tax burden data:', error);
            setErrors(prev => ({ ...prev, taxBurden: 'Failed to load tax burden data' }));
        } finally {
            setIsLoadingTaxBurden(false);
        }
    };

    // Load all benchmark data
    useEffect(() => {
        // Prevent duplicate calls in StrictMode
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        const loadAllData = async () => {
            setLoading(true);
            await Promise.all([
                loadInflationData(),
                loadShortTermRateData(),
                loadLongTermRateData(),
                loadUnemploymentData(),
                loadConsumerConfidenceData(),
                loadWageGrowthData(),
                loadRentIndexData(),
                loadEnergyUtilitiesData(),
                loadTaxBurdenData()
            ]);
            setLoading(false);
        };

        loadAllData();
    }, []);

    const getUserCountryData = (apiData: any, indicator: string) => {
        if (!apiData?.data?.data || !user?.oecd_country) {
            return null;
        }

        const countryData = apiData.data.data.find(
            (item: any) => item.country === user.oecd_country && item.indicator === indicator
        );

        return countryData || null;
    };

    const formatValue = (value: number, unit: string) => {
        if (unit === '%') {
            return value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
        }
        return value.toString();
    };

    const getLatestPeriod = (apiData: any) => {
        if (!apiData?.data?.data) return null;

        const periods = apiData.data.data
            .map((item: any) => item.period)
            .filter((period: string, index: number, arr: string[]) => arr.indexOf(period) === index)
            .sort()
            .reverse();

        return periods[0] || null;
    };

    // Mock market data
    const marketData: MarketData = {
        inflation: {
            value: 3.8,
            explanation: 'Prices for rent, supplies and services are rising.',
            risk: 'If costs grow faster than sales, margins shrink.',
            opportunity: 'If you can pass prices to customers, revenues increase.',
            tooltip: 'Source: ONS'
        },
        wageGrowth: {
            value: 5.0,
            explanation: 'UK wages are rising faster than inflation.',
            risk: 'Payroll eats up a bigger share of Opex.',
            opportunity: 'Higher pay helps attract and retain skilled staff.',
            tooltip: 'Source: ONS / UK Parliament Briefing'
        },
        ecommercePenetration: {
            value: '27–28%',
            explanation: 'One in four purchases in the UK is now online.',
            risk: 'Offline sales lose share, marketing costs rise.',
            opportunity: 'New digital channels bring growth potential.',
            tooltip: 'Source: Statista / BRC'
        },
        consumerConfidence: {
            value: -19,
            explanation: 'Consumers remain cautious with discretionary spending.',
            risk: 'Restaurants, beauty and retail face weaker demand.',
            opportunity: 'Essentials remain stable; promotions can win hesitant customers.',
            tooltip: 'Source: GfK'
        },
        energyCosts: {
            value: '+46%',
            explanation: 'Business energy costs remain well above pre-crisis levels.',
            risk: 'Higher operating costs hit margins, especially in F&B and manufacturing.',
            opportunity: 'Energy efficiency measures cut waste and lower bills long term.',
            tooltip: 'Source: ONS / UK Gov Energy Stats'
        },
        interestRate: {
            value: 4.0,
            explanation: 'BoE rate remains above historic norms, though below 2023 peak.',
            risk: 'Loans and overdrafts are more expensive, limiting growth.',
            opportunity: 'Gradual easing in 2025 may reduce financing pressure.',
            tooltip: 'Source: Bank of England'
        }
    };

    // Mock benchmark KPIs
    const benchmarkKPIs: BenchmarkKPI[] = [
        {
            title: 'Operating Margin',
            yourValue: 8,
            sectorNorm: 13.5,
            unit: '%',
            status: 'warning',
            tooltip: 'Sector median 12–15%, your operating margin 8%'
        },
        {
            title: 'Cash Buffer',
            yourValue: 2.1,
            sectorNorm: 3.5,
            unit: 'months',
            status: 'warning',
            tooltip: 'Sector norm 3+ months, your buffer 2.1 months'
        },
        {
            title: 'DSO (Days Sales Outstanding)',
            yourValue: 42,
            sectorNorm: 30,
            unit: 'days',
            status: 'critical',
            tooltip: 'Sector norm 30 days, your DSO 42 days'
        }
    ];

    // Mock expense mix data
    const expenseMix: ExpenseMix[] = [
        { category: 'Payroll', yourPct: 55, sectorPct: 50, deviation: 5 },
        { category: 'Marketing', yourPct: 30, sectorPct: 20, deviation: 10 },
        { category: 'Rent', yourPct: 8, sectorPct: 12, deviation: -4 },
        { category: 'Software', yourPct: 4, sectorPct: 6, deviation: -2 },
        { category: 'Other', yourPct: 3, sectorPct: 12, deviation: -9 }
    ];

    // Mock signals
    const signals: Signal[] = [
        {
            id: '1',
            severity: 'critical',
            message: 'Cash buffer below 3 months - consider credit line',
            link: '/dashboard'
        },
        {
            id: '2',
            severity: 'warning',
            message: 'Net margin 3.3pp below sector median',
            link: '/dashboard'
        },
        {
            id: '3',
            severity: 'warning',
            message: 'DSO 12 days above sector average',
            link: '/revenues'
        },
        {
            id: '4',
            severity: 'info',
            message: 'Marketing spend 10pp above peers - review ROI',
            link: '/expenses'
        }
    ];

    // Mock SWOT analysis
    const swotAnalysis: SWOT = {
        strengths: [
            { text: 'Strong revenue growth vs sector average' },
            { text: 'Low rent costs compared to peers' }
        ],
        weaknesses: [
            { text: 'Net margin below sector median' },
            { text: 'Cash buffer <3 months, high DSO' }
        ],
        opportunities: [
            { text: 'E-commerce 28% share = online pivot opportunity' },
            { text: 'AI adoption can offset wage inflation' }
        ],
        threats: [
            { text: 'Wage inflation > revenue growth' },
            { text: 'Rising energy costs impacting margins' }
        ]
    };

    // Mock Porter's 5 Forces
    const porterForces: PorterForce[] = [
        {
            name: 'New Entrants',
            description: 'Moderate, barriers low in retail',
            pressure: 'medium'
        },
        {
            name: 'Suppliers',
            description: 'High: energy = 20% Opex in manufacturing',
            pressure: 'high'
        },
        {
            name: 'Buyers',
            description: 'Strong: DSO 42 days vs sector 30',
            pressure: 'high'
        },
        {
            name: 'Substitutes',
            description: 'High: delivery platforms vs restaurants',
            pressure: 'high'
        },
        {
            name: 'Rivalry',
            description: 'Intense: margins compressed to 4–6%',
            pressure: 'high'
        }
    ];

    const strategicInsights = [
        'Consider diversifying channels as online share grows',
        'Improve collection terms to reduce DSO gap vs peers',
        'AI adoption in manufacturing helps offset wage & energy costs'
    ];

    const industryInsights = [
        '📈 Payroll = 55% Opex vs sector 50%; wage growth +5% → margin squeeze',
        '🛒 E-commerce share 28% of retail → margin compression',
        '⚡ Energy costs rising faster than revenue growth'
    ];

    const formatCurrency = (amount: number, currency: string = baseCurrency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'critical':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good':
                return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
            default:
                return <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
        }
    };

    const getSignalIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
        }
    };

    const getPressureColor = (pressure: string) => {
        switch (pressure) {
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSectorContextBadge = () => {
        const badges = {
            'Services': 'Services: Digital transformation → efficiency gains',
            'E-commerce / Retail': 'Retail: Online sales = 28% → margins under pressure',
            'Manufacturing / Production': 'Manufacturing: Payroll & energy costs ↑',
            'Technology / SaaS / IT': 'Tech: AI adoption accelerating → competitive advantage',
            'Healthcare / Wellness / Beauty': 'Healthcare: Regulatory costs rising',
            'Hospitality / Food & Beverage': 'Hospitality: Labor shortage → wage inflation'
        };

        return badges[industry as keyof typeof badges] || 'Industry trends impacting margins';
    };

    // Prepare chart data for expense mix
    const expenseChartData = expenseMix.map(item => ({
        category: item.category,
        yours: item.yourPct,
        sector: item.sectorPct,
        deviation: item.deviation
    }));

    const renderMarketOverview = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Market Overview</h2>

                {/* Market Tab Selector */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveMarketTab('macro')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeMarketTab === 'macro'
                                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Macro Pulse
                    </button>
                    <button
                        onClick={() => setActiveMarketTab('operating')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeMarketTab === 'operating'
                                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Operating Pressure
                    </button>
                </div>
            </div>
            {/* Content based on active tab */}
            {activeMarketTab === 'macro' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Inflation Card */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Inflation (CPI)</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingInflation ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.inflation, 'inflation');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            3.8%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Interest rate short term */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Interest rate short term</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingShortTermRate ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.shortTermRate, 'short_term_rate');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            5.25%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Interest rate long term */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Interest rate long term</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingLongTermRate ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.longTermRate, 'long_term_rate');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            4.8%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Unemployment rate */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Unemployment rate</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingUnemployment ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                                {(() => {
                                    // Note: unemployment data not available in current API, using demo data
                                    return (
                                        <>
                                            4.2%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Consumer confidence */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Consumer confidence</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingConsumerConfidence ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.consumerConfidence, 'consumer_confidence');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            -19{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Wage growth */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Wage growth</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingWageGrowth ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.wageGrowth, 'wage_growth');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            +5.0%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Operating Pressure Cards */}

                    {/* Rent index */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Rent index</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingRentIndex ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.rentIndex, 'rent_index');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            +12%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Energy & Utilities */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Energy & Utilities</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingEnergyUtilities ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.energyUtilities, 'energy_utilities');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            +46%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Tax burden index */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tax burden index</h3>
                            <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            </div>
                        </div>
                        {isLoadingTaxBurden ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">
                                {(() => {
                                    const data = getUserCountryData(benchmarkData.taxBurden, 'tax_burden');
                                    if (data && data.previous_value && data.previous_period) {
                                        return (
                                            <>
                                                {data.previous_value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.previous_period})
                                                </span>
                                                {' - '}
                                                {data.value.toFixed(1)}{' '}
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                    ({data.period})
                                                </span>
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            34.3%{' '}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                (Demo)
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderBenchmarkCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {benchmarkKPIs.map((kpi, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-indigo-500 dark:border-indigo-400 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{kpi.title}</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {kpi.tooltip}
                            </div>
                        </div>
                    </div>

                    {/* Your Value - Large Display */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Value</span>
                            <div className={`flex items-center space-x-2 ${getStatusColor(kpi.status)}`}>
                                {getStatusIcon(kpi.status)}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {kpi.yourValue}{kpi.unit}
                        </div>
                    </div>

                    {/* Visual Comparison */}
                    <div className="space-y-4">
                        {/* Your Performance Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{kpi.yourValue}{kpi.unit}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                        kpi.status === 'good' ? 'bg-green-500' :
                                            kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{
                                        width: `${Math.min((kpi.yourValue / Math.max(kpi.yourValue, kpi.sectorNorm)) * 100, 100)}%`
                                    }}
                                ></div>
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Sector Benchmark Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sector Average</span>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.sectorNorm}{kpi.unit}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                                <div
                                    className="h-3 rounded-full bg-gray-400 dark:bg-gray-500 transition-all duration-500"
                                    style={{
                                        width: `${Math.min((kpi.sectorNorm / Math.max(kpi.yourValue, kpi.sectorNorm)) * 100, 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Performance Gap Indicator */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Performance Gap</span>
                                <div className="flex items-center space-x-1">
                                    {kpi.title === 'DSO (Days Sales Outstanding)' ? (
                                        // For DSO, lower is better, so we use (sector - you) / you * 100
                                        kpi.sectorNorm > kpi.yourValue ? (
                                            <>
                                                <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400" />
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{(((kpi.sectorNorm - kpi.yourValue) / kpi.yourValue) * 100).toFixed(1)}%
                        </span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {(((kpi.sectorNorm - kpi.yourValue) / kpi.yourValue) * 100).toFixed(1)}%
                        </span>
                                            </>
                                        )
                                    ) : (
                                        // For other metrics, higher is better
                                        kpi.yourValue > kpi.sectorNorm ? (
                                            <>
                                                <ArrowUpRight className="w-4 h-4 text-green-500 dark:text-green-400" />
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{((kpi.yourValue - kpi.sectorNorm) / kpi.sectorNorm * 100).toFixed(1)}%
                      </span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {((kpi.yourValue - kpi.sectorNorm) / kpi.sectorNorm * 100).toFixed(1)}%
                      </span>
                                            </>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderBenchmarkCards_old = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {benchmarkKPIs.map((kpi, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {kpi.tooltip}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">You</span>
                            <span className="text-sm font-medium">{kpi.yourValue}{kpi.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${getStatusColor(kpi.status).replace('text-', 'bg-')}`}
                                style={{ width: `${Math.min((kpi.yourValue / Math.max(kpi.yourValue, kpi.sectorNorm)) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Sector</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.sectorNorm}{kpi.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-gray-400"
                                style={{ width: `${Math.min((kpi.sectorNorm / Math.max(kpi.yourValue, kpi.sectorNorm)) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );

    const renderSectorContext = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sector Context</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800">{getSectorContextBadge()}</span>
                </div>
            </div>
        </div>
    );

    const renderExpenseMix = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Mix vs Peers</h2>
            <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value: number, name: string) => [`${value}%`, name === 'yours' ? 'Your %' : 'Sector %']} />
                        <Bar dataKey="yours" fill="#4f46e5" name="yours" />
                        <Bar dataKey="sector" fill="#9ca3af" name="sector" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-2">
                {expenseMix.filter(item => Math.abs(item.deviation) >= 5).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-800">
              {item.category} {item.yourPct}% vs peers {item.sectorPct}%
              ({item.deviation > 0 ? '+' : ''}{item.deviation}pp)
            </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderIndustryInsights = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Industry Insights</h2>
            <div className="space-y-3">
                {industryInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-indigo-800">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSignalsFeed = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Signals Feed</h2>
            <div className="space-y-3">
                {signals.map((signal) => (
                    <button
                        key={signal.id}
                        onClick={() => window.location.href = signal.link}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-center space-x-3">
                            {getSignalIcon(signal.severity)}
                            <span className="font-medium text-gray-900">{signal.message}</span>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSWOTAnalysis = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">SWOT Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Strengths
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.strengths.map((item, index) => (
                            <li key={index} className="text-sm text-green-700">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Weaknesses
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.weaknesses.map((item, index) => (
                            <li key={index} className="text-sm text-red-700">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Opportunities
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.opportunities.map((item, index) => (
                            <li key={index} className="text-sm text-blue-700">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Threats
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.threats.map((item, index) => (
                            <li key={index} className="text-sm text-yellow-700">• {item.text}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderPorterAnalysis = () => (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Porter's 5 Forces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {porterForces.map((force, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getPressureColor(force.pressure)}`}>
                        <h3 className="font-semibold mb-2">{force.name}</h3>
                        <p className="text-sm">{force.description}</p>
                        <div className="mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPressureColor(force.pressure)}`}>
                {force.pressure.charAt(0).toUpperCase() + force.pressure.slice(1)} pressure
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStrategicInsights = () => (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Strategic Insights</h2>
            <div className="space-y-3">
                {strategicInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Zap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-800">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Benchmark</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Compare your performance against industry standards
                        {user.oecd_country && (
                            <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                                {user.oecd_country}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Tab Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'market'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            Market Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('strategic')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'strategic'
                                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            Strategic Analysis
                        </button>
                    </div>

                </div>
            </div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Some benchmark data failed to load
                        </h3>
                    </div>
                    <div className="mt-2 space-y-1">
                        {Object.entries(errors).map(([key, error]) => (
                            <p key={key} className="text-sm text-red-700 dark:text-red-300">
                                • {error}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Debug: Benchmark Data */}
            {!loading && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Benchmark Data Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(benchmarkData).map(([key, data]) => (
                            <div key={key} className="flex items-center space-x-2">
                                {data ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            {activeTab === 'market' ? (
                <>
                    {renderMarketOverview()}
                    {renderBenchmarkCards()}
                    {/*{renderSectorContext()}*/}
                    {/*{renderExpenseMix()}*/}
                    {/*{renderIndustryInsights()}*/}
                    {/*{renderSignalsFeed()}*/}
                </>
            ) : (
                <>
                    {/*{renderSWOTAnalysis()}*/}
                    {/*{renderPorterAnalysis()}*/}
                    {/*{renderStrategicInsights()}*/}
                </>
            )}
        </div>
    );
};

export default Benchmark;

