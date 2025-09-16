import React, { useState } from 'react';
import {
    User,
    Building,
    Bell,
    Shield
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'company', name: 'Company', icon: Building },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
    ];

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Profile Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your personal account settings</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 dark:text-gray-400">Profile settings coming soon...</p>
            </div>
        </div>
    );

    const renderCompanyTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Company Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your company information and preferences</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 dark:text-gray-400">Company settings coming soon...</p>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Notification Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure how you receive notifications</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 dark:text-gray-400">Notification settings coming soon...</p>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Security Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account security and privacy</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 dark:text-gray-400">Security settings coming soon...</p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{duration: 0.5, delay: 0.2}}
            className="w-full max-w-none"
        >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

            <div className="flex space-x-8">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                                }`}
                            >
                                <tab.icon className="w-5 h-5 mr-3" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'company' && renderCompanyTab()}
                    {activeTab === 'notifications' && renderNotificationsTab()}
                    {activeTab === 'security' && renderSecurityTab()}
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
