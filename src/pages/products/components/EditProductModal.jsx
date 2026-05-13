import { useState, useEffect } from 'react'; // ← Thêm useEffect
import { Plus, X, Loader2, Tag, Trash2, Undo2 } from 'lucide-react'; // ← Thêm icon Undo2
import { parseAttr, getAllPossibleCombos, isDuplicateSku } from '../utils/productHelpers';
import { useEditProduct } from '../hooks/useProducts';
import { ImageUploadPreview } from '../components/ImageUploadPreview';

// ─── EditBulkApplyBar ────────────────────────────────────────────────────────
function EditBulkApplyBar({ onApply }) {
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkImg, setBulkImg] = useState('');

    return (
        <div className="bg-slate-50 border border-[#e3e3e3] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply to all variants</p>
            <div className="flex flex-wrap gap-3">
                <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                    <input
                        type="number" min="0"
                        value={bulkPrice}
                        onChange={e => setBulkPrice(e.target.value)}
                        placeholder="Price (VND)"
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                    />
                    <button
                        type="button"
                        onClick={() => { if (bulkPrice !== '') onApply('price', bulkPrice); }}
                        disabled={bulkPrice === ''}
                        className="min-h-11 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
                    >
                        Set price
                    </button>
                </div>
                <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                    <div className="flex-1">
                        <ImageUploadPreview 
                            value={bulkImg}
                            onChange={setBulkImg}
                            multiple={false}
                            maxFiles={1}
                            label="Upload"
                            placeholder="Image URL"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => { if (bulkImg.trim()) onApply('imgUrl', bulkImg); }}
                        disabled={!bulkImg.trim()}
                        className="min-h-11 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
                    >
                        Set image
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── EditGroupApplyBar ────────────────────────────────────────────────────────
//  ĐÃ XÓA nút Save All khỏi đây (chỉ giữ logic apply)
function EditGroupApplyBar({ productAttrs, onApplyGroup }) {
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
            
            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={selectedKey}
                    onChange={e => handleKeyChange(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black sm:w-auto"
                >
                    <option value="">Select attribute...</option>
                    {attrKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {selectedKey && (
                    <select
                        value={selectedValue}
                        onChange={e => setSelectedValue(e.target.value)}
                        className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black sm:w-auto"
                    >
                        <option value="">Select value...</option>
                        {(productAttrs[selectedKey] || []).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                )}
            </div>
            
            {selectedValue && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                        <input
                            type="number" min="0"
                            value={groupPrice}
                            onChange={e => setGroupPrice(e.target.value)}
                            placeholder={`Price for ${selectedValue}`}
                            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                        />
                        <button
                            type="button"
                            onClick={() => { if (groupPrice !== '') onApplyGroup(selectedKey, selectedValue, 'price', groupPrice); }}
                            disabled={groupPrice === ''}
                            className="min-h-11 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                        >
                            Set price
                        </button>
                    </div>
                    
                    <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                        <div className="flex-1">
                            <ImageUploadPreview 
                                value={groupImg}
                                onChange={setGroupImg}
                                multiple={false}
                                maxFiles={1}
                                label="Upload"
                                placeholder={`Image for ${selectedValue}`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => { if (groupImg.trim()) onApplyGroup(selectedKey, selectedValue, 'imgUrl', groupImg); }}
                            disabled={!groupImg.trim()}
                            className="min-h-11 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
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
    const productAttrs = parseAttr(product.attributes);
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

    // ── Track modified SKUs ───────────────────────────────────────────────
    const [modifiedSkuIds, setModifiedSkuIds] = useState(new Set());

    // Helper: so sánh giá trị an toàn
    const isValueChanged = (original, edited) => {
        if (original === edited) return false;
        if (original == null && edited === '') return false;
        if (original === '' && edited == null) return false;
        return String(original).trim() !== String(edited).trim();
    };

    // Helper: check nếu SKU có thay đổi so với gốc
    const isSkuModified = (originalSku, edit) => {
        if (!originalSku || !edit) return false;
        return (
            isValueChanged(originalSku.price, edit.price) ||
            isValueChanged(originalSku.stock, edit.stock) ||
            isValueChanged(originalSku.imgUrl, edit.imgUrl)
        );
    };

    //  useEffect auto-track changes (FIXED - không gây infinite loop)
    

    //  Discard changes cho 1 SKU
    const discardSkuChanges = (skuId) => {
        const original = skuList.find(s => s.id === skuId);
        if (!original) return;
        setSkuEdits(prev => ({
            ...prev,
            [skuId]: {
                price: original.price ?? '',
                stock: original.stock ?? '0',
                imgUrl: original.imgUrl || ''
            }
        }));
    };

    //  Discard tất cả changes
    const discardAllChanges = () => {
        const reverted = {};
        visibleSkus.forEach(sku => {
            reverted[sku.id] = {
                price: sku.price ?? '',
                stock: sku.stock ?? '0',
                imgUrl: sku.imgUrl || ''
            };
        });
        setSkuEdits(reverted);
    };

    //  Update SKU + auto mark modified (useEffect sẽ handle setModifiedSkuIds)
    const updateSkuEdit = (skuId, field, value) => {
        setSkuEdits(prev => ({
            ...prev,
            [skuId]: { ...prev[skuId], [field]: value }
        }));
    };

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
    const allPossibleCombos = getAllPossibleCombos(productAttrs);
    const maxVariants = allPossibleCombos.length;
    const isAtMaxVariants = visibleSkus.length >= maxVariants && maxVariants > 0;


    useEffect(() => {
        const modified = new Set();
        visibleSkus.forEach(sku => {
            const edit = skuEdits[sku.id];
            if (edit && isSkuModified(sku, edit)) {
                modified.add(sku.id);
            }
        });
        // Chỉ update nếu thực sự thay đổi
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModifiedSkuIds(prev => {
            if (prev.size === modified.size && [...prev].every(id => modified.has(id))) {
                return prev;
            }
            return modified;
        });
    }, [skuEdits, visibleSkus]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Bulk / group apply ────────────────────────────────────────────────
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

    // ── Save all modified SKUs ────────────────────────────────────────────
    const saveAllSkus = async () => {
        const toSave = visibleSkus.filter(s => modifiedSkuIds.has(s.id));
        if (toSave.length === 0) return;

        try {
            for (const sku of toSave) {
                const edit = skuEdits[sku.id];
                await saveSku(sku.id, {
                    price: Number(edit.price),
                    stock: Number(edit.stock),
                    imgUrl: edit.imgUrl || '',
                });
            }
            
            // ✅ QUAN TRỌNG: Cập nhật skuList với giá trị đã save
            // → isSkuModified sẽ trả về false → màu cam tự biến mất
            setSkuList(prev => prev.map(s => {
                if (modifiedSkuIds.has(s.id)) {
                    const edit = skuEdits[s.id];
                    return {
                        ...s,
                        price: Number(edit.price),
                        stock: Number(edit.stock),
                        imgUrl: edit.imgUrl || ''
                    };
                }
                return s;
            }));
            
        } catch (err) {
            console.error('Failed to save some SKUs:', err);
        }
    };
    // ── Handlers ─────────────────────────────────────────────────────────
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
        
        // ✅ Cập nhật skuList để màu cam biến mất cho row này
        setSkuList(prev => prev.map(s => 
            s.id === skuId 
                ? { ...s, price: Number(edit.price), stock: Number(edit.stock), imgUrl: edit.imgUrl || '' }
                : s
        ));
    };

    const handleDeleteSku = (skuId) => {
        deleteSku(skuId, (id) => setDeletedIds(prev => new Set([...prev, id])));
    };

    const handleAddSku = () => {
        setAddError('');
        const combo = {};
        attrKeys.forEach(k => { if (newSku[k]) combo[k] = newSku[k]; });

        if (isDuplicateSku(combo, visibleSkus)) {
            setAddError('This variant combination already exists.');
            return;
        }

        if (isAtMaxVariants) {
            setAddError(`All ${maxVariants} possible combinations already exist.`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e3] bg-white px-4 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-black">Edit Product</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="divide-y divide-[#e3e3e3]">
                    {/* ── Product fields ── */}
                    <div className="space-y-4 p-4 sm:p-6">
                        <h3 className="text-sm font-semibold text-slate-700">Product Information</h3>

                        {productError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{productError}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                                className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${fieldErrors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                                className="w-full resize-none rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                    className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black">
                                    <option value="">No category</option>
                                    {categories.map(cat => (
                                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Product Images <span className="text-slate-400 font-normal">(Upload or paste URLs)</span>
                                </label>
                                <ImageUploadPreview 
                                    value={imgUrlsText}
                                    onChange={setImgUrlsText}
                                    multiple={true}
                                    maxFiles={5}
                                    label="Upload up to 5 images"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

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
                    <div className="space-y-4 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">
                                Variants <span className="font-normal text-slate-400">({visibleSkus.length}{maxVariants > 0 ? ` / ${maxVariants}` : ''})</span>
                            </h3>
                            {!isAtMaxVariants && (
                                <button type="button" onClick={() => { setShowAddSku(v => !v); setAddError(''); }}
                                    className="flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                                    <Plus className="w-4 h-4" /> Add Variant
                                </button>
                            )}
                            {isAtMaxVariants && (
                                <span className="text-xs text-slate-400 italic">All combinations added</span>
                            )}
                        </div>

                        {/*  Action bar: Save All / Discard All - ĐẶT ĐÚNG CHỖ */}
                        {modifiedSkuIds.size > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                <span className="text-sm text-amber-800">
                                    <strong>{modifiedSkuIds.size}</strong> variant{modifiedSkuIds.size > 1 ? 's' : ''} has unsaved changes
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={discardAllChanges}
                                        className="flex min-h-10 items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                    >
                                        <Undo2 className="w-3.5 h-3.5" /> Discard All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveAllSkus}
                                        disabled={visibleSkus.some(s => savingSkuId === s.id)}
                                        className="flex min-h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
                                    >
                                        {visibleSkus.some(s => savingSkuId === s.id) && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save All Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {visibleSkus.length > 1 && (
                            <EditBulkApplyBar onApply={bulkApply} />
                        )}

                        {visibleSkus.length > 1 && attrKeys.length > 0 && (
                            <EditGroupApplyBar
                                productAttrs={productAttrs}
                                onApplyGroup={groupApply}
                            />
                        )}

                        {visibleSkus.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-[#e3e3e3]">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                        <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 w-40">Variant</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-28">Price (VND)</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-22">Stock</th>
                                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600">Image</th>
                                            <th className="px-2 py-2.5 w-28"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e3e3e3]">
                                        {visibleSkus.map(sku => {
                                            const edit = skuEdits[sku.id] || { price: sku.price ?? '', stock: sku.stock ?? '0', imgUrl: sku.imgUrl || '' };
                                            const attrs = parseAttr(sku.attributes);
                                            const label = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('\n') || '(Default)';
                                            const isModified = modifiedSkuIds.has(sku.id);
                                            
                                            return (
                                                <tr key={sku.id} className={`hover:bg-[#fafafa] ${isModified ? 'bg-amber-50/30' : ''}`}>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-slate-600 break-all whitespace-pre-line">{label}</span>
                                                            {/*  Dot indicator cho unsaved changes */}
                                                            {isModified && (
                                                                <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input type="number" min="0" value={edit.price}
                                                            onChange={e => updateSkuEdit(sku.id, 'price', e.target.value)}
                                                            className="min-h-10 w-full rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-sm outline-none transition-colors focus:border-black" />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input type="number" min="0" value={edit.stock}
                                                            onChange={e => updateSkuEdit(sku.id, 'stock', e.target.value)} 
                                                            className="min-h-10 w-full rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-sm outline-none transition-colors focus:border-black" />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <ImageUploadPreview 
                                                            value={edit.imgUrl}
                                                            onChange={(val) => updateSkuEdit(sku.id, 'imgUrl', val)} 
                                                            multiple={false}
                                                            maxFiles={1}
                                                            label="Upload"
                                                            placeholder="https://..."
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            {/*  Nút Save từng row */}
                                                            <button type="button" onClick={() => handleSaveSku(sku.id)} disabled={savingSkuId === sku.id}
                                                                className="flex min-h-8 items-center gap-1 rounded-lg bg-black px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                                                                {savingSkuId === sku.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                                                Save
                                                            </button>
                                                            {/*  Nút Discard từng row - MỚI THÊM */}
                                                            {isModified && (
                                                                <button type="button" onClick={() => discardSkuChanges(sku.id)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-amber-200 hover:bg-amber-50 text-amber-600 transition-colors"
                                                                    title="Discard changes">
                                                                    <Undo2 className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            {/* Nút Delete */}
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
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {attrKeys.map(k => (
                                            <div key={k}>
                                                <label className="text-xs font-medium text-slate-600 mb-1 block capitalize">{k}</label>
                                                <select
                                                    value={newSku[k] || ''}
                                                    onChange={e => { setNewSku(prev => ({ ...prev, [k]: e.target.value })); setAddError(''); }}
                                                    className="min-h-10 w-full rounded-lg border border-[#e3e3e3] bg-white px-2 py-1.5 text-sm outline-none transition-colors focus:border-black"
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

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Price (VND) *</label>
                                        <input type="number" min="0" value={newSku.price}
                                            onChange={e => setNewSku(p => ({ ...p, price: e.target.value }))}
                                            className="min-h-10 w-full rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-sm outline-none transition-colors focus:border-black" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Stock *</label>
                                        <input type="number" min="0" value={newSku.stock}
                                            onChange={e => setNewSku(p => ({ ...p, stock: e.target.value }))}
                                            className="min-h-10 w-full rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-sm outline-none transition-colors focus:border-black" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600 mb-1 block">Image</label>
                                        <ImageUploadPreview 
                                            value={newSku.imgUrl}
                                            onChange={(val) => setNewSku(p => ({ ...p, imgUrl: val }))}
                                            multiple={false}
                                            maxFiles={1}
                                            label="Upload"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                    <button type="button" onClick={() => { setShowAddSku(false); setNewSku(buildNewSku()); setAddError(''); }}
                                        className="min-h-10 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-[#f8f8f8]">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={handleAddSku} disabled={addingSkuLoading}
                                        className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                                        {addingSkuLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        Add Variant
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-4 py-4 sm:px-6">
                        <button type="button" onClick={onClose}
                            className="min-h-11 w-full rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8] sm:w-auto">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
