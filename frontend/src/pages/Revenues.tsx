import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Filter,
    Download,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    X,
    ChevronDown,
    Eye,
    ExternalLink,
    Users,
    Target,
    Activity
} from 'lucide-react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isAfter, isBefore, parseISO, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { revenues, customers, projects, products, Revenue, Customer, Project, Product } from '../data/seedData';

interface Filters {
    period: 'MTD' | 'Last3M' | 'YTD' | 'Custom';
    dateRange: { start: string; end: string };
    project: string;
    product: string;
    customer: string;
    channel: string;
    status: string;
}

interface KPIData {
    revenueMTD: number;
    momDelta: number;
    forecast30d: number;
    avgInvoiceSize: number;
}

interface ChartDataPoint {
    date: string;
    revenue: number;
    movingAverage: number;
    forecast?: number;
}

interface InvoiceDrawerData extends Revenue {
    customerName: string;
    projectName: string;
    productName: string;
    amountBase: number;
    isOutlier?: boolean;
}

const Revenues: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({
        period: 'MTD',
        dateRange: {
            start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
            end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
        },
        project: '',
        product: '',
        customer: '',
        channel: '',
        status: ''
    });

    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDrawerData | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Get base currency from company profile
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

    // Update date range when period changes
    useEffect(() => {
        const now = new Date();
        let start: Date, end: Date;

        switch (filters.period) {
            case 'MTD':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case 'Last3M':
                start = startOfMonth(subMonths(now, 2));
                end = endOfMonth(now);
                break;
            case 'YTD':
                start = new Date(now.getFullYear(), 0, 1);
                end = now;
                break;
            default:
                return; // Custom - don't update
        }

        setFilters(prev => ({
            ...prev,
            dateRange: {
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd')
            }
        }));
    }, [filters.period]);

    // Filter and process revenue data
    const filteredRevenues = useMemo(() => {
        return revenues.filter(revenue => {
            const revenueDate = parseISO(revenue.date);
            const startDate = parseISO(filters.dateRange.start);
            const endDate = parseISO(filters.dateRange.end);

            if (isBefore(revenueDate, startDate) || isAfter(revenueDate, endDate)) return false;
            if (filters.project && revenue.project_id !== filters.project) return false;
            if (filters.product && revenue.product_code !== filters.product) return false;
            if (filters.customer && revenue.customer_id !== filters.customer) return false;
            if (filters.channel && revenue.channel !== filters.channel) return false;
            if (filters.status && revenue.status !== filters.status) return false;

            return true;
        });
    }, [revenues, filters]);

    // Calculate KPIs
    const kpiData = useMemo((): KPIData => {
        const now = new Date();
        const currentMonth = startOfMonth(now);
        const previousMonth = startOfMonth(subMonths(now, 1));

        // Current month revenues
        const currentMonthRevenues = revenues.filter(r => {
            const date = parseISO(r.date);
            return date >= currentMonth && date <= endOfMonth(now);
        });

        // Previous month revenues
        const previousMonthRevenues = revenues.filter(r => {
            const date = parseISO(r.date);
            return date >= previousMonth && date < currentMonth;
        });

        const revenueMTD = currentMonthRevenues.reduce((sum, r) => sum + (r.amount * r.fx_rate), 0);
        const revenuePrevMonth = previousMonthRevenues.reduce((sum, r) => sum + (r.amount * r.fx_rate), 0);

        const momDelta = revenuePrevMonth > 0 ? ((revenueMTD - revenuePrevMonth) / revenuePrevMonth) * 100 : 0;

        // Forecast calculation: exponential smoothing on last 12 weeks
        const last90Days = subDays(now, 90);
        const forecastData = revenues.filter(r => parseISO(r.date) >= last90Days);
        const weeklyTotals = new Map<string, number>();

        forecastData.forEach(r => {
            const week = format(startOfWeek(parseISO(r.date)), 'yyyy-MM-dd');
            weeklyTotals.set(week, (weeklyTotals.get(week) || 0) + (r.amount * r.fx_rate));
        });

        const weeklyValues = Array.from(weeklyTotals.values());
        const alpha = 0.3; // smoothing factor
        let smoothed = weeklyValues[0] || 0;

        for (let i = 1; i < weeklyValues.length; i++) {
            smoothed = alpha * weeklyValues[i] + (1 - alpha) * smoothed;
        }

        const forecast30d = smoothed * 4.3; // ~4.3 weeks in 30 days

        const avgInvoiceSize = filteredRevenues.length > 0
            ? filteredRevenues.reduce((sum, r) => sum + (r.amount * r.fx_rate), 0) / filteredRevenues.length
            : 0;

        return { revenueMTD, momDelta, forecast30d, avgInvoiceSize };
    }, [filteredRevenues, filters.dateRange]);

    // Prepare chart data
    const chartData = useMemo((): ChartDataPoint[] => {
        const dataMap = new Map<string, number>();

        filteredRevenues.forEach(revenue => {
            const date = parseISO(revenue.date);
            let key: string;

            switch (groupBy) {
                case 'week':
                    const weekStart = startOfWeek(date);
                    key = format(weekStart, 'yyyy-MM-dd');
                    break;
                case 'month':
                    key = format(date, 'yyyy-MM');
                    break;
                default:
                    key = format(date, 'yyyy-MM-dd');
            }

            const amount = revenue.amount * revenue.fx_rate;
            dataMap.set(key, (dataMap.get(key) || 0) + amount);
        });

        const sortedData = Array.from(dataMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, revenue]) => ({ date, revenue, movingAverage: revenue }));

        // Calculate moving average
        const windowSize = Math.min(7, sortedData.length);
        for (let i = windowSize - 1; i < sortedData.length; i++) {
            if (sortedData[i]) {
                const sum = sortedData.slice(i - windowSize + 1, i + 1).reduce((acc, item) => acc + item.revenue, 0);
                sortedData[i].movingAverage = sum / windowSize;
            }
        }

        return sortedData;
    }, [filteredRevenues, groupBy]);

    // Prepare table data with enriched information and outlier detection
    const tableData = useMemo((): InvoiceDrawerData[] => {
        const enrichedData = filteredRevenues.map(revenue => {
            const customer = customers.find(c => c.id === revenue.customer_id);
            const project = projects.find(p => p.id === revenue.project_id);
            const product = products.find(p => p.code === revenue.product_code);

            return {
                ...revenue,
                customerName: customer?.name || 'Unknown',
                projectName: project?.name || 'Unknown',
                productName: product?.name || 'Unknown',
                amountBase: revenue.amount * revenue.fx_rate
            };
        });

        // Calculate outliers
        if (enrichedData.length > 0) {
            const amounts = enrichedData.map(r => r.amountBase);
            const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
            const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);

            enrichedData.forEach(item => {
                item.isOutlier = Math.abs(item.amountBase - mean) > 2 * stdDev;
            });
        }

        return enrichedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredRevenues]);

    // Get overdue invoices
    const overdueInvoices = useMemo(() => {
        const today = new Date();
        return tableData.filter(invoice =>
            invoice.status !== 'paid' && parseISO(invoice.due_date) < today
        );
    }, [tableData]);

    // Top customers
    const topCustomers = useMemo(() => {
        const customerTotals = new Map<string, { name: string; total: number }>();

        filteredRevenues.forEach(revenue => {
            const customer = customers.find(c => c.id === revenue.customer_id);
            if (customer) {
                const current = customerTotals.get(customer.id) || { name: customer.name, total: 0 };
                current.total += revenue.amount * revenue.fx_rate;
                customerTotals.set(customer.id, current);
            }
        });

        return Array.from(customerTotals.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
    }, [filteredRevenues]);

    // Revenue streaks
    const revenueStreaks = useMemo(() => {
        if (chartData.length < 2) return { growth: 0, decline: 0 };

        let currentGrowthStreak = 0;
        let currentDeclineStreak = 0;
        let maxGrowthStreak = 0;
        let maxDeclineStreak = 0;

        for (let i = 1; i < chartData.length; i++) {
            const current = chartData[i].revenue;
            const previous = chartData[i - 1].revenue;

            if (current > previous) {
                currentGrowthStreak++;
                currentDeclineStreak = 0;
                maxGrowthStreak = Math.max(maxGrowthStreak, currentGrowthStreak);
            } else if (current < previous) {
                currentDeclineStreak++;
                currentGrowthStreak = 0;
                maxDeclineStreak = Math.max(maxDeclineStreak, currentDeclineStreak);
            }
        }

        return { growth: maxGrowthStreak, decline: maxDeclineStreak };
    }, [chartData]);

    // Revenue vs plan check
    const revenueVsPlan = useMemo(() => {
        const planMTD = 50000; // Demo plan value
        const actualMTD = kpiData.revenueMTD;
        const variance = ((actualMTD - planMTD) / planMTD) * 100;
        return { plan: planMTD, actual: actualMTD, variance };
    }, [kpiData.revenueMTD]);

    const formatCurrency = (amount: number, currency: string = baseCurrency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const clearFilters = () => {
        setFilters({
            period: 'MTD',
            dateRange: {
                start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
            },
            project: '',
            product: '',
            customer: '',
            channel: '',
            status: ''
        });
    };

    const exportCSV = () => {
        const headers = ['Date', 'Invoice #', 'Customer', 'Project', 'Product', 'Channel', 'Amount', 'Currency', 'Amount (Base)', 'Status', 'Due Date'];
        const csvData = tableData.map(row => [
            row.date,
            row.invoice_id,
            row.customerName,
            row.projectName,
            row.productName,
            row.channel,
            row.amount,
            row.currency,
            row.amountBase.toFixed(2),
            row.status,
            row.due_date
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenues-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFilterClick = (type: 'customer' | 'project' | 'product', value: string) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Alerts */}
            <div className="space-y-2">
                {overdueInvoices.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">
                {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} requiring attention
              </span>
                        </div>
                    </div>
                )}

                {revenueVsPlan.variance < -10 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                Revenue MTD is {Math.abs(revenueVsPlan.variance).toFixed(1)}% below plan
                ({formatCurrency(revenueVsPlan.actual)} vs {formatCurrency(revenueVsPlan.plan)})
              </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Revenues</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                    <button
                        onClick={exportCSV}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow p-6 space-y-4 sticky top-0 z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                            <select
                                value={filters.period}
                                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="MTD">MTD</option>
                                <option value="Last3M">Last 3M</option>
                                <option value="YTD">YTD</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>

                        {filters.period === 'Custom' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateRange.start}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            dateRange: { ...prev.dateRange, start: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateRange.end}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            dateRange: { ...prev.dateRange, end: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                            <select
                                value={filters.customer}
                                onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Customers</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                            <select
                                value={filters.project}
                                onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Projects</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                            <select
                                value={filters.product}
                                onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Products</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.code}>{product.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                            <select
                                value={filters.channel}
                                onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Channels</option>
                                <option value="CRM">CRM</option>
                                <option value="POS">POS</option>
                                <option value="ECOM">E-commerce</option>
                                <option value="MANUAL">Manual</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="overdue">Overdue</option>
                                <option value="void">Void</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Revenue MTD</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.revenueMTD)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">MoM Δ%</p>
                            <p className={`text-2xl font-bold ${kpiData.momDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {kpiData.momDelta >= 0 ? '+' : ''}{kpiData.momDelta.toFixed(1)}%
                            </p>
                        </div>
                        <TrendingUp className={`w-8 h-8 ${kpiData.momDelta >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Forecast 30d</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.forecast30d)}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Invoice Size</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.avgInvoiceSize)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
                        <div className="flex space-x-2">
                            {(['day', 'week', 'month'] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setGroupBy(period)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                        groupBy === period
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const date = groupBy === 'month' ? parseISO(value + '-01') : parseISO(value);
                                        return format(date, groupBy === 'month' ? 'MMM yyyy' : 'MMM dd');
                                    }}
                                />
                                <YAxis tickFormatter={(value) => formatCurrency(value).replace(/\$|,/g, '')} />
                                <Tooltip
                                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                    labelFormatter={(value) => {
                                        const date = groupBy === 'month' ? parseISO(value + '-01') : parseISO(value as string);
                                        return format(date, 'PPP');
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
                                <Line
                                    type="monotone"
                                    dataKey="movingAverage"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Moving Average"
                                />
                                {kpiData.forecast30d > 0 && (
                                    <ReferenceLine
                                        y={kpiData.forecast30d / 30}
                                        stroke="#f59e0b"
                                        strokeDasharray="5 5"
                                        label="30d Forecast"
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 3 Customers</h3>
                        <div className="space-y-3">
                            {topCustomers.map((customer, index) => (
                                <div key={customer.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                                        <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{formatCurrency(customer.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue Streaks</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Growth Streak</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{revenueStreaks.growth} days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Decline Streak</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{revenueStreaks.decline} days</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tableData.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
                                <span className="text-sm font-medium text-green-600">
                  {tableData.filter(r => r.status === 'paid').length}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                                <span className="text-sm font-medium text-red-600">
                  {overdueInvoices.length}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Outliers</span>
                                <span className="text-sm font-medium text-yellow-600">
                  {tableData.filter(r => r.isOutlier).length}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.slice(0, 50).map((invoice) => (
                            <tr
                                key={invoice.id}
                                className={`hover:bg-gray-50 cursor-pointer ${
                                    invoice.status === 'overdue' ? 'bg-red-50' : ''
                                }`}
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(parseISO(invoice.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {invoice.invoice_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterClick('customer', invoice.customer_id);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {invoice.customerName}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterClick('project', invoice.project_id);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {invoice.projectName}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilterClick('product', invoice.product_code);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {invoice.productName}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {invoice.channel}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center space-x-2">
                                        <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
                                        {invoice.currency !== baseCurrency && (
                                            <span className="text-xs text-gray-500">
                          ({formatCurrency(invoice.amountBase)})
                        </span>
                                        )}
                                        {invoice.isOutlier && (
                                            <AlertTriangle
                                                className="w-4 h-4 text-yellow-500"
                                                title="Outlier vs period mean"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                invoice.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status === 'overdue' ? 'Overdue' : invoice.status}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(parseISO(invoice.due_date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button className="text-indigo-600 hover:text-indigo-900">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Details Drawer */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.invoice_id}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.customerName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Project</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.projectName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Product</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.productName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <p className="text-sm text-gray-900">
                                        {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                                        {selectedInvoice.currency !== baseCurrency && (
                                            <span className="text-gray-500 ml-2">
                        ({formatCurrency(selectedInvoice.amountBase)})
                      </span>
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                        selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                selectedInvoice.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                    }`}>
                    {selectedInvoice.status}
                  </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Channel</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.channel}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <p className="text-sm text-gray-900">{format(parseISO(selectedInvoice.date), 'PPP')}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <p className="text-sm text-gray-900">{format(parseISO(selectedInvoice.due_date), 'PPP')}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">FX Rate</label>
                                    <p className="text-sm text-gray-900">{selectedInvoice.fx_rate}</p>
                                </div>

                                {selectedInvoice.isOutlier && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-800">Outlier vs period mean</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Open in Accounting
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Revenues;
