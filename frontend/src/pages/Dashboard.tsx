import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-xl text-gray-600 dark:text-gray-400">Coming soon</p>
            </div>
        </div>
    );
};

export default Dashboard;
