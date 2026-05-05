import { Loader2, Trash2 } from 'lucide-react';

export function DeleteProductConfirm({ name, onConfirm, onCancel, isLoading }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
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
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}