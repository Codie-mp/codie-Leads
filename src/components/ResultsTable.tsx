"use client";
import React, { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ExternalLink, MapPin, Phone, Star, FileJson, FileSpreadsheet, DollarSign, Save, Check, TrendingUp, ArrowUp, ArrowDown, ChevronsUpDown, Filter, X, ChevronLeft, ChevronRight, Send, Square, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import Papa from 'papaparse';
import { PlaceResult } from '@/services/gemini';
import { useStore } from '@/store/useLeadStore';
import { toast } from 'sonner';
import { calculateLeadScore, getScoreColor } from '@/lib/scoring';
import { AddToCampaignModal } from './AddToCampaignModal';
import { MapVisualization } from './MapVisualization';
import { cn } from '@/lib/utils';

interface ResultsTableProps {
  places: PlaceResult[];
  isLoading?: boolean;
}

type SortKey = 'name' | 'score' | 'rating' | 'reviews';
type SortDirection = 'asc' | 'desc';

interface FilterConfig {
  minRating: number;
  hasWebsite: boolean;
  hasPhone: boolean;
  minScore: number;
}

export function ResultsTable({ places, isLoading }: ResultsTableProps) {
  const { addLead, bulkAddLeads } = useStore();
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [newlySavedLeadIds, setNewlySavedLeadIds] = useState<string[]>([]);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'score',
    direction: 'desc'
  });

  // Filtering State
  const [filters, setFilters] = useState<FilterConfig>({
    minRating: 0,
    hasWebsite: false,
    hasPhone: false,
    minScore: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  
  // Expanded Rows State
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const getPlaceId = (place: PlaceResult) => `${place.name}-${place.address}`;

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedPlaces = useMemo(() => {
    let result = [...places];

    // 1. Filter
    result = result.filter(place => {
      const rating = parseFloat(place.rating) || 0;
      const score = calculateLeadScore(place);
      
      if (rating < filters.minRating) return false;
      if (filters.hasWebsite && (!place.website || place.website === 'N/A')) return false;
      if (filters.hasPhone && (!place.phone || place.phone === 'N/A')) return false;
      if (score < filters.minScore) return false;
      
      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof PlaceResult];
      let bValue: any = b[sortConfig.key as keyof PlaceResult];

      // Handle special cases
      if (sortConfig.key === 'score') {
        aValue = calculateLeadScore(a);
        bValue = calculateLeadScore(b);
      } else if (sortConfig.key === 'rating') {
        aValue = parseFloat(a.rating) || 0;
        bValue = parseFloat(b.rating) || 0;
      } else if (sortConfig.key === 'reviews') {
        aValue = parseInt((a.reviews || '0').replace(/,/g, '')) || 0;
        bValue = parseInt((b.reviews || '0').replace(/,/g, '')) || 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [places, sortConfig, filters]);

  // Reset to first page when data or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [processedPlaces.length, sortConfig, filters]);

  const totalPages = Math.ceil(processedPlaces.length / itemsPerPage);
  const paginatedPlaces = processedPlaces.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSave = async (place: PlaceResult) => {
    const id = getPlaceId(place);
    if (savedIds.has(id)) return;

    try {
      await addLead({
        name: place.name,
        address: place.address,
        phone: place.phone,
        website: place.website,
        googleMapsLink: place.googleMapsLink,
        rating: parseFloat(place.rating) || 0,
        priceLevel: place.price,
        businessCategory: place.businessCategory,
        businessStatus: place.businessStatus,
        reviewsSummary: place.reviewsSummary,
        status: 'new',
        source: 'search',
        tags: [],
        notes: '',
      });
      setSavedIds(prev => new Set(prev).add(id));
      toast.success('Lead saved successfully!', {
        description: `${place.name} has been added to your saved leads.`,
      });
    } catch (error) {
      console.error('Failed to save lead:', error);
      toast.error('Failed to save lead');
    }
  };

  const handleSaveAll = async () => {
    if (processedPlaces.length === 0) return;
    setIsSavingAll(true);
    
    try {
      const leadsToSave = processedPlaces
        .filter(place => !savedIds.has(getPlaceId(place)))
        .map(place => ({
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          googleMapsLink: place.googleMapsLink,
          rating: parseFloat(place.rating) || 0,
          priceLevel: place.price,
          businessCategory: place.businessCategory,
          businessStatus: place.businessStatus,
          reviewsSummary: place.reviewsSummary,
          status: 'new' as const,
          source: 'search' as const,
          tags: [],
          notes: '',
        }));

      if (leadsToSave.length === 0) {
        toast.info('All visible leads are already saved.');
        setIsSavingAll(false);
        return;
      }

      await bulkAddLeads(leadsToSave);
      
      // Update saved IDs
      const newSavedIds = new Set(savedIds);
      processedPlaces.forEach(place => {
        newSavedIds.add(getPlaceId(place));
      });
      setSavedIds(newSavedIds);

      toast.success(`Saved ${leadsToSave.length} leads successfully!`);
    } catch (error) {
      console.error('Failed to save all leads:', error);
      toast.error('Failed to save leads');
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(processedPlaces);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'codie_leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV');
  };

  const handleExportExcel = () => {
    const csv = Papa.unparse(processedPlaces);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'codie_leads_spreadsheet.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported spreadsheet-compatible CSV');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(processedPlaces, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'codie_leads.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to JSON');
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronsUpDown className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600" /> 
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedPlaces.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPlaces.map(p => getPlaceId(p))));
    }
  };

  const handleToggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const handleBulkAddToCampaign = async () => {
    const selectedPlaces = processedPlaces.filter(p => selectedIds.has(getPlaceId(p)));
    if (selectedPlaces.length === 0) return;

    setIsSavingAll(true);
    try {
      // 1. Save leads that aren't saved yet
      const leadsToSave = selectedPlaces
        .filter(place => !savedIds.has(getPlaceId(place)))
        .map(place => ({
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          googleMapsLink: place.googleMapsLink,
          rating: parseFloat(place.rating) || 0,
          priceLevel: place.price,
          businessCategory: place.businessCategory,
          businessStatus: place.businessStatus,
          reviewsSummary: place.reviewsSummary,
          status: 'new' as const,
          source: 'search' as const,
          tags: [],
          notes: '',
        }));

      let finalLeadIds: string[] = [];
      
      const { leads } = useStore.getState();

      if (leadsToSave.length > 0) {
        await bulkAddLeads(leadsToSave);
        // Assuming bulkAddLeads returns the new leads or we can fetch them
        // For now, let's fetch all leads and match by name/address to get IDs
        // wait a moment or just rely on state? it might not be updated yet
        // actually let's just refresh data
        await useStore.getState().fetchData();
        const allLeads = useStore.getState().leads;
        finalLeadIds = allLeads
          .filter(l => selectedPlaces.some(p => p.name === l.name && p.address === l.address))
          .map(l => l.id!);
      } else {
        const allLeads = leads;
        finalLeadIds = allLeads
          .filter(l => selectedPlaces.some(p => p.name === l.name && p.address === l.address))
          .map(l => l.id!);
      }

      setNewlySavedLeadIds(finalLeadIds);
      setIsCampaignModalOpen(true);
      
      // Update saved IDs
      const newSavedIds = new Set(savedIds);
      selectedPlaces.forEach(place => newSavedIds.add(getPlaceId(place)));
      setSavedIds(newSavedIds);
      setSelectedIds(new Set());

    } catch (error) {
      console.error(error);
      toast.error('Failed to prepare leads for campaign');
    } finally {
      setIsSavingAll(false);
    }
  };

  if (places.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-6xl mx-auto mt-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 flex items-center gap-3">
            Found {places.length} Gems
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 animate-pulse">
                <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                Fetching more...
              </span>
            )}
          </h2>
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkAddToCampaign}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm font-bold text-sm animate-in zoom-in duration-200"
            >
              <Send className="w-4 h-4" />
              Add {selectedIds.size} to Campaign
            </button>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg hover:bg-gray-800 transition-all shadow-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingAll ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save the Goods
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-green-700 hover:bg-green-50 hover:border-green-200 transition-all shadow-sm font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-yellow-700 hover:bg-yellow-50 hover:border-yellow-200 transition-all shadow-sm font-medium text-sm"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-1.5">
          <Filter className="w-4 h-4" /> Quick Filters:
        </span>
        <button
          onClick={() => setFilters(prev => ({ ...prev, hasWebsite: !prev.hasWebsite }))}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            filters.hasWebsite ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Has Website
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, hasPhone: !prev.hasPhone }))}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            filters.hasPhone ? "bg-blue-100 border-blue-200 text-blue-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Has Phone
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === 4 ? 0 : 4 }))}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center gap-1",
            filters.minRating === 4 ? "bg-yellow-100 border-yellow-200 text-yellow-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          Highly Rated (4.0+)
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, minScore: prev.minScore === 70 ? 0 : 70 }))}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            filters.minScore === 70 ? "bg-green-100 border-green-200 text-green-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          High Quality Lead (70+)
        </button>
        
        {(filters.minRating > 0 || filters.hasWebsite || filters.hasPhone || filters.minScore > 0) && (
          <button 
            onClick={() => setFilters({ minRating: 0, hasWebsite: false, hasPhone: false, minScore: 0 })}
            className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {processedPlaces.length > 0 && <MapVisualization places={processedPlaces} />}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 w-10">
                  <button onClick={handleToggleSelectAll} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {selectedIds.size === paginatedPlaces.length && paginatedPlaces.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th 
                  className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name <SortIcon columnKey="name" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Category & Status</th>
                <th 
                  className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2">
                    Score <SortIcon columnKey="score" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                <th 
                  className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center gap-2">
                    Rating <SortIcon columnKey="rating" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Reviews Summary</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Maps</th>
                <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedPlaces.map((place, index) => {
                const placeId = getPlaceId(place);
                const isSaved = savedIds.has(placeId);
                const score = calculateLeadScore(place);
                const scoreColor = getScoreColor(score);
                const isExpanded = expandedIds.has(placeId);
                
                return (
                  <Fragment key={placeId}>
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4, backgroundColor: "rgba(245, 243, 255, 0.5)" }}
                    transition={{ 
                      delay: index * 0.05,
                      x: { type: "spring", stiffness: 300, damping: 30 }
                    }}
                    onClick={() => handleToggleExpand(placeId)}
                    className={cn(
                      "hover:bg-blue-50/30 transition-colors group cursor-pointer",
                      selectedIds.has(placeId) && "bg-blue-50/50"
                    )}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleToggleSelect(placeId)}
                        className={cn(
                          "transition-colors",
                          selectedIds.has(placeId) ? "text-blue-600" : "text-gray-300 group-hover:text-gray-400"
                        )}
                      >
                        {selectedIds.has(placeId) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        {place.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 pl-6">
                        <MapPin className="w-3 h-3" /> {place.address}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {place.businessCategory && place.businessCategory !== 'N/A' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 w-fit">
                            {place.businessCategory}
                          </span>
                        )}
                        {place.businessStatus && place.businessStatus !== 'N/A' && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${
                            place.businessStatus.toLowerCase().includes('open') 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {place.businessStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${scoreColor}`}>
                        <TrendingUp className="w-3 h-3" />
                        {score}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {place.phone}
                        </div>
                        {place.website && place.website !== 'N/A' && (
                          <a 
                            href={place.website.startsWith('http') ? place.website : `https://${place.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Website
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {place.rating}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          {place.price}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600 max-w-[150px] truncate" title={place.reviewsSummary}>
                        {place.reviewsSummary !== 'N/A' ? place.reviewsSummary : '-'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {place.googleMapsLink && place.googleMapsLink !== 'N/A' ? (
                        <a 
                          href={place.googleMapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="View on Google Maps"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSave(place)}
                        disabled={isSaved}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSaved 
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3 h-3" /> Saved
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" /> Save
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                  {isExpanded && (
                    <tr className="bg-blue-50/20 border-b border-gray-100/50">
                      <td colSpan={9} className="p-0">
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          {/* Left Column: Reviews & Types */}
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">AI Review Summary</h5>
                              <p className="text-sm text-gray-700 italic border-l-2 border-blue-300 pl-3">
                                &quot;{place.reviewsSummary !== 'N/A' ? place.reviewsSummary : 'No comprehensive review summary available for this location.'}&quot;
                              </p>
                            </div>
                          </div>

                          {/* Right Column: Key Details */}
                          <div className="space-y-4">
                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">Business Status</h5>
                                <div className="text-sm text-gray-700">
                                  {place.businessStatus !== 'N/A' ? place.businessStatus : 'Operating status unknown'}
                                </div>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">Primary Category</h5>
                                <div className="text-sm text-gray-700">
                                  {place.businessCategory !== 'N/A' ? place.businessCategory : 'Uncategorized'}
                                </div>
                            </div>
                            
                            {place.website && place.website !== 'N/A' && (
                              <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-200 pb-1">Online Presence</h5>
                                <a 
                                  href={place.website.startsWith('http') ? place.website : `https://${place.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  {place.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          
          {processedPlaces.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>No leads match your filters.</p>
              <button 
                onClick={() => setFilters({ minRating: 0, hasWebsite: false, hasPhone: false, minScore: 0 })}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, processedPlaces.length)}</span> of{' '}
                <span className="font-medium">{processedPlaces.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  // Show first, last, current, and one around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
          
          {/* Mobile Pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isCampaignModalOpen && (
        <AddToCampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          leadIds={newlySavedLeadIds}
        />
      )}
    </motion.div>
  );
}
