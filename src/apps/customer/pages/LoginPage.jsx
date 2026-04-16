import React, { useState } from 'react'; // <--- 1. Lấy công cụ tạo bộ nhớ
import { toast } from 'sonner'; // <--- Lấy công cụ phát thông báo
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import PasswordInput from '../../../shared/ui/PasswordInput';

export function LoginPage() {
  // 2. Tạo 2 "chiếc hộp" rỗng để chứa dữ liệu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. Hàm xử lý khi người dùng bấm nút Đăng nhập
  const handleLogin = (e) => {
    e.preventDefault(); // Ngăn không cho trình duyệt tải lại trang
    
    // Kiểm tra xem có nhập rỗng không
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    // Phát thông báo thành công và in ra những gì đã gõ
    toast.success(`Đăng nhập thành công! \nEmail: ${email}`);
    console.log("Dữ liệu gửi đi:", { email, password });
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Đăng Nhập</h2>
        <p className="text-slate-500">Mừng bạn quay trở lại FLUXIFY</p>
      </div>

      {/* 4. Gắn hàm handleLogin vào sự kiện onSubmit của Form */}
      <form className="space-y-6" onSubmit={handleLogin}>
        <Input 
          id="email" 
          label="Email của bạn" 
          type="email" 
          placeholder="Ví dụ: hello@fluxify.com"
          value={email} // Gắn giá trị vào hộp
          onChange={(e) => setEmail(e.target.value)} // Cập nhật hộp khi gõ
        />
        
        <PasswordInput 
          id="password" 
          label="Mật khẩu" 
          placeholder="Nhập mật khẩu..." 
          value={password} // Gắn giá trị vào hộp
          onChange={(e) => setPassword(e.target.value)} // Cập nhật hộp khi gõ
        />

        <div className="flex justify-end mt-2">
          <a href="#" className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</a>
        </div>

        {/* Nút bấm ở trong <form> tự động có type="submit" kích hoạt onSubmit */}
        <Button type="submit" fullWidth={true}>Đăng nhập ngay</Button>
      </form>
    </div>
  );
}