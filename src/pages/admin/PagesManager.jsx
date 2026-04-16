import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Pencil, Trash2, Loader2, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getPages, createPage, updatePage, deletePage } from '../../share/api/storeApi';
import { queryKeys } from '../../share/api/queryKeys';

function PageModal({ tenantId, page, onClose, onSuccess }) {
    const [form, setForm] = useState({
        title: page?.title || '',
        slug: page?.slug || '',
        content: page?.content || '',
        isPublished: page?.isPublished ?? true,
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.title.trim() || form.title.trim().length < 2) errs.title = 'Title must be at least 2 characters.';
        if (!form.slug.trim()) {
            errs.slug = 'Slug is required.';
        } else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
            errs.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.';
        }
        return errs;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setServerError('');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const autoSlug = !page
            ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : form.slug;
        setForm((prev) => ({ ...prev, title, slug: autoSlug }));
        setErrors((prev) => ({ ...prev, title: '', slug: '' }));
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const payload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            content: form.content,
            isPublished: form.isPublished,
        };
        try {
            setIsLoading(true);
            if (page) {
                await updatePage(tenantId, page.pageId || page.id, payload);
            } else {
                await createPage(tenantId, payload);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-black">{page ? 'Edit Page' : 'Create Page'}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{serverError}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Page Title <span className="text-red-500">*</span></label>
                        <input name="title" value={form.title} onChange={handleTitleChange} placeholder="e.g. About Us"
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errors.title ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Slug <span className="text-red-500">*</span>
                            <span className="text-slate-400 font-normal ml-1">(URL path)</span>
                        </label>
                        <div className="flex items-center">
                            <span className="px-3 py-2 text-sm text-slate-400 bg-slate-50 border border-r-0 border-[#e3e3e3] rounded-l-lg">/</span>
                            <input name="slug" value={form.slug} onChange={handleChange} placeholder="about-us"
                                className={`flex-1 px-3 py-2 rounded-r-lg border text-sm outline-none transition-colors ${errors.slug ? 'border-red-400' : 'border-[#e3e3e3] focus:border-black'}`} />
                        </div>
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea name="content" value={form.content} onChange={handleChange} rows={10}
                            placeholder="Write your page content here... Supports plain text or HTML."
                            className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none resize-y font-mono transition-colors" />
                        <p className="text-slate-400 text-xs mt-1">Plain text or HTML markup is supported.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublished" name="isPublished" checked={form.isPublished} onChange={handleChange} className="w-4 h-4 accent-black" />
                        <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">Published (visible on storefront)</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Saving...' : (page ? 'Save Changes' : 'Create Page')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ name, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Delete Page</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Delete <strong>{name}</strong>? This cannot be undone.</p>
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

export default function PagesManager() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    const [pageModal, setPageModal] = useState(null); // null | 'add' | page object
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: queryKeys.pages.list(tenantId),
        queryFn: () => getPages(tenantId),
        enabled: !!tenantId,
    });

    const pages = data?.items || data?.data || data || [];

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.pages.list(tenantId) });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deletePage(tenantId, deleteTarget.pageId || deleteTarget.id);
            queryClient.invalidateQueries({ queryKey: queryKeys.pages.list(tenantId) });
            setDeleteTarget(null);
        } catch {
            alert('Failed to delete page.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to manage its pages.</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Pages Manager</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Create and manage your store&apos;s custom pages</p>
                </div>
                <button
                    onClick={() => setPageModal('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Page
                </button>
            </div>

            <div className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading pages...</span>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load pages.</span>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
                                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Updated</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e3]">
                            {pages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-400">No pages yet. Create your first page!</p>
                                    </td>
                                </tr>
                            ) : (
                                pages.map((p) => (
                                    <tr key={p.pageId || p.id} className="hover:bg-[#f8f8f8] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="font-medium text-slate-900">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">/{p.slug}</td>
                                        <td className="px-4 py-3 text-center">
                                            {p.isPublished ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                                                    <Eye className="w-3 h-3" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                                                    <EyeOff className="w-3 h-3" /> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">
                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setPageModal(p)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(p)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition-colors text-red-500"
                                                    title="Delete"
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
                )}
            </div>

            {pageModal && (
                <PageModal
                    tenantId={tenantId}
                    page={pageModal === 'add' ? null : pageModal}
                    onClose={() => setPageModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {deleteTarget && (
                <DeleteConfirm
                    name={deleteTarget.title}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
}
