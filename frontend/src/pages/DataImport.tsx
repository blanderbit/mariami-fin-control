import React, { useState, useEffect } from 'react';
import {
    Download,
    Upload,
    CheckCircle,
    AlertTriangle,
    FileText,
    DollarSign,
    CreditCard,
    Calendar,
    Loader2,
    Brain,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { uploadDataFilesRequest, UploadDataFilesResponse, updateOnboardingRequest, getTemplatesRequest, TemplatesData } from '../api/auth';
import PnLConfigModal, { PnLConfig } from '../components/PnLConfigModal';

interface UploadedFile {
    name: string;
    size: number;
    uploadedAt: string;
}

interface UploadErrors {
    [key: string]: string;
}

const DataImport: React.FC = () => {
    const { onboardingStatus } = useAuth();
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: UploadedFile }>({});
    const [uploadErrors, setUploadErrors] = useState<UploadErrors>({});
    const [currentCashBalance, setCurrentCashBalance] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [isUpdatingCash, setIsUpdatingCash] = useState<boolean>(false);
    const [templates, setTemplates] = useState<TemplatesData | null>(null);
    const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
    const [showPnLConfigModal, setShowPnLConfigModal] = useState<boolean>(false);
    const [pendingPnLFile, setPendingPnLFile] = useState<File | null>(null);
    const [pnlConfig, setPnlConfig] = useState<PnLConfig | null>(null);

    // Get base currency from onboarding status
    const baseCurrency = onboardingStatus?.profile?.currency || 'USD';

    const downloadTemplate = async (templateType: string) => {
        if (!templates) {
            console.error('Templates not loaded yet');
            return;
        }

        let templateUrl = '';
        let filename = '';

        switch (templateType) {
            case 'pnl':
                templateUrl = templates.pnl;
                filename = 'pnl_template.csv';
                break;
            case 'transactions':
                templateUrl = templates.transactions;
                filename = 'transactions_template.csv';
                break;
            case 'invoices':
                templateUrl = templates.invoices;
                filename = 'invoices_template.csv';
                break;
        }

        if (!templateUrl) {
            console.error(`Template URL not found for ${templateType}`);
            return;
        }

        try {
            // Создаем временную ссылку для скачивания
            const a = document.createElement('a');
            a.href = templateUrl;
            a.download = filename;
            a.target = '_blank';
            a.click();
        } catch (error) {
            console.error('Failed to download template:', error);
        }
    };

    // Load profile data from AuthContext instead of API
    useEffect(() => {
        if (onboardingStatus && onboardingStatus.profile && onboardingStatus.profile.current_cash) {
            setCurrentCashBalance(parseFloat(onboardingStatus.profile.current_cash));
        }
    }, [onboardingStatus]);

    const loadTemplates = async () => {
        try {
            setTemplatesLoading(true);
            const templatesData = await getTemplatesRequest();
            setTemplates(templatesData);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setTemplatesLoading(false);
        }
    };

    const updateCurrentCashBalance = async (value: number) => {
        try {
            setIsUpdatingCash(true);
            await updateOnboardingRequest({ current_cash: value.toString() });
        } catch (error) {
            console.error('Failed to update current cash balance:', error);
        } finally {
            setIsUpdatingCash(false);
        }
    };

    // Загружаем шаблоны при монтировании компонента
    useEffect(() => {
        loadTemplates();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['.csv', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            setUploadErrors(prev => ({
                ...prev,
                [fileType]: `Invalid file type. Please upload ${allowedTypes.join(', ')} files only.`
            }));
            return;
        }

        // Clear previous errors and success state
        setUploadErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fileType];
            return newErrors;
        });
        setUploadSuccess(false);

        // For P&L files, show configuration modal first
        if (fileType === 'pnl') {
            setPendingPnLFile(file);
            setShowPnLConfigModal(true);
            return;
        }

        // For other file types, proceed with direct upload
        await performFileUpload(file, fileType);
    };

    const performFileUpload = async (file: File, fileType: string, config?: PnLConfig) => {
        // Set uploading state
        setIsUploading(true);

        try {
            // Prepare data for API call
            const uploadData: { [key: string]: File } = {};
            uploadData[`${fileType}_file`] = file;

            // Add P&L configuration parameters if provided
            const additionalParams: { [key: string]: any } = {};
            if (config && fileType === 'pnl') {
                additionalParams.pnl_date_column = config.pnl_date_column;
                additionalParams.pnl_expense_columns = config.pnl_expense_columns;
                additionalParams.pnl_revenue_columns = config.pnl_revenue_columns;

                // Debug logging
                console.log('P&L Configuration being sent:', {
                    pnl_date_column: config.pnl_date_column,
                    pnl_expense_columns: config.pnl_expense_columns,
                    pnl_revenue_columns: config.pnl_revenue_columns
                });
            }

            // Call API
            const response: UploadDataFilesResponse = await uploadDataFilesRequest(uploadData, additionalParams);

            if (response.status === 'success' || response.status === 'Success') {
                // Update uploaded files state
                setUploadedFiles(prev => ({
                    ...prev,
                    [fileType]: {
                        name: file.name,
                        size: file.size,
                        uploadedAt: new Date().toISOString()
                    }
                }));

                // Save to localStorage
                const company = JSON.parse(localStorage.getItem('company') || '{}');
                if (!company.dataImport) company.dataImport = {};
                company.dataImport[fileType] = {
                    filename: file.name,
                    uploadedAt: new Date().toISOString(),
                    size: file.size,
                    config: config
                };
                localStorage.setItem('company', JSON.stringify(company));

                setUploadSuccess(true);
            } else {
                // Handle API errors
                const errorMessage = response.message || 'Upload failed';
                setUploadErrors(prev => ({
                    ...prev,
                    [fileType]: errorMessage
                }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadErrors(prev => ({
                ...prev,
                [fileType]: 'Upload failed. Please try again.'
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const handlePnLConfigConfirm = async (config: PnLConfig) => {
        setPnlConfig(config);
        setShowPnLConfigModal(false);

        if (pendingPnLFile) {
            await performFileUpload(pendingPnLFile, 'pnl', config);
            setPendingPnLFile(null);
            setPnlConfig(null);
        }
    };

    const handlePnLConfigCancel = () => {
        setShowPnLConfigModal(false);
        setPendingPnLFile(null);
        setPnlConfig(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"][accept=".csv,.xls,.xlsx"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getAIMessage = (fileType: string) => {
        const messages = {
            pnl: "Once uploaded, I'll calculate your gross margin vs. peers.",
            transactions: "Upload your transactions, and I'll show cash flow volatility.",
            invoices: "I'll analyze payment patterns and predict collection timelines."
        };
        return messages[fileType as keyof typeof messages] || '';
    };

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto space-y-8"
        >
            <div className="fade-in">
                <h1 className="text-3xl font-bold text-[#12141A] dark:text-gray-100 mb-2">Data Import</h1>
                <p className="text-[#6F7D99] dark:text-gray-400">Upload your data to unlock AI-powered insights</p>
            </div>

            {/* Step 1 - P&L */}
            <div className={`bg-[#F8FAFF] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6 fade-in hover-lift ${uploadedFiles.pnl ? 'royal-blue-glow' : ''}`}>
                <div className="flex items-start space-x-4">
                    <FileText className="w-6 h-6 text-[#2561E5] mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#12141A] dark:text-gray-100 mb-2">Step 1 — Profit & Loss (P&L)</h4>
                        <p className="text-[#6F7D99] dark:text-gray-400 mb-2">Upload P&L (CSV/Excel template)</p>

                        <div className="bg-[#2561E5]/5 dark:bg-[#2561E5]/10 rounded-lg p-3 mb-4 border border-[#2561E5]/10 dark:border-[#2561E5]/20">
                            <div className="flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-[#2561E5] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#6F7D99] dark:text-gray-400 italic">{getAIMessage('pnl')}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('pnl')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all border ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                                        : 'bg-white dark:bg-gray-700 text-[#6F7D99] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download template'}
                            </button>

                            <label className={`flex items-center px-6 py-2 rounded-lg transition-all cursor-pointer font-medium ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#2561E5] to-[#1e4db8] text-white hover:shadow-lg'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload P&L'}
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'pnl')}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {uploadedFiles.pnl && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 fade-in">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        {uploadedFiles.pnl.name} ({formatFileSize(uploadedFiles.pnl.size)})
                                    </span>
                                </div>
                            </div>
                        )}

                        {uploadErrors.pnl && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.pnl}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 2 - Transactions */}
            <div className={`bg-[#F8FAFF] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6 fade-in hover-lift ${uploadedFiles.transactions ? 'royal-blue-glow' : ''}`}>
                <div className="flex items-start space-x-4">
                    <CreditCard className="w-6 h-6 text-[#2561E5] mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#12141A] dark:text-gray-100 mb-2">Step 2 — Transactions</h4>
                        <p className="text-[#6F7D99] dark:text-gray-400 mb-2">Upload Transactions (CSV/Excel template)</p>

                        <div className="bg-[#2561E5]/5 dark:bg-[#2561E5]/10 rounded-lg p-3 mb-4 border border-[#2561E5]/10 dark:border-[#2561E5]/20">
                            <div className="flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-[#2561E5] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#6F7D99] dark:text-gray-400 italic">{getAIMessage('transactions')}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('transactions')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all border ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                                        : 'bg-white dark:bg-gray-700 text-[#6F7D99] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download template'}
                            </button>

                            <label className={`flex items-center px-6 py-2 rounded-lg transition-all cursor-pointer font-medium ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#2561E5] to-[#1e4db8] text-white hover:shadow-lg'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload Transactions'}
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'transactions')}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {uploadedFiles.transactions && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 fade-in">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        {uploadedFiles.transactions.name} ({formatFileSize(uploadedFiles.transactions.size)})
                                    </span>
                                </div>
                            </div>
                        )}

                        {uploadErrors.transactions && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.transactions}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 3 - Invoices */}
            <div className={`bg-[#F8FAFF] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6 fade-in hover-lift ${uploadedFiles.invoices ? 'royal-blue-glow' : ''}`}>
                <div className="flex items-start space-x-4">
                    <Calendar className="w-6 h-6 text-[#2561E5] mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#12141A] dark:text-gray-100 mb-2">Step 3 — Invoices (A/R)</h4>
                        <p className="text-[#6F7D99] dark:text-gray-400 mb-2">Upload Invoices (CSV/Excel template)</p>

                        <div className="bg-[#2561E5]/5 dark:bg-[#2561E5]/10 rounded-lg p-3 mb-4 border border-[#2561E5]/10 dark:border-[#2561E5]/20">
                            <div className="flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-[#2561E5] mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-[#6F7D99] dark:text-gray-400 italic">{getAIMessage('invoices')}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('invoices')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-all border ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                                        : 'bg-white dark:bg-gray-700 text-[#6F7D99] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download template'}
                            </button>

                            <label className={`flex items-center px-6 py-2 rounded-lg transition-all cursor-pointer font-medium ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#2561E5] to-[#1e4db8] text-white hover:shadow-lg'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload Invoices'}
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'invoices')}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {uploadedFiles.invoices && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 fade-in">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        {uploadedFiles.invoices.name} ({formatFileSize(uploadedFiles.invoices.size)})
                                    </span>
                                </div>
                            </div>
                        )}

                        {uploadErrors.invoices && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.invoices}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 4 - Current Cash Balance */}
            <div className="bg-[#F8FAFF] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-6 fade-in hover-lift">
                <div className="flex items-start space-x-4">
                    <DollarSign className="w-6 h-6 text-[#2561E5] mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#12141A] dark:text-gray-100 mb-2">Step 4 — Current Cash Balance</h4>
                        <p className="text-[#6F7D99] dark:text-gray-400 mb-2">Optional: enter your current bank balance</p>

                        {/* Отображение текущего значения */}
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-medium">Current value:</span> {currentCashBalance ? `${currentCashBalance.toLocaleString()} ${baseCurrency}` : 'Not set'}
                            </p>
                        </div>

                        <div className="max-w-xs">
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={currentCashBalance || ''}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        setCurrentCashBalance(value);
                                        updateCurrentCashBalance(value);
                                    }}
                                    className="w-full pl-4 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2561E5] focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
                                    placeholder="e.g. 12,500"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6F7D99] dark:text-gray-400 text-sm">
                                    {baseCurrency}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {uploadSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Files uploaded successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your data has been processed and is ready for analysis.
                    </p>
                </div>
            )}

            {/* Validation Notes */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 fade-in">
                <h5 className="font-semibold text-[#12141A] dark:text-gray-100 mb-3">Validation & Normalization</h5>
                <ul className="text-sm text-[#6F7D99] dark:text-gray-400 space-y-2">
                    <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <span>Required columns must be present (use provided templates)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <span>Dates should use YYYY-MM-DD format</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#2561E5] rounded-full mt-2"></div>
                        <span>Currency conversion to base currency ({baseCurrency}) will be applied</span>
                    </li>
                </ul>
            </div>

            {/* P&L Configuration Modal */}
            <PnLConfigModal
                isOpen={showPnLConfigModal}
                onClose={handlePnLConfigCancel}
                onConfirm={handlePnLConfigConfirm}
                file={pendingPnLFile}
            />
        </motion.div>
    );
};

export default DataImport;
