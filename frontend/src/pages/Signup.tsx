import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Brain, Mail, Lock, Building, ArrowRight, AlertCircle, CheckCircle, Sun, Moon, ExternalLink} from 'lucide-react';
import {useTheme} from "../contexts/ThemeContext.tsx";
import {motion} from 'framer-motion';
import {useAuth} from '../contexts/AuthContext';
import {getDocumentsRequest, DocumentsData} from '../api/auth';

import Logo from "../assets/FinclAI Logo Blue.png";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const {theme, toggleTheme} = useTheme();
    const {register, user, loading} = useAuth();

    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [documents, setDocuments] = useState<DocumentsData | null>(null);
    const [documentsLoading, setDocumentsLoading] = useState(true);

    const loadDocuments = async () => {
        try {
            setDocumentsLoading(true);
            const documentsData = await getDocumentsRequest();
            setDocuments(documentsData);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setDocumentsLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    useEffect(() => {
        // Ждем пока загрузятся данные
        if (loading) {
            return;
        }

        // Если пользователь уже авторизован, редиректим
        if (user) {
            if (user.is_onboarded) {
                navigate('/overview');
            } else {
                navigate('/onboarding');
            }
        }
    }, [user, loading, navigate]);

    const openDocument = (documentType: 'terms_of_service' | 'privacy_policy') => {
        if (!documents) {
            console.error('Documents not loaded yet');
            return;
        }

        const url = documents[documentType];
        if (!url) {
            console.error(`Document URL not found for ${documentType}`);
            return;
        }

        // Открываем документ в новом окне
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Work email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the Terms of Service';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Используем register из AuthContext
            await register(
                formData.email,
                formData.password,
                formData.confirmPassword,
                formData.companyName, // используем companyName как name
                '' // last_name пока не заполняем
            );

            navigate('/onboarding');
        } catch (err: any) {
            setErrors({general: err?.message || 'Signup failed'});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="relative min-h-screen overflow-hidden"
        >
            <div
                className="absolute inset-0"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(to bottom, #0F0F10 0%, #2E2E2E 100%)'
                        : 'linear-gradient(to bottom, #F2F5FB 0%, #FFFFFF 100%)'
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(ellipse at center 60%, rgba(37,97,229,0.30) 0%, rgba(37,97,229,0.00) 60%)'
                        : 'radial-gradient(ellipse at center 60%, rgba(37,97,229,0.25) 0%, rgba(37,97,229,0.00) 60%)'
                }}
            />

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                </button>

                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <motion.div
                            initial={{scale: 0.8, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            transition={{duration: 0.5}} className="flex justify-center">
                            <img src={Logo} alt="FinclAI Logo" className="w-20 h-20 object-contain"/>
                        </motion.div>
                        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Create account</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Start your financial AI journey</p>
                    </div>

                    <div className="card p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="companyName"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Company Name *
                                </label>
                                <div className="relative">
                                    <Building
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        id="companyName"
                                        name="companyName"
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#2561E5] focus:outline-none transition-all bg-white dark:bg-gray-800 border text-gray-900 dark:text-gray-100 ${
                                            errors.companyName
                                                ? 'border-red-300 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Enter your company name"
                                    />
                                </div>
                                {errors.companyName &&
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>}
                            </div>

                            <div>
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Work Email *
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#2561E5] focus:outline-none transition-all bg-white dark:bg-gray-800 border text-gray-900 dark:text-gray-100 ${
                                            errors.email
                                                ? 'border-red-300 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Enter your work email"
                                    />
                                </div>
                                {errors.email &&
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={8}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#2561E5] focus:outline-none transition-all bg-white dark:bg-gray-800 border text-gray-900 dark:text-gray-100 ${
                                            errors.password
                                                ? 'border-red-300 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Create a password (min 8 characters)"
                                    />
                                </div>
                                {errors.password &&
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-[#2561E5] focus:outline-none transition-all bg-white dark:bg-gray-800 border text-gray-900 dark:text-gray-100 ${
                                            errors.confirmPassword
                                                ? 'border-red-300 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                                {errors.confirmPassword &&
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    required
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="acceptTerms"
                                       className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    I accept the{' '}
                                    <button
                                        type="button"
                                        onClick={() => openDocument('terms_of_service')}
                                        disabled={documentsLoading || !documents}
                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                    >
                                        Terms of Service
                                        {!documentsLoading && documents && (
                                            <ExternalLink className="w-3 h-3 ml-1"/>
                                        )}
                                    </button>
                                    {' '}
                                    and{' '}
                                    <button
                                        type="button"
                                        onClick={() => openDocument('privacy_policy')}
                                        disabled={documentsLoading || !documents}
                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                    >
                                        Privacy Policy
                                        {!documentsLoading && documents && (
                                            <ExternalLink className="w-3 h-3 ml-1"/>
                                        )}
                                    </button>
                                </label>
                            </div>
                            {errors.acceptTerms &&
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}

                            {errors.general && (
                                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4"/>
                                    <span>{errors.general}</span>
                                </div>
                            )}

                             <button
                                 type="submit"
                                 disabled={isLoading}
                                 className="w-full flex items-center justify-center px-4 py-3 border-none text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                 style={{
                                     background: 'linear-gradient(to bottom, #3A75F2, #1E4FCC)',
                                     color: '#FFFFFF'
                                 }}
                                 onMouseEnter={(e) => {
                                     if (!isLoading) {
                                         e.currentTarget.style.boxShadow = '0 0 12px rgba(37,97,229,0.60)';
                                     }
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.boxShadow = 'none';
                                 }}
                             >
                                 {isLoading ? 'Creating account...' : 'Sign up →'}
                             </button>
                        </form>

                        <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Already have an account?{' '}
                            <Link to="/login"
                                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Sign in
                          </Link>
                        </span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                input::placeholder {
                    color: #9AA3B2;
                }

                .dark input::placeholder {
                    color: #6B7280;
                }

                input:focus {
                    border-color: #2561E5 !important;
                }
            `}</style>
        </motion.div>
    );
};

export default Signup;
