import React, { useState, useEffect, useMemo } from 'react';
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
import { motion } from 'framer-motion';
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
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { revenues } from '../data/seedData';
import { useTheme } from '../contexts/ThemeContext';

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
    const { theme } = useTheme();
    
    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

    // Mock API data generation
    const pulseKPIs = useMemo((): PulseKPI => {
        return {
            revenue: 45000,
            revenue_mom: 8.5,
            revenue_yoy: 23.1,
            expenses_total: 32000,
            top_expense_category: 'Payroll',
            net_profit: 13000,
            profit_margin: 28.9,
            overdue_invoices: 8500,
            overdue_count: 3,
            ending_cash: 125000,
            cash_buffer_months: 3.9,
            currency: baseCurrency
        };
    }, [baseCurrency]);

    const chartData = useMemo((): ChartData => {
        const months = [];
        const revenue = [];
        const expenses_total = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            months.push(format(date, 'yyyy-MM'));
            revenue.push(45000 + Math.random() * 10000 - 5000);
            expenses_total.push(32000 + Math.random() * 8000 - 4000);
        }

        const expenses_by_category = [
            { category: 'Payroll', series: months.map(() => 15000 + Math.random() * 3000 - 1500) },
            { category: 'Rent', series: months.map(() => 5000 + Math.random() * 500 - 250) },
            { category: 'Marketing', series: months.map(() => 4000 + Math.random() * 2000 - 1000) },
            { category: 'Software', series: months.map(() => 2000 + Math.random() * 500 - 250) },
            { category: 'Other_Expenses', series: months.map(() => 3000 + Math.random() * 1000 - 500) }
        ];

        return {
            months,
            revenue,
            expenses_total,
            expenses_by_category,
            story: "🔥 Expenses +25% MoM; Revenue −10% YoY. Marketing spend driving customer acquisition but impacting short-term margins."
        };
    }, []);

    const expenseChips = useMemo((): ExpenseChip[] => [
        { category: 'Payroll', amount: 15000, pct: 46.9, icon: 'users' },
        { category: 'Marketing', amount: 4000, pct: 12.5, icon: 'zap' },
        { category: 'Rent', amount: 5000, pct: 15.6, icon: 'building' },
        { category: 'Software', amount: 2000, pct: 6.3, icon: 'code' },
        { category: 'Other', amount: 6000, pct: 18.7, icon: 'more' }
    ], []);

    const alerts = useMemo((): Alert[] => [
        {
            id: '1',
            severity: 'error',
            message: 'Cash flow projection shows potential shortage in 45 days',
            link: '/scenarios'
        },
        {
            id: '2',
            severity: 'warning',
            message: '3 invoices overdue by more than 30 days ($8,500 total)',
            link: '/revenues'
        },
        {
            id: '3',
            severity: 'info',
            message: 'Marketing spend 15% above industry average for your sector',
            link: '/market-intel'
        }
    ], []);

    const insights = useMemo((): string[] => [
        "Your gross margin (71%) is above industry average (65%) for your sector",
        "Customer acquisition cost decreased 12% this quarter while retention improved",
        "Operating expenses as % of revenue (28%) are well controlled vs benchmark (35%)",
        "Consider increasing marketing budget by 20% to capitalize on current conversion rates"
    ], []);

    const formatCurrency = (amount: number, curr: string = baseCurrency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

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
                return trend && trend > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />;
            case 'criticalIf>0':
                return value > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />;
            case 'balance':
                return <DollarSign className="w-6 h-6" />;
            default:
                return <BarChart3 className="w-6 h-6" />;
        }
    };

    const getAlertIcon = (severity: string) => {
        switch (severity) {
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    const getChipIcon = (iconKey: string) => {
        switch (iconKey) {
            case 'users':
                return <Users className="w-4 h-4" />;
            case 'zap':
                return <Zap className="w-4 h-4" />;
            case 'building':
                return <BarChart3 className="w-4 h-4" />;
            case 'code':
                return <Target className="w-4 h-4" />;
            default:
                return <DollarSign className="w-4 h-4" />;
        }
    };

    const getChipColor = (pct: number) => {
        if (pct > 30) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
        if (pct > 15) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
        if (pct > 10) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
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

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Business Pulse</h1>
                <p className="text-gray-600 dark:text-gray-400">Your company's financial heartbeat, risks, and next steps</p>
            </div>

            {/* KPI Pulse Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
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

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500">
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
                        Top category: {pulseKPIs.top_expense_category}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</h3>
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
                        <div className={getStatusColor('criticalIf>0', pulseKPIs.overdue_invoices)}>
                            {getStatusIcon('criticalIf>0', pulseKPIs.overdue_invoices)}
                        </div>
                    </div>
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
                        <div className={getStatusColor('balance', pulseKPIs.ending_cash)}>
                            {getStatusIcon('balance', pulseKPIs.ending_cash)}
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(pulseKPIs.ending_cash)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Buffer: {pulseKPIs.cash_buffer_months} months
                    </p>
                </div>
            </div>

            {/* Revenue vs Expenses Chart with Story */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Revenue vs Expenses</h2>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                        <p className="text-orange-800 dark:text-orange-200 font-medium">{chartData.story}</p>
                    </div>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stackedChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
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
                            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />

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
            </div>

            {/* Expense Chips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Expenses by category</h2>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                    {expenseChips.map((chip, index) => (
                        <button
                            key={index}
                            onClick={() => window.location.href = '/scenarios'}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all hover:shadow-md ${getChipColor(chip.pct)}`}
                        >
                            {getChipIcon(chip.icon)}
                            <span className="font-medium">{chip.category}</span>
                            <span className="text-sm">{chip.pct}%</span>
                        </button>
                    ))}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">Click a chip to see details in Cash Flow</p>
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
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{alert.message}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">No signals — everything is stable 🎉</p>
                    </div>
                )}
            </div>

            {/* AI Advisor Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Brain className="w-6 h-6 mr-2 text-indigo-600" />
                        Advisor Insights 🤖
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Short recommendations based on your data</p>
                </div>

                {insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
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
