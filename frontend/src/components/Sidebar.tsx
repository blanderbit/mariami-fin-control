import React, {useState} from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    BarChart3,
    Bot,
    Settings,
    Database,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import Logo from '../assets/Logo';

const navigationItems = [
    { name: 'Business Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Data Import', path: '/data-import', icon: Database },
    { name: 'Benchmark', path: '/benchmark', icon: TrendingUp },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, pulse: true },
];

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme } = useTheme();

    return (
        <div
            className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 relative ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className={`p-6 flex items-center justify-center transition-all duration-300`}>
                <Logo
                    width={isCollapsed ? 48 : 80}
                    height={isCollapsed ? 48 : 80}
                />
            </div>

            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-1 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
            </button>

            <nav className="mt-6 px-4">
                <div className="space-y-2">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover-lift group relative ${
                                    isActive
                                        ? 'bg-[#2561E5]/10 dark:bg-[#2561E5]/20 text-[#2561E5] dark:text-[#60A5FA] royal-blue-glow'
                                        : 'text-[#6F7D99] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#12141A] dark:hover:text-gray-200'
                                }`
                            }
                            title={isCollapsed ? item.name : ''}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'} ${item.pulse && !isActive ? 'ai-pulse' : ''}`} />
                                    <span className={`whitespace-nowrap transition-all duration-300 ${
                                        isCollapsed
                                            ? 'opacity-0 w-0 overflow-hidden'
                                            : 'opacity-100 w-auto'
                                    }`}>
                                        {item.name}
                                    </span>
                                    {item.pulse && !isCollapsed && (
                                        <span className={`ml-auto w-2 h-2 bg-[#2561E5] rounded-full ai-pulse transition-opacity duration-300 ${
                                            isCollapsed ? 'opacity-0' : 'opacity-100'
                                        }`}></span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover-lift ${
                                isActive
                                    ? 'bg-[#2561E5]/10 dark:bg-[#2561E5]/20 text-[#2561E5] dark:text-[#60A5FA]'
                                    : 'text-[#6F7D99] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#12141A] dark:hover:text-gray-200'
                            }`
                        }
                        title={isCollapsed ? 'Settings' : ''}
                    >
                        <Settings className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} />
                        <span className={`whitespace-nowrap transition-all duration-300 ${
                            isCollapsed
                                ? 'opacity-0 w-0 overflow-hidden'
                                : 'opacity-100 w-auto'
                        }`}>
                            Settings
                        </span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
