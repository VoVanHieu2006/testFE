import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';

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
        <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#334155_0,#0f172a_36%,#020617_100%)] px-4 py-10">
            <div className="min-w-0 w-full max-w-[calc(100vw-2rem)] text-center sm:max-w-3xl">
                <div className="mb-8 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white">
                        <div className="h-8 w-8 rotate-45 rounded-md border-3 border-black"></div>
                    </div>
                </div>

                <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
                    Fluxify
                </h1>
                <p className="mx-auto mb-10 mt-4 max-w-xl break-words text-base leading-7 text-slate-300 sm:text-xl">
                    Quản lý cửa hàng online của bạn với giao diện hiện đại, công cụ mạnh mẽ và đơn giản để sử dụng.
                </p>

                <div className="mb-12 space-y-4">
                    <button
                        onClick={() => navigate('/register')}
                        className="mx-auto flex min-h-12 w-full max-w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-4 text-sm font-bold text-black shadow-2xl shadow-black/20 transition-colors hover:bg-slate-100 sm:max-w-sm sm:px-6 sm:text-lg"
                    >
                        <span className="min-w-0 truncate">Bắt Đầu Kinh Doanh</span>
                        <ArrowRight className="h-5 w-5 shrink-0" />
                    </button>

                    <p className="text-sm text-slate-400 sm:text-base">
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-bold text-white underline transition-colors hover:text-slate-200"
                        >
                            Đăng Nhập
                        </button>
                    </p>
                </div>

                <div className="mt-12 grid gap-3 text-left sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <Package className="mb-3 h-6 w-6 text-white" />
                        <p className="text-sm text-slate-400">Quản lý sản phẩm</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <BarChart3 className="mb-3 h-6 w-6 text-white" />
                        <p className="text-sm text-slate-400">Thống kê chi tiết</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <ShoppingCart className="mb-3 h-6 w-6 text-white" />
                        <p className="text-sm text-slate-400">Quản lý đơn hàng</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
