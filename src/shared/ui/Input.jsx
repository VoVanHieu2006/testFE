import React from 'react';

// Ô nhập liệu cơ bản, dùng chung cho cả Form Đăng nhập, Form Đăng ký, Đổi mật khẩu...
export default function Input({ label, id, type = 'text', value, onChange, placeholder, required = false, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Nếu có truyền label (tiêu đề ô nhập) thì mới hiển thị */}
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      
      {/* Ô nhập liệu được trang trí bo góc, viền xám, khi click vào thì viền chuyển xanh */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 
                   focus:outline-none focus:ring-2 focus:ring-[#1754cf]/20 focus:border-[#1754cf] 
                   transition-all duration-200 placeholder:text-slate-400"
      />
    </div>
  );
}