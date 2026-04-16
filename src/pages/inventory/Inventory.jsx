import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getProducts, getProductSkus, createSku, updateSku, deleteSku } from '../../share/api/productApi';
import { getCategories } from '../../share/api/categoryApi';
import { queryKeys } from '../../share/api/queryKeys';

function parseAttributes(attrStr) {
    try {
        return typeof attrStr === 'string' ? JSON.parse(attrStr) : attrStr || {};
    } catch {
        return {};
    }
}

function SkuRow({ sku, onEdit, onDelete }) {
    const attrs = parseAttributes(sku.attributes);
    const attrText = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
    return (
        <tr className="hover:bg-[#f8f8f8] transition-colors">
            <td className="px-4 py-3 pl-12">
                <div className="flex items-center gap-2">
                    {sku.imgUrl ? (
                        <img src={sku.imgUrl} alt="sku" className="w-8 h-8 rounded object-cover border border-[#e3e3e3]" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div>
                    )}
                    <span className="text-xs font-mono text-slate-600">{sku.skuCode || sku.sku || '—'}</span>
                </div>
            </td>
            <td className="px-4 py-3 text-slate-500 text-xs">{attrText || '—'}</td>
            <td className="px-4 py-3 text-right font-medium text-slate-900 text-sm">
                {sku.price != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sku.price) : '—'}
            </td>
            <td className="px-4 py-3 text-right">
                <span className={`font-semibold text-sm ${sku.stock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                    {sku.stock ?? '—'}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit(sku)} className="w-7 h-7 flex items-center justify-center rounded border border-[#e3e3e3] hover:bg-[#f8f8f8] text-slate-600">
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={() => onDelete(sku)} className="w-7 h-7 flex items-center justify-center rounded border border-red-200 hover:bg-red-50 text-red-500">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function SkuModal({ tenantId, productId, sku, onClose, onSuccess }) {
    const [form, setForm] = useState({
        skuCode: sku?.skuCode || sku?.sku || '',
        price: sku?.price ?? '',
        stock: sku?.stock ?? '',
        attributes: sku ? JSON.stringify(parseAttributes(sku.attributes), null, 2) : '{}',
        imgUrl: sku?.imgUrl || '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const validate = () => {
        const errs = {};
        if (!form.skuCode.trim()) errs.skuCode = 'SKU code is required.';
        if (form.price === '' || isNaN(Number(form.price))) errs.price = 'Valid price is required.';
        if (form.stock === '' || isNaN(Number(form.stock))) errs.stock = 'Valid stock is required.';
        try { JSON.parse(form.attributes); } catch { errs.attributes = 'Attributes must be valid JSON.'; }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setIsLoading(true);
            const payload = {
                skuCode: form.skuCode.trim(),
                price: Number(form.price),
                stock: Number(form.stock),
                attributes: JSON.parse(form.attributes),
                imgUrl: form.imgUrl.trim() || undefined,
            };
            if (sku) {
                await updateSku(tenantId, productId, sku.skuId || sku.id, payload);
            } else {
                await createSku(tenantId, productId, payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Operation failed.';
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white">
                    <h2 className="text-base font-semibold text-black">{sku ? 'Edit SKU' : 'Add SKU'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {serverError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverError}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SKU Code <span className="text-red-500">*</span></label>
                        <input name="skuCode" value={form.skuCode} onChange={handleChange} placeholder="e.g. SHIRT-RED-M"
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.skuCode ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                        {errors.skuCode && <p className="text-red-500 text-xs mt-1">{errors.skuCode}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price <span className="text-red-500">*</span></label>
                            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0"
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.price ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stock <span className="text-red-500">*</span></label>
                            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0"
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.stock ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attributes (JSON)</label>
                        <textarea name="attributes" value={form.attributes} onChange={handleChange} rows={3}
                            placeholder='{"color": "red", "size": "M"}'
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono resize-none transition-colors ${errors.attributes ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                        {errors.attributes && <p className="text-red-500 text-xs mt-1">{errors.attributes}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                        <input name="imgUrl" value={form.imgUrl} onChange={handleChange} placeholder="https://..."
                            className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none transition-colors" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Saving...' : (sku ? 'Save Changes' : 'Add SKU')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProductSkus({ tenantId, product }) {
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [skuModal, setSkuModal] = useState(null); // null | 'add' | sku object
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const productId = product.productId || product.id;

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.products.skus(tenantId, productId),
        queryFn: () => getProductSkus(tenantId, productId),
        enabled: !!tenantId && isExpanded,
    });

    const skus = data?.items || data?.data || data || [];

    const handleDeleteSku = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteSku(tenantId, productId, deleteTarget.skuId || deleteTarget.id);
            queryClient.invalidateQueries({ queryKey: queryKeys.products.skus(tenantId, productId) });
            setDeleteTarget(null);
        } catch {
            alert('Failed to delete SKU.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSkuSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.skus(tenantId, productId) });
    };

    return (
        <>
            <tr className="hover:bg-[#f8f8f8] border-b border-[#e3e3e3] transition-colors">
                <td className="px-4 py-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-left w-full">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <div className="flex items-center gap-2">
                            {Array.isArray(product.imgUrls) && product.imgUrls[0] ? (
                                <img src={product.imgUrls[0]} alt="product" className="w-8 h-8 rounded object-cover border border-[#e3e3e3]" />
                            ) : (
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div>
                            )}
                            <span className="font-medium text-slate-900 text-sm">{product.name}</span>
                        </div>
                    </button>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">{product.categoryName || '—'}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-500">{Array.isArray(product.skus) ? product.skus.length : '—'} SKUs</td>
                <td className="px-4 py-3 text-right">
                    <button
                        onClick={() => { setIsExpanded(true); setSkuModal('add'); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#e3e3e3] text-xs font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors ml-auto"
                    >
                        <Plus className="w-3 h-3" /> Add SKU
                    </button>
                </td>
            </tr>

            {isExpanded && (
                <>
                    {isLoading ? (
                        <tr>
                            <td colSpan={4} className="py-3 pl-12 text-sm text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading SKUs...
                            </td>
                        </tr>
                    ) : skus.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-3 pl-12 text-sm text-slate-400 italic">No SKUs for this product.</td>
                        </tr>
                    ) : (
                        skus.map((sku) => (
                            <SkuRow
                                key={sku.skuId || sku.id}
                                sku={sku}
                                tenantId={tenantId}
                                productId={productId}
                                onEdit={(s) => setSkuModal(s)}
                                onDelete={(s) => setDeleteTarget(s)}
                            />
                        ))
                    )}
                </>
            )}

            {skuModal && (
                <SkuModal
                    tenantId={tenantId}
                    productId={productId}
                    sku={skuModal === 'add' ? null : skuModal}
                    onClose={() => setSkuModal(null)}
                    onSuccess={handleSkuSuccess}
                />
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Delete SKU</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Delete <strong>{deleteTarget.skuCode || deleteTarget.sku}</strong>? This cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">Cancel</button>
                            <button onClick={handleDeleteSku} disabled={isDeleting} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Inventory() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const productsQuery = useQuery({
        queryKey: queryKeys.products.list(tenantId, { search, categoryId, page: 1, pageSize: 100 }),
        queryFn: () => getProducts(tenantId, { search: search || undefined, categoryId: categoryId || undefined, page: 1, pageSize: 100 }),
        enabled: !!tenantId,
    });

    const categoriesQuery = useQuery({
        queryKey: queryKeys.categories.list(tenantId),
        queryFn: () => getCategories(tenantId),
        enabled: !!tenantId,
    });

    const products = productsQuery.data?.items || productsQuery.data?.data || productsQuery.data || [];
    const categories = categoriesQuery.data?.items || categoriesQuery.data?.data || categoriesQuery.data || [];

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to manage inventory.</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage SKUs and stock levels for your products</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Filter by product name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </div>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden">
                {productsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading inventory...</span>
                    </div>
                ) : productsQuery.isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load inventory.</span>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Product / SKU</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">SKUs</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-16 text-slate-400">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <ProductSkus
                                        key={product.productId || product.id}
                                        tenantId={tenantId}
                                        product={product}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
