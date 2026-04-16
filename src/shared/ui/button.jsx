import React from 'react';

export default function Button({ children, type = 'button', onClick, isLoading = false, loadingText = 'Vui lòng chờ...', className = '', fullWidth = true }) {
  // Đây là CSS mặc định cho một cái nút của dự án: Nền xanh, bo tròn, có đổ bóng
  const baseClasses = "bg-[#1754cf] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#1754cf]/20 transition-all duration-200";
  const widthClass = fullWidth ? "w-full" : "";
  
  // Hiệu ứng khi bấm hoặc khi nút đang tải (loading)
  const stateClasses = isLoading 
    ? "opacity-70 cursor-not-allowed" 
    : "hover:bg-[#1754cf]/90 hover:shadow-[#1754cf]/30 transform active:scale-[0.98]";

  return (
    <button
      className={`${baseClasses} ${widthClass} ${stateClasses} ${className}`}
      type={type}
      onClick={onClick}
      disabled={isLoading}
    >
      {/* Nếu đang loading thì hiện vòng tròn xoay, nếu không thì hiện chữ bình thường */}
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}