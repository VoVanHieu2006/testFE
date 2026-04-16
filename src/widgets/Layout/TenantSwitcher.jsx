import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Check } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';

export default function TenantSwitcher() {
    const { user, currentTenant, switchTenant } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tenants = user?.tenants || [];
    const displayName = currentTenant?.storeName || currentTenant?.subdomain || 'Select Store';

    const handleSwitch = (tenantId) => {
        switchTenant(tenantId);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e3e3e3] bg-white hover:bg-[#f8f8f8] transition-colors text-sm font-medium text-slate-800 max-w-[200px]"
            >
                <Store className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{displayName}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e3e3e3] z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#e3e3e3]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Stores</p>
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto">
                        {tenants.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-slate-500">No stores found</p>
                        ) : (
                            tenants.map((tenant) => (
                                <button
                                    key={tenant.tenantId}
                                    onClick={() => handleSwitch(tenant.tenantId)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-[#f8f8f8] transition-colors"
                                >
                                    <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                                            {(tenant.storeName || tenant.subdomain || '?').charAt(0)}
                                        </span>
                                    </div>
                                    <span className="flex-1 text-left truncate">
                                        {tenant.storeName || tenant.subdomain}
                                    </span>
                                    {currentTenant?.tenantId === tenant.tenantId && (
                                        <Check className="w-4 h-4 text-black shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
