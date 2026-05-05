import { Search } from 'lucide-react';

export function ProductFilters({
    searchInput, setSearchInput, handleSearch,
    categoryId, setCategoryId,
    sortBy, sortDir, setSortBy, setSortDir, setPage,
    pageSize, handlePageSizeChange,
    categories,
}) {
    return (
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4 flex flex-wrap gap-3 items-center">
            <form onSubmit={handleSearch}
                className="flex items-center gap-2 bg-[#f8f8f8] rounded-lg px-3 py-2 border border-transparent focus-within:border-[#e3e3e3] flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
            </form>

            <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
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
                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
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
                className="px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm bg-white text-slate-700 outline-none focus:border-black"
            >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
            </select>
        </div>
    );
}