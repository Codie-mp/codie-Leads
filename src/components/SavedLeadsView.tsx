"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useLeadStore';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Phone, Globe, MapPin, Tag, MoreHorizontal, Mail, TrendingUp, Brain, LayoutGrid, Kanban as KanbanIcon, CheckSquare, Square, Database, MousePointerClick, Eye, Target } from 'lucide-react';
import { LeadStatus, Lead } from '@/lib/schema';
import { OutreachModal } from './OutreachModal';
import { LeadIntelligenceModal } from './LeadIntelligenceModal';
import { AddToCampaignModal } from './AddToCampaignModal';
import { calculateLeadScore, getScoreColor } from '@/lib/scoring';
import { TagManager } from './TagManager';
import { KanbanBoard } from './KanbanBoard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Send, Download, RefreshCw, Inbox, Sparkles, Loader2 } from 'lucide-react';
import { enrichLeadData } from '@/services/gemini';

export function SavedLeadsView() {
  const { leads, deleteLead, updateLead, bulkDeleteLeads, bulkUpdateLeads, addLead } = useStore();
  const [selectedLeadForOutreach, setSelectedLeadForOutreach] = useState<Lead | null>(null);
  const [selectedLeadForIntelligence, setSelectedLeadForIntelligence] = useState<Lead | null>(null);
  const [selectedLeadForCampaign, setSelectedLeadForCampaign] = useState<Lead | null>(null);
  const [isBulkCampaignModalOpen, setIsBulkCampaignModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [extensionLeads, setExtensionLeads] = useState<any[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichingLeadId, setEnrichingLeadId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'scraped'>('all');

  const fetchExtensionLeads = async () => {
    try {
      const response = await fetch('/api/extension/leads');
      if (response.ok) {
        const data = await response.json();
        setExtensionLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch extension leads:", error);
    }
  };

  useEffect(() => {
    fetchExtensionLeads();
    const interval = setInterval(fetchExtensionLeads, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleSyncExtension = async () => {
    if (extensionLeads.length === 0) {
      toast.info("No leads in extension inbox, Habibi.");
      return;
    }

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      for (const extLead of extensionLeads) {
        const newLead: Lead = {
          name: extLead.name,
          status: 'new',
          source: 'manual',
          website: extLead.website || '',
          linkedinUrl: extLead.linkedinUrl || '',
          notes: extLead.notes || `Imported from extension. Title: ${extLead.title || 'N/A'}, Company: ${extLead.company || 'N/A'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['extension']
        };

        await addLead(newLead);
        await fetch(`/api/extension/leads/${extLead.id}`, { method: 'DELETE' });
        syncedCount++;
      }

      toast.success(`Successfully synced ${syncedCount} leads from extension!`);
      fetchExtensionLeads();
      setIsInboxOpen(false);
    } catch (error) {
      toast.error("Failed to sync some leads.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkEnrich = async () => {
    if (selectedLeadIds.size === 0) return;
    
    setIsEnriching(true);
    const leadIds = Array.from(selectedLeadIds);
    let enrichedCount = 0;

    toast.promise(
      (async () => {
        for (const id of leadIds) {
          const lead = leads.find(l => l.id === id);
          if (!lead) continue;

          setEnrichingLeadId(id);
          const enrichment = await enrichLeadData(lead.name, lead.name); // Using name as company fallback
          if (enrichment) {
            await updateLead(id as string, {
              analysis: {
                ...lead.analysis,
                decisionMakers: enrichment.decisionMakers,
                signals: enrichment.signals,
                summary: enrichment.summary
              },
              updatedAt: new Date()
            } as any);
            enrichedCount++;
          }
        }
        setIsEnriching(false);
        setEnrichingLeadId(null);
        setSelectedLeadIds(new Set());
        return enrichedCount;
      })(),
      {
        loading: `Enriching ${leadIds.length} leads with AI...`,
        success: (count) => `Successfully enriched ${count} leads!`,
        error: "Failed to enrich some leads."
      }
    );
  };

  const filteredLeads = leads.filter(lead => {
    if (sourceFilter === 'scraped') {
      return lead.tags && lead.tags.includes('scraped');
    }
    return true;
  });

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">No saved leads yet. Start searching to add some!</p>
      </div>
    );
  }

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
    customer: 'bg-blue-100 text-blue-700',
  };

  const handleSelectAll = () => {
    if (filteredLeads) {
      if (selectedLeadIds.size === filteredLeads.length) {
        setSelectedLeadIds(new Set());
      } else {
        setSelectedLeadIds(new Set(filteredLeads.map(l => l.id!)));
      }
    }
  };

  const toggleLeadSelection = (id: string) => {
    const newSelected = new Set(selectedLeadIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeadIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.size === 0) return;
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteLeads(Array.from(selectedLeadIds));
      setSelectedLeadIds(new Set());
      setIsDeleteModalOpen(false);
      toast.success(`Deleted ${selectedLeadIds.size} leads`);
    } catch (error) {
      toast.error('Failed to delete leads');
    }
  };

  const handleBulkStatusChange = async (status: LeadStatus) => {
    if (selectedLeadIds.size === 0) return;
    try {
      await bulkUpdateLeads(Array.from(selectedLeadIds), { status });
      setSelectedLeadIds(new Set());
      toast.success(`Updated status for ${selectedLeadIds.size} leads`);
    } catch (error) {
      toast.error('Failed to update leads');
    }
  };

  const handlePushToCRM = (lead: Lead) => {
    const hubspotToken = localStorage.getItem('hubspotToken');
    const salesforceToken = localStorage.getItem('salesforceToken');
    
    if (!hubspotToken && !salesforceToken) {
      toast.error('No CRM configured. Please add your API keys in Settings.');
      return;
    }

    // Simulate API Call
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Pushing to CRM...',
        success: () => {
          updateLead(lead.id!, {
            crmData: {
              provider: hubspotToken ? 'hubspot' : 'salesforce',
              id: `crm_${Math.random().toString(36).substr(2, 9)}`,
              url: 'https://app.hubspot.com/contacts/123456/contact/789'
            }
          });
          return `${lead.name} synced to CRM successfully!`;
        },
        error: 'Failed to push to CRM',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Saved Leads ({filteredLeads.length})</h2>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSourceFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                sourceFilter === 'all' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              All Leads
            </button>
            <button
              onClick={() => setSourceFilter('scraped')}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
                sourceFilter === 'scraped' ? "bg-white shadow text-blue-700" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Target className="w-3.5 h-3.5" />
              Scraped
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {extensionLeads.length > 0 && (
            <button
              onClick={() => setIsInboxOpen(true)}
              className="relative flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100 transition-all font-medium text-sm"
            >
              <Inbox className="w-4 h-4" />
              Extension Inbox
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {extensionLeads.length}
              </span>
            </button>
          )}

          {viewMode === 'list' && selectedLeadIds.size > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-blue-700 mr-2">
                {selectedLeadIds.size} selected
              </span>
              <button
                onClick={handleBulkEnrich}
                disabled={isEnriching}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors ml-1"
                title="Bulk Enrich with AI"
              >
                {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </button>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value as LeadStatus);
                    e.target.value = ''; // reset
                  }
                }}
                className="text-xs border-gray-300 rounded-md py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>Set Status...</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="customer">Won</option>
              </select>
              <button
                onClick={() => setIsBulkCampaignModalOpen(true)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors ml-1"
                title="Add Selected to Campaign"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors ml-1"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {viewMode === 'list' && (
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedLeadIds.size > 0 && selectedLeadIds.size === filteredLeads.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
          )}

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
              title="List View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'kanban' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
              title="Kanban Board"
            >
              <KanbanIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard 
          leads={filteredLeads} 
          onDraftEmail={setSelectedLeadForOutreach}
          onAnalyze={setSelectedLeadForIntelligence}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredLeads.map((lead) => {
              const score = calculateLeadScore(lead as any);
              const scoreColor = getScoreColor(score);
              const isSelected = selectedLeadIds.has(lead.id!);

              return (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-5 group relative overflow-hidden",
                    isSelected ? "border-blue-400 ring-1 ring-blue-400" : "border-gray-200"
                  )}
                >
                  {/* Enrichment Loading Overlay */}
                  <AnimatePresence>
                    {enrichingLeadId === lead.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center"
                      >
                        <motion.div
                          animate={{ 
                            rotate: 360,
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            rotate: { repeat: Infinity, duration: 2, ease: "linear" },
                            scale: { repeat: Infinity, duration: 1.5 }
                          }}
                          className="mb-3 text-blue-600"
                        >
                          <Sparkles className="w-8 h-8" />
                        </motion.div>
                        <p className="text-sm font-bold text-gray-900">AI Enrichment...</p>
                        <p className="text-[10px] text-gray-500 mt-1">Gathering intel, Habibi</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute top-4 left-4 z-10">
                    <button
                      onClick={() => toggleLeadSelection(lead.id!)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                     <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreColor}`}>
                        <TrendingUp className="w-3 h-3" />
                        {score}
                     </div>
                  </div>

                  <div className="flex justify-between items-start mb-3 pl-8 pr-16">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1" title={lead.name}>
                        {lead.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                        {lead.businessCategory && lead.businessCategory !== 'N/A' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {lead.businessCategory}
                          </span>
                        )}
                        {lead.businessStatus && lead.businessStatus !== 'N/A' && (
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            lead.businessStatus.toLowerCase().includes('open') 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {lead.businessStatus}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {lead.phone && lead.phone !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.website && lead.website !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                          {lead.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {lead.address && lead.address !== 'N/A' && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2 text-xs">{lead.address}</span>
                      </div>
                    )}
                    {lead.reviewsSummary && lead.reviewsSummary !== 'N/A' && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs italic text-gray-600 line-clamp-2">&quot;{lead.reviewsSummary}&quot;</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <TagManager 
                      leadId={lead.id!} 
                      currentTags={lead.tags || []} 
                    />
                  </div>

                  {/* Engagement & Sequence Stats */}
                  {(lead.engagement || lead.sequence) && (
                    <div className="mb-4 flex flex-wrap gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      {lead.engagement && (
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1" title="Email Opens">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-medium">{lead.engagement.opens}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Link Clicks">
                            <MousePointerClick className="w-3.5 h-3.5 text-green-500" />
                            <span className="font-medium">{lead.engagement.clicks}</span>
                          </div>
                        </div>
                      )}
                      
                      {lead.sequence && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 border-l border-gray-200 pl-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Seq: Step {lead.sequence.step}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedLeadForIntelligence(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        title="AI Deep Dive"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        Analyze
                      </button>
                      <button 
                        onClick={() => setSelectedLeadForOutreach(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </button>
                      <button 
                        onClick={() => handlePushToCRM(lead)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          lead.crmData 
                            ? "bg-green-50 text-green-700 hover:bg-green-100" 
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                        )}
                        title={lead.crmData ? "Synced to CRM" : "Push to CRM"}
                      >
                        <Database className="w-3.5 h-3.5" />
                        {lead.crmData ? 'Synced' : 'CRM'}
                      </button>
                      <button 
                        onClick={() => setSelectedLeadForCampaign(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors"
                        title="Add to Sequence"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Seq
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead.id!, { status: e.target.value as LeadStatus })}
                        className="text-xs border-none bg-transparent text-gray-500 focus:ring-0 cursor-pointer hover:text-gray-900 w-20 text-right"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="lost">Lost</option>
                        <option value="customer">Won</option>
                      </select>
                      <button 
                        onClick={() => deleteLead(lead.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {selectedLeadForOutreach && (
        <OutreachModal 
          isOpen={!!selectedLeadForOutreach}
          onClose={() => setSelectedLeadForOutreach(null)}
          lead={selectedLeadForOutreach}
        />
      )}

      {selectedLeadForIntelligence && (
        <LeadIntelligenceModal
          isOpen={!!selectedLeadForIntelligence}
          onClose={() => setSelectedLeadForIntelligence(null)}
          lead={selectedLeadForIntelligence}
        />
      )}

      {selectedLeadForCampaign && (
        <AddToCampaignModal
          isOpen={!!selectedLeadForCampaign}
          onClose={() => setSelectedLeadForCampaign(null)}
          leadIds={[selectedLeadForCampaign.id!]}
        />
      )}

      {isBulkCampaignModalOpen && (
        <AddToCampaignModal
          isOpen={isBulkCampaignModalOpen}
          onClose={() => {
            setIsBulkCampaignModalOpen(false);
            setSelectedLeadIds(new Set());
          }}
          leadIds={Array.from(selectedLeadIds)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {isInboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-orange-600" />
                  Extension Inbox
                </h3>
                <button onClick={() => setIsInboxOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {extensionLeads.map((extLead) => (
                  <div key={extLead.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{extLead.name}</div>
                      <div className="text-xs text-gray-500">{extLead.title || 'No Title'} @ {extLead.company || 'No Company'}</div>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(extLead.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsInboxOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSyncExtension}
                  disabled={isSyncing}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Import All to Leads
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Selected Leads?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {selectedLeadIds.size} selected leads? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete Leads
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}