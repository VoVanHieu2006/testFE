import { useState } from 'react';
import { Plus, X, Loader2, Tag, Trash2 } from 'lucide-react';
import { parseAttr, fmtVnd, getAllPossibleCombos, isDuplicateSku } from '../utils/productHelpers';
import { useEditProduct } from '../hooks/useProducts';

// ─── BulkApplyBar (same as Add, for Edit context) ───────────────────────────

function EditBulkApplyBar({ onApply }) {
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkImg, setBulkImg] = useState('');

    return (
        <div className="bg-slate-50 border border-[#e3e3e3] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply to all variants</p>
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <input
                        type="number" min="0"
                        value={bulkPrice}
                        onChange={e => setBulkPrice(e.target.value)}
                        placeholder="Price for all (VND)"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => { if (bulkPrice !== '') onApply('price', bulkPrice); }}
                        disabled={bulkPrice === ''}
                        className="px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                        Set price
                    </button>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <input
                        type="text"
                        value={bulkImg}
                        onChange={e => setBulkImg(e.target.value)}
                        placeholder="Image URL for all"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black font-mono transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => { if (bulkImg.trim()) onApply('imgUrl', bulkImg); }}
                        disabled={!bulkImg.trim()}
                        className="px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                        Set image
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── EditGroupApplyBar ────────────────────────────────────────────────────────

