import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
    const { user, loading } = useAuth();

    // Показываем индикатор загрузки пока проверяем авторизацию
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 dark:border-primary-400"></div>
            </div>
        );
    }

    // Если пользователь не залогинен - редирект на логин
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Если не прошел онбординг - на онбординг
    if (!user.is_onboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    // Если залогинен и прошел онбординг - на overview
    return <Navigate to="/overview" replace />;
}

export default Home;

