import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../share/api/categoryApi';
import { queryKeys } from '../../share/api/queryKeys';

function CategoryModal({ tenantId, category, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: category?.name || '',
        description: category?.description || '',
        isActive: category?.isActive ?? true,
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim() || form.name.trim().length < 3 || form.name.trim().length > 100) {
            errs.name = 'Name must be 3–100 characters.';
        }
        return errs;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setIsLoading(true);
            if (category) {
                await updateCategory(tenantId, category.categoryId || category.id, { name: form.name.trim(), description: form.description.trim(), isActive: form.isActive });
            } else {
                await createCategory(tenantId, { name: form.name.trim(), description: form.description.trim(), isActive: form.isActive });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#e3e3e3] px-4 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-black">{category ? 'Edit Category' : 'Add Category'}</h2>
                    <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#f1f2f4]">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverError}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input
                            name="name" value={form.name} onChange={handleChange}
                            placeholder="Category name"
                            className={`min-h-11 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange}
                            placeholder="Optional description"
                            rows={3}
                            className="w-full resize-none rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none transition-colors focus:border-black"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} className="h-5 w-5 accent-black" />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                        <button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8]">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Saving...' : (category ? 'Save Changes' : 'Add Category')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ name, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Delete Category</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button onClick={onCancel} className="min-h-11 flex-1 rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8]">Cancel</button>
                    <button onClick={onConfirm} disabled={isLoading} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Categories() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.categories.list(tenantId),
        queryFn: () => getCategories(tenantId),
        enabled: !!tenantId,
    });

    const categories = data?.items || data?.data || data || [];

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteCategory(tenantId, deleteTarget.categoryId || deleteTarget.id);
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.list(tenantId) });
            setDeleteTarget(null);
        } catch {
            alert('Failed to delete category.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.list(tenantId) });
    };

    if (!tenantId) {
        return (
            <div className="flex items-center gap-3 p-4 text-slate-500 sm:p-8">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view categories.</span>
            </div>
        );
    }

    return (
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Categories</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Organize your products by category</p>
                </div>
                <button
                    onClick={() => { setEditCategory(null); setIsModalOpen(true); }}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading categories...</span>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load categories.</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e3]">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-16 text-slate-400">No categories yet. Create your first one!</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.categoryId || cat.id} className="hover:bg-[#f8f8f8] transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            {cat.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                                                    <XCircle className="w-3 h-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditCategory(cat); setIsModalOpen(true); }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(cat)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CategoryModal
                    tenantId={tenantId}
                    category={editCategory}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {deleteTarget && (
                <DeleteConfirm
                    name={deleteTarget.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
}
