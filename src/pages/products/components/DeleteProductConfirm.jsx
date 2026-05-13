import { Loader2, Trash2 } from 'lucide-react';

export function DeleteProductConfirm({ name, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Delete Product</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button onClick={onCancel}
                        className="min-h-11 flex-1 rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f8f8]">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading}
                        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
