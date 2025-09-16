import React, { useState } from 'react';
import {
    Download,
    Upload,
    CheckCircle,
    AlertTriangle,
    FileText,
    DollarSign,
    CreditCard,
    Calendar
} from 'lucide-react';

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

    // Get company data
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    const baseCurrency = company.profile?.baseCurrency || 'USD';

    const downloadTemplate = (templateType: string) => {
        let csvContent = '';
        let filename = '';

        switch (templateType) {
            case 'pnl':
                csvContent = `Category,Amount,Currency,Period\nSales,50000,${baseCurrency},2024-01\nCOGS,-20000,${baseCurrency},2024-01\nPayroll,-15000,${baseCurrency},2024-01\nRent,-3000,${baseCurrency},2024-01\nMarketing,-2000,${baseCurrency},2024-01\nOther,-1000,${baseCurrency},2024-01`;
                filename = 'pnl_template.csv';
                break;
            case 'transactions':
                csvContent = `Date,Type,Category,Description,Amount,Currency,Client_Supplier\n2024-01-15,Income,Sales,Product Sale,1500,${baseCurrency},Client ABC\n2024-01-16,Expense,Marketing,Google Ads,-200,${baseCurrency},Google\n2024-01-17,Income,Sales,Service Revenue,2500,${baseCurrency},Client XYZ\n2024-01-18,Expense,Payroll,Salary Payment,-5000,${baseCurrency},Employee`;
                filename = 'transactions_template.csv';
                break;
            case 'invoices':
                csvContent = `Invoice_ID,Date,Due_Date,Client,Description,Amount,Currency,Status\nINV-001,2024-01-15,2024-02-15,Client ABC,Consulting Services,5000,${baseCurrency},Paid\nINV-002,2024-01-20,2024-02-20,Client XYZ,Product Sale,3000,${baseCurrency},Unpaid\nINV-003,2024-01-25,2024-02-25,Client DEF,Monthly Subscription,1500,${baseCurrency},Overdue`;
                filename = 'invoices_template.csv';
                break;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
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

        // Clear previous errors
        setUploadErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fileType];
            return newErrors;
        });

        // Simulate file processing
        setTimeout(() => {
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
        }, 1000);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
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
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download P&L template
                            </button>

                            <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload P&L file
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'pnl')}
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
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Transactions template
                            </button>

                            <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Transactions file
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'transactions')}
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
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoices template
                            </button>

                            <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Invoices file
                                <input
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={(e) => handleFileUpload(e, 'invoices')}
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
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Used to calculate Ending Cash. If empty, we will show only Net Cash Flow.</p>

                        <div className="max-w-xs">
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={currentCashBalance || ''}
                                    onChange={(e) => setCurrentCashBalance(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-4 pr-16 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100"
                                    placeholder="e.g. 12,500"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  {baseCurrency}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
};

export default DataImport;
