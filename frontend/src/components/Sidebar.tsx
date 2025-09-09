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
    Brain
} from 'lucide-react';

const navigationItems = [
    { name: 'Business Overview', path: '/overview', icon: LayoutDashboard },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Revenues', path: '/revenues', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Unit Economics', path: '/unit-economics', icon: Calculator },
    { name: 'Financial Statements', path: '/statements', icon: FileText },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Market & Strategic Intelligence', path: '/market-intel', icon: Brain },
    { name: 'Scenario Planning', path: '/scenarios', icon: GitBranch },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
            <div className="p-6">
                <div className="flex items-center space-x-2">
                    <Brain className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        FinCl AI
                    </h1>
                </div>
            </div>

            <nav className="mt-6 px-4">
                <div className="space-y-2">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
