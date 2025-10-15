import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DataImport from "./pages/DataImport.tsx";
import Settings from "./pages/Settings.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Overview from "./pages/Overview.tsx";
import Benchmark from "./pages/Benchmark.tsx";
import Welcome from "./pages/Welcome.tsx";
import WelcomeVideo from './pages/WelcomeVideo.tsx';
import WelcomeUser from './pages/WelcomeUser.tsx';
import Assistant from "./pages/Assistant.tsx";
import Home from "./pages/Home.tsx";
import DashboardNew from "./pages/DashboardNew.tsx";

function AppContent() {
    return (
        <>
            <Routes>
                {/* Главная страница с редиректом в зависимости от авторизации */}
                <Route path="/" element={<Home />} />

                {/* Публичные страницы */}
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/welcome-video" element={<WelcomeVideo />} />
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Защищенные страницы */}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        <Route path="welcome-user" element={<WelcomeUser />} />
                        <Route path="overview" element={<Overview />} />
                        <Route path="dashboard" element={<Dashboard/>}/>
                        <Route path="dashboard-new" element={<DashboardNew/>}/>
                        <Route path="data-import" element={<DataImport/>}/>
                        <Route path="benchmark" element={<Benchmark />} />
                        <Route path="assistant" element={<Assistant />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* 404 - редирект на главную */}
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
