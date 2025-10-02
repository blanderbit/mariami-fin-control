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
import WelcomeVideoModal from './components/WelcomeVideoModal';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
    const { showWelcomeVideo, setShowWelcomeVideo, markWelcomeVideoAsSeen } = useAuth();

    const handleVideoComplete = () => {
        markWelcomeVideoAsSeen();
    };

    const handleVideoClose = () => {
        setShowWelcomeVideo(false);
    };

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/onboarding" element={<Onboarding />} />

                <Route element={<ProtectedRoute/>}>
                    <Route path="/" element={<Layout/>}>
                        <Route element={<Navigate to="/dashboard" replace />}/>
                        <Route path="overview" element={<Overview />} />
                        <Route path="dashboard" element={<Dashboard/>}/>
                        <Route path="data-import" element={<DataImport/>}/>
                        <Route path="benchmark" element={<Benchmark />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>

            <WelcomeVideoModal
                isOpen={showWelcomeVideo}
                onClose={handleVideoClose}
                onComplete={handleVideoComplete}
                videoSrc="/videos/welcome.mp4"
                title="Welcome to FinclAI!"
                description="Let us show you around your new financial AI assistant"
                showSkipButton={true}
                autoPlay={true}
            />
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
