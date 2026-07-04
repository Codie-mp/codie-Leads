"use client";
import React, { useState } from 'react';
import { useStore } from '@/store/useLeadStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Send, 
  Mail, 
  Phone, 
  Linkedin, 
  MoreVertical, 
  Trash2, 
  Play, 
  Pause, 
  Users,
  ChevronRight,
  Clock,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Campaign, Lead } from '@/lib/schema';
import { Modal } from './ui/Modal';
import { toast } from 'sonner';

export function CampaignsView() {
  const { campaigns, leads, deleteCampaign, updateLead, deleteLead, addCampaign } = useStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'tasks'>('campaigns');

  const tasks = leads.filter(l => 
    l.campaignId && 
    l.sequence && 
    (l.sequence as any).step <= (campaigns.find(c => c.id === l.campaignId)?.steps.length || 0)
  ).sort((a, b) => {
    const sequenceA = a.sequence as any;
    const sequenceB = b.sequence as any;
    const dateA = sequenceA?.nextActionDate ? new Date(sequenceA.nextActionDate) : new Date(0);
    const dateB = sequenceB?.nextActionDate ? new Date(sequenceB.nextActionDate) : new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
    }
  };

  const handleNextStep = async (lead: Lead, campaign: Campaign) => {
    const leadSeq = lead.sequence as any;
    const currentStepIndex = (leadSeq?.step || 1) - 1;
    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex >= campaign.steps.length) {
      // Sequence completed
      await updateLead(lead.id!, {
        status: 'contacted',
        sequence: {
          ...leadSeq,
          step: campaign.steps.length + 1,
          nextAction: 'Sequence Completed',
          nextActionDate: undefined
        } as any
      });
      toast.success(`${lead.name} completed the sequence!`);
    } else {
      const nextStep = campaign.steps[nextStepIndex];
      const nextActionDate = new Date();
      nextActionDate.setDate(nextActionDate.getDate() + (nextStep.day - (campaign.steps[currentStepIndex]?.day || 0)));

      await updateLead(lead.id!, {
        sequence: {
          step: nextStepIndex + 1,
          nextAction: `Send ${nextStep.type.charAt(0).toUpperCase() + nextStep.type.slice(1)}`,
          nextActionDate: nextActionDate.toISOString()
        } as any
      });
      toast.success(`Moved ${lead.name} to Step ${nextStepIndex + 1}`);
    }
  };

  const handleProcessAll = async (campaign: Campaign, campaignLeads: Lead[]) => {
    setIsProcessingAll(true);
    toast.promise(
      new Promise(async (resolve) => {
        for (const lead of campaignLeads) {
          await handleNextStep(lead, campaign);
          await new Promise(r => setTimeout(r, 300)); // Small delay for effect
        }
        resolve(true);
      }),
      {
        loading: 'Processing sequence for all leads...',
        success: 'All leads moved to next step!',
        error: 'Failed to process some leads'
      }
    );
    setIsProcessingAll(false);
  };

  if (selectedCampaignId) {
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    const campaignLeads = leads.filter(l => l.campaignId === selectedCampaignId);

    if (!campaign) {
      setSelectedCampaignId(null);
      return null;
    }

    const stats = {
      total: campaignLeads.length,
      active: campaignLeads.filter(l => (l.sequence?.step || 1) <= campaign.steps.length).length,
      completed: campaignLeads.filter(l => (l.sequence?.step || 1) > campaign.steps.length).length,
      contacted: campaignLeads.filter(l => l.status === 'contacted').length,
    };

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCampaignId(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
              <p className="text-sm text-gray-500">{campaign.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleProcessAll(campaign, campaignLeads)}
              disabled={isProcessingAll || campaignLeads.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              Process All Next Steps
            </button>
          </div>
        </div>

        {/* Campaign Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: stats.active, icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Contacted', value: stats.contacted, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm">Campaign Leads</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
              </div>
              <div className="divide-y divide-gray-100">
                {campaignLeads.map(lead => {
                  const currentStep = lead.sequence?.step || 1;
                  const isCompleted = currentStep > campaign.steps.length;
                  const progress = Math.min((currentStep / campaign.steps.length) * 100, 100);

                  return (
                    <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 text-sm">{lead.name}</div>
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : "bg-blue-600")}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">
                              {isCompleted ? 'Completed' : `Step ${currentStep}/${campaign.steps.length}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!isCompleted && (
                          <button 
                            onClick={() => handleNextStep(lead, campaign)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                          >
                            <Play className="w-3 h-3" />
                            Next Step
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            await updateLead(lead.id!, { 
                              campaignId: null,
                              sequence: null
                            } as any);
                            toast.success('Removed from campaign');
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove from campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {campaignLeads.length === 0 && (
                  <div className="p-12 text-center text-gray-400 italic text-sm">
                    No leads in this campaign yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Sequence Steps
              </h3>
              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {campaign.steps.map((step, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={cn(
                      "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border z-10",
                      step.type === 'email' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                      step.type === 'linkedin' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                      step.type === 'call' ? 'bg-green-50 border-green-100 text-green-600' :
                      'bg-gray-50 border-gray-100 text-gray-600'
                    )}>
                      {step.type === 'email' && <Mail className="w-4 h-4" />}
                      {step.type === 'linkedin' && <Linkedin className="w-4 h-4" />}
                      {step.type === 'call' && <Phone className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900 text-sm">Day {step.day}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}</div>
                      </div>
                      {step.template && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 relative group">
                          <div className="line-clamp-3 italic">"{step.template}"</div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(step.template!);
                              toast.success('Template copied to clipboard');
                            }}
                            className="absolute top-2 right-2 p-1 bg-white border border-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy Template"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Campaign Health
              </h3>
              <p className="text-xs text-blue-100 mb-4 opacity-80">Your campaign is performing above average for this niche.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span>Open Rate</span>
                  <span className="font-bold">64%</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[64%]" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Reply Rate</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[12%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outreach Campaigns</h2>
          <p className="text-sm text-gray-500">Automate your multi-step sales sequences.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'campaigns' ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'tasks' ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Tasks
              {tasks.length > 0 && (
                <span className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[8px]",
                  activeTab === 'tasks' ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                )}>
                  {tasks.length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {activeTab === 'campaigns' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const campaignLeads = leads.filter(l => l.campaignId === campaign.id);
            return (
              <motion.div
                key={campaign.id}
                layout
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-5 border-b border-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCampaign(campaign.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{campaign.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{campaign.description || 'No description'}</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{campaignLeads.length} Leads</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{campaign.steps.length} Steps</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sequence Steps</div>
                    <div className="flex items-center gap-1">
                      {campaign.steps.map((step, i) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border",
                              step.type === 'email' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                              step.type === 'linkedin' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                              step.type === 'call' ? 'bg-green-50 border-green-100 text-green-600' :
                              'bg-gray-50 border-gray-100 text-gray-600'
                            )} title={`${step.type} on Day ${step.day}`}>
                              {step.type === 'email' && <Mail className="w-4 h-4" />}
                              {step.type === 'linkedin' && <Linkedin className="w-4 h-4" />}
                              {step.type === 'call' && <Phone className="w-4 h-4" />}
                            </div>
                            <span className="text-[8px] font-bold text-gray-400">D{step.day}</span>
                          </div>
                          {i < campaign.steps.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-gray-300 mb-4" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {campaignLeads.slice(0, 3).map((lead, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {lead.name.charAt(0)}
                      </div>
                    ))}
                    {campaignLeads.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-400">
                        +{campaignLeads.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedCampaignId(campaign.id!)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Manage <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {campaigns.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Campaigns Yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">
                Create your first sequence to start automating your outreach, Habibi.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Get Started
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Pending Outreach Tasks</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Due Today</span>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.map(lead => {
                const campaign = campaigns.find(c => c.id === lead.campaignId);
                const currentStep = lead.sequence?.step || 1;
                const stepDetails = campaign?.steps[currentStep - 1];

                if (!campaign || !stepDetails) return null;

                return (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        stepDetails.type === 'email' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                        stepDetails.type === 'linkedin' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                        stepDetails.type === 'call' ? 'bg-green-50 border-green-100 text-green-600' :
                        'bg-gray-50 border-gray-100 text-gray-600'
                      )}>
                        {stepDetails.type === 'email' && <Mail className="w-5 h-5" />}
                        {stepDetails.type === 'linkedin' && <Linkedin className="w-5 h-5" />}
                        {stepDetails.type === 'call' && <Phone className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{lead.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="font-medium text-blue-600">{campaign.name}</span>
                          <span>•</span>
                          <span>Step {currentStep}: {stepDetails.type.charAt(0).toUpperCase() + stepDetails.type.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stepDetails.template && (
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(stepDetails.template!);
                            toast.success('Template copied');
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                          title="Copy Template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleNextStep(lead, campaign)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <div className="p-20 text-center text-gray-400 italic">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                  <p className="text-sm mt-2">No pending tasks for today. Wallah great job!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateCampaignModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

function CreateCampaignModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([{ day: 1, type: 'email' as const, template: '' }]);

  const CAMPAIGN_TEMPLATES = [
    {
      name: 'Cold Outreach (Standard)',
      description: 'A balanced 4-step sequence for initial contact.',
      steps: [
        { day: 1, type: 'email', template: 'Hi {{name}},\n\nI saw your business {{company}} and was impressed by your reviews. We help companies like yours with...' },
        { day: 3, type: 'linkedin', template: 'Hi {{name}}, I sent you an email a couple of days ago about {{company}}. Would love to connect here as well!' },
        { day: 7, type: 'email', template: 'Hi {{name}},\n\nJust following up on my previous email. Did you have a chance to look at it?' },
        { day: 14, type: 'call', template: 'Call script: Mention the previous emails and ask for a 5-min chat.' }
      ]
    },
    {
      name: 'LinkedIn First (Social)',
      description: 'Focus on building connection before emailing.',
      steps: [
        { day: 1, type: 'linkedin', template: 'Hi {{name}}, love what you are doing at {{company}}. Let\'s connect!' },
        { day: 4, type: 'email', template: 'Hi {{name}}, we connected on LinkedIn recently. I wanted to share something that might help {{company}}...' },
        { day: 10, type: 'linkedin', template: 'Hey {{name}}, just saw your latest post. Great insights!' }
      ]
    },
    {
      name: 'Aggressive Follow-up',
      description: 'High frequency sequence for urgent leads.',
      steps: [
        { day: 1, type: 'email', template: 'Urgent: Question about {{company}}' },
        { day: 2, type: 'call', template: 'Direct follow up call.' },
        { day: 4, type: 'email', template: 'Second follow up.' },
        { day: 6, type: 'linkedin', template: 'Final touchpoint.' }
      ]
    }
  ];

  const handleLoadTemplate = (templateIndex: number) => {
    const template = CAMPAIGN_TEMPLATES[templateIndex];
    setName(template.name);
    setDescription(template.description);
    setSteps(template.steps as any);
    toast.success(`Loaded ${template.name} template`);
  };

  const handleAddStep = () => {
    const lastDay = steps[steps.length - 1]?.day || 0;
    setSteps([...steps, { day: lastDay + 2, type: 'email', template: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const { addCampaign } = useStore();

  const handleSave = async () => {
    if (!name) return toast.error('Name is required');
    
    try {
      await addCampaign({
        name,
        description,
        steps,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('Campaign created successfully!');
      onClose();
      setName('');
      setDescription('');
      setSteps([{ day: 1, type: 'email', template: '' }]);
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Campaign" maxWidth="max-w-2xl">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
          <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Quick Start: Load Template</label>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => handleLoadTemplate(i)}
                className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Campaign Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 Real Estate Outreach"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the goal of this campaign?"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-20"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-700">Sequence Steps</label>
            <button 
              onClick={handleAddStep}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Step
            </button>
          </div>
          
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {i + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Day</span>
                      <input 
                        type="number" 
                        value={step.day}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[i].day = parseInt(e.target.value);
                          setSteps(newSteps);
                        }}
                        className="w-12 px-2 py-1 rounded border border-gray-200 text-sm"
                      />
                    </div>
                    <select 
                      value={step.type}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[i].type = e.target.value as any;
                        setSteps(newSteps);
                      }}
                      className="px-2 py-1 rounded border border-gray-200 text-sm bg-white"
                    >
                      <option value="email">Email</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="call">Call</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => handleRemoveStep(i)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {(step.type === 'email' || step.type === 'linkedin') && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message Template</label>
                    <textarea 
                      value={step.template}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[i].template = e.target.value;
                        setSteps(newSteps);
                      }}
                      placeholder="Enter your message template here..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none h-20"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </Modal>
  );
}
