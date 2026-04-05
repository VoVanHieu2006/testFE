import React from 'react';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import PasswordInput from '../../../shared/ui/PasswordInput';

export function LoginPage() {
  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Đăng Nhập</h2>
        <p className="text-slate-500">Mừng bạn quay trở lại FLUXIFY</p>
      </div>

      <form className="space-y-6">
        {/* Ô NHẬP EMAIL */}
        <Input 
          id="email" 
          label="Email của bạn" 
          type="email" 
          placeholder="Ví dụ: hello@fluxify.com" 
        />
        
        {/* Ô NHẬP MẬT KHẨU */}
        <PasswordInput 
          id="password" 
          label="Mật khẩu" 
          placeholder="Nhập mật khẩu..." 
        />

        <div className="flex justify-end mt-2">
          <a href="#" className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</a>
        </div>

        {/* NÚT BẤM (đã tạo từ bài trước) */}
        <Button fullWidth={true}>Đăng nhập ngay</Button>
      </form>
    </div>
  );
}