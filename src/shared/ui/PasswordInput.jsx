import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Thư viện icon (con mắt)

export default function PasswordInput({ label, id, value, onChange, placeholder, required = false, className = '' }) {
  // useState: Bộ nhớ cục bộ của React, dùng để nhớ xem nút "con mắt" đang đóng hay mở
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          // NẾU showPassword là TRUE -> đổi thành ô gõ CHỮ (thấy được mật khẩu). NẾU FALSE -> đổi thành ô PASSWORD (ẩn đi bằng dấu chấm tròn).
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 
                     focus:outline-none focus:ring-2 focus:ring-[#1754cf]/20 focus:border-[#1754cf] 
                     transition-all duration-200 placeholder:text-slate-400"
        />
        
        {/* Nút hình con mắt nằm góc phải ô nhập */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}