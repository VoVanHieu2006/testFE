<<<<<<< HEAD
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../entities/auth/AuthContext';

// Pages
import Start from '../pages/start/Start';
import Register from '../pages/register/Register';
import Login from '../pages/login/Login';
import DashboardLayout from '../widgets/Layout/DashboardLayout'; 

const Home = () => <div className="p-8"><h1>Home Page Coming Soon</h1></div>;

function PrivateRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppContent() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Start />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
                path="/home/*"
                element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Home />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent /> 
            </AuthProvider>
        </BrowserRouter>
    );
}
=======
import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner'; // <--- 1. IMPORT THƯ VIỆN THÔNG BÁO

import { HomePage } from '../apps/customer/pages/HomePage';
import { LoginPage } from '../apps/customer/pages/LoginPage';
import Header from '../apps/customer/widgets/Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-background-light)] text-slate-900">
      <Header />

      <div className="grow">
        <Outlet />
      </div>
      
      <footer className="p-4 bg-gray-800 text-white text-center mt-auto">
        Footer của FLUXIFY
      </footer>

      {/* 2. ĐẶT CÁI LOA Ở ĐÂY ĐỂ NÓ KÊU TRÊN TOÀN TRANG WEB */}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}   
>>>>>>> 5da6e881cce55fed747c9a5e45e1f41494c3555b
