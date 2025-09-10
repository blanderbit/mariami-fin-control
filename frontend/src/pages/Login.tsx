import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Mail, Lock, ArrowRight, AlertCircle, Sun, Moon} from 'lucide-react';
import {motion} from 'framer-motion';
import {useTheme} from "../contexts/ThemeContext.tsx";
import { useAuth } from '../contexts/AuthContext';

import Logo from '../assets/FinclAI Logo Blue.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const {theme, toggleTheme} = useTheme();
    const { login, clearAuthState } = useAuth();

    const [formData, setFormData] = useState({
        email: 'd.utyuzh@codeska.com',
        password: 'stringst123'
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
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
            await login(formData.email, formData.password, true);
            debugger
            navigate('/');
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : 'Login failed' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        clearAuthState();
    }, []);

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center px-4"
        >
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
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your FinCl AI account</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.general && (
                            <motion.div
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                className="flex items-center space-x-2 text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                <AlertCircle className="w-5 h-5"/>
                                <span className="text-sm">{errors.general}</span>
                            </motion.div>
                        )}

                        <div>
                            <label htmlFor="email"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email address *
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
                                    className={`input pl-10 ${errors.email ? 'border-red-300 dark:border-red-500' : ''}`}
                                    placeholder="Enter your email"
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
                                    className={`input pl-10 ${errors.password ? 'border-red-300 dark:border-red-500' : ''}`}
                                    placeholder="Enter your password"
                                />
                            </div>
                            {errors.password &&
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white dark:focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Log in'}
                            {!isLoading && <ArrowRight className="ml-2 w-4 h-4"/>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Don't have an account?{' '}
                            <Link to="/signup"
                                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Sign up
                          </Link>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
