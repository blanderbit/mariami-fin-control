import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, CreditCard as Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LogoIcon from '../assets/LogoIcon';

type MessageType = 'ai' | 'user';
type ConversationStage = 'greeting' | 'period-selection' | 'analyzing' | 'analysis-shown' | 'asking-context' | 'confirmation' | 'recommendations' | 'closing';

interface Message {
    id: string;
    type: MessageType;
    text: string;
    timestamp: Date;
}

interface AINote {
    month: string;
    type: string;
    amount?: number;
    comment: string;
}

interface ConversationalAIProps {
    companyProfile?: {
        industry?: string;
        country?: string;
        employees?: number;
    };
    financialData?: {
        revenue: number;
        expenses: number;
        profit: number;
        cashBuffer: number;
    };
    baseCurrency: string;
}

const ConversationalAI: React.FC<ConversationalAIProps> = ({
                                                               companyProfile = { industry: 'business', employees: 10 },
                                                               financialData = { revenue: 47000, expenses: 42000, profit: 5000, cashBuffer: 1.6 },
                                                               baseCurrency = 'USD'
                                                           }) => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [stage, setStage] = useState<ConversationStage>('greeting');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [aiNotes, setAiNotes] = useState<AINote[]>([]);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: baseCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0) {
            setTimeout(() => {
                addAIMessage(
                    `Welcome back to FinCl AI. Let's review how your ${companyProfile.industry || 'business'} performed recently.`
                );
                setTimeout(() => {
                    addAIMessage("Which period would you like to analyse?");
                    setStage('period-selection');
                }, 1500);
            }, 500);
        }
    }, []);

    const addAIMessage = (text: string) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `msg-${Date.now()}`,
                type: 'ai',
                text,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1000);
    };

    const addUserMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            type: 'user',
            text,
            timestamp: new Date()
        }]);
    };

    const handlePeriodSelection = (period: string) => {
        addUserMessage(period);
        setSelectedPeriod(period);
        setStage('analyzing');

        setTimeout(() => {
            addAIMessage(`Got it. Analysing ${period.toLowerCase()} results...`);
            setTimeout(() => {
                showAnalysis(period);
            }, 2000);
        }, 500);
    };

    const showAnalysis = (period: string) => {
        const revenueChange = 8.5;
        const expenseChange = 25;
        const profitMargin = ((financialData.revenue - financialData.expenses) / financialData.revenue * 100).toFixed(1);

        const analysisText = `Revenue held steady at ${formatCurrency(financialData.revenue)} while expenses rose ${expenseChange}%, mainly from payroll and marketing. Your cash buffer shortened from 2.4 to ${financialData.cashBuffer} months.`;

        addAIMessage(analysisText);
        setStage('analysis-shown');

        setTimeout(() => {
            if (expenseChange > 20 || financialData.cashBuffer < 2) {
                askContextualQuestion();
            } else {
                provideRecommendations();
            }
        }, 2000);
    };

    const askContextualQuestion = () => {
        setStage('asking-context');
        addAIMessage("Did you take any owner withdrawals or make one-off purchases this month?");
    };

    const handleContextResponse = (response: string) => {
        addUserMessage(response);
        setStage('confirmation');

        setTimeout(() => {
            let confirmationText = '';
            let noteType = '';

            switch(response) {
                case 'Dividends':
                    confirmationText = "Got it — logged as £2k dividend for August. Excluding that, profit margins remain stable.";
                    noteType = 'dividend';
                    break;
                case 'One-off Expense':
                    confirmationText = "Understood — one-time equipment purchase noted. This won't affect trend analysis.";
                    noteType = 'one-off-expense';
                    break;
                case 'New Client/Event':
                    confirmationText = "Excellent — new client revenue spike recorded. This helps explain the growth pattern.";
                    noteType = 'new-client';
                    break;
                case 'No Special Events':
                    confirmationText = "Noted — no exceptional items this period.";
                    noteType = 'none';
                    break;
                default:
                    confirmationText = "Thank you for the context. I've saved this information.";
                    noteType = 'custom';
            }

            setAiNotes(prev => [...prev, {
                month: 'August',
                type: noteType,
                amount: response === 'Dividends' ? 2000 : undefined,
                comment: response
            }]);

            addAIMessage(confirmationText);

            setTimeout(() => {
                provideRecommendations();
            }, 1500);
        }, 500);
    };

    const provideRecommendations = () => {
        setStage('recommendations');

        setTimeout(() => {
            let recommendation = '';

            if (financialData.cashBuffer < 2) {
                recommendation = "To rebuild liquidity, aim to restore a 2-month buffer before the next withdrawal. This provides essential runway for unexpected expenses.";
            } else if (companyProfile.employees && companyProfile.employees >= 10) {
                recommendation = "For a 10-20 person services business, keeping payroll under 55% of revenue helps maintain profitability. You're currently at 47% — well positioned.";
            } else {
                recommendation = "Your profit margins are healthy. Consider reinvesting in growth initiatives or building additional cash reserves.";
            }

            addAIMessage(recommendation);

            setTimeout(() => {
                showClosing();
            }, 1500);
        }, 1000);
    };

    const showClosing = () => {
        setStage('closing');
        addAIMessage("Would you like me to show how these trends evolved over the last 3 months?");
    };

    const handleClosingResponse = (response: string) => {
        addUserMessage(response);

        setTimeout(() => {
            if (response === 'Yes, show trend') {
                addAIMessage("Great! I'll prepare a detailed trend analysis. This feature is coming soon in the full dashboard view.");
            } else {
                addAIMessage("No problem. I'm here whenever you need insights. Have a great day!");
            }
        }, 500);
    };

    const renderButtons = () => {
        if (stage === 'period-selection') {
            return (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {['This Month', 'Last Month', 'Last 3 Months', 'Quarter vs Previous'].map((period) => (
                        <button
                            key={period}
                            onClick={() => handlePeriodSelection(period)}
                            className="px-4 py-2 bg-gradient-to-r from-[#3A75F2] to-[#2557C7] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                            {period}
                        </button>
                    ))}
                </div>
            );
        }

        if (stage === 'asking-context') {
            return (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {['Dividends', 'One-off Expense', 'New Client/Event', 'No Special Events'].map((option) => (
                        <button
                            key={option}
                            onClick={() => handleContextResponse(option)}
                            className="px-4 py-2 bg-gradient-to-r from-[#3A75F2] to-[#2557C7] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                            {option === 'Dividends' && '💸 '}
                            {option === 'One-off Expense' && '🧾 '}
                            {option === 'New Client/Event' && '🚀 '}
                            {option}
                        </button>
                    ))}
                </div>
            );
        }

        if (stage === 'closing') {
            return (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {['Yes, show trend', 'Skip for now'].map((option) => (
                        <button
                            key={option}
                            onClick={() => handleClosingResponse(option)}
                            className="px-4 py-2 bg-gradient-to-r from-[#3A75F2] to-[#2557C7] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                            {option === 'Yes, show trend' && '📊 '}
                            {option === 'Skip for now' && '⏭ '}
                            {option}
                        </button>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="col-span-12 lg:col-span-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col" style={{ height: '600px' }}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-[#3A75F2] to-[#2557C7] rounded-lg">
                        <LogoIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#0F1A2B] dark:text-gray-100">FinCl AI Insights</h3>
                        <p className="text-xs text-[#64748B] dark:text-gray-400">Beta Dialog Mode</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowNotesModal(true)}
                    className="text-xs text-[#3A75F2] hover:text-[#2557C7] dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
                >
                    <span>Manage Notes</span>
                    <Edit3 className="w-3 h-3" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 ${
                                message.type === 'ai'
                                    ? 'bg-gradient-to-r from-[#F8FAFF] to-[#EEF4FF] dark:from-gray-700 dark:to-gray-600 border border-[#3A75F2]/20 dark:border-blue-500/20 shadow-sm'
                                    : 'bg-gradient-to-r from-[#3A75F2] to-[#2557C7] text-white shadow-md'
                            }`}
                        >
                            {message.type === 'ai' && (
                                <div className="flex items-start space-x-2 mb-1">
                                    <LogoIcon className="w-3 h-3 text-[#3A75F2] dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-[#3A75F2] dark:text-blue-400">FinCl AI</p>
                                </div>
                            )}
                            <p className={`text-sm leading-relaxed ${message.type === 'ai' ? 'text-[#0F1A2B] dark:text-gray-100' : 'text-white'}`}>
                                {message.text}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl p-3 bg-gradient-to-r from-[#F8FAFF] to-[#EEF4FF] dark:from-gray-700 dark:to-gray-600 border border-[#3A75F2]/20 dark:border-blue-500/20">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-[#3A75F2] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#3A75F2] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#3A75F2] dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {renderButtons()}
            </div>

            {showNotesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotesModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#0F1A2B] dark:text-gray-100">AI Notes</h3>
                            <button onClick={() => setShowNotesModal(false)} className="text-[#64748B] hover:text-[#0F1A2B] dark:hover:text-gray-100">✕</button>
                        </div>
                        {aiNotes.length === 0 ? (
                            <p className="text-sm text-[#64748B] dark:text-gray-400 text-center py-8">No notes saved yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {aiNotes.map((note, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-sm font-medium text-[#0F1A2B] dark:text-gray-100">{note.month} - {note.type}</p>
                                        <p className="text-xs text-[#64748B] dark:text-gray-400 mt-1">{note.comment}</p>
                                        {note.amount && <p className="text-xs text-[#3A75F2] dark:text-blue-400 mt-1">{formatCurrency(note.amount)}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationalAI;
