import React from 'react';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <div className="group bg-white rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
      
      {/* Khung chứa Hình ảnh */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          alt={product.name}
          src={product.img}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Nhãn xanh in Stock */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded uppercase tracking-wider">
            In Stock
          </span>
        </div>
      </div>

      {/* Thông tin chữ bên dưới */}
      <div className="p-5 flex flex-col h-full">
        {product.cat && (
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
            {product.cat}
          </p>
        )}
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 mb-4">{product.desc}</p>

        {/* Giá và nút thêm giỏ hàng (sẽ làm việc đẩy lên sau) */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
          <button className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-primary transition-colors flex items-center justify-center">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}