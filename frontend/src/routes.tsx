import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

type RouteProps = {
    children: React.ReactNode;
};

// Защищённый роут (пускает только авторизованных)
export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    // Пока грузим — можно показать спиннер, чтобы не было мигания
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Публичный роут (пускает только НЕавторизованных, редиректит на /dashboard если уже вошёл)
export const PublicRoute: React.FC<RouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};
