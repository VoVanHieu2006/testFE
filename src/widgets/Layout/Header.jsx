import { Bell, CircleHelp, Plus, Menu } from 'lucide-react'; // Thu vien icon
import { useState, useRef, useEffect } from 'react'; // Hook trang thai, hook thay the cho bien, hook chay moi khi vao chuong trinh
import { useNavigate } from 'react-router-dom'; // Hook dieu huong
import { useAuth } from '../../entities/auth/AuthContext';
import TenantSwitcher from './TenantSwitcher';
import CreateStoreModal from './CreateStoreModal';

export default function Header({ onMenuClick }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false); // xem profile co open ko
    const [isNotifOpen, setIsNotifOpen] = useState(false); // xem thong bao co open ko
    const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
    const profileRef = useRef(null); // bien luu profile
    const notifRef = useRef(null); // bien luu thong bao
    const navigate = useNavigate(); 
    const { logout, user } = useAuth();
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAccountSettings = () => {
        navigate('/settings');
        setIsProfileOpen(false);
    };
    const handleHelpCenter = () => {
        alert('Help center is coming soon!');
        setIsProfileOpen(false);
    };
    const handleLogout = () => {
        logout();
        alert('Logged out successfully!');
        navigate('/');
        setIsProfileOpen(false);
    };
    return (<>
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[#e3e3e3] bg-white/95 px-3 backdrop-blur sm:px-4 lg:left-64 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e3e3e3] text-slate-700 transition-colors hover:bg-[#f8f8f8] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <TenantSwitcher />
        <button
          onClick={() => setIsCreateStoreOpen(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#e3e3e3] bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Store</span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="relative" ref={notifRef}>
          <button onClick={() => {
            setIsNotifOpen(!isNotifOpen);
            setIsProfileOpen(false);
        }} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5"/>
          </button>
          
          {isNotifOpen && (<div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),18rem)] bg-white rounded-xl shadow-lg border border-[#e3e3e3] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e3e3e3]">
                <h3 className="text-sm font-semibold text-black">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <p className="text-[#616161] text-sm">No new notifications.</p>
              </div>
            </div>)}
        </div>

        <button onClick={handleHelpCenter} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <CircleHelp className="w-5 h-5"/>
        </button>

        <div className="relative" ref={profileRef}>
          <div onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNotifOpen(false);
        }} className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-gray-300 ring-offset-1 transition-all shrink-0">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>

          {isProfileOpen && (<div className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),14rem)] bg-white rounded-xl shadow-lg border border-[#e3e3e3] p-2 z-50">
              <div className="px-3 py-2 border-b border-[#e3e3e3] mb-1">
                <p className="text-sm font-semibold text-black truncate">{user?.email || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Merchant'}</p>
              </div>
              <div className="space-y-0.5">
                <div onClick={handleAccountSettings} className="px-3 py-2 rounded-lg hover:bg-[#f8f8f8] cursor-pointer text-sm font-medium text-black transition-colors">
                  Account settings
                </div>
                <div onClick={handleHelpCenter} className="px-3 py-2 rounded-lg hover:bg-[#f8f8f8] cursor-pointer text-sm font-medium text-black transition-colors">
                  Help center
                </div>
              </div>
              <div onClick={handleLogout} className="px-3 py-2 mt-1 rounded-lg hover:bg-red-50 text-[#d82c0d] cursor-pointer text-sm font-medium transition-colors">
                Log out
              </div>
            </div>)}
        </div>
      </div>
    </header>

    {isCreateStoreOpen && <CreateStoreModal onClose={() => setIsCreateStoreOpen(false)} />}
    </>);
}
