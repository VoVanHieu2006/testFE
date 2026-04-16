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
        // Clear error khi user bắt đầu nhập
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
            alert("Đăng ký đã thành công")
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </Link>
                    <h1 className="text-3xl font-black text-white mb-2">Đăng Ký Tài Khoản</h1>
                    <p className="text-slate-400">Tạo cửa hàng online của bạn trong vài phút</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Tên Đầy Đủ
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className={`w-full px-4 py-3 rounded-lg bg-slate-800 border transition-colors ${
                                fieldErrors.fullName
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-slate-700 focus:border-white'
                            } text-white placeholder-slate-500 focus:outline-none`}
                        />
                        {fieldErrors.fullName && (
                            <p className="text-red-400 text-xs mt-1">{fieldErrors.fullName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={`w-full px-4 py-3 rounded-lg bg-slate-800 border transition-colors ${
                                fieldErrors.email
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-slate-700 focus:border-white'
                            } text-white placeholder-slate-500 focus:outline-none`}
                        />
                        {fieldErrors.email && (
                            <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Mật Khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mật khẩu mạnh"
                                className={`w-full px-4 py-3 rounded-lg bg-slate-800 border transition-colors ${
                                    fieldErrors.password
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-slate-700 focus:border-white'
                                } text-white placeholder-slate-500 focus:outline-none pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                        )}
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Tên Cửa Hàng
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            placeholder="Cửa hàng của tôi"
                            className={`w-full px-4 py-3 rounded-lg bg-slate-800 border transition-colors ${
                                fieldErrors.storeName
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-slate-700 focus:border-white'
                            } text-white placeholder-slate-500 focus:outline-none`}
                        />
                        {fieldErrors.storeName && (
                            <p className="text-red-400 text-xs mt-1">{fieldErrors.storeName}</p>
                        )}
                    </div>

                    {/* Subdomain */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Subdomain (URL cửa hàng)
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                name="subdomain"
                                value={formData.subdomain}
                                onChange={handleChange}
                                placeholder="my-shop"
                                className={`flex-1 px-4 py-3 rounded-l-lg bg-slate-800 border transition-colors ${
                                    fieldErrors.subdomain
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-slate-700 focus:border-white'
                                } text-white placeholder-slate-500 focus:outline-none`}
                            />
                            <div className="px-4 py-3 rounded-r-lg bg-slate-700 border border-l-0 border-slate-700 text-slate-400 text-sm">
                                .fluxify.io
                            </div>
                        </div>
                        {fieldErrors.subdomain && (
                            <p className="text-red-400 text-xs mt-1">{fieldErrors.subdomain}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? '🔄 Đang xử lý...' : '✨ Đăng Ký'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-slate-400 mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-white font-bold hover:text-slate-200 transition-colors">
                        Đăng Nhập Ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}