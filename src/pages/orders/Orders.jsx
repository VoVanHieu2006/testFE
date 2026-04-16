import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, Search, ChevronLeft, ChevronRight,
    Loader2, AlertCircle, Eye, X
} from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getOrders, getOrderById, updateOrderStatus } from '../../share/api/orderApi';
import { queryKeys } from '../../share/api/queryKeys';

const DEFAULT_PAGE_SIZE = 10;

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

const STATUS_STYLES = {
    Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
    Shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
    Delivered:  'bg-green-50 text-green-700 border-green-200',
    Cancelled:  'bg-red-50 text-red-700 border-red-200',
    Refunded:   'bg-slate-100 text-slate-600 border-slate-200',
};

function StatusBadge({ status }) {
    const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
            {status || 'Unknown'}
        </span>
    );
}

function OrderDetailModal({ tenantId, orderId, onClose }) {
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
                            {/* Order Info */}
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
                                    <p className="text-sm text-slate-900">{order.customerName || order.customer?.name || '—'}</p>
                                    {(order.customerEmail || order.customer?.email) && (
                                        <p className="text-xs text-slate-400">{order.customerEmail || order.customer?.email}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Total</p>
                                    <p className="text-sm font-semibold text-slate-900">{fmt(order.total || order.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Current Status</p>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Payment</p>
                                    <p className="text-sm text-slate-900">{order.paymentMethod || '—'}</p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {(order.shippingAddress || order.address) && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shipping Address</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                                        {typeof (order.shippingAddress || order.address) === 'string'
                                            ? (order.shippingAddress || order.address)
                                            : JSON.stringify(order.shippingAddress || order.address)}
                                    </p>
                                </div>
                            )}

                            {/* Order Items */}
                            {Array.isArray(order.items) && order.items.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items</p>
                                    <div className="border border-[#e3e3e3] rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Product</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Qty</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Price</th>
                                                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e3e3e3]">
                                                {order.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 text-slate-800">{item.productName || item.name || '—'}</td>
                                                        <td className="px-3 py-2 text-right text-slate-600">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right text-slate-600">{fmt(item.unitPrice || item.price)}</td>
                                                        <td className="px-3 py-2 text-right font-medium text-slate-900">{fmt(item.subtotal || (item.quantity * (item.unitPrice || item.price)))}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Update Status */}
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
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const ordersQuery = useQuery({
        queryKey: queryKeys.orders.list(tenantId, { page, pageSize: DEFAULT_PAGE_SIZE, search, status: statusFilter }),
        queryFn: () => getOrders(tenantId, {
            page,
            pageSize: DEFAULT_PAGE_SIZE,
            search: search || undefined,
            status: statusFilter || undefined,
        }),
        enabled: !!tenantId,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const orders = ordersQuery.data?.items || ordersQuery.data?.data || ordersQuery.data || [];
    const total = ordersQuery.data?.total || ordersQuery.data?.totalCount || 0;
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
                    <span>{total} total order{total !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                >
                    <option value="">All Statuses</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
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
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
                                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e3]">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-slate-400">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.orderId || order.id} className="hover:bg-[#f8f8f8] transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                                    #{String(order.orderId || order.id).slice(-8).toUpperCase()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{order.customerName || order.customer?.name || '—'}</p>
                                                    {(order.customerEmail || order.customer?.email) && (
                                                        <p className="text-xs text-slate-400">{order.customerEmail || order.customer?.email}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{fmtDate(order.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    {fmt(order.total || order.totalAmount)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrderId(order.orderId || order.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600 ml-auto"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {total > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3e3e3]">
                                <span className="text-sm text-slate-500">
                                    Showing {(page - 1) * DEFAULT_PAGE_SIZE + 1}–{Math.min(page * DEFAULT_PAGE_SIZE, total)} of {total} orders
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
                    onClose={() => setSelectedOrderId(null)}
                />
            )}
        </div>
    );
}
