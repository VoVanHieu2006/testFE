import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight, Package, Loader2, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../share/api/productApi';
import { getCategories } from '../../share/api/categoryApi';
import { queryKeys } from '../../share/api/queryKeys';

const DEFAULT_PAGE_SIZE = 10;

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
        <img
            src={src}
            alt="product"
            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#e3e3e3]"
            onError={(e) => { e.target.style.display = 'none'; }}
        />
    );
}

function ProductModal({ tenantId, product, categories, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price ?? '',
        categoryId: product?.categoryId || product?.category?.categoryId || '',
        imgUrls: product?.imgUrls ? product.imgUrls.join('\n') : '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
        if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Valid price is required.';
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const imgUrls = form.imgUrls.split('\n').map(u => u.trim()).filter(Boolean);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: Number(form.price),
            categoryId: form.categoryId || undefined,
            imgUrls,
        };
        try {
            setIsLoading(true);
            if (product) {
                await updateProduct(tenantId, product.productId || product.id, payload);
            } else {
                await createProduct(tenantId, payload);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-black">{product ? 'Edit Product' : 'Add Product'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverError}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Classic T-Shirt"
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange}
                            placeholder="Product description..." rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price (VND) <span className="text-red-500">*</span></label>
                            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0"
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.price ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none bg-white transition-colors">
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image URLs <span className="text-slate-400 font-normal">(one per line)</span></label>
                        <textarea name="imgUrls" value={form.imgUrls} onChange={handleChange}
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-none font-mono transition-colors" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Saving...' : (product ? 'Save Changes' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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
                        <p className="text-sm text-slate-500 mt-0.5">Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">Cancel</button>
                    <button onClick={onConfirm} disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Products() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [productModal, setProductModal] = useState(null); // null | 'add' | product object
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const productsQuery = useQuery({
        queryKey: queryKeys.products.list(tenantId, { page, pageSize: DEFAULT_PAGE_SIZE, search, categoryId, sortBy, sortDir }),
        queryFn: () => getProducts(tenantId, { page, pageSize: DEFAULT_PAGE_SIZE, search: search || undefined, categoryId: categoryId || undefined, sortBy, sortDir }),
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
    };

    const handleCategoryChange = (e) => {
        setCategoryId(e.target.value);
        setPage(1);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(tenantId) });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteProduct(tenantId, deleteTarget.productId || deleteTarget.id);
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all(tenantId) });
            setDeleteTarget(null);
        } catch {
            alert('Failed to delete product.');
        } finally {
            setIsDeleting(false);
        }
    };

    const products = productsQuery.data?.items || productsQuery.data?.data || productsQuery.data || [];
    const total = productsQuery.data?.total || productsQuery.data?.totalCount || 0;
    const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));
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
                    <p className="text-sm text-slate-500 mt-0.5">Manage your store&apos;s products</p>
                </div>
                <button
                    onClick={() => setProductModal('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </form>

                <select
                    value={categoryId}
                    onChange={handleCategoryChange}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={`${sortBy}-${sortDir}`}
                    onChange={(e) => {
                        const [sb, sd] = e.target.value.split('-');
                        setSortBy(sb);
                        setSortDir(sd);
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                >
                    <option value="createdAt-desc">Newest first</option>
                    <option value="createdAt-asc">Oldest first</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
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
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">SKU</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Price</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Stock</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-slate-400">
                                                No products found.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => {
                                            const totalStock = Array.isArray(product.skus)
                                                ? product.skus.reduce((sum, sku) => sum + (sku.stock ?? 0), 0)
                                                : (product.stock ?? '—');
                                            return (
                                                <tr key={product.productId || product.id} className="hover:bg-[#f8f8f8] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <ProductImage imgUrls={product.imgUrls} />
                                                            <div>
                                                                <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                                                                {product.description && (
                                                                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                                                        {product.sku || (Array.isArray(product.skus) && product.skus.length > 0 ? `${product.skus.length} variant(s)` : '—')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {product.categoryName || product.category?.name ? (
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                                {product.categoryName || product.category?.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                        {product.price != null
                                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`font-medium ${typeof totalStock === 'number' && totalStock === 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                                            {totalStock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setProductModal(product)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget(product)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {total > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3e3e3]">
                                <span className="text-sm text-slate-500">
                                    Showing {(page - 1) * DEFAULT_PAGE_SIZE + 1}–{Math.min(page * DEFAULT_PAGE_SIZE, total)} of {total} products
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 text-sm font-medium text-slate-700">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Product Add/Edit Modal */}
            {productModal && (
                <ProductModal
                    tenantId={tenantId}
                    product={productModal === 'add' ? null : productModal}
                    categories={categories}
                    onClose={() => setProductModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Delete Confirmation */}
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
