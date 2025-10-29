import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Users,
    Zap,
    Building,
    ArrowRight,
    FileText,
    Clock,
    CreditCard,
    ShoppingCart,
    Target,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    XCircle,
    Info
} from 'lucide-react';
import LogoIcon from '../assets/LogoIcon';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ConversationalAI from '../components/ConversationalAI';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    parseISO,
    startOfYear,
    endOfDay
} from 'date-fns';
import {
    getPnLAnalysisRequest,
    PnLAnalysisResponse,
    PnLDataItem,
    getInvoicesAnalysisRequest,
    InvoicesAnalysisResponse,
    getCashAnalysisRequest,
    CashAnalysisResponse,
    getExpenseBreakdownRequest,
    ExpenseBreakdownResponse,
    getAIInsightsRequest,
    AIInsightsResponse,
    OnboardingData
} from '../api/auth';

interface PulseKPI {
    revenue: number;
    revenue_mom: number;
    revenue_yoy: number;
    expenses_total: number;
    top_expense_category: string;
    net_profit: number;
    profit_margin: number;
    gross_margin: number;
    operating_margin: number;
    overdue_invoices: number;
    overdue_count: number;
    ending_cash: number;
    cash_buffer_months: number;
    currency: string;
    cash_card_title: string;
}

interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    link: string;
}

interface ChartData {
    months: string[];
    revenue: number[];
    expenses_total: number[];
    expenses_by_category: {
        category: string;
        series: number[];
    }[];
    story: string;
}

interface ExpenseChip {
    category: string;
    amount: number;
    pct: number;
    icon: string;
    spike?: boolean;
    isNew?: boolean;
}

