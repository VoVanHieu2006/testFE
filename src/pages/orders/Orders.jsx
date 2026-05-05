import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, Search, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, Eye, X, SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getOrders, getOrderById, updateOrderStatus } from '../../share/api/orderApi';
import { getCustomers } from '../../share/api/customerApi';
import { queryKeys } from '../../share/api/queryKeys';

const DEFAULT_PAGE_SIZE = 10;

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const PAYMENT_METHODS = ['COD', 'BankTransfer', 'Credit Card', 'Momo', 'ZaloPay'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];
const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date (newest)' },
    { value: 'totalAmount', label: 'Total amount' },
    { value: 'status', label: 'Status' },
    { value: 'paymentStatus', label: 'Payment status' },
    { value: 'id', label: 'Order ID' },
];

const STATUS_STYLES = {
    Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    Confirmed:  'bg-cyan-50 text-cyan-700 border-cyan-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
    Shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
    Delivered:  'bg-green-50 text-green-700 border-green-200',
    Paid:       'bg-green-50 text-green-700 border-green-200',
    Cancelled:  'bg-red-50 text-red-700 border-red-200',
    Refunded:   'bg-slate-100 text-slate-600 border-slate-200',
    Failed:     'bg-orange-50 text-orange-700 border-orange-200',
};

const emailName = (email) => email ? email.split('@')[0] : null;

function StatusBadge({ status }) {
    const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
            {status || 'Unknown'}
        </span>
    );
}

