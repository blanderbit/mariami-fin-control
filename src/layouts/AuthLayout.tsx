import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

function AuthLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Logo */}
            <div className="flex items-center justify-center pt-10 pb-6">
                <div className="flex items-center space-x-2">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-primary-600 text-white p-2 rounded-lg"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </motion.div>
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl font-bold text-primary-700 dark:text-primary-400"
                    >
                        Fin Control
                    </motion.h1>
                </div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 flex items-center justify-center px-4"
            >
                <Outlet />
            </motion.div>

            <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Fin Control. All rights reserved.
            </footer>
        </div>
    );
}

export default AuthLayout;
