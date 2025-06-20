import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./App.css";
import HomePage from "./pages/HomePage";
import MaintenancePage from './pages/MaintenancePage';
import LeakPreventionPage from './pages/LeakPreventionPage';
import Navbar from "./components/Navbar";

function App() {
    return (
        <>
            <Navbar/>
            <main style={{ padding: '2rem', background: '#f7f7f7', minHeight: '100vh' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/leak-prevention" element={<LeakPreventionPage />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
