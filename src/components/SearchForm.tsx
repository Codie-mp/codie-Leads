"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Filter, Loader2, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchFilters } from "@/services/gemini";
import { LocationMap } from "./LocationMap";

interface SearchFormProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const exampleQueries = [
  "Independent gyms in Dubai with 4+ rating",
  "Boutique hotels in Cairo with an active website",
  "B2B software companies in Riyadh",
];

export function SearchForm({ onSearch, isLoading, initialQuery = "" }: SearchFormProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<SearchFilters>({
    minRating: undefined,
    priceLevel: undefined,
    keywords: "",
    limit: 20,
    locationFilter: undefined,
  });

  React.useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const activeFilterCount = [filters.minRating, filters.priceLevel, filters.keywords, filters.locationFilter]
    .filter(Boolean).length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) onSearch(query.trim(), filters);
  };

  const clearFilters = () => {
    setFilters({
      minRating: undefined,
      priceLevel: undefined,
      keywords: "",
      limit: 20,
      locationFilter: undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative mx-auto w-full max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.4)]">
          <div className="border-b border-slate-100 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">Search brief</p>
                <p className="mt-1 text-sm text-slate-500">Describe the businesses you want to reach.</p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 sm:flex"><Sparkles className="h-3.5 w-3.5" /> AI-assisted</div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Independent fitness studios in Dubai"
                  aria-label="Describe your ideal customer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-expanded={showFilters}
                  aria-controls="advanced-search-filters"
                  onClick={() => setShowFilters((visible) => !visible)}
                  className={cn("inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-bold transition sm:px-4", showFilters || activeFilterCount > 0 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50")}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">{activeFilterCount}</span>}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className={cn("inline-flex min-w-32 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition", isLoading || !query.trim() ? "cursor-not-allowed bg-slate-300" : "bg-slate-950 shadow-sm hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2")}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Find leads <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="mr-1 font-semibold text-slate-400">Try:</span>
              {exampleQueries.map((example) => <button key={example} type="button" onClick={() => setQuery(example)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-left font-medium transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">{example}</button>)}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div id="advanced-search-filters" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100 bg-slate-50/70">
                <div className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-blue-700" /><p className="text-sm font-bold text-slate-900">Narrow the brief</p></div><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"><X className="h-3.5 w-3.5" /> Clear filters</button></div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-bold text-slate-500">Results limit<select value={filters.limit || 20} onChange={(event) => setFilters({ ...filters, limit: Number(event.target.value) })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{[10, 20, 30, 50, 100, 150, 300, 500, 1000].map((number) => <option key={number} value={number}>{number} results</option>)}</select></label>
                    <label className="text-xs font-bold text-slate-500">Minimum rating<select value={filters.minRating || ""} onChange={(event) => setFilters({ ...filters, minRating: event.target.value ? Number(event.target.value) : undefined })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Any rating</option><option value="3">3+ stars</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option></select></label>
                    <label className="text-xs font-bold text-slate-500">Price level<select value={filters.priceLevel || ""} onChange={(event) => setFilters({ ...filters, priceLevel: event.target.value || undefined })} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Any price</option><option value="$">$ (cheap)</option><option value="$$">$$ (moderate)</option><option value="$$$">$$$ (expensive)</option><option value="$$$$">$$$$ (premium)</option></select></label>
                    <label className="text-xs font-bold text-slate-500">Keywords<input type="text" value={filters.keywords} onChange={(event) => setFilters({ ...filters, keywords: event.target.value })} placeholder="e.g. 24/7, family owned" className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                  </div>
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 sm:p-4"><div className="mb-3"><p className="text-sm font-bold text-slate-900">Where should we search?</p><p className="mt-1 text-xs leading-5 text-slate-500">Use one area for a focused search or select multiple cities to expand territory coverage.</p></div><LocationMap value={filters.locationFilter} onChange={(value) => setFilters({ ...filters, locationFilter: value })} /></div>
                  {filters.limit && filters.limit > 50 && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800"><strong>Large search:</strong> {filters.limit} results may take longer and may be returned in batches.</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}
