import { Plus, AlertCircle } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { ProductFilters } from './components/ProductFilters';
import { ProductTable } from './components/ProductTable';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { DeleteProductConfirm } from './components/DeleteProductConfirm';

export default function Products() {
    const {
        tenantId,
        // data
        products, total, isLastPage, totalPages, categories,
        isLoading, isError,
        // filter state
        page, pageSize, search, searchInput, categoryId, sortBy, sortDir, expandedIds,
        // filter setters
        setSearchInput, setCategoryId, setSortBy, setSortDir,
        // handlers
        handleSearch, handlePageSizeChange, handlePageChange, toggleExpand,
        invalidate,
        // modal state
        modal, setModal,
        deleteTarget, setDeleteTarget,
        isDeleting, handleDeleteConfirm,
    } = useProducts();

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
                <button
                    onClick={() => setModal('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* Filters */}
            <ProductFilters
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                sortBy={sortBy}
                sortDir={sortDir}
                setSortBy={setSortBy}
                setSortDir={setSortDir}
                setPage={handlePageChange}
                pageSize={pageSize}
                handlePageSizeChange={handlePageSizeChange}
                categories={categories}
            />

            {/* Table */}
            <ProductTable
                products={products}
                categories={categories}
                isLoading={isLoading}
                isError={isError}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                page={page}
                pageSize={pageSize}
                total={total}
                isLastPage={isLastPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                onEdit={(product) => setModal(product)}
                onDelete={(product) => setDeleteTarget(product)}
            />

            {/* Modals */}
            {modal === 'add' && (
                <AddProductModal
                    tenantId={tenantId}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSuccess={invalidate}
                />
            )}
            {modal && modal !== 'add' && (
                <EditProductModal
                    tenantId={tenantId}
                    product={modal}
                    categories={categories}
                    onClose={() => setModal(null)}
                    onSuccess={invalidate}
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