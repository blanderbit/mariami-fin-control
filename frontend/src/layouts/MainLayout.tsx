import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Upload,
    MessageSquareText,
    Settings as SettingsIcon,
    Menu,
    X,
    LogOut,
    Moon,
    Sun,
    DollarSign,
    Building2,
    TrendingUp,
    TrendingDown,
    Calculator,
    FileText,
    Target,
    Globe,
    GitBranch
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar when pressing escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const navigation = [
        { name: 'Business Overview', path: '/', icon: <Building2 size={20} /> },
        { name: 'Revenues', path: '/revenues', icon: <TrendingUp size={20} /> },
        { name: 'Expenses', path: '/expenses', icon: <TrendingDown size={20} /> },
        { name: 'Unit Economics', path: '/unit-economics', icon: <Calculator size={20} /> },
        { name: 'Financial Statements', path: '/financial-statements', icon: <FileText size={20} /> },
        { name: 'Goals', path: '/goals', icon: <Target size={20} /> },
        { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 size={20} /> },
        { name: 'Market & Strategic Intelligence', path: '/market-intelligence', icon: <Globe size={20} /> },
        { name: 'Scenario Planning', path: '/scenario-planning', icon: <GitBranch size={20} /> },
        { name: 'Data Upload', path: '/upload', icon: <Upload size={20} /> },
        { name: 'AI Assistant', path: '/assistant', icon: <MessageSquareText size={20} /> },
        { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-800/60 z-10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed lg:sticky top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-20 transition-transform transform lg:transform-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
                initial={false}
            >
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Logo */}
                    <div className="p-4 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-primary-600 text-white p-1.5 rounded">
                            <DollarSign size={20} />
                        </div>
                        <h1 className="text-lg font-bold text-primary-700 dark:text-primary-400">Fin Control</h1>

                        <button
                            className="ml-auto lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 overflow-y-auto">
                        <ul className="space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-medium'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User profile */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        {user && (
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex items-center space-x-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 flex-1 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        <div className="flex items-center space-x-2 lg:hidden">
                            <div className="bg-primary-600 text-white p-1 rounded">
                                <DollarSign size={16} />
                            </div>
                            <h1 className="text-base font-bold text-primary-700 dark:text-primary-400">Fin Control</h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Placeholder for notifications or other header items */}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 sm:p-6 lg:p-8"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
