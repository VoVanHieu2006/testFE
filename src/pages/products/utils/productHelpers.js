// ─── Parse ──────────────────────────────────────────────────────────────────
// Chuyển đổi an toàn một chuỗi JSON thành một Object (đối tượng). 

import { X } from "lucide-react";

// Dữ liệu thuộc tính từ database thường được lưu dưới dạng chuỗi
export function parseAttr(str) {
    try { return typeof str === 'string' ? JSON.parse(str) : (str || {}); }
    catch { return {}; }
}

// ─── Cartesian product of attribute groups ───────────────────────────────────
// Tạo mọi tổ hợp có thể 
export function cartesian(groups) {
    const active = groups.filter(g => g.key.trim() && g.values.length > 0);
    if (!active.length) return [{}];
    const [first, ...rest] = active;
    const restCombos = cartesian(rest);
    return first.values.flatMap(v => restCombos.map(c => ({ [first.key]: v, ...c })));
}

// ─── SKU helpers ─────────────────────────────────────────────────────────────

export function skuLabel(combo) {
    const vals = Object.values(combo);
    return vals.length ? vals.join(' / ') : '(Default)';
}

// Nhận vào { color: 'Đỏ', size: 'M' } -> Trả về chuỗi "Đỏ / M". Nếu không có gì sẽ trả về "(Default)".

/**
 * Recompute SKU rows from attribute groups, preserving existing row data.
 */
export function computeSkuRows(groups, prevRows = []) {
    const combos = cartesian(groups);
    return combos.map(combo => {
        const key = JSON.stringify(combo);
        const prev = prevRows.find(r => JSON.stringify(r.combination) === key); // tìm nếu đã có thì lấy lại dữ liệu thôi
        return {
            combination: combo,
            price: prev?.price ?? '',
            stock: prev?.stock ?? '0',
            imgUrl: prev?.imgUrl ?? '',
        };
    });
}

// Lúc đầu: Màu: Đỏ, Xanh và Size: X -> Đỏ X | Xanh X và đã có dữ liệu
// Thêm Size: L 
// Nó gửi lại tạo ra 4 tổ hợp:
// { màu: "Đỏ", size: "X" }

// { màu: "Đỏ", size: "L" }

// { màu: "Xanh", size: "X" }

// { màu: "Xanh", size: "L" }

// Nếu như đã có dữ liệu thì lấy nguyên, còn không thì sẽ set rỗng hoặc 0


// Tạo ra một danh sách các bảng/dòng biến thể dựa trên các thuộc tính đang có.

// ─── Formatting ──────────────────────────────────────────────────────────────

export function fmtVnd(val) {
    if (val == null || val === '') return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
}

export function getPriceRange(product) {
    const skus = product.productSkus || product.skus || [];
    if (!skus.length) return product.price != null ? fmtVnd(product.price) : '—';
    const prices = skus.map(s => s.price).filter(p => p != null);
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? fmtVnd(min) : `${fmtVnd(min)} – ${fmtVnd(max)}`;
}

export function getTotalStock(product) {
    const skus = product.productSkus || product.skus || [];
    if (!skus.length) return product.stock ?? '—';
    return skus.reduce((s, sk) => s + (sk.stock ?? 0), 0);
}

// ─── Duplicate SKU check ─────────────────────────────────────────────────────

/**
 * Returns true if the given combo already exists among existing SKUs.
 * combo: { color: 'red', size: 'M' }
 * existingSkus: array of sku objects with .attributes (object or JSON string)
 */
export function isDuplicateSku(combo, existingSkus) {
    const comboStr = JSON.stringify(combo);
    return existingSkus.some(sku => {
        const attrs = parseAttr(sku.attributes);
        return JSON.stringify(attrs) === comboStr;
    });
}

/**
 * Get all possible combinations for a product's attributes.
 * attributesObj: { color: ['red', 'blue'], size: ['M', 'L'] }
 */
export function getAllPossibleCombos(attributesObj) {
    const keys = Object.keys(attributesObj || {});
    if (!keys.length) return [{}];
    const groups = keys.map(k => ({ key: k, values: attributesObj[k] || [] }));
    return cartesian(groups);
}

// object dạng: { color: ['Đỏ', 'Xanh'], size: ['S', 'M'] }
//  => Chuyển object thành mảng groups: [{ key: 'color', values: [...] }, { key: 'size', values: [...] }]
