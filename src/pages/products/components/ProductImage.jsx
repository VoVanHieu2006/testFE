import { Package } from 'lucide-react';

export function ProductImage({ imgUrls }) {
    const src = Array.isArray(imgUrls) && imgUrls.length > 0 ? imgUrls[0] : null;
    if (!src) {
        return (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-slate-400" />
            </div>
        );
    }
    return (
        <img src={src} alt="product"
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#e3e3e3]"
            onError={(e) => { e.target.style.display = 'none'; }} />
    );
}