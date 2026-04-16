import React, { createContext, useContext, useState } from 'react';

// 1. Tạo ra một cái Trạm phát sóng
const AppContext = createContext();

// 2. Tạo cái Loa phát (Provider) để bọc quanh ứng dụng
export function AppProvider({ children }) {
  // Bộ nhớ lưu số lượng giỏ hàng (bắt đầu là 0)
  const [cartCount, setCartCount] = useState(0);

  // Hàm để các nút bấm gọi vào khi muốn tăng giỏ hàng
  const addToCart = () => {
    setCartCount(prevCount => prevCount + 1);
  };

  // Phát sóng dữ liệu (cartCount) và cái nút bấm (addToCart) cho toàn bộ con cháu xài
  return (
    <AppContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </AppContext.Provider>
  );
}

// 3. Tạo một cái "ăng-ten" để các component khác cắm vào và nghe
export const useAppContext = () => useContext(AppContext);