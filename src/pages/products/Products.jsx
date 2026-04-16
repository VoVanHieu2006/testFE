import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight, Package, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getProducts } from '../../share/api/productApi';
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

export default function Products() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

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
                    <p className="text-sm text-slate-500 mt-0.5">Manage your store's products</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-slate-400">
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
        </div>
    );
}
