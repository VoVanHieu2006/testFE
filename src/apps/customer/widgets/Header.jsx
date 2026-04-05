import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react'; // Thư viện Icon
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation(); // Dùng để biết ta đang ở trang nào để bôi màu xanh cho Menu đó

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          
          {/* 1. LOGO */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
              <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">Fluxify</span>
            </Link>
          </div>

          {/* 2. DANH SÁCH MENU CHÍNH (Ẩn trên điện thoại, hiện trên máy tính) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-slate-600 hover:text-primary'}`}>
              Home
            </Link>
            <Link to="/shop" className={`text-sm font-semibold transition-colors ${location.pathname === '/shop' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-slate-600 hover:text-primary'}`}>
              Shop
            </Link>
            <Link to="/about" className={`text-sm font-semibold transition-colors ${location.pathname === '/about' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-slate-600 hover:text-primary'}`}>
              About
            </Link>
          </nav>

          {/* 3. THANH TÌM KIẾM */}
          <div className="hidden md:flex flex-1 max-w-sm justify-end">
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                className="block w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-8 text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                placeholder="Tìm sản phẩm..."
                type="text"
              />
            </div>
          </div>

          {/* 4. CÁC NÚT ICON BÊN PHẢI (User, Giỏ hàng) */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/login" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Đăng nhập">
              <User />
            </Link>
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Giỏ hàng">
              <ShoppingCart />
              {/* Dấu chấm đỏ báo có hàng trong giỏ (tạm thời để cứng số 3) */}
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
            </button>
            
            {/* Nút Menu Hamburger cho Mobile */}
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}