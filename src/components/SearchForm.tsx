import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFilters } from '@/services/gemini';
import { LocationMap } from './LocationMap';

interface SearchFormProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export function SearchForm({ onSearch, isLoading, initialQuery = '' }: SearchFormProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [showFilters, setShowFilters] = React.useState(false);
  
  React.useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  const [filters, setFilters] = React.useState<SearchFilters>({
    minRating: undefined,
    priceLevel: undefined,
    keywords: '',
    limit: 20,
    locationFilter: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const clearFilters = () => {
    setFilters({
      minRating: undefined,
      priceLevel: undefined,
      keywords: '',
      limit: 20,
      locationFilter: undefined,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto relative"
    >
      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex flex-col bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center p-2">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Best Mandi in Riyadh, Startups in Cairo..."
                className="w-full p-4 text-lg text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-2 mr-2 rounded-lg transition-colors",
                  showFilters ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
                )}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium text-white transition-all duration-200",
                  isLoading || !query.trim() 
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-blue-600 hover:from-yellow-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                )}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yalla Search"}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 bg-gray-50/50"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Results Limit</label>
                      <select
                        value={filters.limit || 20}
                        onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {[10, 20, 30, 50, 100, 150, 300, 500, 1000].map(num => (
                          <option key={num} value={num}>{num} Results</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Min Rating</label>
                      <select
                        value={filters.minRating || ''}
                        onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price Level</label>
                      <select
                        value={filters.priceLevel || ''}
                        onChange={(e) => setFilters({ ...filters, priceLevel: e.target.value || undefined })}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Any Price</option>
                        <option value="$">$ (Cheap)</option>
                        <option value="$$">$$ (Moderate)</option>
                        <option value="$$$">$$$ (Expensive)</option>
                        <option value="$$$$">$$$$ (Very Expensive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keywords</label>
                      <input
                        type="text"
                        value={filters.keywords}
                        onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                        placeholder="e.g. '24/7', 'Family owned'"
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Geolocation Interactive Map Filter */}
                  <div className="px-4 pb-2">
                    <LocationMap 
                      value={filters.locationFilter}
                      onChange={(val) => setFilters({ ...filters, locationFilter: val })}
                    />
                  </div>
                  
                  {(filters.limit && filters.limit > 50) && (
                    <div className="px-4 pb-2">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start gap-2">
                        <div className="mt-0.5">⚠️</div>
                        <p>
                          Fetching <strong>{filters.limit}</strong> results may take significantly longer and is subject to AI rate limits. 
                          Results may be returned in batches or truncated.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="px-4 pb-4 flex justify-end">
                     <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
