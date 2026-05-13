import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Users, Search, Loader2, AlertCircle, X,
    SlidersHorizontal, ChevronLeft, ChevronRight,
    ShoppingBag, DollarSign, Calendar, CheckCircle2, XCircle,
} from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getCustomers } from '../../share/api/customerApi';
import { queryKeys } from '../../share/api/queryKeys';

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Joined date' },
    { value: 'email', label: 'Email' },
];

const fmt = (val) => val != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    : '—';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const emailName = (email) => email ? email.split('@')[0] : '—';

function deriveStats(customer) {
    const orders = Array.isArray(customer.orders) ? customer.orders : [];
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const lastOrder = orders.length > 0
        ? orders.reduce((latest, o) =>
            new Date(o.createdAt) > new Date(latest.createdAt) ? o : latest
        )
        : null;
    return { totalOrders, totalSpent, lastOrder };
}

function CustomerDetailModal({ customer, onClose }) {
    const { totalOrders, totalSpent } = deriveStats(customer);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e3] bg-white px-4 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-black">Customer Details</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-6 p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                            {emailName(customer.email)[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">{emailName(customer.email)}</p>
                            <p className="text-sm text-slate-500">{customer.email}</p>
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${customer.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {customer.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {customer.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="bg-[#f8f8f8] rounded-xl p-3">
                            <p className="text-xs text-slate-500">Total Orders</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{totalOrders}</p>
                        </div>
                        <div className="bg-[#f8f8f8] rounded-xl p-3">
                            <p className="text-xs text-slate-500">Total Spent</p>
                            <p className="text-lg font-bold text-slate-900 mt-1">{fmt(totalSpent)}</p>
                        </div>
                        <div className="bg-[#f8f8f8] rounded-xl p-3">
                            <p className="text-xs text-slate-500">Joined</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">{fmtDate(customer.createdAt)}</p>
                        </div>
                    </div>

                    {/* Orders list */}
                    {customer.orders && customer.orders.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Orders</p>
                            <div className="overflow-x-auto rounded-lg border border-[#e3e3e3]">
                                <table className="w-full min-w-[560px] text-sm">
                                    <thead>
                                        <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Order ID</th>
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Date</th>
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Status</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e3e3e3]">
                                        {customer.orders.map((o) => (
                                            <tr key={o.id}>
                                                <td className="px-3 py-2 font-mono text-xs text-slate-500">#{String(o.id).slice(-8).toUpperCase()}</td>
                                                <td className="px-3 py-2 text-slate-500 text-xs">{fmtDate(o.createdAt)}</td>
                                                <td className="px-3 py-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt(o.totalAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Cart info */}
                    {customer.cart && Array.isArray(customer.cart.cartItems) && (
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cart</p>
                            <p className="text-sm text-slate-700">
                                {customer.cart.cartItems.length} item{customer.cart.cartItems.length !== 1 ? 's' : ''} in cart
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Customers() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    const params = useMemo(() => ({
        search: search || undefined,
        isActive: isActiveFilter !== '' ? isActiveFilter === 'true' : undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        sortBy: sortBy || undefined,
    }), [search, isActiveFilter, createdFrom, createdTo, sortBy]);

    const customersQuery = useQuery({
        queryKey: queryKeys.customers.list(tenantId, params),
        queryFn: () => getCustomers(tenantId, params),
        enabled: !!tenantId,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleReset = () => {
        setSearchInput(''); setSearch('');
        setIsActiveFilter('');
        setCreatedFrom(''); setCreatedTo('');
        setSortBy('createdAt');
        setPage(1);
    };

    const allCustomers = useMemo(() => {
        
        const data = customersQuery.data;
        console.log(customersQuery.data);
        return Array.isArray(data) ? data : (data?.items || data?.data || []);
    }, [customersQuery.data]);

    const pagedCustomers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return allCustomers.slice(start, start + PAGE_SIZE);
    }, [allCustomers, page]);

    const totalPages = Math.max(1, Math.ceil(allCustomers.length / PAGE_SIZE));

    if (!tenantId) {
        return (
            <div className="flex items-center gap-3 p-4 text-slate-500 sm:p-8">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view customers.</span>
            </div>
        );
    }

    return (
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Customers</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and analyse your customer base</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>{allCustomers.length} customer{allCustomers.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-3 rounded-xl border border-[#e3e3e3] bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={handleSearch} className="flex min-h-11 w-full min-w-0 flex-1 items-center gap-2 rounded-lg border border-transparent bg-[#f8f8f8] px-3 py-2 focus-within:border-[#e3e3e3] sm:min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                        {searchInput && (
                            <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        )}
                    </form>
                    <select
                        value={isActiveFilter}
                        onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
                        className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-black sm:w-auto"
                    >
                        <option value="">All Statuses</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:w-auto ${showAdvanced ? 'border-slate-900 bg-slate-900 text-white' : 'border-[#e3e3e3] text-slate-600 hover:bg-[#f8f8f8]'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {showAdvanced && (
                    <div className="grid gap-3 border-t border-[#f0f0f0] pt-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Joined from</label>
                            <input type="date" value={createdFrom} onChange={(e) => { setCreatedFrom(e.target.value); setPage(1); }}
                                className="min-h-11 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none focus:border-black" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Joined to</label>
                            <input type="date" value={createdTo} onChange={(e) => { setCreatedTo(e.target.value); setPage(1); }}
                                className="min-h-11 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm outline-none focus:border-black" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1 lg:min-w-[140px]">
                            <label className="text-xs font-medium text-slate-500">Sort by</label>
                            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                className="min-h-11 rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-black">
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={handleReset}
                            className="min-h-11 rounded-lg border border-[#e3e3e3] px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f8f8f8]">
                            Reset all
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-sm">
                {customersQuery.isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading customers...</span>
                    </div>
                ) : customersQuery.isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load customers. Please try again.</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Customer</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">
                                            <span className="flex items-center justify-end gap-1"><ShoppingBag className="w-3.5 h-3.5" /> Orders</span>
                                        </th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">
                                            <span className="flex items-center justify-end gap-1"><DollarSign className="w-3.5 h-3.5" /> Total Spent</span>
                                        </th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Last Order</span>
                                        </th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Joined</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {pagedCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-slate-400">No customers found.</td>
                                        </tr>
                                    ) : (
                                        pagedCustomers.map((c) => {
                                            const { totalOrders, totalSpent, lastOrder } = deriveStats(c);
                                            return (
                                                <tr key={c.id} className="hover:bg-[#f8f8f8] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                                                                {emailName(c.email)[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{emailName(c.email)}</p>
                                                                <p className="text-xs text-slate-400">{c.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                            {c.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                            {c.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{totalOrders}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">{fmt(totalSpent)}</td>
                                                    <td className="px-4 py-3 text-slate-500 text-sm">
                                                        {lastOrder ? fmtDate(lastOrder.createdAt) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-sm">{fmtDate(c.createdAt)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => setSelectedCustomer(c)}
                                                            className="px-3 py-1.5 rounded-lg border border-[#e3e3e3] text-xs font-medium text-slate-600 hover:bg-[#f8f8f8] transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {allCustomers.length > PAGE_SIZE && (
                            <div className="flex flex-col gap-3 border-t border-[#e3e3e3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allCustomers.length)} of {allCustomers.length}
                                </span>
                                <div className="flex items-center justify-between gap-1 sm:justify-end">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedCustomer && (
                <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
            )}
        </div>
    );
}
