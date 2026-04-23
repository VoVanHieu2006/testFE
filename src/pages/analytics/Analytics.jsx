import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart2, Loader2, AlertCircle, TrendingUp, TrendingDown,
    ShoppingCart, Users, DollarSign, Star, Package, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getAnalyticsDashboard } from '../../share/api/analyticsApi';
import { queryKeys } from '../../share/api/queryKeys';

const fmt = (val) => val != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    : '—';

const fmtNum = (val) => val != null
    ? new Intl.NumberFormat('vi-VN').format(val)
    : '—';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

const PRESET_RANGES = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 365 },
];

function getPresetDates(days) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
    };
}

function StatCard({ icon: Icon, label, value, sub, color = 'slate', trend }) {
    const colorMap = {
        slate: 'bg-slate-50 text-slate-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1 leading-none">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                {trend != null && (
                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{trend >= 0 ? '+' : ''}{trend}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function RatingBar({ label, count, total, color }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 w-12 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
            <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
        </div>
    );
}

function StarDisplay({ rating, max = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                />
            ))}
        </div>
    );
}

export default function Analytics() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;

    const [selectedPreset, setSelectedPreset] = useState(1);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [topTake, setTopTake] = useState(10);

    const dateRange = useMemo(() => {
        if (useCustom && customFrom && customTo) {
            return { from: customFrom, to: customTo };
        }
        return getPresetDates(PRESET_RANGES[selectedPreset].days);
    }, [useCustom, customFrom, customTo, selectedPreset]);

    const params = useMemo(() => ({
        from: dateRange.from,
        to: dateRange.to,
        take: topTake,
    }), [dateRange, topTake]);

    const dashboardQuery = useQuery({
        queryKey: queryKeys.analytics.dashboard(tenantId, params),
        queryFn: () => getAnalyticsDashboard(tenantId, params),
        enabled: !!tenantId,
    });

    const { overview, ratings, topProducts } = dashboardQuery.data || {};

    const paidRate = overview
        ? overview.totalOrders > 0
            ? Math.round((overview.paidOrders / overview.totalOrders) * 100)
            : 0
        : null;

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to view analytics.</span>
            </div>
        );
    }

    const maxRevenue = topProducts && topProducts.length > 0
        ? Math.max(...topProducts.map((p) => p.revenue))
        : 1;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {overview
                            ? `${fmtDate(overview.fromUtc)} — ${fmtDate(overview.toUtc)}`
                            : 'Store performance overview'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {PRESET_RANGES.map((r, i) => (
                        <button
                            key={r.label}
                            onClick={() => { setSelectedPreset(i); setUseCustom(false); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${!useCustom && selectedPreset === i
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-[#e3e3e3] hover:bg-[#f8f8f8]'}`}
                        >
                            {r.label}
                        </button>
                    ))}
                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => { setCustomFrom(e.target.value); setUseCustom(true); }}
                            className="px-2 py-1.5 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                        />
                        <span className="text-slate-400 text-sm">–</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => { setCustomTo(e.target.value); setUseCustom(true); }}
                            className="px-2 py-1.5 rounded-lg border border-[#e3e3e3] text-sm outline-none focus:border-black"
                        />
                    </div>
                    <button
                        onClick={() => dashboardQuery.refetch()}
                        disabled={dashboardQuery.isFetching}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3e3e3] hover:bg-[#f8f8f8] transition-colors text-slate-600 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {dashboardQuery.isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    <span className="ml-3 text-slate-500">Loading analytics...</span>
                </div>
            ) : dashboardQuery.isError ? (
                <div className="flex items-center justify-center gap-2 py-24 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Failed to load analytics. Please try again.</span>
                </div>
            ) : (
                <>
                    {/* ── Overview KPI cards ── */}
                    {overview && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={ShoppingCart} label="Total Orders" value={fmtNum(overview.totalOrders)} sub={`${overview.paidOrders} paid (${paidRate}%)`} color="blue" />
                            <StatCard icon={DollarSign} label="Gross Revenue" value={fmt(overview.grossRevenue)} sub={`Paid: ${fmt(overview.paidRevenue)}`} color="green" />
                            <StatCard icon={TrendingUp} label="Avg Order Value" value={fmt(overview.averageOrderValue)} color="purple" />
                            <StatCard icon={Users} label="Customers" value={fmtNum(overview.activeCustomers)} sub={`${overview.newCustomers} new this period`} color="amber" />
                        </div>
                    )}

                    {/* ── Revenue breakdown + Ratings ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Revenue breakdown */}
                        {overview && (
                            <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                                <p className="text-sm font-semibold text-slate-900 mb-4">Revenue Breakdown</p>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-500">Gross Revenue</span>
                                            <span className="text-xs font-semibold text-slate-900">{fmt(overview.grossRevenue)}</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-900 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-500">Paid Revenue</span>
                                            <span className="text-xs font-semibold text-green-700">{fmt(overview.paidRevenue)}</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: overview.grossRevenue > 0 ? `${(overview.paidRevenue / overview.grossRevenue) * 100}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">Total Orders</p>
                                            <p className="text-lg font-bold text-slate-900">{fmtNum(overview.totalOrders)}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">Paid Orders</p>
                                            <p className="text-lg font-bold text-green-700">{fmtNum(overview.paidOrders)}</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">New Customers</p>
                                            <p className="text-lg font-bold text-blue-700">{fmtNum(overview.newCustomers)}</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-lg p-3">
                                            <p className="text-xs text-slate-500">Active Customers</p>
                                            <p className="text-lg font-bold text-amber-700">{fmtNum(overview.activeCustomers)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ratings */}
                        {ratings && (
                            <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                                <p className="text-sm font-semibold text-slate-900 mb-4">Customer Ratings</p>
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-slate-900">{ratings.averageRating?.toFixed(1)}</p>
                                        <StarDisplay rating={ratings.averageRating} />
                                        <p className="text-xs text-slate-500 mt-1">{fmtNum(ratings.totalReviews)} reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <RatingBar label="5 ★" count={ratings.fiveStarCount} total={ratings.totalReviews} color="bg-amber-400" />
                                        <RatingBar label="4 ★" count={ratings.fourStarCount} total={ratings.totalReviews} color="bg-amber-300" />
                                        <RatingBar label="3 ★" count={ratings.threeStarCount} total={ratings.totalReviews} color="bg-slate-300" />
                                        <RatingBar label="2 ★" count={ratings.twoStarCount} total={ratings.totalReviews} color="bg-orange-300" />
                                        <RatingBar label="1 ★" count={ratings.oneStarCount} total={ratings.totalReviews} color="bg-red-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 border-t border-[#f0f0f0] pt-4">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-amber-500">{fmtNum(ratings.fiveStarCount + ratings.fourStarCount)}</p>
                                        <p className="text-xs text-slate-500">4–5 ★</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-slate-600">{fmtNum(ratings.threeStarCount)}</p>
                                        <p className="text-xs text-slate-500">3 ★</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-red-500">{fmtNum(ratings.twoStarCount + ratings.oneStarCount)}</p>
                                        <p className="text-xs text-slate-500">1–2 ★</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Top Products ── */}
                    {topProducts && topProducts.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-500" />
                                    Top Products
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Show top</span>
                                    <select
                                        value={topTake}
                                        onChange={(e) => setTopTake(Number(e.target.value))}
                                        className="px-2 py-1 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
                                    >
                                        {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Bar chart */}
                            <div className="mb-6 space-y-2">
                                {topProducts.map((p, idx) => (
                                    <div key={p.productId} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-xs font-medium text-slate-700 truncate">{p.productName}</span>
                                                <span className="text-xs font-semibold text-slate-900 ml-2 shrink-0">{fmt(p.revenue)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-800 rounded-full"
                                                    style={{ width: `${(p.revenue / maxRevenue) * 100}%`, opacity: 1 - idx * 0.06 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto border border-[#e3e3e3] rounded-lg">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#f8f8f8] border-b border-[#e3e3e3]">
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">#</th>
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600">Product</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Qty Sold</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Orders</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Revenue</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Rating</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-slate-600">Reviews</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e3e3e3]">
                                        {topProducts.map((p, idx) => (
                                            <tr key={p.productId} className="hover:bg-[#f8f8f8] transition-colors">
                                                <td className="px-3 py-2.5 text-xs font-bold text-slate-400">{idx + 1}</td>
                                                <td className="px-3 py-2.5 font-medium text-slate-900">{p.productName}</td>
                                                <td className="px-3 py-2.5 text-right text-slate-700">{fmtNum(p.quantitySold)}</td>
                                                <td className="px-3 py-2.5 text-right text-slate-700">{fmtNum(p.orderCount)}</td>
                                                <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{fmt(p.revenue)}</td>
                                                <td className="px-3 py-2.5 text-right">
                                                    {p.averageRating != null ? (
                                                        <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-xs">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                            {p.averageRating.toFixed(1)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-3 py-2.5 text-right text-slate-500">{fmtNum(p.reviewCount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!overview && !ratings && !topProducts && (
                        <div className="bg-white rounded-xl border border-[#e3e3e3] py-20 text-center">
                            <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No analytics data for this period.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
