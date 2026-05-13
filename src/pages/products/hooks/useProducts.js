import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../entities/auth/AuthContext';
import {
    getProducts, createProduct, updateProduct, deleteProduct,
    createSku, updateSku, deleteSku,
} from '../../../share/api/productApi';
import { getCategories } from '../../../share/api/categoryApi';
import { queryKeys } from '../../../share/api/queryKeys';

const DEFAULT_PAGE_SIZE = 10;

export function useProducts() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    // ── Pagination / filter state ──────────────────────────────────────────
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [expandedIds, setExpandedIds] = useState(new Set());

    // ── Modal state ────────────────────────────────────────────────────────
    const [modal, setModal] = useState(null);          // null | 'add' | product-object
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Queries ────────────────────────────────────────────────────────────
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

    // ── Derived data ────────────────────────────────────────────────────────
    const products = productsQuery.data?.items || productsQuery.data?.data || productsQuery.data || [];
    const total = productsQuery.data?.total || productsQuery.data?.totalCount || 0;
    const isLastPage = Array.isArray(products) && products.length < pageSize;
    const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : null;
    const categories = categoriesQuery.data?.items || categoriesQuery.data?.data || categoriesQuery.data || [];

    // ── Handlers ────────────────────────────────────────────────────────────

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all(tenantId) });
    };

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

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteProduct(tenantId, deleteTarget.id || deleteTarget.productId);
            invalidate();
            setDeleteTarget(null);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete product.';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        tenantId,
        // data
        products,
        total,
        isLastPage,
        totalPages,
        categories,
        // query states
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
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
    };
}

// ─── useAddProduct ───────────────────────────────────────────────────────────

export function useAddProduct(tenantId, onSuccess, onClose) {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const submit = async (payload) => {
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

    return { isLoading, serverError, submit };
}

// ─── useEditProduct ──────────────────────────────────────────────────────────

export function useEditProduct(tenantId, productId, onSuccess) {
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [productError, setProductError] = useState('');
    const [savingSkuId, setSavingSkuId] = useState(null);
    const [deletingSkuId, setDeletingSkuId] = useState(null);
    const [addingSkuLoading, setAddingSkuLoading] = useState(false);

    const saveProduct = async (data) => {
        try {
            setIsSavingProduct(true);
            setProductError('');
            await updateProduct(tenantId, productId, data);
            onSuccess();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to update product.';
            setProductError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsSavingProduct(false);
        }
    };

    const saveSku = async (skuId, data) => {
        try {
            setSavingSkuId(skuId);
            await updateSku(tenantId, productId, skuId, data);
            onSuccess();
        } catch {
            alert('Failed to update variant.');
        } finally {
            setSavingSkuId(null);
        }
    };

    const deleteSku_ = async (skuId, onDeleted) => {
        if (!confirm('Delete this variant? This cannot be undone.')) return;
        try {
            setDeletingSkuId(skuId);
            await deleteSku(tenantId, productId, skuId);
            onDeleted(skuId);
            onSuccess();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to delete variant.';
            alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setDeletingSkuId(null);
        }
    };

    const addSku = async (payload, onAdded) => {
        try {
            setAddingSkuLoading(true);
            const created = await createSku(tenantId, productId, payload);
            onAdded(created);
            onSuccess();
        } catch {
            alert('Failed to add variant.');
        } finally {
            setAddingSkuLoading(false);
        }
    };

    return {
        isSavingProduct, productError,
        savingSkuId, deletingSkuId, addingSkuLoading,
        saveProduct, saveSku, deleteSku: deleteSku_, addSku,
    };
}
