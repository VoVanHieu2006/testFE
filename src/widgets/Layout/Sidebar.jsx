import { NavLink, useLocation } from 'react-router-dom';
import {
    Home,
    ShoppingCart,
    Package,
    Users,
    BarChart2,
    Settings,
    ChevronDown,
    ChevronRight,
    Palette,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen = false, onClose }) {
    const location = useLocation(); // hook biet url hien tai
    const [isProductsOpen, setIsProductsOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/home/products')) { // neu dang o trang product thi se open
            const frameId = window.requestAnimationFrame(() => setIsProductsOpen(true));
            return () => window.cancelAnimationFrame(frameId);
        }
    }, [location.pathname]);

    const navItems = [
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Orders', path: '/home/orders', icon: ShoppingCart },
    ];
    const bottomNavItems = [
        { name: 'Customers', path: '/home/customers', icon: Users },
        { name: 'Analytics', path: '/home/analytics', icon: BarChart2 },
    ];

    const closeOnMobile = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={closeOnMobile}
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
                />
            )}
            <aside className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 transition-transform duration-200 lg:w-64 lg:max-w-none lg:translate-x-0 lg:bg-slate-50 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-8 mt-2 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center overflow-hidden shrink-0">
                        <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <span className="text-lg font-bold tracking-tighter text-slate-900 leading-none truncate">Modern Atelier</span>
                        <span className="text-[11px] font-medium tracking-tight text-on-surface-variant truncate mt-0.5">Shopify Admin</span>
                    </div>
                    <button
                        type="button"
                        onClick={closeOnMobile}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {/*NavLink: Component link (tu dong highlight neu active) */}
                <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={closeOnMobile}
                            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 ${isActive
                                ? 'bg-slate-200 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.name}</span>
                        </NavLink>
                    ))}

                    <div className="space-y-1">
                        <button
                            onClick={() => setIsProductsOpen(!isProductsOpen)}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 ${location.pathname.startsWith('/home/products')
                                ? 'bg-slate-200 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                        >
                            <Package className="w-5 h-5" />
                            <span className="text-sm flex-1 text-left">Products</span>
                            {isProductsOpen ? (<ChevronDown className="w-4 h-4" />) : (<ChevronRight className="w-4 h-4" />)}
                        </button>

                        {isProductsOpen && (
                            <div className="pl-11 pr-2 space-y-1 mt-1">
                                <NavLink
                                    to="/home/products"
                                    end
                                    onClick={closeOnMobile}
                                    className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive
                                        ? 'bg-slate-200 text-slate-900 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                                >
                                    All products
                                </NavLink>
                                <NavLink
                                    to="/home/products/categories"
                                    onClick={closeOnMobile}
                                    className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive
                                        ? 'bg-slate-200 text-slate-900 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                                >
                                    Categories
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {bottomNavItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={closeOnMobile}
                            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 ${isActive
                                ? 'bg-slate-200 text-slate-900 font-semibold'
                                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{item.name}</span>
                        </NavLink>
                    ))}

                    <div className="pt-6 pb-2 px-3">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sales Channels</span>
                    </div>
                    <NavLink
                        to="/home/admin/themes"
                        onClick={closeOnMobile}
                        className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 ${isActive ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
                    >
                        <Palette className="w-5 h-5" />
                        <span className="text-sm">Theme Editor</span>
                    </NavLink>
                </nav>

                <div className="mt-auto pt-4 border-t border-outline-variant/30">
                    <NavLink
                        to="/home/settings"
                        onClick={closeOnMobile}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors duration-200 font-medium"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm">Settings</span>
                    </NavLink>
                </div>
            </aside>
        </>
    );
}
