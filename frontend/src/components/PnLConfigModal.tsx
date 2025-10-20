import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PnLConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: PnLConfig) => void;
    file: File | null;
}

export interface PnLConfig {
    pnl_date_column: string;
    pnl_expense_columns: string[];
    pnl_revenue_columns: string[];
}

interface ColumnData {
    name: string;
    values: string[];
}

const PnLConfigModal: React.FC<PnLConfigModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    file
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [columns, setColumns] = useState<ColumnData[]>([]);
    const [selectedDateValue, setSelectedDateValue] = useState<string>('');
    const [expenseColumns, setExpenseColumns] = useState<string[]>([]);
    const [revenueColumns, setRevenueColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen && file) {
            setCurrentStep(1);
            setSelectedDateValue('');
            setExpenseColumns([]);
            setRevenueColumns([]);
            setError('');
            setIsLoading(false);
            parseFile();
        } else if (!isOpen) {
            // Reset all state when modal closes
            setCurrentStep(1);
            setSelectedDateValue('');
            setExpenseColumns([]);
            setRevenueColumns([]);
            setError('');
            setIsLoading(false);
            setColumns([]);
        }
    }, [isOpen, file]);

    const parseFile = async () => {
        if (!file) {
            setError('No file provided');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                throw new Error('File must have at least a header row and one data row');
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const dataRows = lines.slice(1, Math.min(6, lines.length)); // Take first 5 data rows for preview

            const parsedColumns: ColumnData[] = headers.map(header => {
                const values = dataRows.map(row => {
                    const cells = row.split(',').map(c => c.trim().replace(/"/g, ''));
                    const index = headers.indexOf(header);
                    return cells[index] || '';
                }).filter(val => val);

                return {
                    name: header,
                    values: values
                };
            });

            setColumns(parsedColumns);
        } catch (err) {
            setError('Failed to parse file. Please ensure it\'s a valid CSV file.');
            console.error('File parsing error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getDateColumnOptions = () => {
        return columns.filter(col =>
            col.name.toLowerCase().includes('date') ||
            col.name.toLowerCase().includes('period') ||
            col.name.toLowerCase().includes('month') ||
            col.name.toLowerCase().includes('year')
        );
    };

    const getDateValues = () => {
        // Find the date column automatically
        const dateCol = columns.find(col =>
            col.name.toLowerCase().includes('date') ||
            col.name.toLowerCase().includes('period') ||
            col.name.toLowerCase().includes('month') ||
            col.name.toLowerCase().includes('year')
        );
        return dateCol ? [...new Set(dateCol.values)] : []; // Remove duplicates
    };

    const getNonDateColumns = () => {
        // Find the date column automatically and exclude it
        const dateColName = columns.find(col =>
            col.name.toLowerCase().includes('date') ||
            col.name.toLowerCase().includes('period') ||
            col.name.toLowerCase().includes('month') ||
            col.name.toLowerCase().includes('year')
        )?.name;
        return columns.filter(col => col.name !== dateColName);
    };

    const getAvailableRevenueColumns = () => {
        return getNonDateColumns().filter(col =>
            !expenseColumns.includes(col.name)
        );
    };

    const canProceedToNext = () => {
        switch (currentStep) {
            case 1:
                return selectedDateValue !== '';
            case 2:
                return expenseColumns.length > 0;
            case 3:
                return revenueColumns.length > 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceedToNext() && currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleConfirm = () => {
        if (canProceedToNext()) {
            const config: PnLConfig = {
                pnl_date_column: selectedDateValue,
                pnl_expense_columns: expenseColumns,
                pnl_revenue_columns: revenueColumns
            };
            onConfirm(config);
            onClose();
        }
    };

    const toggleExpenseColumn = (columnName: string) => {
        setExpenseColumns(prev =>
            prev.includes(columnName)
                ? prev.filter(col => col !== columnName)
                : [...prev, columnName]
        );
    };

    const toggleRevenueColumn = (columnName: string) => {
        setRevenueColumns(prev =>
            prev.includes(columnName)
                ? prev.filter(col => col !== columnName)
                : [...prev, columnName]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Configure P&L File
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Step {currentStep} of 3
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="p-4">
                        <div className="flex items-center w-full">
                            {/* Step 1 */}
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        currentStep >= 1
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                                >
                                    {currentStep > 1 ? <Check className="w-4 h-4" /> : 1}
                                </div>
                            </div>

                            {/* Line 1 */}
                            <div
                                className={`flex-1 h-1 mx-4 ${
                                    currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            />

                            {/* Step 2 */}
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        currentStep >= 2
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                                >
                                    {currentStep > 2 ? <Check className="w-4 h-4" /> : 2}
                                </div>
                            </div>

                            {/* Line 2 */}
                            <div
                                className={`flex-1 h-1 mx-4 ${
                                    currentStep > 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            />

                            {/* Step 3 */}
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        currentStep >= 3
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                                >
                                    {currentStep > 3 ? <Check className="w-4 h-4" /> : 3}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Parsing file...</span>
                            </div>
                        ) : error ? (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Step 1: Date Selection */}
                                {currentStep === 1 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            Select Date
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Choose a specific date value from your P&L data.
                                        </p>
                                        
                                        <div className="space-y-2">
                                            {getDateValues().map((value) => (
                                                <label
                                                    key={value}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        selectedDateValue === value
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="dateValue"
                                                        value={value}
                                                        checked={selectedDateValue === value}
                                                        onChange={(e) => setSelectedDateValue(e.target.value)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {value}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Expense Columns Selection */}
                                {currentStep === 2 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            Select Expense Columns
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Choose all columns that represent expenses or costs in your P&L data.
                                        </p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {getNonDateColumns().map((column) => (
                                                <label
                                                    key={column.name}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        expenseColumns.includes(column.name)
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={expenseColumns.includes(column.name)}
                                                        onChange={() => toggleExpenseColumn(column.name)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {column.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Sample values: {column.values.slice(0, 3).join(', ')}
                                                            {column.values.length > 3 && '...'}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Revenue Columns Selection */}
                                {currentStep === 3 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            Select Revenue Columns
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Choose all columns that represent revenue or income in your P&L data.
                                        </p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {getAvailableRevenueColumns().map((column) => (
                                                <label
                                                    key={column.name}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        revenueColumns.includes(column.name)
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={revenueColumns.includes(column.name)}
                                                        onChange={() => toggleRevenueColumn(column.name)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {column.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Sample values: {column.values.slice(0, 3).join(', ')}
                                                            {column.values.length > 3 && '...'}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Validation Messages */}
                                {!canProceedToNext() && (
                                    <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            {currentStep === 1 && 'Please select a date value'}
                                            {currentStep === 2 && 'Please select at least one expense column'}
                                            {currentStep === 3 && 'Please select at least one revenue column'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                currentStep === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedToNext()}
                                    className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                                        canProceedToNext()
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    disabled={!canProceedToNext()}
                                    className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                                        canProceedToNext()
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PnLConfigModal;
