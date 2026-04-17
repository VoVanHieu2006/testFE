import { useState, useCallback, Fragment } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Search, Plus, ChevronLeft, ChevronRight, Package,
    Loader2, AlertCircle, Pencil, Trash2, X, Tag,
    ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import {
    getProducts, createProduct, updateProduct, deleteProduct,
    createSku, updateSku, deleteSku,
} from '../../share/api/productApi';
import { getCategories } from '../../share/api/categoryApi';
import { queryKeys } from '../../share/api/queryKeys';

const DEFAULT_PAGE_SIZE = 10;
const MAX_ATTR_GROUPS = 2;
const MAX_ATTR_VALUES = 5;

// ─── helpers ────────────────────────────────────────────────────────────────

function parseAttr(str) {
    try { return typeof str === 'string' ? JSON.parse(str) : (str || {}); }
    catch { return {}; }
}

function cartesian(groups) {
    const active = groups.filter(g => g.key.trim() && g.values.length > 0);
    if (!active.length) return [{}];
    const [first, ...rest] = active;
    const restCombos = cartesian(rest);
    return first.values.flatMap(v => restCombos.map(c => ({ [first.key]: v, ...c })));
}

function skuLabel(combo) {
    const vals = Object.values(combo);
    return vals.length ? vals.join(' / ') : '(Default)';
}

function fmtVnd(val) {
    if (val == null || val === '') return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val));
}

function getPriceRange(product) {
    const skus = product.productSkus || product.skus || [];
    if (!skus.length) return product.price != null ? fmtVnd(product.price) : '—';
    const prices = skus.map(s => s.price).filter(p => p != null);
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? fmtVnd(min) : `${fmtVnd(min)} – ${fmtVnd(max)}`;
}

function getTotalStock(product) {
    const skus = product.productSkus || product.skus || [];
    if (!skus.length) return product.stock ?? '—';
    return skus.reduce((s, sk) => s + (sk.stock ?? 0), 0);
}

// ─── ProductImage ────────────────────────────────────────────────────────────

