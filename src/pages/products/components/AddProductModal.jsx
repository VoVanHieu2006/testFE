import { useState, useCallback } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { computeSkuRows, skuLabel } from '../utils/productHelpers';
import { useAddProduct } from '../hooks/useProducts';
import { ImageUploadPreview } from '../components/ImageUploadPreview';


const MAX_ATTR_GROUPS = 2;
const MAX_ATTR_VALUES = 5;

// ─── BulkPriceRow — set price/image for ALL variants at once ────────────────

function BulkApplyBar({ onApply }) {
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkImg, setBulkImg] = useState('');

    const applyPrice = () => {
        if (bulkPrice === '' || isNaN(Number(bulkPrice))) return;
        onApply('price', bulkPrice);
    };
    const applyImg = () => {
        onApply('imgUrl', bulkImg);
    };

    return (
        <div className="bg-slate-50 border border-[#e3e3e3] rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply to all variants</p>
            <div className="flex flex-wrap gap-3">
                {/* Bulk price */}
                <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                    <input
                        type="number" min="0"
                        value={bulkPrice}
                        onChange={e => setBulkPrice(e.target.value)}
                        placeholder="Price for all (VND)"
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                    />
                    <button
                        type="button"
                        onClick={applyPrice}
                        disabled={bulkPrice === ''}
                        className="min-h-11 whitespace-nowrap rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
                    >
                        Set price
                    </button>
                </div>
                {/* Bulk image */}
                <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                    <ImageUploadPreview 
                        value={bulkImg}
                        onChange={setBulkImg}
                        multiple={false}
                        maxFiles={1}
                        label="Upload"
                        placeholder="Image URL for all"
                        className="flex-1"
                    />
                    <button
                        type="button"
                        onClick={applyImg}
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

// ─── GroupApplyBar — set price/image per attribute group value ───────────────
// e.g. "Set price for all Color: Red variants"

function GroupApplyBar({ attrGroups, onApplyGroup }) {
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const [groupPrice, setGroupPrice] = useState('');
    const [groupImg, setGroupImg] = useState('');

    const activeGroups = attrGroups.filter(g => g.key.trim() && g.values.length > 0);
    if (activeGroups.length === 0) return null;

    const currentGroup = activeGroups.find(g => g.key === selectedGroup);

    const handleGroupChange = (key) => {
        setSelectedGroup(key);
        setSelectedValue('');
        setGroupPrice('');
        setGroupImg('');
    };

    const applyGroupPrice = () => {
        if (!selectedGroup || !selectedValue || groupPrice === '' || isNaN(Number(groupPrice))) return;
        onApplyGroup(selectedGroup, selectedValue, 'price', groupPrice);
    };
    const applyGroupImg = () => {
        if (!selectedGroup || !selectedValue || !groupImg.trim()) return;
        onApplyGroup(selectedGroup, selectedValue, 'imgUrl', groupImg);
    };

    return (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Apply by attribute group</p>

            {/* Group + Value selectors */}
            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={selectedGroup}
                    onChange={e => handleGroupChange(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black sm:w-auto"
                >
                    <option value="">Select attribute...</option>
                    {activeGroups.map(g => (
                        <option key={g.key} value={g.key}>{g.key}</option>
                    ))}
                </select>
                {currentGroup && (
                    <select
                        value={selectedValue}
                        onChange={e => setSelectedValue(e.target.value)}
                        className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black sm:w-auto"
                    >
                        <option value="">Select value...</option>
                        {currentGroup.values.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Price + Image inputs for group */}
            {selectedValue && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[240px] sm:max-w-[320px]">
                        <input
                            type="number" min="0"
                            value={groupPrice}
                            onChange={e => setGroupPrice(e.target.value)}
                            placeholder={`Price for all ${selectedGroup}: ${selectedValue}`}
                            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                        />
                        <button
                            type="button"
                            onClick={applyGroupPrice}
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
                            onClick={applyGroupImg}
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

// ─── Main AddProductModal ─────────────────────────────────────────────────────

export function AddProductModal({ tenantId, categories, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [imgUrlsText, setImgUrlsText] = useState('');
    const [attrGroups, setAttrGroups] = useState([]);
    const [newAttrKey, setNewAttrKey] = useState('');
    const [skuRows, setSkuRows] = useState([{ combination: {}, price: '', stock: '0', imgUrl: '' }]);
    const [errors, setErrors] = useState({});

    const { isLoading, serverError, submit } = useAddProduct(tenantId, onSuccess, onClose);

    const recompute = useCallback((groups) => {
        setSkuRows(prev => computeSkuRows(groups, prev));
    }, []);

    // ── Attribute group management ───────────────────────────────────────────

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

    // ── SKU row helpers ──────────────────────────────────────────────────────

    const updateSkuRow = (idx, field, value) => {
        setSkuRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    // Apply a field to ALL rows (bulk)
    const bulkApply = (field, value) => {
        setSkuRows(prev => prev.map(r => ({ ...r, [field]: value })));
    };

    // Apply a field to rows matching a group key/value
    const groupApply = (groupKey, groupVal, field, value) => {
        setSkuRows(prev => prev.map(r =>
            r.combination[groupKey] === groupVal ? { ...r, [field]: value } : r
        ));
    };

    // ── Validation ───────────────────────────────────────────────────────────

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

        let attributesObj = undefined;
        const activeGroups = attrGroups.filter(g => g.key && g.values.length);
        if (activeGroups.length) {
            attributesObj = {};
            activeGroups.forEach(g => { attributesObj[g.key] = g.values; });
        }

        const payload = {
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            attributes: attributesObj,
            imgUrls: imgUrlsText.split('\n').map(u => u.trim()).filter(Boolean),
            skus: skuRows.map(r => ({
                price: Number(r.price),
                stock: Number(r.stock),
                attributes: Object.keys(r.combination).length ? r.combination : undefined,
                imgUrl: r.imgUrl.trim() || '',
            })),
        };

        await submit(payload);
    };

    const hasMultipleAttrs = attrGroups.some(g => g.values.length > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e3] bg-white px-4 py-4 sm:px-6">
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
                    <div className="space-y-4 p-4 sm:p-6">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">1</span>
                            Basic Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                            <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                                placeholder="e.g. Classic T-Shirt"
                                className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                                placeholder="Product description..."
                                className="w-full resize-none rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setErrors(p => ({ ...p, categoryId: '' })); }}
                                    className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors ${errors.categoryId ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`}>
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
                                        placeholder="https://cdn.example.com/image1.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Attributes ── */}
                    <div className="space-y-4 p-4 sm:p-6">
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
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input value={newAttrKey}
                                    onChange={e => setNewAttrKey(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttrGroup(); } }}
                                    placeholder='Attribute name (e.g. Color, Size, Style...)'
                                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-black" />
                                <button type="button" onClick={addAttrGroup} disabled={!newAttrKey.trim()}
                                    className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40 sm:w-auto">
                                    <Plus className="w-4 h-4" /> Add Attribute
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Maximum {MAX_ATTR_GROUPS} attribute groups reached.</p>
                        )}
                    </div>

                    {/* ── Section 3: Variants & Pricing ── */}
                    <div className="space-y-4 p-4 sm:p-6">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">3</span>
                            Variants &amp; Pricing
                            <span className="text-xs font-normal text-slate-400">({skuRows.length} variant{skuRows.length !== 1 ? 's' : ''})</span>
                        </h3>

                        {/* ── Bulk apply (all variants) ── */}
                        {skuRows.length > 1 && (
                            <BulkApplyBar onApply={bulkApply} />
                        )}

                        {/* ── Group apply (by attribute value) ── */}
                        {skuRows.length > 1 && hasMultipleAttrs && (
                            <GroupApplyBar
                                attrGroups={attrGroups}
                                onApplyGroup={groupApply}
                            />
                        )}

                        {errors.skus && <p className="text-red-500 text-xs">{errors.skus}</p>}

                        {/* ── Per-variant table ── */}
                        <div className="overflow-x-auto rounded-xl border border-[#e3e3e3]">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-600 w-36">Variant</th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-32"> Price (VND) <span className="text-red-500">*</span></th>
                                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 w-24">Stock <span className="text-red-500">*</span></th>
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
                                                <ImageUploadPreview 
                                                    value={row.imgUrl}
                                                    onChange={(val) => updateSkuRow(idx, 'imgUrl', val)}
                                                    multiple={false}
                                                    maxFiles={1}
                                                    label="Upload"
                                                    placeholder="https://..."
                                                    className="min-w-[200px]"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom buttons */}
                    <div className="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:px-6">
                        <button type="button" onClick={onClose}
                            className="min-h-11 flex-1 rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8]">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
