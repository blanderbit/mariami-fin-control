import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Load from localStorage on initialization
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const setCollapsed = (collapsed: boolean) => {
        setIsCollapsed(collapsed);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}