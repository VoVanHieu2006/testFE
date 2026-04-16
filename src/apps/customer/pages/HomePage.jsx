import React from 'react';
// IMPORT THỰC THỂ SẢN PHẨM & DỮ LIỆU
import ProductCard from '../../../entities/product/ui/ProductCard';
import { products } from '../../../shared/lib/data';

export function HomePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Tiêu đề trang */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Sản Phẩm Nổi Bật</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Khám phá những công nghệ đỉnh cao giúp tăng hiệu suất làm việc của bạn.
        </p>
      </div>

      {/* 
        Khung lưới hiển thị sản phẩm (Grid):
        - Điện thoại: 1 cột (grid-cols-1)
        - Tablet: 2 cột (sm:grid-cols-2)
        - Laptop/PC: 4 cột (lg:grid-cols-4)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* VÒNG LẶP IN SẢN PHẨM RA */}
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}