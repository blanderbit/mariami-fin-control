import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DataImport from "./pages/DataImport.tsx";
import Revenues from "./pages/Revenues.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>

                <Route element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        <Route path="/" element={<Dashboard/>}/>
                        <Route path="data-import" element={<DataImport/>}/>
                        <Route path="revenues" element={<Revenues />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}

export default App;
