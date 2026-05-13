import { Fragment } from 'react';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { parseAttr, fmtVnd, getPriceRange, getTotalStock } from '../utils/productHelpers';

export function ProductTable({
    products, categories, isLoading, isError,
    expandedIds, toggleExpand,
    page, pageSize, total, isLastPage, totalPages,
    handlePageChange,
    onEdit, onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-sm">
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-500 text-sm">Loading products...</span>
                </div>
            ) : isError ? (
                <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Failed to load products. Please try again.</span>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                    <th className="w-10 px-2 py-3"></th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Variants</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Price</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Stock</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e3e3e3]">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-400">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => {
                                        const productId = product.id || product.productId;
                                        const isExpanded = expandedIds.has(productId);
                                        const skus = product.productSkus || product.skus || [];
                                        const category = categories.find(m => (m.id || m.categoryId) == product.categoryId);
                                        const totalStock = getTotalStock(product);
                                        const priceRange = getPriceRange(product);
                                        const attrs = parseAttr(product.attributes);
                                        const attrSummary = Object.keys(attrs)
                                            .map(k => `${k} (${(attrs[k] || []).length})`)
                                            .join(', ');

                                        return (
                                            <Fragment key={productId}>
                                                <tr className="hover:bg-[#f8f8f8] transition-colors">
                                                    {/* Expand toggle */}
                                                    <td className="w-10 px-2 py-3 text-center">
                                                        {skus.length > 0 ? (
                                                            <button
                                                                onClick={() => toggleExpand(productId)}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-slate-100 text-slate-500 transition-colors mx-auto"
                                                                title={isExpanded ? 'Hide variants' : 'Show variants'}
                                                            >
                                                                {isExpanded
                                                                    ? <ChevronUp className="w-3.5 h-3.5" />
                                                                    : <ChevronDown className="w-3.5 h-3.5" />}
                                                            </button>
                                                        ) : null}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <ProductImage imgUrls={product.imgUrls} />
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                                                {product.description && (
                                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{product.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {category?.name ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                                {category.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">—</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs font-medium text-slate-700">
                                                                {skus.length} variant{skus.length !== 1 ? 's' : ''}
                                                            </span>
                                                            {attrSummary && (
                                                                <p className="text-xs text-slate-400">{attrSummary}</p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900 whitespace-nowrap">
                                                        {priceRange}
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`font-medium text-sm ${typeof totalStock === 'number' && totalStock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                                            {totalStock}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => onEdit(product)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600"
                                                                title="Edit">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => onDelete(product)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                                                                title="Delete">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* SKU expanded sub-row */}
                                                {isExpanded && skus.length > 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="px-0 py-0">
                                                            <div className="bg-slate-50 border-b border-[#e3e3e3] px-12 py-3">
                                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                                    Variants of &ldquo;{product.name}&rdquo;
                                                                </p>
                                                                <div className="overflow-x-auto">
                                                                <table className="w-full min-w-[520px] text-xs">
                                                                    <thead>
                                                                        <tr className="border-b border-[#e3e3e3]">
                                                                            <th className="text-left pb-1.5 font-semibold text-slate-500 w-48">Combination</th>
                                                                            <th className="text-right pb-1.5 font-semibold text-slate-500 w-32">Price</th>
                                                                            <th className="text-right pb-1.5 font-semibold text-slate-500 w-20">Stock</th>
                                                                            <th className="text-left pb-1.5 font-semibold text-slate-500 pl-6">Image</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {skus.map(sku => {
                                                                            const skuAttrs = parseAttr(sku.attributes);
                                                                            const label = Object.entries(skuAttrs)
                                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                                .join(', ') || '(Default)';
                                                                            return (
                                                                                <tr key={sku.id} className="border-b border-[#e3e3e3] last:border-0">
                                                                                    <td className="py-2 text-slate-700 font-mono">{label}</td>
                                                                                    <td className="py-2 text-right font-medium text-slate-900">{fmtVnd(sku.price)}</td>
                                                                                    <td className={`py-2 text-right font-medium ${sku.stock === 0 ? 'text-red-500' : 'text-slate-800'}`}>
                                                                                        {sku.stock}
                                                                                    </td>
                                                                                    <td className="py-2 pl-6">
                                                                                        {sku.imgUrl ? (
                                                                                            <img src={sku.imgUrl} alt="sku"
                                                                                                className="w-8 h-8 rounded object-cover border border-[#e3e3e3]"
                                                                                                onError={e => { e.target.style.display = 'none'; }} />
                                                                                        ) : (
                                                                                            <span className="text-slate-400">—</span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {(page > 1 || !isLastPage) && (
                        <div className="flex flex-col gap-3 border-t border-[#e3e3e3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-slate-500">
                                {total > 0
                                    ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} products`
                                    : `Page ${page} · ${products.length} product${products.length !== 1 ? 's' : ''}`
                                }
                            </span>
                            <div className="flex items-center justify-between gap-1 sm:justify-end">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-sm font-medium text-slate-700">
                                    {totalPages ? `${page} / ${totalPages}` : `Page ${page}`}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={isLastPage}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
