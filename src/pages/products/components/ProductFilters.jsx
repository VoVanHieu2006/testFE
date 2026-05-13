import { Search } from 'lucide-react';

export function ProductFilters({
    searchInput, setSearchInput, handleSearch,
    categoryId, setCategoryId,
    sortBy, sortDir, setSortBy, setSortDir, setPage,
    pageSize, handlePageSizeChange,
    categories,
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e3e3e3] bg-white p-3 shadow-sm sm:p-4">
            <form onSubmit={handleSearch}
                className="flex min-h-11 w-full min-w-0 flex-1 items-center gap-2 rounded-lg border border-transparent bg-[#f8f8f8] px-3 py-2 focus-within:border-[#e3e3e3] sm:min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
            </form>

            <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-black sm:w-auto"
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name}</option>
                ))}
            </select>

            <select
                value={`${sortBy}-${sortDir}`}
                onChange={e => {
                    const [sb, sd] = e.target.value.split('-');
                    setSortBy(sb); setSortDir(sd); setPage(1);
                }}
                className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-black sm:w-auto"
            >
                <option value="id-asc">ID A–Z</option>
                <option value="id-desc">ID Z–A</option>
                <option value="categoryId-desc">Category A–Z</option>
                <option value="categoryId-asc">Category Z–A</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
            </select>

            <select
                value={pageSize}
                onChange={e => handlePageSizeChange(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#e3e3e3] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-black sm:w-auto"
            >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
            </select>
        </div>
    );
}