const DashboardNew: React.FC = () => {
    const { theme } = useTheme();
    const { onboardingStatus: authOnboardingStatus } = useAuth();

    // UI States
    const [scenarioMonths, setScenarioMonths] = useState(0);
    const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
    const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

    // Period selection state
    const [selectedPeriod, setSelectedPeriod] = useState('This month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showCustomRange, setShowCustomRange] = useState(false);

    // API Data States
    const [pnlData, setPnlData] = useState<PnLAnalysisResponse | null>(null);
    const [isLoadingPnl, setIsLoadingPnl] = useState(false);
    const [pnlError, setPnlError] = useState<string | null>(null);

    const [invoicesData, setInvoicesData] = useState<InvoicesAnalysisResponse | null>(null);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);

    const [cashData, setCashData] = useState<CashAnalysisResponse | null>(null);
    const [isLoadingCash, setIsLoadingCash] = useState(false);
    const [cashError, setCashError] = useState<string | null>(null);

    const [expenseBreakdownData, setExpenseBreakdownData] = useState<ExpenseBreakdownResponse | null>(null);
    const [isLoadingExpenseBreakdown, setIsLoadingExpenseBreakdown] = useState(false);
    const [expenseBreakdownError, setExpenseBreakdownError] = useState<string | null>(null);

    const [aiInsightsData, setAiInsightsData] = useState<AIInsightsResponse | null>(null);
    const [isLoadingAiInsights, setIsLoadingAiInsights] = useState(false);
    const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);

    const [profileData, setProfileData] = useState<OnboardingData | null>(null);
    const [calculatedEndingCash, setCalculatedEndingCash] = useState(0);
    const [cashCardTitle, setCashCardTitle] = useState('Net Cash');
    const [cashBufferMonths, setCashBufferMonths] = useState(0);

    // Date range picker states
    const [showOverdueDatePicker, setShowOverdueDatePicker] = useState(false);
    const [showCashDatePicker, setShowCashDatePicker] = useState(false);
    const [overdueStartDate, setOverdueStartDate] = useState('');
    const [overdueEndDate, setOverdueEndDate] = useState('');
    const [cashStartDate, setCashStartDate] = useState('');
    const [cashEndDate, setCashEndDate] = useState('');

    // Ref to track loading state
    const isLoadingRef = useRef(false);

    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: baseCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Function to get period dates based on selected period
    const getPeriodDates = (period: string) => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case 'This month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'Last 3 months':
                startDate = startOfMonth(subMonths(now, 2));
                endDate = endOfMonth(now);
                break;
            case 'Last 6 months':
                startDate = startOfMonth(subMonths(now, 5));
                endDate = endOfMonth(now);
                break;
            case 'Last 12 months':
                startDate = startOfMonth(subMonths(now, 11));
                endDate = endOfMonth(now);
                break;
            case 'Year to date':
                startDate = startOfYear(now);
                endDate = endOfDay(now);
                break;
            case 'Custom range':
                if (customStartDate && customEndDate) {
                    startDate = parseISO(customStartDate);
                    endDate = parseISO(customEndDate);
                } else {
                    startDate = startOfMonth(now);
                    endDate = endOfMonth(now);
                }
                break;
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
        }

        return {
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd')
        };
    };

    // Handle period change
    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        if (period === 'Custom range') {
            setShowCustomRange(true);
        } else {
            setShowCustomRange(false);
        }
    };

    // Get current period dates
    const periodDates = getPeriodDates(selectedPeriod);

    // Load P&L data
    const loadPnLData = async (dates?: {start_date: string, end_date: string}) => {
        try {
            setIsLoadingPnl(true);
            setPnlError(null);
            const requestDates = dates || periodDates;
            const response = await getPnLAnalysisRequest(requestDates);

            if (response && response.data && response.data.pnl_data && response.data.pnl_data.length > 0) {
                setPnlData(response);
            } else {
                setPnlData({
                    status: 'success',
                    code: 200,
                    data: {
                        pnl_data: [],
                        total_revenue: 0,
                        total_expenses: 0,
                        net_profit: 0,
                        month_change: {
                            revenue: {change: 0, percentage_change: 0},
                            expenses: {change: 0, percentage_change: 0},
                            net_profit: {change: 0, percentage_change: 0}
                        },
                        year_change: {
                            revenue: {change: 0, percentage_change: 0},
                            expenses: {change: 0, percentage_change: 0},
                            net_profit: {change: 0, percentage_change: 0}
                        },
                        period: requestDates,
                        ai_insights: 'No data available for the selected period.'
                    },
                    message: null
                });
            }
        } catch (error) {
            console.error('Failed to load P&L data:', error);
            setPnlError('Failed to load financial data. Please try again.');
            setPnlData(null);
        } finally {
            setIsLoadingPnl(false);
        }
    };

    // Load Invoices Analysis data
    const loadInvoicesData = async (dates: {start_date: string, end_date: string}) => {
        try {
            setIsLoadingInvoices(true);
            setInvoicesError(null);
            const response = await getInvoicesAnalysisRequest(dates);
            setInvoicesData(response);
        } catch (error) {
            console.error('Failed to load invoices analysis:', error);
            setInvoicesError('Failed to load invoices data. Please try again.');
            setInvoicesData(null);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    // Load Cash Analysis data
    const loadCashData = async (dates: {start_date: string, end_date: string}) => {
        try {
            setIsLoadingCash(true);
            setCashError(null);
            const response = await getCashAnalysisRequest(dates);
            setCashData(response);
        } catch (error) {
            console.error('Failed to load cash analysis:', error);
            setCashError('Failed to load cash data. Please try again.');
            setCashData(null);
        } finally {
            setIsLoadingCash(false);
        }
    };

    // Load Expense Breakdown data
    const loadExpenseBreakdownData = async (dates: {start_date: string, end_date: string}) => {
        try {
            setIsLoadingExpenseBreakdown(true);
            setExpenseBreakdownError(null);
            const response = await getExpenseBreakdownRequest(dates);
            setExpenseBreakdownData(response);
        } catch (error) {
            console.error('Failed to load expense breakdown:', error);
            setExpenseBreakdownError('Failed to load expense breakdown data. Please try again.');
            setExpenseBreakdownData(null);
        } finally {
            setIsLoadingExpenseBreakdown(false);
        }
    };

    // Load AI Insights data
    const loadAiInsightsData = async (dates: {start_date: string, end_date: string}) => {
        try {
            setIsLoadingAiInsights(true);
            setAiInsightsError(null);
            const response = await getAIInsightsRequest(dates);
            setAiInsightsData(response);
        } catch (error) {
            console.error('Failed to load AI insights:', error);
            setAiInsightsError('Failed to load AI insights. Please try again.');
            setAiInsightsData(null);
        } finally {
            setIsLoadingAiInsights(false);
        }
    };

    // Calculate ending cash
    const calculateEndingCash = useCallback(() => {
        if (!cashData) {
            setCalculatedEndingCash(0);
            setCashCardTitle('Net Cash');
            setCashBufferMonths(0);
            return;
        }

        const totalIncome = parseFloat(cashData.data.total_income) || 0;
        const totalExpense = parseFloat(cashData.data.total_expense) || 0;

        if (profileData?.current_cash) {
            const currentCash = parseFloat(profileData.current_cash);
            const endingCash = currentCash - totalExpense + totalIncome;
            setCalculatedEndingCash(endingCash);
            setCashCardTitle('Ending Cash');

            // Calculate cash buffer
            calculateCashBuffer(endingCash, totalExpense);
        } else {
            const netCash = totalIncome - totalExpense;
            setCalculatedEndingCash(netCash);
            setCashCardTitle('Net Cash');
            setCashBufferMonths(0);
        }
    }, [cashData, profileData]);

    // Calculate cash buffer
    const calculateCashBuffer = useCallback((endingCash: number, totalExpense: number) => {
        if (!pnlData?.data?.pnl_data || pnlData.data.pnl_data.length === 0) {
            setCashBufferMonths(0);
            return;
        }

        const cogsData = pnlData.data.pnl_data.reduce((sum, item) => {
            return sum + (item.COGS || 0);
        }, 0);

        const periodDates = getPeriodDates(selectedPeriod);
        const startDate = new Date(periodDates.start_date);
        const endDate = new Date(periodDates.end_date);
        const monthsAmount = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

        const opex = (totalExpense - cogsData) / monthsAmount;

        if (opex > 0) {
            const buffer = endingCash / opex;
            setCashBufferMonths(Math.round(buffer * 10) / 10);
        } else {
            setCashBufferMonths(0);
        }
    }, [pnlData, selectedPeriod, customStartDate, customEndDate]);

    // Apply custom range
    const applyCustomRange = async () => {
        if (customStartDate && customEndDate && customStartDate <= customEndDate) {
            const dates = {start_date: customStartDate, end_date: customEndDate};

            await Promise.all([
                loadPnLData(dates),
                loadInvoicesData(dates),
                loadCashData(dates),
                loadExpenseBreakdownData(dates)
            ]);

            await loadAiInsightsData(dates);
        }
    };

    // Load profile data from AuthContext
    useEffect(() => {
        if (authOnboardingStatus && authOnboardingStatus.profile) {
            setProfileData(authOnboardingStatus.profile);
        }
    }, [authOnboardingStatus]);

    // Calculate ending cash when cash data or profile data changes
    useEffect(() => {
        calculateEndingCash();
    }, [cashData, profileData, calculateEndingCash]);

    // Load data when period changes
    useEffect(() => {
        const loadAllData = async () => {
            if (selectedPeriod !== 'Custom range') {
                if (isLoadingRef.current) {
                    return;
                }

                isLoadingRef.current = true;
                const dates = getPeriodDates(selectedPeriod);

                try {
                    await Promise.all([
                        loadPnLData(dates),
                        loadInvoicesData(dates),
                        loadCashData(dates),
                        loadExpenseBreakdownData(dates)
                    ]);

                    await loadAiInsightsData(dates);
                } finally {
                    isLoadingRef.current = false;
                }
            }
        };

        loadAllData();
    }, [selectedPeriod]);

    // Expense data from API or fallback
    const expenseData = useMemo(() => {
        if (expenseBreakdownData) {
            const getIcon = (category: string) => {
                switch (category) {
                    case 'Payroll': return Users;
                    case 'Rent': return Building;
                    case 'Marketing': return Zap;
                    case 'COGS': return ShoppingCart;
                    default: return Target;
                }
            };

            const totalExpenses = Object.values(expenseBreakdownData).reduce((sum, category) => {
                return sum + (category ? parseFloat(category.total_amount) : 0);
            }, 0);

            const colors = ['#3A75F2', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
            let colorIndex = 0;

            const data = Object.entries(expenseBreakdownData)
                .map(([category, data]) => {
                    const amount = data ? parseFloat(data.total_amount) : 0;
                    if (amount > 0) {
                        return {
                            name: category,
                            value: amount,
                            color: colors[colorIndex++ % colors.length],
                            icon: getIcon(category),
                            pct: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0
                        };
                    }
                    return null;
                })
                .filter(item => item !== null)
                .sort((a, b) => (b?.value || 0) - (a?.value || 0));

            return data as { name: string; value: number; color: string; icon: any; pct: number; }[];
        }

        // Fallback data
        return [
        { name: 'Payroll', value: 15000, color: '#3A75F2', icon: Users, pct: 46.9 },
        { name: 'Rent', value: 5000, color: '#6366F1', icon: Building, pct: 15.6 },
        { name: 'Marketing', value: 4000, color: '#8B5CF6', icon: Zap, pct: 12.5 },
        { name: 'COGS', value: 8000, color: '#EC4899', icon: ShoppingCart, pct: 25.0 }
    ];
    }, [expenseBreakdownData]);

    // Revenue vs Expenses data from API or fallback
    const revenueExpenseData = useMemo(() => {
        if (pnlData?.data?.pnl_data && pnlData.data.pnl_data.length > 0) {
            return pnlData.data.pnl_data.map(item => {
                const expenses = (item.COGS || 0) + (item.Payroll || 0) + (item.Rent || 0) +
                                (item.Marketing || 0) + (item.Other_Expenses || 0);
                return {
                    month: format(parseISO(item.Month), 'MMM'),
                    revenue: item.Revenue || 0,
                    expenses: expenses
                };
            });
        }

        // Fallback data
        return [
        { month: 'Oct', revenue: 42000, expenses: 28000 },
        { month: 'Nov', revenue: 45000, expenses: 30000 },
        { month: 'Dec', revenue: 48000, expenses: 32000 },
        { month: 'Jan', revenue: 50000, expenses: 40000 },
        { month: 'Feb', revenue: 45000, expenses: 38000 },
        { month: 'Mar', revenue: 47000, expenses: 42000 }
    ];
    }, [pnlData]);

    const getScenarioData = (months: number) => {
        // TODO: Replace with real calculation from API data
        const baseRevenue = 47000;
        const baseExpenses = 42000;
        const baseCash = 125000;
        const burnRate = 8000;

        return {
            revenue: baseRevenue + (months * 2000),
            expenses: baseExpenses + (months * 3500),
            cash: baseCash - (months * burnRate),
            runway: (baseCash - (months * burnRate)) / burnRate,
            netProfit: (baseRevenue + (months * 2000)) - (baseExpenses + (months * 3500)),
            profitMargin: (((baseRevenue + (months * 2000)) - (baseExpenses + (months * 3500))) / (baseRevenue + (months * 2000))) * 100
        };
    };

    const scenarioData = useMemo(() => getScenarioData(scenarioMonths), [scenarioMonths]);

    // Generate KPI data from P&L analysis (from Dashboard)
    const pulseKPIs = useMemo((): PulseKPI => {
        if (!pnlData?.data) {
            // Return empty data if no backend data
            return {
                revenue: 0,
                revenue_mom: 0,
                revenue_yoy: 0,
                expenses_total: 0,
                top_expense_category: '',
                net_profit: 0,
                profit_margin: 0,
                gross_margin: 0,
                operating_margin: 0,
                overdue_invoices: 0,
                overdue_count: 0,
                ending_cash: 0,
                cash_buffer_months: 0,
                currency: baseCurrency,
                cash_card_title: 'Net Cash'
            };
        }

        const data = pnlData.data;
        const profitMargin = data.total_revenue > 0 ? Math.round(((data.net_profit / data.total_revenue) * 100) * 100) / 100 : 0;

        // Use gross margin from API
        const grossMargin = data.gross_margin || 0;

        // Parse operating margin from API (it comes as string like "10-15%")
        // Extract the first number as the sector operating margin
        const operatingMarginStr = data.operating_margin || "0%";
        const operatingMarginMatch = operatingMarginStr.match(/(\d+(?:\.\d+)?)/);
        const operatingMargin = operatingMarginMatch ? parseFloat(operatingMarginMatch[1]) : 0;

        // Find top expense category
        const latestMonth = data.pnl_data && data.pnl_data.length > 0 ? data.pnl_data[data.pnl_data.length - 1] : null;
        const expenses = [
            {name: 'Payroll', amount: latestMonth?.Payroll || 0},
            {name: 'COGS', amount: latestMonth?.COGS || 0},
            {name: 'Marketing', amount: latestMonth?.Marketing || 0},
            {name: 'Rent', amount: latestMonth?.Rent || 0},
            {name: 'Other_Expenses', amount: latestMonth?.Other_Expenses || 0}
        ];
        const topExpense = expenses.reduce((max, current) =>
            current.amount > max.amount ? current : max
        );

        return {
            revenue: data.total_revenue || 0,
            revenue_mom: data.month_change?.revenue?.percentage_change || 0,
            revenue_yoy: data.year_change?.revenue?.percentage_change || 0,
            expenses_total: data.total_expenses || 0,
            top_expense_category: topExpense.name || '',
            net_profit: data.net_profit || 0,
            profit_margin: profitMargin || 0,
            gross_margin: grossMargin || 0,
            operating_margin: operatingMargin || 0,
            overdue_invoices: invoicesData?.data?.overdue_invoices?.total_amount || 0,
            overdue_count: invoicesData?.data?.overdue_invoices?.total_count || 0,
            ending_cash: calculatedEndingCash,
            cash_buffer_months: cashBufferMonths,
            currency: baseCurrency,
            cash_card_title: cashCardTitle
        };
    }, [pnlData, invoicesData, cashData, baseCurrency, calculatedEndingCash, cashCardTitle, cashBufferMonths]);

    // Animated values for Business Pulse cards
    const animatedRevenue = useAnimatedNumber(pulseKPIs.revenue, { duration: 1200, delay: 0 });
    const animatedExpenses = useAnimatedNumber(pulseKPIs.expenses_total, { duration: 1200, delay: 200 });
    const animatedNetProfit = useAnimatedNumber(pulseKPIs.net_profit, { duration: 1200, delay: 400 });
    const animatedOverdue = useAnimatedNumber(pulseKPIs.overdue_invoices, { duration: 1200, delay: 600 });
    const animatedCash = useAnimatedNumber(pulseKPIs.ending_cash, { duration: 1200, delay: 800 });

    // Chart data from Dashboard
    const chartData = useMemo((): ChartData => {
        if (!pnlData?.data?.pnl_data || pnlData.data.pnl_data.length === 0) {
            // Return empty data if no backend data
            return {
                months: [],
                revenue: [],
                expenses_total: [],
                expenses_by_category: [],
                story: ""
            };
        }

        // Use real P&L data
        const pnlDataItems = pnlData.data.pnl_data;

        const months = pnlDataItems.map(item => format(parseISO(item.Month), 'yyyy-MM'));
        const revenue = pnlDataItems.map(item => item.Revenue || 0);
        const expenses_total = pnlDataItems.map(item =>
            (item.COGS || 0) + (item.Payroll || 0) + (item.Rent || 0) + (item.Marketing || 0) + (item.Other_Expenses || 0)
        );

        const expenses_by_category = [
            {category: 'COGS', series: pnlDataItems.map(item => item.COGS || 0)},
            {category: 'Payroll', series: pnlDataItems.map(item => item.Payroll || 0)},
            {category: 'Rent', series: pnlDataItems.map(item => item.Rent || 0)},
            {category: 'Marketing', series: pnlDataItems.map(item => item.Marketing || 0)},
            {category: 'Other_Expenses', series: pnlDataItems.map(item => item.Other_Expenses || 0)}
        ];

        return {
            months,
            revenue,
            expenses_total,
            expenses_by_category,
            story: pnlData.data.ai_insights || ""
        };
    }, [pnlData]);

    // Prepare stacked chart data
    const stackedChartData = useMemo(() => {
        return chartData.months.map((month, index) => {
            const dataPoint: any = {
                month: format(parseISO(month + '-01'), 'MMM yyyy'),
                revenue: chartData.revenue[index],
                expenses_total: chartData.expenses_total[index]
            };

            // Add each expense category
            chartData.expenses_by_category.forEach(category => {
                dataPoint[category.category] = category.series[index];
            });

            return dataPoint;
        });
    }, [chartData]);

    const expenseColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

    // Expense chips functionality from Dashboard
    const getChipColor = (pct: number, spike?: boolean, isNew?: boolean) => {
        // Base color #2762ea with different opacity based on percentage
        const baseColor = '#2762ea';

        // Calculate opacity based on percentage (higher % = more saturated)
        let opacity = 0.1;
        if (pct >= 30) {
            opacity = 0.8;
        } else if (pct >= 20) {
            opacity = 0.6;
        } else if (pct >= 15) {
            opacity = 0.5;
        } else if (pct >= 10) {
            opacity = 0.4;
        } else if (pct >= 5) {
            opacity = 0.3;
        } else {
            opacity = 0.2;
        }

        // If spike, increase opacity for more saturation
        if (spike) {
            opacity = Math.min(opacity + 0.3, 1);
        }

        // If new, add green tint
        if (isNew) {
            return {
                backgroundColor: `rgba(34, 197, 94, ${opacity})`,
                borderColor: `rgba(34, 197, 94, ${opacity + 0.2})`,
                color: '#ffffff'
            };
        }

        return {
            backgroundColor: `rgba(39, 98, 234, ${opacity})`,
            borderColor: `rgba(39, 98, 234, ${opacity + 0.2})`,
            color: '#ffffff'
        };
    };

    const expenseChips = useMemo((): ExpenseChip[] => {
        // Use expense breakdown data if available, otherwise fallback to P&L data
        if (expenseBreakdownData) {
            const getIcon = (category: string) => {
                switch (category) {
                    case 'Payroll':
                        return '💼';
                    case 'Rent':
                        return '🏢';
                    case 'Marketing':
                        return '📣';
                    case 'COGS':
                        return '📦';
                    case 'Software':
                        return '💻';
                    case 'Utilities':
                        return '🔌';
                    default:
                        return '⋯';
                }
            };

            // Calculate total expenses for percentage calculation
            const totalExpenses = Object.values(expenseBreakdownData).reduce((sum, category) => {
                return sum + (category ? parseFloat(category.total_amount) : 0);
            }, 0);

            // Helper function to round percentage to 1 decimal place
            const roundPercentage = (value: number) => Math.round(value * 10) / 10;

            const chips: ExpenseChip[] = [];

            Object.entries(expenseBreakdownData).forEach(([category, data]) => {
                const amount = data ? parseFloat(data.total_amount) : 0;
                if (data && amount > 0) {
                    chips.push({
                        category,
                        amount: amount,
                        pct: totalExpenses > 0 ? roundPercentage((amount / totalExpenses) * 100) : 0,
                        icon: getIcon(category),
                        spike: data.spike,
                        isNew: data.new
                    });
                }
            });

            return chips.sort((a, b) => b.amount - a.amount); // Sort by amount descending
        }

        // Fallback to P&L data if expense breakdown is not available
        if (!pnlData?.data?.pnl_data || pnlData.data.pnl_data.length === 0) {
            return [];
        }

        const latestMonth = pnlData.data.pnl_data[pnlData.data.pnl_data.length - 1];
        const expenses = [
            {name: 'Payroll', amount: latestMonth?.Payroll || 0},
            {name: 'COGS', amount: latestMonth?.COGS || 0},
            {name: 'Marketing', amount: latestMonth?.Marketing || 0},
            {name: 'Rent', amount: latestMonth?.Rent || 0},
            {name: 'Other_Expenses', amount: latestMonth?.Other_Expenses || 0}
        ];

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const roundPercentage = (value: number) => Math.round(value * 10) / 10;

        return expenses
            .filter(exp => exp.amount > 0)
            .map(exp => ({
                category: exp.name,
                amount: exp.amount,
                pct: totalExpenses > 0 ? roundPercentage((exp.amount / totalExpenses) * 100) : 0,
                icon: exp.name === 'Payroll' ? '💼' : exp.name === 'Rent' ? '🏢' : exp.name === 'Marketing' ? '📣' : exp.name === 'COGS' ? '📦' : '⋯'
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenseBreakdownData, pnlData]);

    // Business Pulse Metrics from real API data
    const businessPulseMetrics = useMemo(() => {
        if (!pnlData?.data) {
            // Return demo data if no API data
            return [
        {
            label: 'Revenue',
            value: scenarioData.revenue,
            change: 8.5,
                    trend: 'up' as const,
            icon: TrendingUp,
            aiNote: 'Growth accelerating, conversion rates improving',
            color: '#10B981'
        },
        {
            label: 'Expenses',
            value: scenarioData.expenses,
            change: 25,
                    trend: 'up' as const,
            icon: Activity,
            aiNote: 'Marketing spend growing faster than revenue',
            color: '#F59E0B'
        },
        {
            label: 'Net Profit',
            value: scenarioData.netProfit,
            change: -15.2,
                    trend: 'down' as const,
            icon: DollarSign,
            aiNote: 'Margins compressing, review operational efficiency',
            color: scenarioData.netProfit > 0 ? '#10B981' : '#EF4444'
        },
        {
            label: 'Overdue Invoices',
            value: 8500,
            change: 0,
                    trend: 'neutral' as const,
            icon: Clock,
            aiNote: '3 invoices overdue, consider shorter payment terms',
            color: '#EF4444'
        },
        {
            label: 'Ending Cash',
            value: scenarioData.cash,
            change: -6.4,
                    trend: 'down' as const,
            icon: CreditCard,
            aiNote: 'Runway 4 months vs industry avg of 6 months',
            color: scenarioData.cash > 100000 ? '#10B981' : '#F59E0B'
        }
    ];
        }

        const data = pnlData.data;
        const revenue = data.total_revenue || 0;
        const expenses = data.total_expenses || 0;
        const netProfit = data.net_profit || 0;
        const revenueMoM = data.month_change?.revenue?.percentage_change || 0;
        const expensesMoM = data.month_change?.expenses?.percentage_change || 0;
        const profitMoM = data.month_change?.net_profit?.percentage_change || 0;

        const overdueAmount = invoicesData?.data?.overdue_invoices?.total_amount || 0;
        const overdueCount = invoicesData?.data?.overdue_invoices?.total_count || 0;

        return [
            {
                label: 'Revenue',
                value: revenue,
                change: revenueMoM,
                trend: revenueMoM > 0 ? 'up' as const : revenueMoM < 0 ? 'down' as const : 'neutral' as const,
                icon: TrendingUp,
                aiNote: revenueMoM > 0 ? 'Growth accelerating, conversion rates improving' : 'Revenue declined, review sales pipeline',
                color: '#10B981'
            },
            {
                label: 'Expenses',
                value: expenses,
                change: Math.abs(expensesMoM),
                trend: expensesMoM > 0 ? 'up' as const : expensesMoM < 0 ? 'down' as const : 'neutral' as const,
                icon: Activity,
                aiNote: expensesMoM > 15 ? 'Expenses growing faster than revenue' : 'Expense growth under control',
                color: '#F59E0B'
            },
            {
                label: 'Net Profit',
                value: netProfit,
                change: profitMoM,
                trend: profitMoM > 0 ? 'up' as const : profitMoM < 0 ? 'down' as const : 'neutral' as const,
                icon: DollarSign,
                aiNote: profitMoM < 0 ? 'Margins compressing, review operational efficiency' : 'Profitability improving',
                color: netProfit > 0 ? '#10B981' : '#EF4444'
            },
            {
                label: 'Overdue Invoices',
                value: overdueAmount,
                change: 0,
                trend: 'neutral' as const,
                icon: Clock,
                aiNote: overdueCount > 0 ? `${overdueCount} invoices overdue, consider shorter payment terms` : 'All invoices current',
                color: overdueAmount > 0 ? '#EF4444' : '#10B981'
            },
            {
                label: cashCardTitle,
                value: calculatedEndingCash,
                change: 0,
                trend: 'neutral' as const,
                icon: CreditCard,
                aiNote: cashBufferMonths > 0 ? `Buffer: ${cashBufferMonths} months` : 'Monitor cash closely',
                color: calculatedEndingCash > 100000 ? '#10B981' : calculatedEndingCash > 50000 ? '#F59E0B' : '#EF4444'
            }
        ];
    }, [pnlData, invoicesData, cashData, scenarioData, calculatedEndingCash, cashCardTitle, cashBufferMonths]);

    // Signals from real data or fallback
    const signals = useMemo(() => {
        const alertsList = [];

        // Cash gap signal
        if (cashData?.data) {
            const totalIncome = parseFloat(cashData.data.total_income) || 0;
            const totalExpense = parseFloat(cashData.data.total_expense) || 0;

            if (totalExpense > totalIncome || calculatedEndingCash < 0) {
                const topExpense = expenseData.length > 0 ? expenseData[0].name : 'expenses';
                alertsList.push({
                    id: 1,
                    severity: 'urgent' as const,
                    icon: AlertTriangle,
                    title: 'Cash flow shortage detected',
                    description: `Outflows exceed inflows - ${topExpense} is primary driver`,
                    action: 'View Details',
                    link: '/overview'
                });
            }
        }

        // Overdue invoices signal
        const overdueAmount = invoicesData?.data?.overdue_invoices?.total_amount || 0;
        const overdueCount = invoicesData?.data?.overdue_invoices?.total_count || 0;
        if (overdueAmount > 0) {
            alertsList.push({
            id: 2,
                severity: 'watch' as const,
                icon: Clock,
                title: 'Overdue invoices require attention',
                description: `${formatCurrency(overdueAmount)} across ${overdueCount} invoices`,
                action: 'Review Invoices',
                link: '/overview'
            });
        }

        // Expense growth signal
        if (pnlData?.data?.month_change?.expenses?.percentage_change) {
            const expensesMoM = pnlData.data.month_change.expenses.percentage_change;
            if (expensesMoM > 20) {
                alertsList.push({
                    id: 3,
                    severity: 'watch' as const,
            icon: TrendingUp,
                    title: `Expense growth +${expensesMoM.toFixed(1)}% MoM`,
                    description: 'Expenses growing faster than typical. Review cost structure.',
            action: 'View Expenses',
                    link: '/overview'
                });
            }
        }

        // Positive signal - revenue growth
        if (pnlData?.data?.month_change?.revenue?.percentage_change) {
            const revenueMoM = pnlData.data.month_change.revenue.percentage_change;
            if (revenueMoM > 10) {
                alertsList.push({
                    id: 4,
                    severity: 'positive' as const,
                    icon: CheckCircle,
                    title: `Revenue growth +${revenueMoM.toFixed(1)}% MoM`,
                    description: 'Strong revenue performance. Consider scaling operations.',
                    action: 'View Revenue',
                    link: '/overview'
                });
            }
        }

        // Low cash buffer signal
        if (cashBufferMonths > 0 && cashBufferMonths < 2) {
            alertsList.push({
                id: 5,
                severity: 'watch' as const,
                icon: AlertTriangle,
                title: 'Low cash buffer',
                description: `${cashBufferMonths} months runway. Aim for ≥2 months.`,
                action: 'View Cash Flow',
                link: '/overview'
            });
        }

        // Return fallback if no signals - using original Dashboard signals
        if (alertsList.length === 0) {
            return [
                {
                    id: 1,
                    severity: 'urgent' as const,
                    icon: AlertTriangle,
                    title: 'Cash flow shortage risk in 45 days',
                    description: 'Current burn rate: $8K/mo. Consider reducing Opex by 15% or extending AR terms.',
                    action: 'View Forecast',
                    link: '/scenarios'
                },
                {
                    id: 2,
                    severity: 'watch' as const,
                    icon: TrendingUp,
                    title: 'Expense growth +25% MoM',
                    description: 'Payroll increased $5K. Industry avg growth is 5%. Review headcount plan.',
                    action: 'View Expenses',
                    link: '/expenses'
                },
                {
                    id: 3,
                    severity: 'positive' as const,
                    icon: CheckCircle,
                    title: 'Retention improved 12% vs last month',
                    description: 'Customer lifetime value up. Strong product-market fit indicators.',
                    action: 'View Metrics',
                    link: '/overview'
                }
            ];
        }

        return alertsList;
    }, [cashData, invoicesData, pnlData, expenseData, calculatedEndingCash, cashBufferMonths]);

    const scenarioOptions = [
        { label: 'Now', value: 0, description: 'Current state' },
        { label: '+3M', value: 3, description: '3 months forward' },
        { label: '+6M', value: 6, description: '6 months forward' }
    ];

    // Cash Calendar data from API or fallback
    const cashCalendarData = useMemo(() => {
        if (cashData?.data) {
            // Return most recent 3 months if available
            const totalIncome = parseFloat(cashData.data.total_income) || 0;
            const totalExpense = parseFloat(cashData.data.total_expense) || 0;

            // For now, show aggregate for the period
            // In future, could break down by month if API provides monthly data
            return [
                {
                    month: 'Period Total',
                    inflow: totalIncome,
                    outflow: totalExpense
                }
            ];
        }

        // Fallback data
        return [
        { month: 'Apr', inflow: 52000, outflow: 35000 },
        { month: 'May', inflow: 48000, outflow: 42000 },
        { month: 'Jun', inflow: 55000, outflow: 40000 }
    ];
    }, [cashData]);

    // AR Health data from API or fallback
    const arHealthData = useMemo(() => {
        if (invoicesData?.data?.aging_buckets) {
            const buckets = invoicesData.data.aging_buckets;
            return [
                {
                    range: '0-30 days',
                    invoices: buckets['0-30']?.count || 0,
                    amount: buckets['0-30']?.amount || 0,
                    color: '#10B981',
                    icon: Clock
                },
                {
                    range: '31-60 days',
                    invoices: buckets['31-60']?.count || 0,
                    amount: buckets['31-60']?.amount || 0,
                    color: '#F59E0B',
                    icon: Clock
                },
                {
                    range: '61-90 days',
                    invoices: buckets['61-90']?.count || 0,
                    amount: buckets['61-90']?.amount || 0,
                    color: '#EF4444',
                    icon: Clock
                },
                {
                    range: '90+ days',
                    invoices: buckets['90+']?.count || 0,
                    amount: buckets['90+']?.amount || 0,
                    color: '#DC2626',
                    icon: AlertTriangle
                }
            ].filter(item => item.amount > 0 || item.invoices > 0);
        }

        // Fallback data
        return [
        { range: '0-30 days', invoices: 8, amount: 25000, color: '#10B981', icon: Clock },
        { range: '31-60 days', invoices: 4, amount: 12000, color: '#F59E0B', icon: Clock },
        { range: '61-90 days', invoices: 3, amount: 8500, color: '#EF4444', icon: Clock },
        { range: '90+ days', invoices: 2, amount: 3500, color: '#DC2626', icon: AlertTriangle }
    ];
    }, [invoicesData]);

    const getScenarioAINote = () => {
        // Use AI insights if available
        if (aiInsightsData?.insights && aiInsightsData.insights.length > 0) {
            // Get a summary insight
            return aiInsightsData.insights[0];
        }

        // Use P&L insights if available
        if (pnlData?.data?.ai_insights) {
            return pnlData.data.ai_insights;
        }

        // Fallback scenarios
        if (scenarioMonths === 0) {
            return "Current state: Margins healthy. Watch expense growth.";
        }
        if (scenarioMonths === 3) {
            return "3-month projection: If growth continues, profitability expected. Consider expanding.";
        }
        return "6-month projection: At current trajectory, cash position should strengthen.";
    };

    const getStatusColor = (statusBy: string, value: number, trend?: number) => {
        switch (statusBy) {
            case 'trend':
                return trend && trend > 0 ? 'text-green-600' : 'text-red-600';
            case 'criticalIf>0':
                return value > 0 ? 'text-red-600' : 'text-green-600';
            case 'balance':
                return value > 100000 ? 'text-green-600' : value > 50000 ? 'text-yellow-600' : 'text-red-600';
            case 'buffer':
                if (value >= 2) return 'text-green-600';
                if (value >= 1) return 'text-yellow-600';
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (statusBy: string, value: number, trend?: number) => {
        switch (statusBy) {
            case 'trend':
                return trend && trend > 0 ? <TrendingUp className="w-6 h-6"/> : <TrendingDown className="w-6 h-6"/>;
            case 'criticalIf>0':
                return value > 0 ? <AlertTriangle className="w-6 h-6"/> : <CheckCircle className="w-6 h-6"/>;
            case 'balance':
                return <DollarSign className="w-6 h-6"/>;
            case 'buffer':
                if (value >= 2) return <CheckCircle className="w-6 h-6"/>;
                if (value >= 1) return <AlertTriangle className="w-6 h-6"/>;
                return <XCircle className="w-6 h-6"/>;
            default:
                return <Activity className="w-6 h-6"/>;
        }
    };

    const getAlertIcon = (severity: string) => {
        switch (severity) {
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500"/>;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500"/>;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500"/>;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500"/>;
        }
    };

    const getSignalStyles = (severity: string) => {
        switch (severity) {
            case 'urgent':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-800',
                    icon: 'text-red-600 dark:text-red-400',
                    dot: 'bg-red-500'
                };
            case 'watch':
                return {
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    border: 'border-orange-200 dark:border-orange-800',
                    icon: 'text-orange-600 dark:text-orange-400',
                    dot: 'bg-orange-500'
                };
            case 'positive':
                return {
                    bg: 'bg-green-50 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-800',
                    icon: 'text-green-600 dark:text-green-400',
                    dot: 'bg-green-500'
                };
            default:
                return {
                    bg: 'bg-gray-50 dark:bg-gray-800',
                    border: 'border-gray-200 dark:border-gray-700',
                    icon: 'text-gray-600 dark:text-gray-400',
                    dot: 'bg-gray-500'
                };
        }
    };

    // Animation effect for values
    useEffect(() => {
        const targets = {
            revenue: scenarioData.revenue,
            expenses: scenarioData.expenses,
            netProfit: scenarioData.netProfit,
            cash: scenarioData.cash
        };

        Object.entries(targets).forEach(([key, target]) => {
            const start = animatedValues[key] || target * 0.8;
            const duration = 800;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = start + (target - start) * easeOutQuart;

                setAnimatedValues(prev => ({ ...prev, [key]: current }));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        });
    }, [scenarioData]);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-[#F8FAFF] to-[#E5EBF5] dark:from-gray-900 dark:to-gray-800 p-6 space-y-6"
        >
            {/* Header */}
            <div className="fade-in flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold text-[#0F1A2B] dark:text-gray-100 mb-2">Financial Cockpit</h1>
                <p className="text-[#64748B] dark:text-gray-400">Your personal CFO assistant</p>
            </div>

                {/* Period Selector */}
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        disabled={isLoadingPnl}
                        className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3A75F2] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <option value="This month">This month</option>
                        <option value="Last 3 months">Last 3 months</option>
                        <option value="Last 6 months">Last 6 months</option>
                        <option value="Last 12 months">Last 12 months</option>
                        <option value="Year to date">Year to date</option>
                        <option value="Custom range">Custom range</option>
                    </select>
                    {isLoadingPnl && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3A75F2]"></div>
                            <span>Loading...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {pnlError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-500"/>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading financial data</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{pnlError}</p>
                        </div>
                        <button
                            onClick={() => loadPnLData()}
                            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Date Range Selector */}
            {showCustomRange && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Custom Date Range</h3>

                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                max={customEndDate || undefined}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3A75F2] focus:border-transparent"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                min={customStartDate || undefined}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3A75F2] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {customStartDate && customEndDate && customStartDate > customEndDate && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                End date must be on or after start date.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setCustomStartDate('');
                                setCustomEndDate('');
                                setShowCustomRange(false);
                                setSelectedPeriod('This month');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyCustomRange}
                            disabled={!customStartDate || !customEndDate || customStartDate > customEndDate || isLoadingPnl}
                            className="px-6 py-2 text-sm font-medium text-white bg-[#3A75F2] hover:bg-[#2557C7] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center space-x-2"
                        >
                            {isLoadingPnl && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>{isLoadingPnl ? 'Loading...' : 'Apply'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Business Pulse - Top KPIs */}
            <div>
                <h2 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-[#3A75F2]" />
                    Business Pulse
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Revenue Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                <p className="text-xs text-[#64748B] dark:text-gray-400 font-medium uppercase tracking-wide">Revenue</p>
                            </div>
                            <div className={getStatusColor('trend', pulseKPIs.revenue, pulseKPIs.revenue_mom)}>
                                {getStatusIcon('trend', pulseKPIs.revenue, pulseKPIs.revenue_mom)}
                            </div>
                        </div>
                                    <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100 mb-1">
                            {formatCurrency(Math.round(animatedRevenue.currentValue))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            MoM: {pulseKPIs.revenue_mom > 0 ? '+' : ''}{pulseKPIs.revenue_mom}%,
                            YoY: {pulseKPIs.revenue_yoy > 0 ? '+' : ''}{pulseKPIs.revenue_yoy}%
                        </p>
                    </motion.div>

                    {/* Expenses Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs text-[#64748B] dark:text-gray-400 font-medium uppercase tracking-wide">Expenses</p>
                            </div>
                            <div className={getStatusColor('trend', pulseKPIs.expenses_total, -5)}>
                                {getStatusIcon('trend', pulseKPIs.expenses_total, -5)}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100 mb-1">
                            {formatCurrency(Math.round(animatedExpenses.currentValue))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Top category: {pulseKPIs.top_expense_category || 'No data'}
                        </p>
                    </motion.div>

                    {/* Operating Profit Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs text-[#64748B] dark:text-gray-400 font-medium uppercase tracking-wide">Operating Profit</p>
                            </div>
                            <div className={getStatusColor('trend', pulseKPIs.net_profit, 12)}>
                                {getStatusIcon('trend', pulseKPIs.net_profit, 12)}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100 mb-1">
                            {formatCurrency(Math.round(animatedNetProfit.currentValue))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Margin: {pulseKPIs.profit_margin}%
                        </p>
                    </motion.div>

                    {/* Overdue Invoices Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs text-[#64748B] dark:text-gray-400 font-medium uppercase tracking-wide">Overdue Invoices</p>
                            </div>
                            <div className={getStatusColor('criticalIf>0', pulseKPIs.overdue_invoices)}>
                                {getStatusIcon('criticalIf>0', pulseKPIs.overdue_invoices)}
                            </div>
                        </div>

                        {/* Date Range Picker */}
                        {showOverdueDatePicker && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Overdue date range:
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={overdueStartDate}
                                            onChange={(e) => setOverdueStartDate(e.target.value)}
                                            max={overdueEndDate || undefined}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Start date"
                                        />
                                        <input
                                            type="date"
                                            value={overdueEndDate}
                                            onChange={(e) => setOverdueEndDate(e.target.value)}
                                            min={overdueStartDate || undefined}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="End date"
                                        />
                                    </div>
                                    {overdueStartDate && overdueEndDate && overdueStartDate > overdueEndDate && (
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            End date must be on or after start date
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setShowOverdueDatePicker(false);
                                                setOverdueStartDate('');
                                                setOverdueEndDate('');
                                            }}
                                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowOverdueDatePicker(false);
                                                // Apply the date range filter for invoices analysis
                                                if (overdueStartDate && overdueEndDate) {
                                                    loadInvoicesData({
                                                        start_date: overdueStartDate,
                                                        end_date: overdueEndDate
                                                    });
                                                }
                                            }}
                                            disabled={!overdueStartDate || !overdueEndDate || overdueStartDate > overdueEndDate || isLoadingInvoices}
                                            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center space-x-2"
                                        >
                                            {isLoadingInvoices && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            )}
                                            <span>{isLoadingInvoices ? 'Loading...' : 'Apply'}</span>
                                        </button>
                                </div>
                                </div>
                                        </div>
                                    )}

                        <div className="flex items-center justify-between mb-2">
                            <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100">
                                {formatCurrency(Math.round(animatedOverdue.currentValue))}
                            </p>
                            <button
                                onClick={() => {
                                    setShowOverdueDatePicker(!showOverdueDatePicker);
                                    if (!showOverdueDatePicker) {
                                        setShowCashDatePicker(false);
                                    }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                title="Select overdue date range">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                            </button>
                                </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {pulseKPIs.overdue_count} invoices
                        </p>
                    </motion.div>

                    {/* Cash Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs text-[#64748B] dark:text-gray-400 font-medium uppercase tracking-wide">{pulseKPIs.cash_card_title}</p>
                            </div>
                            <div className={getStatusColor('buffer', pulseKPIs.cash_buffer_months)}>
                                {getStatusIcon('balance', pulseKPIs.ending_cash)}
                            </div>
                        </div>

                        {/* Date Range Picker */}
                        {showCashDatePicker && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Cash date range:
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={cashStartDate}
                                            onChange={(e) => setCashStartDate(e.target.value)}
                                            max={cashEndDate || undefined}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Start date"
                                        />
                                        <input
                                            type="date"
                                            value={cashEndDate}
                                            onChange={(e) => setCashEndDate(e.target.value)}
                                            min={cashStartDate || undefined}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="End date"
                                        />
                                    </div>
                                    {cashStartDate && cashEndDate && cashStartDate > cashEndDate && (
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            End date must be on or after start date
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setShowCashDatePicker(false);
                                                setCashStartDate('');
                                                setCashEndDate('');
                                            }}
                                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCashDatePicker(false);
                                                // Apply the date range filter for cash analysis
                                                if (cashStartDate && cashEndDate) {
                                                    loadCashData({
                                                        start_date: cashStartDate,
                                                        end_date: cashEndDate
                                                    });
                                                }
                                            }}
                                            disabled={!cashStartDate || !cashEndDate || cashStartDate > cashEndDate || isLoadingCash}
                                            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center space-x-2"
                                        >
                                            {isLoadingCash && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            )}
                                            <span>{isLoadingCash ? 'Loading...' : 'Apply'}</span>
                                        </button>
                                </div>
                            </div>
                                </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                            <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100">
                                {formatCurrency(Math.round(animatedCash.currentValue))}
                            </p>
                            <button
                                onClick={() => {
                                    setShowCashDatePicker(!showCashDatePicker);
                                    if (!showCashDatePicker) {
                                        setShowOverdueDatePicker(false);
                                    }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                title="Select cash date range"
                            >
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                            </button>
                            </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Buffer: {profileData?.current_cash ? `${pulseKPIs.cash_buffer_months} months` : 'N/A'}
                        </p>
                        </motion.div>
                </div>
            </div>

            {/* Mid Section - Insights & Visualization */}
            <div className="grid grid-cols-12 gap-6">
                {/* Revenue vs Expenses Chart */}
                <div className="col-span-12 lg:col-span-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100 mb-4">Revenue vs Expenses</h3>
                    <div className="h-72">
                        {isLoadingPnl ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A75F2]"></div>
                            </div>
                        ) : stackedChartData.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-[#64748B] dark:text-gray-400">No data available</p>
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stackedChartData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3A75F2" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#3A75F2" stopOpacity={0.6} />
                                    </linearGradient>
                                    <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#EC4899" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#EC4899" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E2E8F0'} />
                                <XAxis
                                    dataKey="month"
                                    stroke={theme === 'dark' ? '#9CA3AF' : '#64748B'}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke={theme === 'dark' ? '#9CA3AF' : '#64748B'}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255,255,255,0.95)',
                                        border: `1px solid ${theme === 'dark' ? '#374151' : '#E2E8F0'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        color: theme === 'dark' ? '#F3F4F6' : '#0F1A2B'
                                    }}
                                    labelStyle={{ color: theme === 'dark' ? '#F3F4F6' : '#0F1A2B', fontWeight: 600 }}
                                />
                                <Bar dataKey="revenue" fill="url(#revenueGrad)" name="Revenue" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="expenses_total" fill="url(#expensesGrad)" name="Expenses" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                    {chartData.story && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-start space-x-2">
                                <LogoIcon className="w-4 h-4 text-[#3A75F2] mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#64748B] dark:text-gray-400 italic">
                                    {chartData.story}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Expense Breakdown Donut */}
                <div className="col-span-12 lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100 mb-4">Expense Breakdown</h3>
                    <div className="h-64">
                        {isLoadingExpenseBreakdown ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A75F2]"></div>
                            </div>
                        ) : expenseData.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-[#64748B] dark:text-gray-400">No expense data</p>
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {expenseData.map((entry, index) => (
                                        <linearGradient key={`grad-${index}`} id={`expGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#expGrad-${index})`} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255,255,255,0.95)',
                                        border: `1px solid ${theme === 'dark' ? '#374151' : '#E2E8F0'}`,
                                        borderRadius: '12px',
                                        color: theme === 'dark' ? '#F3F4F6' : '#0F1A2B'
                                    }}
                                    labelStyle={{
                                        color: theme === 'dark' ? '#F3F4F6' : '#0F1A2B'
                                    }}
                                    itemStyle={{
                                        color: theme === 'dark' ? '#F3F4F6' : '#0F1A2B'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                    {expenseData.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {expenseData.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                                    <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[#0F1A2B] dark:text-gray-100 truncate">{item.name}</p>
                                    <p className="text-xs text-[#64748B] dark:text-gray-400">{item.pct}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>


                {/* Conversational AI Insights */}
                <ConversationalAI
                    companyProfile={{
                        industry: company.profile?.industry || 'business',
                        country: company.profile?.country,
                        employees: company.profile?.employees
                    }}
                    financialData={{
                        revenue: pnlData?.data?.total_revenue || 0,
                        expenses: pnlData?.data?.total_expenses || 0,
                        profit: pnlData?.data?.net_profit || 0,
                        cashBuffer: cashBufferMonths
                    }}
                    baseCurrency={baseCurrency}
                />
            </div>

            {/* Signals Panel */}
            <div>
                <h2 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100 mb-4">Signals</h2>
                {isLoadingPnl || isLoadingCash || isLoadingInvoices ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A75F2]"></div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {signals.map((signal) => {
                        const styles = getSignalStyles(signal.severity);
                        return (
                            <motion.div
                                key={signal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: signal.id * 0.1 }}
                                className={`${styles.bg} rounded-2xl p-5 border ${styles.border} hover:shadow-md transition-all duration-200`}
                            >
                                <div className="flex items-start space-x-3 mb-3">
                                    <div className="relative">
                                        <signal.icon className={`w-6 h-6 ${styles.icon}`} />
                                        <div className={`absolute -top-1 -right-1 w-2 h-2 ${styles.dot} rounded-full animate-pulse`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-[#0F1A2B] dark:text-gray-100 mb-1">{signal.title}</h3>
                                        <p className="text-xs text-[#64748B] dark:text-gray-400 leading-relaxed">{signal.description}</p>
                                    </div>
                                </div>
                                <button className="text-xs font-semibold text-[#3A75F2] hover:text-[#2557C7] dark:hover:text-[#60A5FA] flex items-center space-x-1 transition-colors mt-2">
                                    <span>{signal.action}</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
                )}
            </div>

            {/* Cash Calendar and AR Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Calendar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center space-x-2 mb-6">
                        <Calendar className="w-5 h-5 text-[#3A75F2]" />
                        <h3 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100">Cash Calendar</h3>
                    </div>
                    {isLoadingCash ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A75F2]"></div>
                        </div>
                    ) : (
                    <div className="space-y-6">
                        {cashCalendarData.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-[#64748B] dark:text-gray-400 uppercase tracking-wide">{item.month}</h4>
                                    <TrendingUp className="w-4 h-4 text-[#64748B] dark:text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm text-[#64748B] dark:text-gray-400">Inflow</span>
                                        </div>
                                        <span className="text-base font-bold text-green-600 dark:text-green-400">{formatCurrency(item.inflow)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ArrowDownRight className="w-4 h-4 text-red-500 dark:text-red-400" />
                                            <span className="text-sm text-[#64748B] dark:text-gray-400">Outflow</span>
                                        </div>
                                        <span className="text-base font-bold text-red-500 dark:text-red-400">{formatCurrency(item.outflow)}</span>
                                    </div>
                                </div>
                                {idx < cashCalendarData.length - 1 && (
                                    <div className="border-b border-gray-200 dark:border-gray-700 pt-2"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                    )}
                </motion.div>

                {/* AR Health */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center space-x-2 mb-6">
                        <FileText className="w-5 h-5 text-[#3A75F2]" />
                        <h3 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100">AR Health</h3>
                    </div>
                    {isLoadingInvoices ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A75F2]"></div>
                        </div>
                    ) : arHealthData.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-[#64748B] dark:text-gray-400">No invoice data available</p>
                        </div>
                    ) : (
                    <>
                    <div className="space-y-4">
                        {arHealthData.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#0F1A2B] dark:text-gray-100">{item.range}</p>
                                        <p className="text-xs text-[#64748B] dark:text-gray-400">{item.invoices} invoices</p>
                                    </div>
                                </div>
                                <span className="text-base font-bold text-[#0F1A2B] dark:text-gray-100">{formatCurrency(item.amount)}</span>
                            </motion.div>
                        ))}
                    </div>
                    {(invoicesData?.data?.average_days_outstanding || arHealthData.length > 0) && (
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-start space-x-2">
                                <LogoIcon className="w-4 h-4 text-[#3A75F2] mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-[#64748B] dark:text-gray-400 italic">
                                    {invoicesData?.data?.average_days_outstanding 
                                        ? `Avg collection: ${Math.round(invoicesData.data.average_days_outstanding)} days`
                                        : 'Monitor aging buckets for collection efficiency'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                    </>
                    )}
                </motion.div>
            </div>

            {/* Scenario Explorer */}
            {/* <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100 mb-1">Scenario Explorer</h2>
                        <p className="text-sm text-[#64748B] dark:text-gray-400">Model your financial future</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-[#64748B] dark:text-gray-400 mb-1">Projected Cash</p>
                        <p className="text-2xl font-bold text-[#0F1A2B] dark:text-gray-100">{formatCurrency(scenarioData.cash)}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                    {scenarioOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setScenarioMonths(option.value)}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                                scenarioMonths === option.value
                                    ? 'bg-gradient-to-r from-[#3A75F2] to-[#2557C7] text-white shadow-lg shadow-[#3A75F2]/30'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[#64748B] dark:text-gray-300 hover:border-[#3A75F2] hover:text-[#3A75F2]'
                            }`}
                        >
                            <div className="text-center">
                                <div className="text-sm font-bold">{option.label}</div>
                                <div className="text-xs opacity-75">{option.description}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-[#3A75F2]/10 to-[#6366F1]/10 dark:from-[#3A75F2]/20 dark:to-[#6366F1]/20 rounded-xl p-5 border border-[#3A75F2]/20 dark:border-[#3A75F2]/30">
                    <div className="flex items-start space-x-3">
                        <Brain className="w-6 h-6 text-[#3A75F2] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-[#0F1A2B] dark:text-gray-100 font-medium leading-relaxed">{getScenarioAINote()}</p>
                        </div>
                    </div>
                </div>
            </div> */}
        </motion.div>
    );
};

export default DashboardNew;

