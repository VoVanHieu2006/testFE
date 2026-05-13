import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../entities/auth/AuthContext';
import { merchantRegister } from '../../share/api/authApi';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        storeName: '',
        subdomain: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error khi user bat dau nhap
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

        if (!formData.fullName.trim()) errors.fullName = 'Tên không được để trống';
        if (!formData.email.trim()) errors.email = 'Email không được để trống';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (!formData.password) errors.password = 'Mật khẩu không được để trống';
        if (formData.password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!formData.storeName.trim()) errors.storeName = 'Tên cửa hàng không được để trống';
        if (!formData.subdomain.trim()) errors.subdomain = 'Subdomain không được để trống';
        if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
            errors.subdomain = 'Subdomain chỉ dùng chữ thường, số và dấu gạch ngang';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);
            setError(null);

            console.log('Register request:', formData);
            const response = await merchantRegister(formData);
            console.log('Register response:', response);

            register({
                userId: response.userId,
                email: response.email,
                role: response.role,
                tenantId: response.tenantId,
                subdomain: response.subdomain
            });
            alert('Đăng ký đã thành công');
            navigate('/home', { replace: true });
        } catch (err) {
            console.error('Register error:', err);
            const message = err.response?.data?.message || err.message || 'Đăng ký thất bại';
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
                        <h1 className="text-3xl font-black leading-tight text-white">Đăng Ký Tài Khoản</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-300">Tạo cửa hàng online của bạn trong vài phút</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/15 p-4">
                            <p className="text-sm text-red-100">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Tên Đầy Đủ
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                className={`min-h-12 w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                                    fieldErrors.fullName
                                        ? 'border-red-400 focus:border-red-300'
                                        : 'border-white/10 focus:border-white'
                                }`}
                            />
                            {fieldErrors.fullName && (
                                <p className="mt-1 text-xs text-red-200">{fieldErrors.fullName}</p>
                            )}
                        </div>

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
                                    placeholder="Mật khẩu mạnh"
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

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Tên Cửa Hàng
                            </label>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                placeholder="Cửa hàng của tôi"
                                className={`min-h-12 w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                                    fieldErrors.storeName
                                        ? 'border-red-400 focus:border-red-300'
                                        : 'border-white/10 focus:border-white'
                                }`}
                            />
                            {fieldErrors.storeName && (
                                <p className="mt-1 text-xs text-red-200">{fieldErrors.storeName}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white">
                                Subdomain (URL cửa hàng)
                            </label>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                                <input
                                    type="text"
                                    name="subdomain"
                                    value={formData.subdomain}
                                    onChange={handleChange}
                                    placeholder="my-shop"
                                    className={`min-h-12 min-w-0 rounded-l-xl border bg-slate-950/40 px-4 py-3 text-white transition-colors placeholder:text-slate-500 focus:outline-none ${
                                        fieldErrors.subdomain
                                            ? 'border-red-400 focus:border-red-300'
                                            : 'border-white/10 focus:border-white'
                                    }`}
                                />
                                <div className="flex min-h-12 items-center rounded-r-xl border border-l-0 border-white/10 bg-white/10 px-3 text-sm text-slate-300 sm:px-4">
                                    .fluxify.io
                                </div>
                            </div>
                            {fieldErrors.subdomain && (
                                <p className="mt-1 text-xs text-red-200">{fieldErrors.subdomain}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 min-h-12 w-full rounded-xl bg-white py-3 font-bold text-black transition-colors hover:bg-slate-100 disabled:opacity-50"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-300">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-bold text-white transition-colors hover:text-slate-200">
                            Đăng Nhập Ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
