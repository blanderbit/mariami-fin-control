import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    DollarSign,
    Clock,
    Shield,
    Users,
    Zap,
    Target,
    Eye,
    BarChart3,
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
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

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
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'market' | 'strategic'>('market');

    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';
    const industry = company.profile?.industry || 'Services';

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
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'good':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getSignalIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    const getPressureColor = (pressure: string) => {
        switch (pressure) {
            case 'low':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
            case 'high':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Inflation Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Inflation</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.inflation.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                        {marketData.inflation.value}% <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(Aug 2025)</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.inflation.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.inflation.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.inflation.opportunity}</p>
                        </div>
                    </div>
                </div>

                {/* Wage Growth Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Wage Growth</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.wageGrowth.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">
                        +{marketData.wageGrowth.value}% <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">YoY (Jun 2025)</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.wageGrowth.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.wageGrowth.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.wageGrowth.opportunity}</p>
                        </div>
                    </div>
                </div>

                {/* E-commerce Penetration Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">E-commerce Penetration</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.ecommercePenetration.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {marketData.ecommercePenetration.value} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">of retail (2025)</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.ecommercePenetration.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.ecommercePenetration.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.ecommercePenetration.opportunity}</p>
                        </div>
                    </div>
                </div>

                {/* Consumer Confidence Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Consumer Confidence</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.consumerConfidence.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                        {marketData.consumerConfidence.value} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(Sep 2025)</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.consumerConfidence.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.consumerConfidence.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.consumerConfidence.opportunity}</p>
                        </div>
                    </div>
                </div>

                {/* Energy & Utilities Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Energy & Utilities</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.energyCosts.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                        {marketData.energyCosts.value} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">vs pre-crisis</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.energyCosts.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.energyCosts.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.energyCosts.opportunity}</p>
                        </div>
                    </div>
                </div>

                {/* Interest Rate Card */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Interest Rate</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {marketData.interestRate.tooltip}
                            </div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">
                        {marketData.interestRate.value}% <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">(Sep 2025)</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{marketData.interestRate.explanation}</p>
                        <div className="flex items-start space-x-2">
                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 dark:text-red-300">{marketData.interestRate.risk}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-green-700 dark:text-green-300">{marketData.interestRate.opportunity}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBenchmarkCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {benchmarkKPIs.map((kpi, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{kpi.title}</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
                                    className="h-3 rounded-full bg-gray-400 transition-all duration-500"
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
                                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{(((kpi.sectorNorm - kpi.yourValue) / kpi.yourValue) * 100).toFixed(1)}%
                        </span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {(((kpi.sectorNorm - kpi.yourValue) / kpi.yourValue) * 100).toFixed(1)}%
                        </span>
                                            </>
                                        )
                                    ) : (
                                        // For other metrics, higher is better
                                        kpi.yourValue > kpi.sectorNorm ? (
                                            <>
                                                <ArrowUpRight className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{((kpi.yourValue - kpi.sectorNorm) / kpi.sectorNorm * 100).toFixed(1)}%
                      </span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownRight className="w-4 h-4 text-red-500" />
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
                        <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                        <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {kpi.tooltip}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">You</span>
                            <span className="text-sm font-medium">{kpi.yourValue}{kpi.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${getStatusColor(kpi.status).replace('text-', 'bg-')}`}
                                style={{ width: `${Math.min((kpi.yourValue / Math.max(kpi.yourValue, kpi.sectorNorm)) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Sector</span>
                            <span className="text-sm font-medium text-gray-600">{kpi.sectorNorm}{kpi.unit}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Sector Context</h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">{getSectorContextBadge()}</span>
                </div>
            </div>
        </div>
    );

    const renderExpenseMix = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Expense Mix vs Peers</h2>
            <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="category" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <YAxis tickFormatter={(value) => `${value}%`} stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                        <Tooltip 
                            formatter={(value: number, name: string) => [`${value}%`, name === 'yours' ? 'Your %' : 'Sector %']}
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#111827'
                            }}
                        />
                        <Bar dataKey="yours" fill="#4f46e5" name="yours" />
                        <Bar dataKey="sector" fill="#9ca3af" name="sector" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-2">
                {expenseMix.filter(item => Math.abs(item.deviation) >= 5).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {item.category} {item.yourPct}% vs peers {item.sectorPct}%
              ({item.deviation > 0 ? '+' : ''}{item.deviation}pp)
            </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderIndustryInsights = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Industry Insights</h2>
            <div className="space-y-3">
                {industryInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                        <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSignalsFeed = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Signals Feed</h2>
            <div className="space-y-3">
                {signals.map((signal) => (
                    <button
                        key={signal.id}
                        onClick={() => window.location.href = signal.link}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-center space-x-3">
                            {getSignalIcon(signal.severity)}
                            <span className="font-medium text-gray-900 dark:text-gray-100">{signal.message}</span>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSWOTAnalysis = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">SWOT Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Strengths
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.strengths.map((item, index) => (
                            <li key={index} className="text-sm text-green-700 dark:text-green-300">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Weaknesses
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.weaknesses.map((item, index) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-300">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Opportunities
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.opportunities.map((item, index) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300">• {item.text}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Threats
                    </h3>
                    <ul className="space-y-2">
                        {swotAnalysis.threats.map((item, index) => (
                            <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">• {item.text}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderPorterAnalysis = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Porter's 5 Forces</h2>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Strategic Insights</h2>
            <div className="space-y-3">
                {strategicInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-800 dark:text-purple-200">{insight}</p>
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
                    <p className="text-gray-600 dark:text-gray-400">Compare your performance against industry standards</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Tab Selector */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'market'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            Market Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('strategic')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'strategic'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            Strategic Analysis
                        </button>
                    </div>

                </div>
            </div>

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
