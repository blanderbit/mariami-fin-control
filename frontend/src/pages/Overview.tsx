import React, { useState, useEffect } from 'react';
import {
    Building,
    Globe,
    DollarSign,
    Users,
    Calendar,
    Edit,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Plus,
    X,
    CreditCard,
    FileText,
    Phone,
    ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { updateOnboardingRequest, OnboardingData, getCurrenciesRequest, Currency, getIndustriesRequest, getCountriesRequest, Country } from '../api/auth';




interface Integration {
    id: string;
    type: string;
    vendor: string;
    status: 'ok' | 'warning' | 'error';
    lastSync: string;
}

interface DataWarning {
    id: string;
    type: 'sync' | 'data';
    severity: 'warning' | 'error';
    message: string;
    dismissible: boolean;
}

const Overview: React.FC = () => {
    const { theme } = useTheme();
    const { onboardingStatus: authOnboardingStatus } = useAuth();
    const [company, setCompany] = useState<any>({});
    const [profileData, setProfileData] = useState<OnboardingData | null>(null);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [warnings, setWarnings] = useState<DataWarning[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currenciesLoading, setCurrenciesLoading] = useState(true);
    const [industries, setIndustries] = useState<string[]>([]);
    const [industriesLoading, setIndustriesLoading] = useState(true);
    const [countries, setCountries] = useState<Country[]>([]);
    const [countriesLoading, setCountriesLoading] = useState(true);

    useEffect(() => {
        loadProfileData();
        loadIntegrations();
        loadCurrencies();
        loadIndustries();
        loadCountries();
    }, [authOnboardingStatus]);

    const loadProfileData = () => {
        // Use onboarding status from AuthContext instead of API call
        if (authOnboardingStatus && authOnboardingStatus.profile) {
            setProfileData(authOnboardingStatus.profile);

            // Update company data with profile data
            const companyData = JSON.parse(localStorage.getItem('company') || '{}');
            const updatedCompany = {
                ...companyData,
                name: authOnboardingStatus.profile.company_name || companyData.name,
                profile: {
                    ...companyData.profile,
                    country: authOnboardingStatus.profile.country,
                    baseCurrency: authOnboardingStatus.profile.currency,
                    industry: authOnboardingStatus.profile.industry,
                    companySize: authOnboardingStatus.profile.employees_count,
                    fiscalYearStart: authOnboardingStatus.profile.fiscal_year_start,
                }
            };
            setCompany(updatedCompany);
            localStorage.setItem('company', JSON.stringify(updatedCompany));
        } else {
            // Fallback to localStorage data
            const companyData = JSON.parse(localStorage.getItem('company') || '{}');
            setCompany(companyData);
        }
    };

    const loadCurrencies = async () => {
        try {
            const currencies = await getCurrenciesRequest();
            setCurrencies(currencies);
        } catch (error) {
            console.error('Failed to load currencies:', error);
        } finally {
            setCurrenciesLoading(false);
        }
    };

    const loadIndustries = async () => {
        try {
            const industries = await getIndustriesRequest();
            setIndustries(industries);
        } catch (error) {
            console.error('Failed to load industries:', error);
        } finally {
            setIndustriesLoading(false);
        }
    };

    const loadCountries = async () => {
        try {
            const countries = await getCountriesRequest();
            setCountries(countries);
        } catch (error) {
            console.error('Failed to load countries:', error);
        } finally {
            setCountriesLoading(false);
        }
    };

    const loadIntegrations = () => {
        // Initialize demo integrations
        const demoIntegrations: Integration[] = [
            {
                id: '1',
                type: 'Banking',
                vendor: 'Chase Bank',
                status: 'error',
                lastSync: '2025-01-15T10:30:00Z'
            },
            {
                id: '2',
                type: 'Accounting',
                vendor: 'QuickBooks',
                status: 'ok',
                lastSync: '2025-01-18T14:20:00Z'
            },
            {
                id: '3',
                type: 'CRM',
                vendor: 'Salesforce',
                status: 'warning',
                lastSync: '2025-01-16T09:15:00Z'
            },
            {
                id: '4',
                type: 'E-commerce',
                vendor: 'Shopify',
                status: 'ok',
                lastSync: '2025-01-18T16:45:00Z'
            }
        ];
        setIntegrations(demoIntegrations);

        // Generate warnings based on integration status and data
        generateWarnings(demoIntegrations);
    };

    const generateWarnings = (integrations: Integration[]) => {
        const newWarnings: DataWarning[] = [];
        const now = new Date();

        integrations.forEach(integration => {
            const lastSync = new Date(integration.lastSync);
            const hoursDiff = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

            // Check for sync warnings (>72 hours)
            if (hoursDiff > 72) {
                newWarnings.push({
                    id: `sync-${integration.id}`,
                    type: 'sync',
                    severity: 'warning',
                    message: `${integration.type} (${integration.vendor}) hasn't synced in ${Math.floor(hoursDiff)} hours`,
                    dismissible: true
                });
            }

            // Check for banking disconnection
            if (integration.type === 'Banking' && integration.status === 'error') {
                newWarnings.push({
                    id: 'banking-disconnected',
                    type: 'data',
                    severity: 'error',
                    message: 'Bank feed disconnected - Financial data may be incomplete',
                    dismissible: false
                });
            }
        });

        // Demo data warnings
        newWarnings.push({
            id: 'empty-revenue',
            type: 'data',
            severity: 'error',
            message: 'No revenue data found for current month - Please check your integrations',
            dismissible: true
        });

        setWarnings(newWarnings);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ok':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Banking':
                return <CreditCard className="w-5 h-5 text-blue-600" />;
            case 'Accounting':
                return <FileText className="w-5 h-5 text-green-600" />;
            case 'CRM':
                return <Phone className="w-5 h-5 text-purple-600" />;
            case 'E-commerce':
                return <ShoppingCart className="w-5 h-5 text-orange-600" />;
            default:
                return <Building className="w-5 h-5 text-gray-600" />;
        }
    };

    const formatLastSync = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleReconnect = (integrationId: string) => {
        setIntegrations(prev =>
            prev.map(integration =>
                integration.id === integrationId
                    ? { ...integration, status: 'ok' as const, lastSync: new Date().toISOString() }
                    : integration
            )
        );

        // Regenerate warnings after reconnection
        const updatedIntegrations = integrations.map(integration =>
            integration.id === integrationId
                ? { ...integration, status: 'ok' as const, lastSync: new Date().toISOString() }
                : integration
        );
        generateWarnings(updatedIntegrations);
    };

    const handleReconnectAll = () => {
        const updatedIntegrations = integrations.map(integration => ({
            ...integration,
            status: 'ok' as const,
            lastSync: new Date().toISOString()
        }));
        setIntegrations(updatedIntegrations);
        generateWarnings(updatedIntegrations);
    };

    const dismissWarning = (warningId: string) => {
        setWarnings(prev => prev.filter(warning => warning.id !== warningId));
    };

    const handleEditProfile = () => {
        setIsEditingProfile(true);
        setEditingProfile({
            company_name: company.name || profileData?.company_name || '',
            country: company.profile?.country || profileData?.country || '',
            currency: company.profile?.baseCurrency || profileData?.currency || '',
            industry: company.profile?.industry || profileData?.industry || '',
            employees_count: company.profile?.companySize || profileData?.employees_count || null,
            fiscal_year_start: company.profile?.fiscalYearStart || profileData?.fiscal_year_start || null,
        });
    };

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);

            // Обновляем данные через API
            await updateOnboardingRequest(editingProfile);

            // Обновляем локальные данные
            const updatedCompany = {
                ...company,
                name: editingProfile.company_name,
                profile: {
                    ...company.profile,
                    country: editingProfile.country,
                    baseCurrency: editingProfile.currency,
                    industry: editingProfile.industry,
                    companySize: editingProfile.employees_count,
                    fiscalYearStart: editingProfile.fiscal_year_start,
                }
            };

            setCompany(updatedCompany);
            localStorage.setItem('company', JSON.stringify(updatedCompany));

            // Обновляем данные профиля
            setProfileData(prev => ({
                ...prev,
                ...editingProfile
            }));

            setIsEditingProfile(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setEditingProfile({});
    };

    const handleProfileChange = (field: string, value: any) => {
        setEditingProfile((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleAddIntegration = (type: string) => {
        // Demo logic - add new integration
        const newIntegration: Integration = {
            id: Date.now().toString(),
            type,
            vendor: `Demo ${type}`,
            status: 'ok',
            lastSync: new Date().toISOString()
        };
        setIntegrations(prev => [...prev, newIntegration]);
        setShowAddModal(false);
    };

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Data Warnings */}
            {/*{warnings.length > 0 && (*/}
            {/*    <div className="space-y-2">*/}
            {/*        {warnings.map(warning => (*/}
            {/*            <div*/}
            {/*                key={warning.id}*/}
            {/*                className={`flex items-center justify-between p-4 rounded-lg border ${*/}
            {/*                    warning.severity === 'error'*/}
            {/*                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'*/}
            {/*                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'*/}
            {/*                }`}*/}
            {/*            >*/}
            {/*                <div className="flex items-center space-x-3">*/}
            {/*                    {warning.severity === 'error' ? (*/}
            {/*                        <XCircle className="w-5 h-5" />*/}
            {/*                    ) : (*/}
            {/*                        <AlertTriangle className="w-5 h-5" />*/}
            {/*                    )}*/}
            {/*                    <span className="font-medium">{warning.message}</span>*/}
            {/*                </div>*/}
            {/*                {warning.dismissible && (*/}
            {/*                    <button*/}
            {/*                        onClick={() => dismissWarning(warning.id)}*/}
            {/*                        className="p-1 hover:bg-white dark:hover:bg-gray-800 hover:bg-opacity-50 rounded"*/}
            {/*                    >*/}
            {/*                        <X className="w-4 h-4" />*/}
            {/*                    </button>*/}
            {/*                )}*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*)}*/}

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Overview</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleReconnectAll}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reconnect All
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Company Profile</h2>
                        {!isEditingProfile ? (
                            <button
                                onClick={handleEditProfile}
                                className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Company Name</p>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={editingProfile.company_name || ''}
                                        onChange={(e) => handleProfileChange('company_name', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                        placeholder="Enter company name"
                                    />
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.name || profileData?.company_name || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                                {isEditingProfile ? (
                                    <select
                                        value={editingProfile.country || ''}
                                        onChange={(e) => handleProfileChange('country', e.target.value)}
                                        disabled={countriesLoading}
                                        className={`w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${countriesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">
                                            {countriesLoading ? 'Loading countries...' : 'Select country'}
                                        </option>
                                        {countries.map(country => (
                                            <option key={country.code} value={country.code}>{country.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.profile?.country || profileData?.country || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Base Currency</p>
                                {isEditingProfile ? (
                                    <select
                                        value={editingProfile.currency || ''}
                                        onChange={(e) => handleProfileChange('currency', e.target.value)}
                                        disabled={currenciesLoading}
                                        className={`w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                                            currenciesLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
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
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.profile?.baseCurrency || profileData?.currency || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                                {isEditingProfile ? (
                                    <select
                                        value={editingProfile.industry || ''}
                                        onChange={(e) => handleProfileChange('industry', e.target.value)}
                                        disabled={industriesLoading}
                                        className={`w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                                            industriesLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <option value="">
                                            {industriesLoading ? 'Loading industries...' : 'Select industry'}
                                        </option>
                                        {industries.map(industry => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.profile?.industry || profileData?.industry || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
                                {isEditingProfile ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingProfile.employees_count || ''}
                                        onChange={(e) => handleProfileChange('employees_count', parseInt(e.target.value) || null)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                        placeholder="Number of employees"
                                    />
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.profile?.companySize || profileData?.employees_count || 0}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fiscal Year Start</p>
                                {isEditingProfile ? (
                                    <input
                                        type="date"
                                        value={editingProfile.fiscal_year_start || ''}
                                        onChange={(e) => handleProfileChange('fiscal_year_start', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                    />
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {company.profile?.fiscalYearStart || profileData?.fiscal_year_start || 'Not specified'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Health */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Integration Health</h2>

                    <div className="space-y-4">
                        {integrations.map(integration => (
                            <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    {getTypeIcon(integration.type)}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{integration.type}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{integration.vendor}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(integration.status)}
                                            <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{integration.status}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatLastSync(integration.lastSync)}</p>
                                    </div>

                                    {integration.status !== 'ok' && (
                                        <button
                                            onClick={() => handleReconnect(integration.id)}
                                            className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                                        >
                                            Reconnect
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Integration Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Integration</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {['Banking', 'Accounting', 'CRM', 'E-commerce'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleAddIntegration(type)}
                                    className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {getTypeIcon(type)}
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Overview;
