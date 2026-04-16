import { Search, Bell, CircleHelp, Plus } from 'lucide-react'; // Thu vien icon
import { useState, useRef, useEffect } from 'react'; // Hook trang thai, hook thay the cho bien, hook chay moi khi vao chuong trinh
import { useNavigate } from 'react-router-dom'; // Hook dieu huong
import { useAuth } from '../../entities/auth/AuthContext';
import TenantSwitcher from './TenantSwitcher';
import CreateStoreModal from './CreateStoreModal';

export default function Header() {
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
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 flex justify-between items-center px-6 py-3 bg-white border-b border-[#e3e3e3] h-16">
      <div className="flex items-center gap-3">
        <TenantSwitcher />
        <button
          onClick={() => setIsCreateStoreOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e3e3e3] bg-white hover:bg-[#f8f8f8] transition-colors text-sm font-medium text-slate-700"
        >
          <Plus className="w-4 h-4" />
          New Store
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => {
            setIsNotifOpen(!isNotifOpen);
            setIsProfileOpen(false);
        }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5"/>
          </button>
          
          {isNotifOpen && (<div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#e3e3e3] z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e3e3e3]">
                <h3 className="text-sm font-semibold text-black">Notifications</h3>
              </div>
              <div className="p-4 text-center">
                <p className="text-[#616161] text-sm">No new notifications.</p>
              </div>
            </div>)}
        </div>

        <button onClick={handleHelpCenter} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <CircleHelp className="w-5 h-5"/>
        </button>

        <div className="relative" ref={profileRef}>
          <div onClick={() => {
            setIsProfileOpen(!isProfileOpen);
            setIsNotifOpen(false);
        }} className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-gray-300 ring-offset-1 transition-all shrink-0">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>

          {isProfileOpen && (<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e3e3e3] p-2 z-50">
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
