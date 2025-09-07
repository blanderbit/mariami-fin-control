import { useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
    const location = useLocation();
    const { user } = useAuth();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/*<Route element={<ProtectedRoute />}>*/}

            {/*</Route>*/}

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
