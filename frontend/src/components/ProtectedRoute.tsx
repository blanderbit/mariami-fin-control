import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 dark:border-primary-400"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Если пользователь не прошел онбординг, перенаправляем на онбординг
    if (!user.is_onboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
