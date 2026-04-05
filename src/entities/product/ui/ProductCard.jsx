import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppContext } from '../../../app/providers/AppContext';
import { toast } from 'sonner'; 

export default function ProductCard({ product }) {

    if (!product || product.price === undefined) {
        console.error("Dữ liệu product bị thiếu!", product);
        return <div className="p-4 border">Lỗi dữ liệu sản phẩm</div>;
    }



    const { addToCart } = useAppContext(); // Lấy nút bấm tăng giỏ hàng từ trạm

    // Hàm xử lý khi click mua
    const handleAddToCart = () => {
        // Kiểm tra xem addToCart có tồn tại không (phòng trường hợp Context lỗi)
        if (addToCart) {
            addToCart();
            toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
        }
    };
  return (
  <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-[450px]">
      
      {/* Khung ảnh: Chiều cao cố định h-52 */}
      <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
        <img
          alt={product.name}
          src={product.img}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded uppercase tracking-wider">
            In Stock
          </span>
        </div>
      </div>

      {/* Thông tin chữ: Dùng flex-1 để nó chiếm hết khoảng trống giữa */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">
          {product.cat}
        </p>
        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {product.desc}
        </p>

        {/* PHẦN DƯỚI CÙNG: Dùng mt-auto để luôn bám đáy */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          
          <button 
            type="button"
            onClick={handleAddToCart}
            className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-primary transition-all duration-300 active:scale-90 flex items-center justify-center"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}