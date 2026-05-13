import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../entities/auth/AuthContext';
import { merchantLogin } from '../../share/api/authApi';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.email.trim()) errors.email = 'Email không được để trống';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (!formData.password) errors.password = 'Mật khẩu không được để trống';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            setError(null);

            console.log('Login request:', formData);
            const response = await merchantLogin(formData.email, formData.password);
            console.log('Login response:', response);

            // Kiem tra co tenants khong
            if (!response.tenants || response.tenants.length === 0) {
                setError('Không tìm thấy store của bạn');
                return;
            }

            // Goi login voi data tu response
            login({
                token: response.token,
                userId: response.userId,
                email: response.email,
                role: response.role,
                tenants: response.tenants
            });
            alert('Đăng nhập đã thành công');
            navigate('/home', { replace: true });

        } catch (err) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#334155_0,#0f172a_36%,#020617_100%)] px-4 py-8">
            <div className="min-w-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-md">
                <Link to="/" className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-slate-300 transition-colors hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Link>

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
                    <div className="mb-7">
                        <h1 className="text-3xl font-black text-white">Đăng Nhập</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Quản lý cửa hàng của bạn</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/15 p-4">
                            <p className="text-sm text-red-100">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`min-h-12 w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                                    fieldErrors.email
                                        ? 'border-red-400 focus:border-red-300'
                                        : 'border-white/10 focus:border-white'
                                }`}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-200">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Mật Khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu của bạn"
                                    className={`min-h-12 w-full rounded-xl border bg-slate-950/40 px-4 py-3 pr-12 text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                                        fieldErrors.password
                                            ? 'border-red-400 focus:border-red-300'
                                            : 'border-white/10 focus:border-white'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="mt-1 text-xs text-red-200">{fieldErrors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 min-h-12 w-full rounded-xl bg-white py-3 font-bold text-black transition-colors hover:bg-slate-100 disabled:opacity-50"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-300">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="font-bold text-white transition-colors hover:text-slate-200">
                            Đăng Ký Ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
