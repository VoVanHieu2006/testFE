import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 lg:flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 pt-16">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
