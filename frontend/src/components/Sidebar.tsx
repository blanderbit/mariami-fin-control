import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    Calculator,
    FileText,
    Target,
    BarChart3,
    GitBranch,
    Bot,
    Settings,
    Brain,
    Database
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import Logo from '../assets/FinclAI Logo Blue.png';

const navigationItems = [
    { name: 'Business Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Data Import', path: '/data-import', icon: Database },
    { name: 'Benchmark', path: '/benchmark', icon: TrendingUp },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="w-64 h-screen flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="p-6">
                <div className="flex items-center justify-center space-x-2">
                    <img src={Logo} alt="FinclAI Logo" className="w-20 h-20 object-contain"/>

                    {/*<h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">*/}
                    {/*    FinCl AI*/}
                    {/*</h1>*/}
                </div>
            </div>

            <nav className="px-4 flex-1">
                <div className="space-y-2">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
