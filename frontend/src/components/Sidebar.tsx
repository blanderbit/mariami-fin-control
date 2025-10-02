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
    Database,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext';

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
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300 ease-in-out`}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`transition-all duration-300 overflow-hidden ${
                        isCollapsed
                            ? 'w-0 opacity-0'
                            : 'w-auto opacity-100'
                    }`}>
                        <div className="flex items-center justify-center space-x-2">
                            <img src={Logo} alt="FinclAI Logo" className="w-20 h-20 object-contain"/>
                        </div>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                </div>
            </div>

            <nav className="px-4 flex-1">
                <div className="space-y-2">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center ${isCollapsed ? 'justify-center px-4' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                                }`
                            }
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                                isCollapsed
                                    ? 'w-0 opacity-0'
                                    : 'w-auto opacity-100'
                            }`}>
                                {item.name}
                            </span>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
