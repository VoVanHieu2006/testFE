import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../entities/auth/AuthContext';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function Start() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    

    useEffect(() => {
        if (isLoading) return;
        
        if (isAuthenticated) {
            navigate('/home', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                {/* Logo */}
                <div className="mb-8 inline-block">
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-black rounded-md transform rotate-45"></div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                    Fluxify
                </h1>
                <p className="text-xl text-slate-300 mb-12 max-w-lg mx-auto">
                    Quản lý cửa hàng online của bạn với giao diện hiện đại, công cụ mạnh mẽ và đơn giản để sử dụng.
                </p>

                {/* Main Button */}
                <div className="space-y-4 mb-12">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full max-w-sm mx-auto block px-8 py-4 bg-white text-black text-lg font-bold rounded-xl hover:bg-slate-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                    >
                        Bắt Đầu Kinh Doanh
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Login Link */}
                    <p className="text-slate-400">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white font-bold hover:text-slate-200 transition-colors underline"
                        >
                            Đăng Nhập
                        </button>
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-6 text-left mt-16">
                    <div>
                        <div className="text-3xl font-bold text-white mb-2">📦</div>
                        <p className="text-sm text-slate-400">Quản lý sản phẩm</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-2">📊</div>
                        <p className="text-sm text-slate-400">Thống kê chi tiết</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-2">🛒</div>
                        <p className="text-sm text-slate-400">Quản lý đơn hàng</p>
                    </div>
                </div>
            </div>
        </div>
    );
}