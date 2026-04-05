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