"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Search, Sparkles, Loader2, Database, ExternalLink, SlidersHorizontal, Star, MapPin, Phone, DollarSign, X, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStore } from '@/store/useLeadStore';
import { CategoryManagerModal } from './CategoryManagerModal';
import { handleApiError } from '@/lib/errorHandler';

interface ScrapeResult {
  name: string;
  website?: string;
  company: string;
  title?: string;
  notes?: string;
  rating?: string;
  priceLevel?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface ScrapeViewProps {
  onNavigateToSaved?: () => void;
}

export function ScrapeView({ onNavigateToSaved }: ScrapeViewProps) {
  const { bulkAddLeads, categories } = useStore();
  const [icp, setIcp] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    limit: number;
    minRating: string;
    priceLevel: string;
    keywords: string;
  }>({
    limit: 10,
    minRating: '',
    priceLevel: '',
    keywords: '',
  });

  const handleScrape = async () => {
    if (!icp.trim()) return;
    setIsScraping(true);
    setResults([]);
    try {
      const response = await fetch('/api/gemini/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          icp,
          filters: {
            limit: filters.limit,
            minRating: filters.minRating ? Number(filters.minRating) : undefined,
            priceLevel: filters.priceLevel || undefined,
            keywords: filters.keywords || undefined,
          }
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Scraping failed');
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error(`Expected JSON but got ${contentType}: ${await response.text()}`);
      }
      const data = await response.json();
      setResults(data.results || []);
      toast.success(`Found ${data.results?.length || 0} leads matching your profile!`);
    } catch (error: any) {
      handleApiError(error, "Scraping Failed", () => handleScrape());
    } finally {
      setIsScraping(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      limit: 10,
      minRating: '',
      priceLevel: '',
      keywords: '',
    });
  };

  const handleSaveAll = async () => {
    if (!results.length) return;
    const leads = results.map(r => {
      // Clean rating value prior to storage
      let parsedRating: number | null = null;
      if (r.rating) {
        const cleaned = r.rating.replace(/[^0-9.]/g, '');
        if (cleaned && !isNaN(parseFloat(cleaned))) {
          parsedRating = Math.round(parseFloat(cleaned));
        }
      }

      return {
        name: r.name,
        company: r.company,
        website: r.website || '',
        notes: r.notes || '',
        title: r.title || '',
        address: r.address && r.address !== 'N/A' ? r.address : '',
        phone: r.phone && r.phone !== 'N/A' ? r.phone : '',
        email: r.email && r.email !== 'N/A' ? r.email : '',
        rating: parsedRating,
        source: 'search' as const,
        status: 'new' as const,
        tags: ['scraped'],
        categoryId: selectedCategoryId || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    try {
      await bulkAddLeads(leads as any);
      toast.success('Successfully saved all scraped leads to database!');
      if (onNavigateToSaved) {
        onNavigateToSaved();
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save to database');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-6">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ICP Web Scraper</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Describe your Ideal Customer Profile (ICP). We'll use the Gemini Google Search grounding feature to scrape exactly what you're looking for across the whole web.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Your Ideal Customer Profile
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                placeholder="e.g. Luxury boutique hotels in Paris with wellness spa details"
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "absolute right-3 top-2.5 p-1.5 rounded-lg transition-colors",
                  showFilters ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-gray-100"
                )}
                title="Filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleScrape}
              disabled={isScraping || !icp.trim()}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shrink-0"
            >
              {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Scrape Web
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 pt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Results Limit</label>
                    <select
                      value={filters.limit}
                      onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value) })}
                      className="w-full p-2 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
                    >
                      {[5, 10, 15, 20, 30, 50].map(num => (
                        <option key={num} value={num}>{num} Results</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Min Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                      className="w-full p-2 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
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
                      value={filters.priceLevel}
                      onChange={(e) => setFilters({ ...filters, priceLevel: e.target.value })}
                      className="w-full p-2 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
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
                      placeholder="e.g. 'spa', 'rooftop pool'"
                      className="w-full p-2 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
            <h3 className="font-bold text-gray-900">Found {results.length} Leads</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 min-w-[150px]"
              >
                <option value="">No Category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                title="Manage Categories"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSaveAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ml-2"
              >
                <Database className="w-4 h-4" />
                Save to Database
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((result, i) => (
              <div key={i} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {result.name}
                      </h4>
                      {result.company && (
                        <span className="text-xs font-medium text-blue-700 px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
                          {result.company}
                        </span>
                      )}
                      
                      {result.rating && result.rating !== 'N/A' && (
                        <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold px-1.5 py-0.5 rounded">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {result.rating}
                        </span>
                      )}

                      {result.priceLevel && result.priceLevel !== 'N/A' && (
                        <span className="inline-flex items-center bg-green-50 text-green-700 border border-green-100 text-xs font-bold px-1.5 py-0.5 rounded">
                          <DollarSign className="w-3 h-3 -mr-0.5" />
                          {result.priceLevel}
                        </span>
                      )}
                    </div>

                    {result.title && (
                      <p className="text-sm font-semibold text-gray-700 bg-gray-50 inline-block px-2.5 py-1 rounded-lg border border-gray-100">
                        {result.title}
                      </p>
                    )}

                    {result.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic border-l-2 border-blue-200 pl-3">
                        {result.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-gray-500">
                      {result.address && result.address !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {result.address}
                        </span>
                      )}
                      {result.phone && result.phone !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {result.phone}
                        </span>
                      )}
                      {result.email && result.email !== 'N/A' && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400 w-3.5 h-3.5">@</span>
                          {result.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {result.website && result.website !== 'N/A' && (
                    <div className="shrink-0">
                      <a 
                        href={result.website.startsWith('http') ? result.website : `https://${result.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/75 border border-blue-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CategoryManagerModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
    </div>
  );
}
