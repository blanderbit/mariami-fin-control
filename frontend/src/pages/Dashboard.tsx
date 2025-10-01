import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Upload,
    Eye,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    CreditCard,
    ShoppingCart,
    Zap,
    Target,
    Clock,
    Brain,
    ExternalLink
} from 'lucide-react';
import {motion} from 'framer-motion';
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    parseISO,
    startOfYear,
    endOfYear,
    subYears,
    startOfDay,
    endOfDay
} from 'date-fns';
import {revenues} from '../data/seedData';
import {useTheme} from '../contexts/ThemeContext';
import {getPnLAnalysisRequest, PnLAnalysisResponse, PnLDataItem, getInvoicesAnalysisRequest, InvoicesAnalysisResponse, getCashAnalysisRequest, CashAnalysisResponse, getExpenseBreakdownRequest, ExpenseBreakdownResponse, getAIInsightsRequest, AIInsightsResponse} from '../api/auth';

interface PulseKPI {
    revenue: number;
    revenue_mom: number;
    revenue_yoy: number;
    expenses_total: number;
    top_expense_category: string;
    net_profit: number;
    profit_margin: number;
    overdue_invoices: number;
    overdue_count: number;
    ending_cash: number;
    cash_buffer_months: number;
    currency: string;
}

interface ExpenseChip {
    category: string;
    amount: number;
    pct: number;
    icon: string;
    spike?: boolean;
    isNew?: boolean;
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

const Dashboard: React.FC = () => {
    const {theme} = useTheme();

    // Refs for scroll targets
    const revenueExpensesRef = useRef<HTMLDivElement>(null);
    const expensesCategoryRef = useRef<HTMLDivElement>(null);
    
    // Ref to track if data is currently being loaded (prevents duplicate calls in StrictMode)
    const isLoadingRef = useRef(false);

    // Period selection state
    const [selectedPeriod, setSelectedPeriod] = useState('This month');

    // Custom range state
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showCustomRange, setShowCustomRange] = useState(false);

    // P&L Analysis state
    const [pnlData, setPnlData] = useState<PnLAnalysisResponse | null>(null);
    const [isLoadingPnl, setIsLoadingPnl] = useState(false);
    const [pnlError, setPnlError] = useState<string | null>(null);

