import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createTenant } from '../../share/api/tenantApi';
import { useAuth } from '../../entities/auth/AuthContext';

const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,50}$/;

export default function CreateStoreModal({ onClose }) {
    const { addTenant } = useAuth();
    const [form, setForm] = useState({ subdomain: '', storeName: '', isActive: true });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validate = () => {
        const errs = {};
        if (!SUBDOMAIN_REGEX.test(form.subdomain)) {
            errs.subdomain = 'Subdomain must be 3–50 characters, only lowercase letters, numbers, and hyphens.';
        }
        if (!form.storeName || form.storeName.trim().length < 3 || form.storeName.trim().length > 100) {
            errs.storeName = 'Store name must be 3–100 characters.';
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
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            setIsLoading(true);
            const newTenant = await createTenant({
                subdomain: form.subdomain.trim(),
                storeName: form.storeName.trim(),
                isActive: form.isActive,
            });
            addTenant(newTenant);
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to create store. Please try again.';
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3]">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-black" />
                        <h2 className="text-base font-semibold text-black">Create New Store</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] transition-colors">
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                            {serverError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Subdomain <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="subdomain"
                            value={form.subdomain}
                            onChange={handleChange}
                            placeholder="my-store"
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                                errors.subdomain
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-[#e3e3e3] focus:border-black'
                            }`}
                        />
                        {errors.subdomain && (
                            <p className="text-red-500 text-xs mt-1">{errors.subdomain}</p>
                        )}
                        <p className="text-slate-400 text-xs mt-1">3–50 characters, lowercase letters, numbers, hyphens only.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Store Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="storeName"
                            value={form.storeName}
                            onChange={handleChange}
                            placeholder="My Awesome Store"
                            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                                errors.storeName
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-[#e3e3e3] focus:border-black'
                            }`}
                        />
                        {errors.storeName && (
                            <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 accent-black"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                            Active store
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Creating...' : 'Create Store'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
