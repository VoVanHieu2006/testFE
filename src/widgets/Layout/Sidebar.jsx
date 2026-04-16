import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, BarChart2, Settings, ChevronDown, ChevronRight, Palette, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const location = useLocation(); // hook biet url hien tai
    const [isProductsOpen, setIsProductsOpen] = useState(false);
   

    useEffect(() => {
        if (location.pathname.startsWith('/products')) { // neu dang o trang product thi se open
            setIsProductsOpen(true);
        }
    }, [location.pathname]);
    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Orders', path: '/orders', icon: ShoppingCart },
    ];
    const bottomNavItems = [
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];
    return (<aside className="w-64 h-screen fixed left-0 top-0 bg-slate-50 flex flex-col p-4 z-50 border-r border-outline-variant/30">
      <div className="flex items-center gap-3 mb-8 px-2 mt-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center overflow-hidden shrink-0">
          <div className="w-4 h-4 border-2 border-white rounded-sm transform rotate-45"></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-lg font-bold tracking-tighter text-slate-900 leading-none truncate">Modern Atelier</span>
          <span className="text-[11px] font-medium tracking-tight text-on-surface-variant truncate mt-0.5">Shopify Admin</span>
        </div>
      </div>
        {/*NavLink: Component link (tự động highlight nếu active) */}
      <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (<NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive 
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
            <item.icon className="w-5 h-5"/>
            <span className="text-sm">{item.name}</span>
          </NavLink>))}


        <div className="space-y-1">
          <button onClick={() => setIsProductsOpen(!isProductsOpen)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${location.pathname.startsWith('/products')
            ? 'bg-slate-200 text-slate-900 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
            <Package className="w-5 h-5"/>
            <span className="text-sm flex-1 text-left">Products</span>
            {isProductsOpen ? (<ChevronDown className="w-4 h-4"/>) : (<ChevronRight className="w-4 h-4"/>)}
          </button>
          
          {isProductsOpen && (<div className="pl-11 pr-2 space-y-1 mt-1">
              <NavLink to="/products" end className={({ isActive }) => `block px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${isActive
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
                All products
              </NavLink>
              <NavLink to="/products/categories/create" className={({ isActive }) => `block px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${isActive
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
                Categories
              </NavLink>
              <NavLink to="/products/inventory" className={({ isActive }) => `block px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${isActive
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
                Inventory
              </NavLink>
            </div>)}
        </div>

        {bottomNavItems.map((item) => (<NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
            <item.icon className="w-5 h-5"/>
            <span className="text-sm">{item.name}</span>
          </NavLink>))}

        <div className="pt-6 pb-2 px-3">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sales Channels</span>
        </div>
        <NavLink to="/admin/themes" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
          <Palette className="w-5 h-5"/>
          <span className="text-sm">Theme Editor</span>
        </NavLink>
        <NavLink to="/admin/pages" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
          <FileText className="w-5 h-5"/>
          <span className="text-sm">Pages Manager</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant/30">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors duration-200 font-medium">
          <Settings className="w-5 h-5"/>
          <span className="text-sm">Settings</span>
        </NavLink>
      </div>
    </aside>);
}
