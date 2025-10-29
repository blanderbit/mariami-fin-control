import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '../contexts/SidebarContext';

const Layout: React.FC = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
