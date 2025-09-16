import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DataImport from "./pages/DataImport.tsx";
import Revenues from "./pages/Revenues.tsx";
import Settings from "./pages/Settings.tsx";
import Onboarding from "./pages/Onboarding.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/onboarding" element={<Onboarding />} />

                <Route element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="data-import" element={<DataImport/>}/>
                        <Route path="revenues" element={<Revenues />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}

export default App;