    // Invoices Analysis state
    const [invoicesData, setInvoicesData] = useState<InvoicesAnalysisResponse | null>(null);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoicesError, setInvoicesError] = useState<string | null>(null);

    // Cash Analysis state
    const [cashData, setCashData] = useState<CashAnalysisResponse | null>(null);
    const [isLoadingCash, setIsLoadingCash] = useState(false);
    const [cashError, setCashError] = useState<string | null>(null);

    // Expense Breakdown state
    const [expenseBreakdownData, setExpenseBreakdownData] = useState<ExpenseBreakdownResponse | null>(null);
    const [isLoadingExpenseBreakdown, setIsLoadingExpenseBreakdown] = useState(false);
    const [expenseBreakdownError, setExpenseBreakdownError] = useState<string | null>(null);
    const [showAllCategories, setShowAllCategories] = useState(false);

    // AI Insights state
    const [aiInsightsData, setAiInsightsData] = useState<AIInsightsResponse | null>(null);
    const [isLoadingAiInsights, setIsLoadingAiInsights] = useState(false);
    const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);

    // Date range picker states
    const [showOverdueDatePicker, setShowOverdueDatePicker] = useState(false);
    const [showCashDatePicker, setShowCashDatePicker] = useState(false);
    const [overdueStartDate, setOverdueStartDate] = useState('');
    const [overdueEndDate, setOverdueEndDate] = useState('');
    const [cashStartDate, setCashStartDate] = useState('');
    const [cashEndDate, setCashEndDate] = useState('');

    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

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
                // Use custom dates if available, otherwise use current month
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
            // Only close custom range when selecting a different period
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

            // Check if response has valid data
            if (response && response.data && response.data.pnl_data && response.data.pnl_data.length > 0) {
                setPnlData(response);
            } else {
                // Set empty data structure to trigger fallback
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

    // Load P&L, Invoices, Cash, and Expense Breakdown data when period changes (except for custom range)
    useEffect(() => {
        const loadAllData = async () => {
            if (selectedPeriod !== 'Custom range') {
                // Prevent duplicate calls in StrictMode
                if (isLoadingRef.current) {
                    console.log('Already loading data, skipping duplicate call');
                    return;
                }
                
                isLoadingRef.current = true;
                const dates = getPeriodDates(selectedPeriod);
                
                try {
                    // Load all 4 main requests in parallel
                    await Promise.all([
                        loadPnLData(dates),
                        loadInvoicesData(dates),
                        loadCashData(dates),
                        loadExpenseBreakdownData(dates)
                    ]);

                    // After all requests are done, load AI insights
                    await loadAiInsightsData(dates);
                } finally {
                    isLoadingRef.current = false;
                }
            }
        };

        loadAllData();
    }, [selectedPeriod]);

    // Apply custom range
    const applyCustomRange = async () => {
        if (customStartDate && customEndDate && customStartDate <= customEndDate) {
            const dates = {start_date: customStartDate, end_date: customEndDate};

            // Load all 4 main requests in parallel
            await Promise.all([
                loadPnLData(dates),
                loadInvoicesData(dates),
                loadCashData(dates),
                loadExpenseBreakdownData(dates)
            ]);

            // After all requests are done, load AI insights
            await loadAiInsightsData(dates);
        }
    };

    // Generate KPI data from P&L analysis
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
                overdue_invoices: 0,
                overdue_count: 0,
                ending_cash: 0,
                cash_buffer_months: 0,
                currency: baseCurrency
            };
        }

        const data = pnlData.data;
        const profitMargin = data.total_revenue > 0 ? Math.round(((data.net_profit / data.total_revenue) * 100) * 100) / 100 : 0;

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
            overdue_invoices: invoicesData?.data?.overdue_invoices?.total_amount || 0,
            overdue_count: invoicesData?.data?.overdue_invoices?.total_count || 0,
            ending_cash: cashData ? parseFloat(cashData.total_income) - parseFloat(cashData.total_expense) : 0,
            cash_buffer_months: 0, // Will be provided by backend when available
            currency: baseCurrency
        };
    }, [pnlData, invoicesData, cashData, baseCurrency]);

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
    }, [selectedPeriod, pnlData]);

    const formatCurrency = (amount: number, curr: string = baseCurrency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
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
        if (!latestMonth) {
            return [];
        }

        const totalExpenses = (latestMonth.COGS || 0) + (latestMonth.Payroll || 0) + (latestMonth.Rent || 0) +
            (latestMonth.Marketing || 0) + (latestMonth.Other_Expenses || 0);

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

        const roundPercentage = (value: number) => Math.round(value * 10) / 10;

        return [
            {
                category: 'COGS',
                amount: latestMonth.COGS || 0,
                pct: totalExpenses > 0 ? roundPercentage(((latestMonth.COGS || 0) / totalExpenses) * 100) : 0,
                icon: getIcon('COGS')
            },
            {
                category: 'Payroll',
                amount: latestMonth.Payroll || 0,
                pct: totalExpenses > 0 ? roundPercentage(((latestMonth.Payroll || 0) / totalExpenses) * 100) : 0,
                icon: getIcon('Payroll')
            },
            {
                category: 'Rent',
                amount: latestMonth.Rent || 0,
                pct: totalExpenses > 0 ? roundPercentage(((latestMonth.Rent || 0) / totalExpenses) * 100) : 0,
                icon: getIcon('Rent')
            },
            {
                category: 'Marketing',
                amount: latestMonth.Marketing || 0,
                pct: totalExpenses > 0 ? roundPercentage(((latestMonth.Marketing || 0) / totalExpenses) * 100) : 0,
                icon: getIcon('Marketing')
            },
            {
                category: 'Other_Expenses',
                amount: latestMonth.Other_Expenses || 0,
                pct: totalExpenses > 0 ? roundPercentage(((latestMonth.Other_Expenses || 0) / totalExpenses) * 100) : 0,
                icon: getIcon('Other_Expenses')
            }
        ].filter(chip => chip.amount > 0);
    }, [expenseBreakdownData, pnlData]);

    const alerts = useMemo((): Alert[] => {
        const signals: Alert[] = [];

        // Signal 1: Cash gap (critical)
        // Show if total_expense > total_income OR ending_cash < 0
        const totalIncome = cashData ? parseFloat(cashData.total_income) : 0;
        const totalExpense = cashData ? parseFloat(cashData.total_expense) : 0;

        if (totalExpense > totalIncome || pulseKPIs.ending_cash < 0) {
            // Find the category with the highest percentage (driver)
            const topCategory = expenseChips.length > 0 ? expenseChips[0] : null;
            const driver = topCategory ? topCategory.category : 'expenses';

            signals.push({
                id: 'cash-gap',
                severity: 'error',
                message: `Outflows exceed inflows this month - ${driver}`,
                link: '#'
            });
        }

        // Signal 2: Overdue AR
        // Show if overdue_invoices > 0
        if (pulseKPIs.overdue_invoices > 0) {
            signals.push({
                id: 'overdue-ar',
                severity: 'warning',
                message: `Overdue invoices ${formatCurrency(pulseKPIs.overdue_invoices)} (${pulseKPIs.overdue_count} invoices).`,
                link: '#'
            });
        }

        return signals;
    }, [cashData, pulseKPIs, expenseChips]);

    const insights = useMemo((): string[] => {
        if (!aiInsightsData?.insights) {
            // Return empty array if no backend insights
            return [];
        }

        // Use AI insights from AI Insights API
        return aiInsightsData.insights;
    }, [aiInsightsData]);

    const getStatusColor = (statusBy: string, value: number, trend?: number) => {
        switch (statusBy) {
            case 'trend':
                return trend && trend > 0 ? 'text-green-600' : 'text-red-600';
            case 'criticalIf>0':
                return value > 0 ? 'text-red-600' : 'text-green-600';
            case 'balance':
                return value > 100000 ? 'text-green-600' : value > 50000 ? 'text-yellow-600' : 'text-red-600';
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
            default:
                return <BarChart3 className="w-6 h-6"/>;
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
            opacity = Math.min(opacity + 0.2, 0.9);
        }

        // Create background and border colors
        const backgroundColor = `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        const borderColor = `${baseColor}${Math.round(opacity * 255 * 1.2).toString(16).padStart(2, '0')}`;

        return {
            backgroundColor,
            borderColor,
            color: '#ffffff'
        };
    };

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

    // Scroll function
    const scrollToElement = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Business Pulse</h1>
                    <p className="text-gray-600 dark:text-gray-400">Your company's financial heartbeat, risks, and next
                        steps</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</span>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        disabled={isLoadingPnl}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {pnlError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-500"/>
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading financial
                                data</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{pnlError}</p>
                        </div>
                        <button
                            onClick={loadPnLData}
                            className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Date Range Selector */}
            {showCustomRange && (
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Custom Date
                        Range</h3>

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
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Validation message */}
                    {customStartDate && customEndDate && customStartDate > customEndDate && (
                        <div
                            className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
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
                                // Reset to previous period or default
                                setSelectedPeriod('This month');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyCustomRange}
                            disabled={!customStartDate || !customEndDate || customStartDate > customEndDate || isLoadingPnl}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center space-x-2"
                        >
                            {isLoadingPnl && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>{isLoadingPnl ? 'Loading...' : 'Apply'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* KPI Pulse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                    onClick={() => scrollToElement(revenueExpensesRef)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</h3>
                        <div className={getStatusColor('trend', pulseKPIs.revenue, pulseKPIs.revenue_mom)}>
                            {getStatusIcon('trend', pulseKPIs.revenue, pulseKPIs.revenue_mom)}
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.revenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        MoM: {pulseKPIs.revenue_mom > 0 ? '+' : ''}{pulseKPIs.revenue_mom}%,
                        YoY: {pulseKPIs.revenue_yoy > 0 ? '+' : ''}{pulseKPIs.revenue_yoy}%
                    </p>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                    onClick={() => scrollToElement(expensesCategoryRef)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Expenses</h3>
                        <div className={getStatusColor('trend', pulseKPIs.expenses_total, -5)}>
                            {getStatusIcon('trend', pulseKPIs.expenses_total, -5)}
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.expenses_total)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Top category: {pulseKPIs.top_expense_category || 'No data'}
                    </p>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                    onClick={() => scrollToElement(revenueExpensesRef)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Operating Profit</h3>
                        <div className={getStatusColor('trend', pulseKPIs.net_profit, 12)}>
                            {getStatusIcon('trend', pulseKPIs.net_profit, 12)}
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.net_profit)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Margin: {pulseKPIs.profit_margin}%
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Invoices</h3>
                        <div className="flex">
                            <div className="mr-1">
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
                            <div className={getStatusColor('criticalIf>0', pulseKPIs.overdue_invoices)}>
                                {getStatusIcon('criticalIf>0', pulseKPIs.overdue_invoices)}
                            </div>
                        </div>
                    </div>

                    {/* Date Range Picker */}
                    {showOverdueDatePicker && (
                        <div
                            className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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

                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.overdue_invoices)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {pulseKPIs.overdue_count} invoices
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ending Cash</h3>
                        <div className="flex">

                            <div className="mr-1">
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
                            <div className={getStatusColor('balance', pulseKPIs.ending_cash)}>
                                {getStatusIcon('balance', pulseKPIs.ending_cash)}
                            </div>
                        </div>
                    </div>

                    {/* Date Range Picker */}
                    {showCashDatePicker && (
                        <div
                            className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
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

                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.ending_cash)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Buffer: {pulseKPIs.cash_buffer_months} months
                    </p>
                </div>
            </div>

            {/* Revenue vs Expenses Chart with Story */}
            <div ref={revenueExpensesRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Revenue vs Expenses</h2>
                    {chartData.story && (
                        <div
                            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                            <p className="text-orange-800 dark:text-orange-200 font-medium">{chartData.story}</p>
                        </div>
                    )}
                </div>

                {stackedChartData.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={stackedChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}/>
                                <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}/>
                                <YAxis
                                    tickFormatter={(value) => formatCurrency(value).replace(/\$|,/g, '')}
                                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                                        border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                        color: theme === 'dark' ? '#f9fafb' : '#111827'
                                    }}
                                />

                                {/* Revenue bar */}
                                <Bar dataKey="revenue" fill="#10b981" name="Revenue"/>

                                {/* Stacked expense categories */}
                                {chartData.expenses_by_category.map((category, index) => (
                                    <Bar
                                        key={category.category}
                                        dataKey={category.category}
                                        stackId="expenses"
                                        fill={expenseColors[index % expenseColors.length]}
                                        name={category.category}
                                    />
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400">No chart data available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Expense Chips */}
            <div ref={expensesCategoryRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Expenses by category ({expenseChips.length} chips)
                    </h2>
                    {expenseBreakdownError && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-sm text-red-800 dark:text-red-200">{expenseBreakdownError}</p>
                        </div>
                    )}
                </div>

                {isLoadingExpenseBreakdown ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Loading expense breakdown...</span>
                        </div>
                    </div>
                ) : expenseChips.length > 0 ? (
                    <>
                        {/* Handle edge case: only one category */}
                        {expenseChips.length === 1 ? (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-4">
                                    <div
                                        className="flex items-center space-x-2 px-6 py-3 rounded-full border-2"
                                        style={{
                                            backgroundColor: getChipColor(expenseChips[0].pct, expenseChips[0].spike, expenseChips[0].isNew).backgroundColor,
                                            borderColor: getChipColor(expenseChips[0].pct, expenseChips[0].spike, expenseChips[0].isNew).borderColor,
                                            color: getChipColor(expenseChips[0].pct, expenseChips[0].spike, expenseChips[0].isNew).color
                                        }}
                                    >
                                        <span className="text-lg">{expenseChips[0].icon}</span>
                                        <span className="font-medium text-lg">{expenseChips[0].category}</span>
                                        <span className="text-lg font-bold">{expenseChips[0].pct}%</span>
                                        {expenseChips[0].spike && <span className="text-lg">⚠️</span>}
                                        {expenseChips[0].isNew && (
                                            <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-bold">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Add more expense categories in P&L to refine analysis
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {(showAllCategories ? expenseChips : expenseChips.slice(0, 12)).map((chip, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                // TODO: Open modal with category details
                                                console.log('Open category details modal for:', chip.category);
                                            }}
                                            className="relative flex items-center space-x-2 px-4 py-2 rounded-full border transition-all hover:shadow-md"
                                            style={{
                                                backgroundColor: getChipColor(chip.pct, chip.spike, chip.isNew).backgroundColor,
                                                borderColor: getChipColor(chip.pct, chip.spike, chip.isNew).borderColor,
                                                color: getChipColor(chip.pct, chip.spike, chip.isNew).color
                                            }}
                                            title={`${chip.category}: ${formatCurrency(chip.amount)} (${chip.pct}%)${chip.spike ? ' - Spike detected' : ''}${chip.isNew ? ' - New category' : ''}`}
                                        >
                                            <span className="text-sm">{chip.icon}</span>
                                            <span className="font-medium">{chip.category}</span>
                                            <span className="text-sm font-bold">{chip.pct}%</span>
                                            {chip.spike && <span className="text-sm">⚠️</span>}
                                            {chip.isNew && (
                                                <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full font-bold">
                                                    NEW
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Show "show more" button if there are more than 12 categories */}
                                {expenseChips.length > 12 && (
                                    <div className="text-center mb-4">
                                        <button
                                            onClick={() => setShowAllCategories(!showAllCategories)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
                                        >
                                            {showAllCategories ? 'Show less...' : `Show ${expenseChips.length - 12} more...`}
                                        </button>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Click a chip to see category details.
                                </p>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No expense data available</p>
                    </div>
                )}
            </div>

            {/* Alerts Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Signals</h2>
                </div>

                {alerts.length > 0 ? (
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <button
                                key={alert.id}
                                onClick={() => window.location.href = alert.link}
                                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    {getAlertIcon(alert.severity)}
                                    <span
                                        className="font-medium text-gray-900 dark:text-gray-100">{alert.message}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500"/>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                        <p className="text-gray-600 dark:text-gray-400">No signals — everything is stable 🎉</p>
                    </div>
                )}
            </div>

            {/* AI Advisor Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Brain className="w-6 h-6 mr-2 text-indigo-600"/>
                        Advisor Insights 🤖
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short recommendations based on your data</p>
                </div>

                {aiInsightsError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-200">{aiInsightsError}</p>
                    </div>
                )}

                {isLoadingAiInsights ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">Loading AI insights...</span>
                        </div>
                    </div>
                ) : insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div key={index}
                                 className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0"/>
                                <p className="text-sm text-indigo-800 dark:text-indigo-200">{insight}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No advice yet — upload more data.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;
