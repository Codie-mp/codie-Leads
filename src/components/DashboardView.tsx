"use client";
import React from 'react';
import { useStore } from '@/store/useLeadStore';
import { motion } from 'motion/react';
import {
  Users,
  Target,
  CheckCircle2,
  TrendingUp,
  MousePointerClick,
  Eye,
  Clock,
  Briefcase,
  Zap,
  Search,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardView({ onSelectRecentSearch, onNavigateToView }: { onSelectRecentSearch?: (query: string) => void; onNavigateToView?: (view: 'saved' | 'campaigns') => void }) {
  const { leads, recentSearches } = useStore();
  const sortedRecentSearches = [...recentSearches].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    won: leads.filter(l => l.status === 'customer').length,
    totalOpens: leads.reduce((acc, l) => acc + (l.engagement?.opens || 0), 0),
    totalClicks: leads.reduce((acc, l) => acc + (l.engagement?.clicks || 0), 0),
  };


  const conversionRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : '0';
  const engagementRate = stats.contacted > 0 ? (((stats.totalOpens + stats.totalClicks) / stats.contacted) * 100).toFixed(1) : '0';

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const categories = leads.reduce((acc, lead) => {
    const cat = lead.businessCategory || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Workspace overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Make the next account easier to reach.</h2>
          <p className="mt-2 text-slate-500">Track your lead inventory, recent searches, and outreach momentum from one place.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Qualified"
          value={stats.qualified}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Won Deals"
          value={stats.won}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Conversion"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Chart Simulation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Pipeline health
              </h3>
              <div className="flex gap-2">
                {['new', 'contacted', 'qualified', 'customer'].map(s => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full",
                      s === 'new' ? 'bg-blue-400' :
                      s === 'contacted' ? 'bg-blue-400' :
                      s === 'qualified' ? 'bg-orange-400' : 'bg-green-400'
                    )} />
                    <span className="text-[10px] uppercase font-bold text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-48 flex items-end gap-4 px-2">
              {[stats.new, stats.contacted, stats.qualified, stats.won].map((val, i) => {
                const max = Math.max(stats.new, stats.contacted, stats.qualified, stats.won, 1);
                const height = (val / max) * 100;
                const colors = ['bg-blue-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500'];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex flex-col items-center">
                       <div
                        className={cn("w-full rounded-t-lg transition-all duration-1000 ease-out relative", colors[i])}
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {val} Leads
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 border-t border-gray-50 pt-4">
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-gray-900">{engagementRate}%</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Engagement Rate</div>
              </div>
              <div className="text-center flex-1 border-x border-gray-50">
                <div className="text-xl font-bold text-gray-900">{stats.totalOpens}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Total Opens</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-gray-900">{stats.totalClicks}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Total Clicks</div>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <span className="text-xs font-semibold text-slate-400">Latest 5</span>
            </div>
            <div className="divide-y divide-gray-50">
              {recentLeads.length > 0 ? recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.businessCategory} • {new Date(lead.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                    lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                    lead.status === 'contacted' ? 'bg-blue-50 text-blue-700' :
                    lead.status === 'qualified' ? 'bg-orange-50 text-orange-700' :
                    lead.status === 'customer' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                  )}>
                    {lead.status}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-500">
                  <p className="font-semibold text-slate-900">Your lead inventory is empty.</p>
                  <p className="mt-1 text-sm">Start with one clear ICP brief and build from there.</p>
                  <button type="button" onClick={() => onSelectRecentSearch?.('')} className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700">Find your first leads</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Engagement Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Outreach Impact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 opacity-70" />
                  <span className="text-sm opacity-90">Email Opens</span>
                </div>
                <span className="font-bold">{stats.totalOpens}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 opacity-70" />
                  <span className="text-sm opacity-90">Link Clicks</span>
                </div>
                <span className="font-bold">{stats.totalClicks}</span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-[10px] uppercase font-bold opacity-60 mb-2">Top Categories</div>
                <div className="space-y-2">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-xs truncate max-w-[120px]">{cat}</span>
                      <span className="text-xs font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSelectRecentSearch?.('')}
                className="rounded-xl bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50 group"
              >
                <SearchIcon className="mx-auto mb-2 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                <span className="text-[10px] font-bold uppercase text-slate-500">New search</span>
              </button>
              <button onClick={() => onNavigateToView?.('saved')} className="rounded-xl bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50 group">
                <Briefcase className="mx-auto mb-2 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Saved leads</span>
              </button>
              <button onClick={() => onNavigateToView?.('campaigns')} className="rounded-xl bg-slate-50 p-3 text-center transition-colors hover:bg-blue-50 group">
                <SendIcon className="mx-auto mb-2 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                <span className="text-[10px] font-bold uppercase text-slate-500">Campaigns</span>
              </button>
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Recent Searches
            </h3>
            <div className="space-y-3">
              {sortedRecentSearches.length > 0 ? sortedRecentSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => onSelectRecentSearch && onSelectRecentSearch(search.query)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <div className="truncate pr-4">
                    <p className="text-sm font-semibold text-gray-900 truncate">{search.query}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date(search.timestamp).toLocaleDateString()} • {search.resultsCount || 0} Results</p>
                  </div>
                  <SearchIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-600 shrink-0" />
                </button>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4 italic">No recent searches</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl border", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>

      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{title}</div>
      </div>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
