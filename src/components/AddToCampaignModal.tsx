import React, { useState } from 'react';
import { useStore } from '@/store/useLeadStore';
import { Modal } from './ui/Modal';
import { Send, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddToCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
}

export function AddToCampaignModal({ isOpen, onClose, leadIds }: AddToCampaignModalProps) {
  const { campaigns, bulkUpdateLeads } = useStore();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!selectedCampaignId) return toast.error('Please select a campaign');
    
    setIsSubmitting(true);
    try {
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (!campaign) throw new Error('Campaign not found');

      const firstStep = campaign.steps[0];
      
      await bulkUpdateLeads(leadIds, {
        campaignId: selectedCampaignId,
        sequence: {
          step: 1,
          nextAction: `Step 1: ${firstStep.type.charAt(0).toUpperCase() + firstStep.type.slice(1)}`,
          nextActionDate: new Date()
        } as any
      });

      toast.success(`Added ${leadIds.length} leads to ${campaign.name}`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add leads to campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Campaign" maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">{leadIds.length} Leads Selected</h4>
            <p className="text-xs text-blue-700">Choose a sequence to start the outreach.</p>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id!)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                selectedCampaignId === campaign.id
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  selectedCampaignId === campaign.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                )}>
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{campaign.name}</div>
                  <div className="text-xs text-gray-500">{campaign.steps.length} steps</div>
                </div>
              </div>
              {selectedCampaignId === campaign.id && (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </button>
          ))}

          {campaigns.length === 0 && (
            <div className="py-8 text-center text-gray-400 italic text-sm">
              No campaigns found. Create one first!
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedCampaignId || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
