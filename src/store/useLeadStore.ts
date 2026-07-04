"use client";
import { create } from 'zustand';
import { Lead, Category, Campaign, RecentSearch } from '@/lib/schema';

interface LeadState {
  // UI State
  selectedLeadId: string | null;
  isSidebarOpen: boolean;
  viewMode: 'list' | 'kanban';
  
  // Data
  leads: Lead[];
  campaigns: Campaign[];
  categories: Category[];
  recentSearches: RecentSearch[];
  isLoaded: boolean;

  // Actions
  setSelectedLeadId: (id: string | null) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'list' | 'kanban') => void;
  
  fetchData: () => Promise<void>;
  
  // DB Actions
  addLead: (lead: any) => Promise<string>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  bulkAddLeads: (leads: any[]) => Promise<void>;
  bulkDeleteLeads: (ids: string[]) => Promise<void>;
  bulkUpdateLeads: (ids: string[], updates: Partial<Lead>) => Promise<void>;
  
  addCategory: (category: any) => Promise<string>;
  updateCategory: (id: string, category: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addCampaign: (campaign: any) => Promise<string>;
  deleteCampaign: (id: string) => Promise<void>;

  addRecentSearch: (search: any) => Promise<void>;
}

export const useStore = create<LeadState>((set, get) => ({
  selectedLeadId: null,
  isSidebarOpen: false,
  viewMode: 'list',
  leads: [],
  campaigns: [],
  categories: [],
  recentSearches: [],
  isLoaded: false,
  
  setSelectedLeadId: (id) => set({ selectedLeadId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  fetchData: async () => {
    try {
      const resp = await fetch('/api/data');
      if (resp.ok) {
        const data = await resp.json();
        set({
          leads: data.leads || [],
          campaigns: data.campaigns || [],
          categories: data.categories || [],
          recentSearches: data.recentSearches || [],
          isLoaded: true
        });
      }
    } catch (err) {
      console.error(err);
    }
  },

  addLead: async (lead) => {
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
    if (!res.ok) throw new Error('Failed to add lead');
    await get().fetchData();
    return (await res.json()).id;
  },
  
  updateLead: async (id, updates) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!res.ok) throw new Error('Failed to update lead');
    await get().fetchData();
  },
  
  deleteLead: async (id) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lead');
    await get().fetchData();
  },
  
  bulkAddLeads: async (leads) => {
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leads) });
    if (!res.ok) throw new Error('Failed to bulk add leads');
    await get().fetchData();
  },

  bulkDeleteLeads: async (ids) => {
    const res = await fetch('/api/leads/bulk-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
    if (!res.ok) throw new Error('Failed to bulk delete leads');
    await get().fetchData();
  },

  bulkUpdateLeads: async (ids, update) => {
    const res = await fetch('/api/leads/bulk-update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, update }) });
    if (!res.ok) throw new Error('Failed to bulk update leads');
    await get().fetchData();
  },
  
  addCategory: async (category) => {
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) });
    await get().fetchData();
    return (await res.json()).id;
  },
  
  updateCategory: async (id, category) => {
    await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(category) });
    await get().fetchData();
  },

  deleteCategory: async (id) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await get().fetchData();
  },

  addCampaign: async (campaign) => {
    const res = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaign) });
    await get().fetchData();
    return (await res.json()).id;
  },

  deleteCampaign: async (id) => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    await get().fetchData();
  },

  addRecentSearch: async (search) => {
    await fetch('/api/recentSearches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(search) });
    await get().fetchData();
  }
}));

