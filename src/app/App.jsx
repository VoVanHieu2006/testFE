import { Routes, Route, Link } from 'react-router-dom';
import { HomePage } from '../apps/customer/pages/HomePage';
import { LoginPage } from '../apps/customer/pages/LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Đây là Thanh điều hướng (Navbar) tạm thời */}
      <nav className="p-4 text-white bg-gray-800 space-x-4">
        <Link to="/" className="hover:text-gray-300">Trang Chủ</Link>
        <Link to="/login" className="hover:text-gray-300">Đăng Nhập</Link>
      </nav>

      {/* Đây là nơi Router sẽ thay đổi nội dung trang */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;