function EditGroupApplyBar({ productAttrs, visibleSkus, onApplyGroup }) {
    const attrKeys = Object.keys(productAttrs);
    const [selectedKey, setSelectedKey] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const [groupPrice, setGroupPrice] = useState('');
    const [groupImg, setGroupImg] = useState('');

    if (attrKeys.length === 0) return null;

    const handleKeyChange = (k) => {
        setSelectedKey(k);
        setSelectedValue('');
        setGroupPrice('');
        setGroupImg('');
    };

    return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply by attribute group</p>
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    value={selectedKey}
                    onChange={e => handleKeyChange(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white outline-none focus:border-black transition-colors"
                >
                    <option value="">Select attribute...</option>
                    {attrKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {selectedKey && (
                    <select
                        value={selectedValue}
                        onChange={e => setSelectedValue(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white outline-none focus:border-black transition-colors"
                    >
                        <option value="">Select value...</option>
                        {(productAttrs[selectedKey] || []).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                )}
            </div>
            {selectedValue && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                        <input
                            type="number" min="0"
                            value={groupPrice}
                            onChange={e => setGroupPrice(e.target.value)}
                            placeholder={`Price for all ${selectedKey}: ${selectedValue}`}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => { if (groupPrice !== '') onApplyGroup(selectedKey, selectedValue, 'price', groupPrice); }}
                            disabled={groupPrice === ''}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors whitespace-nowrap"
                        >
                            Set price
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                        <input
                            type="text"
                            value={groupImg}
                            onChange={e => setGroupImg(e.target.value)}
                            placeholder={`Image for all ${selectedKey}: ${selectedValue}`}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black font-mono transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => { if (groupImg.trim()) onApplyGroup(selectedKey, selectedValue, 'imgUrl', groupImg); }}
                            disabled={!groupImg.trim()}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors whitespace-nowrap"
                        >
                            Set image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main EditProductModal ────────────────────────────────────────────────────

export function EditProductModal({ tenantId, product, categories, onClose, onSuccess }) {
    const productId = product.id || product.productId;
    const productAttrs = parseAttr(product.attributes); // e.g. { color: ['red','blue'], size: ['M','L'] }
    const attrKeys = Object.keys(productAttrs);

    // ── Product fields ────────────────────────────────────────────────────
    const [name, setName] = useState(product.name || '');
    const [description, setDescription] = useState(product.description || '');
    const [categoryId, setCategoryId] = useState(product.categoryId || '');
    const [imgUrlsText, setImgUrlsText] = useState(
        Array.isArray(product.imgUrls) ? product.imgUrls.join('\n') : ''
    );
    const [fieldErrors, setFieldErrors] = useState({});

    // ── SKU state ─────────────────────────────────────────────────────────
    const [skuList, setSkuList] = useState(product.productSkus || product.skus || []);
    const [skuEdits, setSkuEdits] = useState(() => {
        const m = {};
        (product.productSkus || product.skus || []).forEach(s => {
            m[s.id] = { price: s.price ?? '', stock: s.stock ?? '0', imgUrl: s.imgUrl || '' };
        });
        return m;
    });
    const [deletedIds, setDeletedIds] = useState(new Set());

    // ── Add variant state ─────────────────────────────────────────────────
    const [showAddSku, setShowAddSku] = useState(false);
    const [addError, setAddError] = useState('');

    const buildNewSku = () => ({
        price: '', stock: '0', imgUrl: '',
        ...attrKeys.reduce((a, k) => ({ ...a, [k]: '' }), {}),
    });
    const [newSku, setNewSku] = useState(buildNewSku);

    const {
        isSavingProduct, productError,
        savingSkuId, deletingSkuId, addingSkuLoading,
        saveProduct, saveSku, deleteSku, addSku,
    } = useEditProduct(tenantId, productId, onSuccess, onClose);

    const visibleSkus = skuList.filter(s => !deletedIds.has(s.id));

    // ── Compute how many total combos are possible ─────────────────────────
    const allPossibleCombos = getAllPossibleCombos(productAttrs);
    const maxVariants = allPossibleCombos.length;
    const isAtMaxVariants = visibleSkus.length >= maxVariants && maxVariants > 0;

    // ── Bulk / group apply on existing SKUs ───────────────────────────────
    const bulkApply = (field, value) => {
        setSkuEdits(prev => {
            const next = { ...prev };
            visibleSkus.forEach(s => {
                next[s.id] = { ...next[s.id], [field]: value };
            });
            return next;
        });
    };

    const groupApply = (groupKey, groupVal, field, value) => {
        setSkuEdits(prev => {
            const next = { ...prev };
            visibleSkus.forEach(s => {
                const attrs = parseAttr(s.attributes);
                if (attrs[groupKey] === groupVal) {
                    next[s.id] = { ...next[s.id], [field]: value };
                }
            });
            return next;
        });
    };

    // ── Handlers ──────────────────────────────────────────────────────────

    const handleSaveProduct = () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        saveProduct({
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            imgUrls: imgUrlsText.split('\n').map(u => u.trim()).filter(Boolean),
        });
    };

    const handleSaveSku = (skuId) => {
        const edit = skuEdits[skuId];
        saveSku(skuId, {
            price: Number(edit.price),
            stock: Number(edit.stock),
            imgUrl: edit.imgUrl || '',
        });
    };

    const handleDeleteSku = (skuId) => {
        deleteSku(skuId, (id) => setDeletedIds(prev => new Set([...prev, id])));
    };

    const handleAddSku = () => {
        setAddError('');

        // Build combo from newSku attribute fields
        const combo = {};
        attrKeys.forEach(k => { if (newSku[k]) combo[k] = newSku[k]; });

        // ── Duplicate check ──────────────────────────────────────────────
        if (isDuplicateSku(combo, visibleSkus)) {
            setAddError('This variant combination already exists. Please choose different attribute values.');
            return;
        }

        // ── Max variants check ───────────────────────────────────────────
        if (isAtMaxVariants) {
            setAddError(`All ${maxVariants} possible variant combinations already exist.`);
            return;
        }

        const payload = {
            price: Number(newSku.price),
            stock: Number(newSku.stock),
            imgUrl: newSku.imgUrl || '',
            attributes: Object.keys(combo).length ? combo : undefined,
        };

        addSku(payload, (created) => {
            setSkuList(prev => [...prev, created]);
            setSkuEdits(prev => ({
                ...prev,
                [created.id]: { price: created.price ?? '', stock: created.stock ?? '0', imgUrl: created.imgUrl || '' },
            }));
            setNewSku(buildNewSku());
            setShowAddSku(false);
        });
    };

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
                                Variants <span className="font-normal text-slate-400">({visibleSkus.length}{maxVariants > 0 ? ` / ${maxVariants}` : ''})</span>
                            </h3>
                            {/* Hide "Add Variant" button if already at max */}
                            {!isAtMaxVariants && (
                                <button type="button" onClick={() => { setShowAddSku(v => !v); setAddError(''); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition-colors">
                                    <Plus className="w-4 h-4" /> Add Variant
                                </button>
                            )}
                            {isAtMaxVariants && (
                                <span className="text-xs text-slate-400 italic">All combinations added</span>
                            )}
                        </div>

                        {/* ── Bulk apply (edit) ── */}
                        {visibleSkus.length > 1 && (
                            <EditBulkApplyBar onApply={bulkApply} />
                        )}

                        {/* ── Group apply (edit) ── */}
                        {visibleSkus.length > 1 && attrKeys.length > 0 && (
                            <EditGroupApplyBar
                                productAttrs={productAttrs}
                                visibleSkus={visibleSkus}
                                onApplyGroup={groupApply}
                            />
                        )}

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

                        {/* ── Add Variant form ── */}
                        {showAddSku && !isAtMaxVariants && (
                            <div className="bg-slate-50 border border-[#e3e3e3] rounded-xl p-4 space-y-3">
                                <p className="text-sm font-semibold text-slate-700">New Variant</p>

                                {addError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{addError}</div>
                                )}

                                {attrKeys.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {attrKeys.map(k => (
                                            <div key={k}>
                                                <label className="text-xs font-medium text-slate-600 mb-1 block capitalize">{k}</label>
                                                <select
                                                    value={newSku[k] || ''}
                                                    onChange={e => { setNewSku(prev => ({ ...prev, [k]: e.target.value })); setAddError(''); }}
                                                    className="w-full px-2 py-1.5 border border-[#e3e3e3] rounded-lg text-sm bg-white outline-none focus:border-black transition-colors"
                                                >
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
                                    <button type="button" onClick={() => { setShowAddSku(false); setNewSku(buildNewSku()); setAddError(''); }}
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