import Button from "../../../shared/ui/button";

export function LoginPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-red-600">Trang Đăng Nhập</h2>
      <p>Vui lòng nhập tài khoản và mật khẩu.</p>


        {/* DÙNG NÚT BẤM XỊN ĐÃ TẠO Ở ĐÂY */}
        <Button>Đăng nhập ngay</Button>
        
        <div className="mt-4"></div>
        
        {/* Thử tính năng Loading của nút bấm */}
        <Button isLoading={true}>Nút này đang xử lý</Button>
    </div>
  );
}