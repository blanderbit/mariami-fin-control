import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '../contexts/SidebarContext';

const Layout: React.FC = () => {
    return (
        <SidebarProvider>
            <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
