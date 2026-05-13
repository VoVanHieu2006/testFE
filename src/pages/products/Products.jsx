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
        page, pageSize, searchInput, categoryId, sortBy, sortDir, expandedIds,
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
            <div className="flex items-center gap-3 p-4 text-slate-500 sm:p-8">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view products.</span>
            </div>
        );
    }

    return (
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Products</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your store&apos;s products and variants</p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
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
