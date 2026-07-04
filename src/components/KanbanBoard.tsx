import React from 'react';
import { Lead, LeadStatus } from '@/lib/schema';
import { useStore } from '@/store/useLeadStore';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Mail, Phone, Calendar, CheckCircle2, XCircle, Brain } from 'lucide-react';
import { calculateLeadScore, getScoreColor } from '@/lib/scoring';

interface KanbanBoardProps {
  leads: Lead[];
  onDraftEmail: (lead: Lead) => void;
  onAnalyze: (lead: Lead) => void;
}

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
  { id: 'customer', label: 'Customer', color: 'bg-blue-500' },
];

export function KanbanBoard({ leads, onDraftEmail, onAnalyze }: KanbanBoardProps) {
  const { updateLead } = useStore();

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      await updateLead(leadId, { status });
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-8 min-h-[600px]">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter(l => l.status === col.id);
        
        return (
          <div 
            key={col.id}
            className="min-w-[300px] bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="font-semibold text-sm text-gray-700">{col.label}</span>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {colLeads.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="p-3 flex-1 space-y-3">
              <AnimatePresence>
                {colLeads.map((lead) => {
                  const score = calculateLeadScore(lead);
                  const scoreColor = getScoreColor(score);

                  return (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, lead.id!)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -4,
                        transition: { duration: 0.2 }
                      }}
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 cursor-grab active:cursor-grabbing group transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{lead.name}</h4>
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor}`}>
                          {score}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {lead.address || "No address"}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => onAnalyze(lead)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded bg-blue-50/50"
                            title="AI Intelligence"
                          >
                            <Brain className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDraftEmail(lead)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Draft Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-300 font-mono">
                          {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {colLeads.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