function OrderDetailModal({ tenantId, orderId, customerMap, onClose }) {
    const queryClient = useQueryClient();
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [serverError, setServerError] = useState('');

    const { data: order, isLoading, isError } = useQuery({
        queryKey: queryKeys.orders.detail(tenantId, orderId),
        queryFn: () => getOrderById(tenantId, orderId),
        enabled: !!orderId,
    });

    const handleStatusUpdate = async () => {
        if (!selectedStatus || selectedStatus === order?.status) return;
        try {
            setUpdatingStatus(true);
            setServerError('');
            await updateOrderStatus(tenantId, orderId, selectedStatus);
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(tenantId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(tenantId, orderId) });
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to update status.';
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setUpdatingStatus(false);
        }
    };

    const fmt = (val) => val != null
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        : '—';
    const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';

    const customerEmail = order ? (customerMap[order.customerId] || null) : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e3e3] sticky top-0 bg-white z-10">
                    <h2 className="text-base font-semibold text-black">Order Details</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f1f2f4] text-slate-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            <span className="ml-2 text-slate-500 text-sm">Loading order...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex items-center gap-2 text-red-500 py-6">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Failed to load order details.</span>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Order ID</p>
                                    <p className="text-sm font-mono font-medium text-slate-900">{order.orderId || order.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Date</p>
                                    <p className="text-sm text-slate-900">{fmtDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Customer</p>
                                    {customerEmail ? (
                                        <>
                                            <p className="text-sm font-medium text-slate-900">{emailName(customerEmail)}</p>
                                            <p className="text-xs text-slate-400">{customerEmail}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm font-mono text-slate-500 text-xs">{order.customerId}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Total</p>
                                    <p className="text-sm font-semibold text-slate-900">{fmt(order.total || order.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Order Status</p>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Payment Method</p>
                                    <p className="text-sm text-slate-900">{order.paymentMethod || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Payment Status</p>
                                    <StatusBadge status={order.paymentStatus} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Address</p>
                                    <p className="text-sm text-slate-900">{order.address || order.shippingAddress || '—'}</p>
                                </div>
                            </div>

                            {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items</p>
                                    <div className="border border-[#e3e3e3] rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">SKU ID</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Qty</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Unit Price</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e3e3e3]">
                                                {order.orderItems.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td className="px-3 py-2 text-slate-600 text-xs font-mono">{String(item.productSkuId || '').slice(-8).toUpperCase()}</td>
                                                        <td className="px-3 py-2 text-right text-slate-600">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right text-slate-600">{fmt(item.unitPrice)}</td>
                                                        <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt(item.quantity * item.unitPrice)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Update Status</p>
                                {serverError && (
                                    <div className="mb-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{serverError}</div>
                                )}
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedStatus || order.status || ''}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                                    >
                                        <option value="">Select new status</option>
                                        {ORDER_STATUSES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={updatingStatus || !selectedStatus || selectedStatus === order.status}
                                        className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function Orders() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [totalFrom, setTotalFrom] = useState('');
    const [totalTo, setTotalTo] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [customerIdFilter, setCustomerIdFilter] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);


    
    const activeFilters = useMemo(() => ({
        search: search || undefined,
        status: statusFilter || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentStatus: paymentStatus || undefined,
        totalFrom: totalFrom ? Number(totalFrom) : undefined,
        totalTo: totalTo ? Number(totalTo) : undefined,
        createdFrom: createdFrom || undefined,
        createdTo: createdTo || undefined,
        sortBy: sortBy || undefined,
        sortDir: "desc",
        customerId: customerIdFilter || undefined,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
    }), [search, statusFilter, paymentMethod, paymentStatus, totalFrom, totalTo, createdFrom, createdTo, sortBy, customerIdFilter, page]);

    const ordersQuery = useQuery({
        queryKey: queryKeys.orders.list(tenantId, activeFilters),
        queryFn: () => getOrders(tenantId, activeFilters),
        enabled: !!tenantId,
    });


    useEffect(() => {
        console.log("🎯 Filters đã thay đổi:", activeFilters);
    }, [activeFilters]); // Chạy mỗi khi object activeFilters có tham chiếu mới


    const customersQuery = useQuery({
        queryKey: queryKeys.customers.list(tenantId, {}),
        queryFn: () => getCustomers(tenantId, {}),
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000,
    });

    const customerMap = useMemo(() => {
        const list = customersQuery.data || [];
        const arr = Array.isArray(list) ? list : (list.items || list.data || []);
        return arr.reduce((acc, c) => { acc[c.id] = c.email; return acc; }, {});
    }, [customersQuery.data]);

    const customerOptions = useMemo(() => {
        const list = customersQuery.data || [];
        const arr = Array.isArray(list) ? list : (list.items || list.data || []);
        return arr.map((c) => ({ id: c.id, email: c.email }));
    }, [customersQuery.data]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleReset = () => {
        setSearchInput(''); setSearch('');
        setStatusFilter(''); setPaymentMethod(''); setPaymentStatus('');
        setTotalFrom(''); setTotalTo('');
        setCreatedFrom(''); setCreatedTo('');
        setSortBy('createdAt'); setCustomerIdFilter('');
        setPage(1);
    };

    const orders = ordersQuery.data?.items || ordersQuery.data?.data || (Array.isArray(ordersQuery.data) ? ordersQuery.data : []);
    const total = ordersQuery.data?.total || ordersQuery.data?.totalCount || (Array.isArray(ordersQuery.data) ? ordersQuery.data.length : 0);
    const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

    const fmt = (val) => val != null
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        : '—';
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view orders.</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Orders</h1>
                    <p className="text-sm text-slate-500 mt-0.5">View and manage customer orders</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{Array.isArray(ordersQuery.data) ? ordersQuery.data.length : total} order{total !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 space-y-3">
                {/* Row 1: Search + Status + Customer */}
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by order ID, address, customer ID..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                        {searchInput && (
                            <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        )}
                    </form>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                    >
                        <option value="">All Statuses</option>
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        value={customerIdFilter}
                        onChange={(e) => { setCustomerIdFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black min-w-[160px]"
                    >
                        <option value="">All Customers</option>
                        {customerOptions.map((c) => (
                            <option key={c.id} value={c.id}>{emailName(c.email) || c.id}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showAdvanced ? 'border-slate-900 bg-slate-900 text-white' : 'border-[#e3e3e3] text-slate-600 hover:bg-[#f8f8f8]'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Row 2: Advanced filters */}
                {showAdvanced && (
                    <div className="flex flex-wrap gap-3 items-end pt-2 border-t border-[#f0f0f0]">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <label className="text-xs font-medium text-slate-500">Payment Method</label>
                            <select
                                value={paymentMethod}
                                
                                onChange={(e) => { 
                                   setPaymentMethod(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                            >
                                <option value="">Any</option>
                                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <label className="text-xs font-medium text-slate-500">Payment Status</label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                            >
                                <option value="">Any</option>
                                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Total from (VND)</label>
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={totalFrom}
                                onChange={(e) => { setTotalFrom(e.target.value); setPage(1); }}
                                className="w-32 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Total to (VND)</label>
                            <input
                                type="number"
                                min={0}
                                placeholder="∞"
                                value={totalTo}
                                onChange={(e) => { setTotalTo(e.target.value); setPage(1); }}
                                className="w-32 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Created from</label>
                            <input
                                type="date"
                                value={createdFrom}
                                onChange={(e) => { setCreatedFrom(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">Created to</label>
                            <input
                                type="date"
                                value={createdTo}
                                onChange={(e) => { setCreatedTo(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex flex-col gap-1 min-w-[160px]">
                            <label className="text-xs font-medium text-slate-500">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                            >
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm text-slate-600 hover:bg-[#f8f8f8] transition-colors"
                        >
                            Reset all
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden">
                {ordersQuery.isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-slate-500 text-sm">Loading orders...</span>
                    </div>
                ) : ordersQuery.isError ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed to load orders. Please try again.</span>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#e3e3e3] bg-[#f8f8f8]">
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Order ID</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Customer</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Payment</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 text-slate-400">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => {
                                            const oid = order.orderId || order.id;
                                            const email = customerMap[order.customerId] || null;
                                            return (
                                                <tr key={oid} className="hover:bg-[#f8f8f8] transition-colors">
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                                        #{String(oid).slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {email ? (
                                                            <>
                                                                <p className="font-medium text-slate-900">{emailName(email)}</p>
                                                                <p className="text-xs text-slate-400">{email}</p>
                                                            </>
                                                        ) : (
                                                            <p className="font-mono text-xs text-slate-400">{String(order.customerId || '').slice(-8)}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{fmtDate(order.createdAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs text-slate-600">{order.paymentMethod || '—'}</span>
                                                            <StatusBadge status={order.paymentStatus} />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                        {fmt(order.total || order.totalAmount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => setSelectedOrderId(oid)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600 ml-auto"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {total > DEFAULT_PAGE_SIZE && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3e3e3]">
                                <span className="text-sm text-slate-500">
                                    Page {page} of {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-3 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] disabled:opacity-40 hover:bg-[#f8f8f8] transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedOrderId && (
                <OrderDetailModal
                    tenantId={tenantId}
                    orderId={selectedOrderId}
                    customerMap={customerMap}
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </div>
    );
}