function ProductImage({ imgUrls }) {
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

// ─── AddProductModal ─────────────────────────────────────────────────────────

function computeSkuRows(groups, prevRows = []) {
    const combos = cartesian(groups);
    return combos.map(combo => {
        const key = JSON.stringify(combo);
        const prev = prevRows.find(r => JSON.stringify(r.combination) === key);
        return { combination: combo, price: prev?.price ?? '', stock: prev?.stock ?? '0', imgUrl: prev?.imgUrl ?? '' };
    });
}

function AddProductModal({ tenantId, categories, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imgUrlsText, setImgUrlsText] = useState('');
    const [attrGroups, setAttrGroups] = useState([]);
    const [newAttrKey, setNewAttrKey] = useState('');
    const [skuRows, setSkuRows] = useState([{ combination: {}, price: '', stock: '0', imgUrl: '' }]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const recompute = useCallback((groups) => {
        setSkuRows(prev => computeSkuRows(groups, prev));
    }, []);

    const addAttrGroup = () => {
        const key = newAttrKey.trim();
        if (!key || attrGroups.length >= MAX_ATTR_GROUPS) return;
        if (attrGroups.find(g => g.key === key)) return;
        const next = [...attrGroups, { key, values: [], newVal: '' }];
        setAttrGroups(next);
        setNewAttrKey('');
        recompute(next);
    };

    const removeAttrGroup = (idx) => {
        const next = attrGroups.filter((_, i) => i !== idx);
        setAttrGroups(next);
        recompute(next);
    };

    const addAttrValue = (gIdx) => {
        const g = attrGroups[gIdx];
        const val = g.newVal.trim();
        if (!val || g.values.length >= MAX_ATTR_VALUES || g.values.includes(val)) return;
        const next = attrGroups.map((g2, i) =>
            i === gIdx ? { ...g2, values: [...g2.values, val], newVal: '' } : g2
        );
        setAttrGroups(next);
        recompute(next);
    };

    const removeAttrValue = (gIdx, vIdx) => {
        const next = attrGroups.map((g, i) =>
            i === gIdx ? { ...g, values: g.values.filter((_, vi) => vi !== vIdx) } : g
        );
        setAttrGroups(next);
        recompute(next);
    };

    const updateSkuRow = (idx, field, value) => {
        setSkuRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const validate = () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
        if (!categoryId) errs.categoryId = 'Please select a category.';
        const badPrice = skuRows.some(r => r.price === '' || isNaN(Number(r.price)) || Number(r.price) < 0);
        const badStock = skuRows.some(r => r.stock === '' || isNaN(Number(r.stock)) || Number(r.stock) < 0);
        if (badPrice || badStock) errs.skus = 'All variants need a valid price and stock (≥ 0).';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        // Build product attributes JSON string
        let attributesStr;
        const activeGroups = attrGroups.filter(g => g.key && g.values.length);
        if (activeGroups.length) {
            const obj = {};
            activeGroups.forEach(g => { obj[g.key] = g.values; });
            attributesStr = JSON.stringify(obj);
        }

        const payload = {
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            attributes: attributesStr,
            imgUrls: imgUrlsText.split('\n').map(u => u.trim()).filter(Boolean),
            skus: skuRows.map(r => ({
                price: Number(r.price),
                stock: Number(r.stock),
                attributes: Object.keys(r.combination).length ? JSON.stringify(r.combination) : undefined,
                imgUrl: r.imgUrl.trim() || '',
            })),
        };

        try {
            setIsLoading(true);
            setServerError('');
            await createProduct(tenantId, payload);
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to create product.';
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-black">Add New Product</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="divide-y divide-[#e3e3e3]">
                    {serverError && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverError}</div>
                    )}

                    {/* ── Section 1: Basic Info ── */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">1</span>
                            Basic Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                                placeholder="e.g. Classic T-Shirt"
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                                placeholder="Product description..."
                                className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setErrors(p => ({ ...p, categoryId: '' })); }}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none bg-white transition-colors ${errors.categoryId ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`}>
                                    <option value="">Select category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Product Images <span className="text-slate-400 font-normal">(URLs, one per line)</span>
                                </label>
                                <textarea value={imgUrlsText} onChange={e => setImgUrlsText(e.target.value)} rows={2}
                                    placeholder="https://cdn.example.com/image1.jpg"
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none font-mono transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Attributes ── */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">2</span>
                            Product Attributes
                            <span className="text-xs font-normal text-slate-400">(optional · max {MAX_ATTR_GROUPS} groups · max {MAX_ATTR_VALUES} values each)</span>
                        </h3>

                        {attrGroups.map((group, gIdx) => (
                            <div key={gIdx} className="bg-slate-50 rounded-xl border border-[#e3e3e3] p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-800 capitalize">{group.key}</span>
                                    <button type="button" onClick={() => removeAttrGroup(gIdx)}
                                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {group.values.map((val, vIdx) => (
                                        <span key={vIdx}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#e3e3e3] rounded-full text-xs font-medium text-slate-700">
                                            {val}
                                            <button type="button" onClick={() => removeAttrValue(gIdx, vIdx)}
                                                className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {group.values.length < MAX_ATTR_VALUES && (
                                        <div className="flex items-center gap-1">
                                            <input
                                                value={group.newVal}
                                                onChange={e => setAttrGroups(prev => prev.map((g, i) => i === gIdx ? { ...g, newVal: e.target.value } : g))}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttrValue(gIdx); } }}
                                                placeholder={`Add ${group.key}...`}
                                                className="px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-xs outline-none focus:border-black w-32 transition-colors" />
                                            <button type="button" onClick={() => addAttrValue(gIdx)}
                                                className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    {group.values.length >= MAX_ATTR_VALUES && (
                                        <span className="text-xs text-slate-400">Max {MAX_ATTR_VALUES} values</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {attrGroups.length < MAX_ATTR_GROUPS ? (
                            <div className="flex items-center gap-2">
                                <input value={newAttrKey}
                                    onChange={e => setNewAttrKey(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttrGroup(); } }}
                                    placeholder='Attribute name (e.g. Color, Size, Style...)'
                                    className="flex-1 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-sm outline-none focus:border-black transition-colors" />
                                <button type="button" onClick={addAttrGroup} disabled={!newAttrKey.trim()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 disabled:opacity-40 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Attribute
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Maximum {MAX_ATTR_GROUPS} attribute groups reached.</p>
                        )}
                    </div>

                    {/* ── Section 3: SKU Table ── */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">3</span>
                            Variants &amp; Pricing
                            <span className="text-xs font-normal text-slate-400">({skuRows.length} variant{skuRows.length !== 1 ? 's' : ''})</span>
                        </h3>
                        {errors.skus && <p className="text-red-500 text-xs">{errors.skus}</p>}

                        <div className="border border-[#e3e3e3] rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 w-36">Variant</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-32">
                                            Price (VND) <span className="text-red-500">*</span>
                                        </th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-24">
                                            Stock <span className="text-red-500">*</span>
                                        </th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600">Image URL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {skuRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-[#fafafa]">
                                            <td className="px-4 py-2.5">
                                                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                                                    {skuLabel(row.combination)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <input type="number" min="0" value={row.price}
                                                    onChange={e => { updateSkuRow(idx, 'price', e.target.value); setErrors(p => ({ ...p, skus: '' })); }}
                                                    placeholder="0"
                                                    className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <input type="number" min="0" value={row.stock}
                                                    onChange={e => { updateSkuRow(idx, 'stock', e.target.value); setErrors(p => ({ ...p, skus: '' })); }}
                                                    placeholder="0"
                                                    className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <input type="text" value={row.imgUrl}
                                                    onChange={e => updateSkuRow(idx, 'imgUrl', e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black font-mono transition-colors" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── EditProductModal ─────────────────────────────────────────────────────────

function EditProductModal({ tenantId, product, categories, onClose, onSuccess }) {
    const productId = product.id || product.productId;
    const productAttrs = parseAttr(product.attributes);
    const attrKeys = Object.keys(productAttrs);

    // Product fields
    const [name, setName] = useState(product.name || '');
    const [description, setDescription] = useState(product.description || '');
    const [categoryId, setCategoryId] = useState(product.categoryId || '');
    const [imgUrlsText, setImgUrlsText] = useState(
        Array.isArray(product.imgUrls) ? product.imgUrls.join('\n') : ''
    );
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [productError, setProductError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // SKU state — kept in local state so we can add without mutating props
    const [skuList, setSkuList] = useState(product.productSkus || product.skus || []);
    const [skuEdits, setSkuEdits] = useState(() => {
        const m = {};
        (product.productSkus || product.skus || []).forEach(s => {
            m[s.id] = { price: s.price ?? '', stock: s.stock ?? '0', imgUrl: s.imgUrl || '' };
        });
        return m;
    });
    const [deletedIds, setDeletedIds] = useState(new Set());
    const [savingSkuId, setSavingSkuId] = useState(null);
    const [deletingSkuId, setDeletingSkuId] = useState(null);

    // Add SKU form
    const [showAddSku, setShowAddSku] = useState(false);
    const initNewSku = () => ({
        price: '', stock: '0', imgUrl: '',
        ...attrKeys.reduce((a, k) => ({ ...a, [k]: '' }), {}),
    });
    const [newSku, setNewSku] = useState(initNewSku);
    const [addingSkuLoading, setAddingSkuLoading] = useState(false);

    const handleSaveProduct = async () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        try {
            setIsSavingProduct(true);
            setProductError('');
            await updateProduct(tenantId, productId, {
                name: name.trim(),
                description: description.trim() || undefined,
                categoryId: categoryId || undefined,
                imgUrls: imgUrlsText.split('\n').map(u => u.trim()).filter(Boolean),
            });
            onSuccess();
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to update product.';
            setProductError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsSavingProduct(false);
        }
    };

    const handleSaveSku = async (skuId) => {
        const edit = skuEdits[skuId];
        try {
            setSavingSkuId(skuId);
            await updateSku(tenantId, productId, skuId, {
                price: Number(edit.price),
                stock: Number(edit.stock),
                imgUrl: edit.imgUrl || '',
            });
        } catch {
            alert('Failed to update variant.');
        } finally {
            setSavingSkuId(null);
        }
    };

    const handleDeleteSku = async (skuId) => {
        if (!confirm('Delete this variant? This cannot be undone.')) return;
        try {
            setDeletingSkuId(skuId);
            await deleteSku(tenantId, productId, skuId);
            setDeletedIds(prev => new Set([...prev, skuId]));
            onSuccess();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete variant.';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setDeletingSkuId(null);
        }
    };

    const handleAddSku = async () => {
        const combo = {};
        attrKeys.forEach(k => { if (newSku[k]) combo[k] = newSku[k]; });
        const payload = {
            price: Number(newSku.price),
            stock: Number(newSku.stock),
            imgUrl: newSku.imgUrl || '',
            attributes: Object.keys(combo).length ? JSON.stringify(combo) : undefined,
        };
        try {
            setAddingSkuLoading(true);
            const created = await createSku(tenantId, productId, payload);
            setSkuList(prev => [...prev, created]);
            setSkuEdits(prev => ({
                ...prev,
                [created.id]: { price: created.price ?? '', stock: created.stock ?? '0', imgUrl: created.imgUrl || '' },
            }));
            setNewSku(initNewSku());
            setShowAddSku(false);
            onSuccess();
        } catch {
            alert('Failed to add variant.');
        } finally {
            setAddingSkuLoading(false);
        }
    };

    const visibleSkus = skuList.filter(s => !deletedIds.has(s.id));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-black">Edit Product</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="divide-y divide-[#e3e3e3]">
                    {/* ── Product fields ── */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700">Product Information</h3>

                        {productError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{productError}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${fieldErrors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none bg-white transition-colors">
                                    <option value="">No category</option>
                                    {categories.map(cat => (
                                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Image URLs <span className="text-slate-400 font-normal">(one per line)</span>
                                </label>
                                <textarea value={imgUrlsText} onChange={e => setImgUrlsText(e.target.value)} rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none font-mono transition-colors" />
                            </div>
                        </div>

                        {/* Attributes display (read-only) */}
                        {attrKeys.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" /> Attributes
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {attrKeys.map(key => (
                                        <div key={key} className="flex items-center gap-1 bg-slate-50 border border-[#e3e3e3] rounded-lg px-3 py-1.5 text-xs">
                                            <span className="font-semibold text-slate-700 capitalize">{key}:</span>
                                            <span className="text-slate-500">{(productAttrs[key] || []).join(', ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button type="button" onClick={handleSaveProduct} disabled={isSavingProduct}
                                className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2 transition-colors">
                                {isSavingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSavingProduct ? 'Saving...' : 'Save Product Info'}
                            </button>
                        </div>
                    </div>

                    {/* ── SKU management ── */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Variants <span className="font-normal text-slate-400">({visibleSkus.length})</span>
                            </h3>
                            <button type="button" onClick={() => setShowAddSku(v => !v)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition-colors">
                                <Plus className="w-4 h-4" /> Add Variant
                            </button>
                        </div>

                        {visibleSkus.length > 0 ? (
                            <div className="border border-[#e3e3e3] rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 w-40">Variant</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-28">Price (VND)</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-22">Stock</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600">Image URL</th>
                                            <th className="px-2 py-2.5 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e3e3e3]">
                                        {visibleSkus.map(sku => {
                                            const edit = skuEdits[sku.id] || { price: sku.price ?? '', stock: sku.stock ?? '0', imgUrl: sku.imgUrl || '' };
                                            const attrs = parseAttr(sku.attributes);
                                            const label = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ') || '(Default)';
                                            return (
                                                <tr key={sku.id} className="hover:bg-[#fafafa]">
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-xs font-mono text-slate-600 break-all">{label}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input type="number" min="0" value={edit.price}
                                                            onChange={e => setSkuEdits(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], price: e.target.value } }))}
                                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input type="number" min="0" value={edit.stock}
                                                            onChange={e => setSkuEdits(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], stock: e.target.value } }))}
                                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input type="text" value={edit.imgUrl}
                                                            onChange={e => setSkuEdits(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], imgUrl: e.target.value } }))}
                                                            placeholder="https://..."
                                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black font-mono transition-colors" />
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => handleSaveSku(sku.id)} disabled={savingSkuId === sku.id}
                                                                className="px-2 py-1 rounded-lg bg-black text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center gap-1 transition-colors">
                                                                {savingSkuId === sku.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                                                Save
                                                            </button>
                                                            <button type="button" onClick={() => handleDeleteSku(sku.id)} disabled={deletingSkuId === sku.id}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 text-red-500 disabled:opacity-60 transition-colors">
                                                                {deletingSkuId === sku.id
                                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                    : <Trash2 className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="border border-dashed border-[#e3e3e3] rounded-xl py-8 text-center text-slate-400 text-sm">
                                No variants yet. Add at least one.
                            </div>
                        )}

                        {/* Add Variant form */}
                        {showAddSku && (
                            <div className="bg-slate-50 border border-[#e3e3e3] rounded-xl p-4 space-y-3">
                                <p className="text-sm font-semibold text-slate-700">New Variant</p>

                                {attrKeys.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {attrKeys.map(k => (
                                            <div key={k}>
                                                <label className="text-xs font-medium text-slate-600 mb-1 block capitalize">{k}</label>
                                                <select value={newSku[k] || ''}
                                                    onChange={e => setNewSku(prev => ({ ...prev, [k]: e.target.value }))}
                                                    className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm bg-white outline-none focus:border-black transition-colors">
                                                    <option value="">Select...</option>
                                                    {(productAttrs[k] || []).map(v => (
                                                        <option key={v} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Price (VND) *</label>
                                        <input type="number" min="0" value={newSku.price}
                                            onChange={e => setNewSku(p => ({ ...p, price: e.target.value }))}
                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Stock *</label>
                                        <input type="number" min="0" value={newSku.stock}
                                            onChange={e => setNewSku(p => ({ ...p, stock: e.target.value }))}
                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Image URL</label>
                                        <input type="text" value={newSku.imgUrl}
                                            onChange={e => setNewSku(p => ({ ...p, imgUrl: e.target.value }))}
                                            placeholder="https://..."
                                            className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm outline-none focus:border-black font-mono transition-colors" />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setShowAddSku(false); setNewSku(initNewSku()); }}
                                        className="px-3 py-1.5 rounded-lg border border-[#e3e3e3] text-sm text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={handleAddSku} disabled={addingSkuLoading}
                                        className="px-3 py-1.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 flex items-center gap-1.5 transition-colors">
                                        {addingSkuLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Add Variant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex justify-end">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── DeleteProductConfirm ─────────────────────────────────────────────────────

function DeleteProductConfirm({ name, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Delete Product</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Products Page ────────────────────────────────────────────────────────────

export default function Products() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [expandedIds, setExpandedIds] = useState(new Set());

    // modal: null | 'add' | product-object (edit)
    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const productsQuery = useQuery({
        queryKey: queryKeys.products.list(tenantId, { page, pageSize, search, categoryId, sortBy, sortDir }),
        queryFn: () => getProducts(tenantId, {
            page, pageSize,
            search: search || undefined,
            categoryId: categoryId || undefined,
            sortBy, sortDir,
        }),
        enabled: !!tenantId,
    });

    const categoriesQuery = useQuery({
        queryKey: queryKeys.categories.list(tenantId),
        queryFn: () => getCategories(tenantId),
        enabled: !!tenantId,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
        setExpandedIds(new Set());
    };

    const handlePageSizeChange = (val) => {
        setPageSize(Number(val));
        setPage(1);
        setExpandedIds(new Set());
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        setExpandedIds(new Set());
    };

    const toggleExpand = (productId) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(productId) ? next.delete(productId) : next.add(productId);
            return next;
        });
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(tenantId) });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteProduct(tenantId, deleteTarget.id || deleteTarget.productId);
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(tenantId) });
            setDeleteTarget(null);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete product.';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsDeleting(false);
        }
    };

    const products = productsQuery.data?.items || productsQuery.data?.data || productsQuery.data || [];
    const total = productsQuery.data?.total || productsQuery.data?.totalCount || 0;
    // API returns direct array — use isLastPage when total is unavailable
    const isLastPage = Array.isArray(products) && products.length < pageSize;
    const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : null;
    const categories = categoriesQuery.data?.items || categoriesQuery.data?.data || categoriesQuery.data || [];

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view products.</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Products</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your store&apos;s products and variants</p>
                </div>
                <button onClick={() => setModal('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch}
                    className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input type="text" placeholder="Search products..."
                        value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
                </form>

                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black">
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select value={`${sortBy}-${sortDir}`}
                    onChange={e => {
                        const [sb, sd] = e.target.value.split('-');
                        setSortBy(sb); setSortDir(sd); setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black">
                    <option value="createdAt-desc">Newest first</option>
                    <option value="createdAt-asc">Oldest first</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                </select>

                <select value={pageSize} onChange={e => handlePageSizeChange(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black">
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden">
                {productsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading products...</span>
                    </div>
                ) : productsQuery.isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load products. Please try again.</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
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
                                                            {product.categoryName || product.category?.name ? (
                                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                                    {product.categoryName || product.category?.name}
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
                                                                <button onClick={() => setModal(product)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600"
                                                                    title="Edit">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget(product)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                                                                    title="Delete">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* SKU expand sub-row */}
                                                    {isExpanded && skus.length > 0 && (
                                                        <tr>
                                                            <td colSpan={7} className="px-0 py-0">
                                                                <div className="bg-slate-50 border-b border-[#e3e3e3] px-12 py-3">
                                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                                        Variants of &quot;{product.name}&quot;
                                                                    </p>
                                                                    <table className="w-full text-xs">
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

                        {(page > 1 || !isLastPage) && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3e3e3]">
                                <span className="text-sm text-slate-500">
                                    {total > 0
                                        ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} products`
                                        : `Page ${page} · ${products.length} product${products.length !== 1 ? 's' : ''}`
                                    }
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 text-sm font-medium text-slate-700">
                                        {totalPages ? `${page} / ${totalPages}` : `Page ${page}`}
                                    </span>
                                    <button onClick={() => handlePageChange(page + 1)} disabled={isLastPage}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {modal === 'add' && (
                <AddProductModal
                    tenantId={tenantId}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {modal && modal !== 'add' && (
                <EditProductModal
                    tenantId={tenantId}
                    product={modal}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
            {deleteTarget && (
                <DeleteProductConfirm
                    name={deleteTarget.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
}


