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
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadDataFilesRequest, UploadDataFilesResponse, updateOnboardingRequest, getOnboardingStatusRequest, getTemplatesRequest, TemplatesData } from '../api/auth';

interface UploadedFile {
    name: string;
    size: number;
    uploadedAt: string;
}

interface UploadErrors {
    [key: string]: string;
}

const DataImport: React.FC = () => {
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: UploadedFile }>({});
    const [uploadErrors, setUploadErrors] = useState<UploadErrors>({});
    const [currentCashBalance, setCurrentCashBalance] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [isUpdatingCash, setIsUpdatingCash] = useState<boolean>(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
    const [templates, setTemplates] = useState<TemplatesData | null>(null);
    const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);

    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

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

    const loadProfileData = async () => {
        try {
            setIsLoadingProfile(true);
            const onboardingStatus = await getOnboardingStatusRequest();
            if (onboardingStatus && onboardingStatus.profile && onboardingStatus.profile.current_cash) {
                setCurrentCashBalance(parseFloat(onboardingStatus.profile.current_cash));
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

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

    // Загружаем данные профиля и шаблоны при монтировании компонента
    useEffect(() => {
        loadProfileData();
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

        // Set uploading state
        setIsUploading(true);

        try {
            // Prepare data for API call
            const uploadData: { [key: string]: File } = {};
            uploadData[`${fileType}_file`] = file;

            // Call API
            const response: UploadDataFilesResponse = await uploadDataFilesRequest(uploadData);

            if (response.status === 'success') {
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
                    size: file.size
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="max-w-7xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Data Import</h1>
                <p className="text-gray-600 dark:text-gray-400">Upload your data to see analytics and market insights</p>
            </div>

            {/* Step 1 - P&L */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                    <FileText className="w-6 h-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Step 1 — Profit & Loss (P&L)</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">📂 Upload P&L (CSV/Excel template)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Export from QuickBooks/Xero or copy your Excel into our template.</p>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('pnl')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download P&L template'}
                            </button>

                            <label className={`flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload P&L file'}
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
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm">
                  {uploadedFiles.pnl.name} ({formatFileSize(uploadedFiles.pnl.size)}) uploaded successfully
                </span>
                            </div>
                        )}

                        {uploadErrors.pnl && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.pnl}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 2 - Transactions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                    <CreditCard className="w-6 h-6 text-green-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Step 2 — Transactions</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">📂 Upload Transactions (CSV/Excel template)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Income/Expense rows with categories.</p>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('transactions')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download Transactions template'}
                            </button>

                            <label className={`flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload Transactions file'}
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
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm">
                  {uploadedFiles.transactions.name} ({formatFileSize(uploadedFiles.transactions.size)}) uploaded successfully
                </span>
                            </div>
                        )}

                        {uploadErrors.transactions && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.transactions}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 3 - Invoices */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                    <Calendar className="w-6 h-6 text-purple-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Step 3 — Invoices (A/R)</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">📂 Upload Invoices (CSV/Excel template)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Issued/Due dates and Status are important for cash forecasting.</p>

                        <div className="flex space-x-3 mb-4">
                            <button
                                onClick={() => downloadTemplate('invoices')}
                                disabled={templatesLoading || !templates}
                                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                    templatesLoading || !templates
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                {templatesLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                {templatesLoading ? 'Loading...' : 'Download Invoices template'}
                            </button>

                            <label className={`flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                isUploading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}>
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {isUploading ? 'Uploading...' : 'Upload Invoices file'}
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
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm">
                  {uploadedFiles.invoices.name} ({formatFileSize(uploadedFiles.invoices.size)}) uploaded successfully
                </span>
                            </div>
                        )}

                        {uploadErrors.invoices && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">{uploadErrors.invoices}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Step 4 - Current Cash Balance */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                    <DollarSign className="w-6 h-6 text-yellow-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Step 4 — Current Cash Balance</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">Optional: enter your current bank balance</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Used to calculate Ending Cash. If empty, we will show only Net Cash Flow.</p>
                        
                        {/* Отображение текущего значения */}
                        {!isLoadingProfile && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <span className="font-medium">Current value:</span> {currentCashBalance ? `${currentCashBalance.toLocaleString()} ${baseCurrency}` : 'Not set'}
                                </p>
                            </div>
                        )}

                        <div className="max-w-md">
                            <div className="flex space-x-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={currentCashBalance || ''}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            setCurrentCashBalance(value);
                                        }}
                                        className="w-full pl-4 pr-16 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100"
                                        placeholder="e.g. 12,500"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                                        {baseCurrency}
                                    </span>
                                </div>
                                <button
                                    onClick={() => updateCurrentCashBalance(currentCashBalance)}
                                    disabled={isUpdatingCash}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                                        isUpdatingCash
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {isUpdatingCash ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Update'
                                    )}
                                </button>
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Validation & Normalization</h5>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Required columns must be present (use provided templates)</li>
                    <li>• Dates should use YYYY-MM-DD format</li>
                    <li>• Amounts must be numeric values</li>
                    <li>• Categories will be normalized to: Sales, COGS, Payroll, Rent, Marketing, Other</li>
                    <li>• Currency conversion to base currency ({baseCurrency}) will be applied</li>
                    <li>• Duplicate entries will be removed based on Invoice_ID and Date+Amount+Client_Supplier</li>
                </ul>
            </div>
        </motion.div>
    );
};

export default DataImport;
