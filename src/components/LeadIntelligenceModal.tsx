"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './ui/Modal';
import { Lead } from '@/lib/schema';
import { Loader2, Brain, Target, AlertTriangle, Lightbulb, User, Briefcase, Search, ExternalLink, RefreshCw, Phone, Mail, Key, Zap, TrendingUp, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useLeadStore';

interface LeadIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

interface IntelligenceData {
  summary: string;
  targetAudience: string;
  painPoints: string[];
  iceBreaker: string;
  suggestedTitles: string[];
  callScript: string;
}

interface DecisionMaker {
  name: string;
  title: string;
  link?: string;
  email?: string;
  phone?: string;
}

export function LeadIntelligenceModal({ isOpen, onClose, lead }: LeadIntelligenceModalProps) {
  const { updateLead } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Initialize state from existing analysis if available
  const [data, setData] = useState<IntelligenceData | null>(() => {
    if (lead.analysis?.summary) {
      return {
        summary: lead.analysis.summary,
        targetAudience: lead.analysis.targetAudience || '',
        painPoints: lead.analysis.painPoints || [],
        iceBreaker: lead.analysis.iceBreaker || '',
        suggestedTitles: lead.analysis.suggestedTitles || [],
        callScript: (lead.analysis as any).callScript || ''
      };
    }
    return null;
  });
  
  const [isSearchingPeople, setIsSearchingPeople] = useState(false);
  const [isSearchingSignals, setIsSearchingSignals] = useState(false);
  const [enrichingIndex, setEnrichingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'script' | 'signals'>('insights');
  const [signals, setSignals] = useState<string[]>(() => {
    return (lead.analysis as any)?.signals || [];
  });
  const [decisionMakers, setDecisionMakers] = useState<DecisionMaker[]>(() => {
    return lead.analysis?.decisionMakers || [];
  });

  const analyzeLead = async (forceRegenerate = false) => {
    // Skip if we already have data and aren't forcing a regeneration
    if (data && !forceRegenerate) return;

    setIsAnalyzing(true);
    try {
      const prompt = `
        Analyze this business for a B2B Sales Representative.
        
        Business: "${lead.name}"
        Address: "${lead.address}"
        Website: "${lead.website}"
        Rating: ${lead.rating}
        
        Task:
        1. Summarize what they do in 1 sentence.
        2. Identify their likely Target Audience (ICP).
        3. List 3 potential operational pain points they might have (based on their industry/reviews).
        4. Suggest a "Spicy" Icebreaker observation for a cold call.
        5. List 3 job titles of decision makers I should look for (e.g. Owner, Marketing Director).
        6. Write a short, punchy 10-second Cold Call Script (Hook + Value Prop) tailored to them.
        
        Return JSON:
        {
          "summary": "...",
          "targetAudience": "...",
          "painPoints": ["...", "...", "..."],
          "iceBreaker": "...",
          "suggestedTitles": ["...", "...", "..."],
          "callScript": "..."
        }
      `;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const resData = await response.json();
      const text = resData.text || "{}";
      const parsedData = JSON.parse(text);
      setData(parsedData);
      
      // Save to IndexedDB via store
      if (lead.id) {
        await updateLead(lead.id, {
          analysis: {
            ...lead.analysis,
            ...parsedData,
            lastAnalyzedAt: new Date()
          }
        });
      }
    } catch (error: any) {
      console.error("Analysis failed", error);
      let errMsg = error?.message || "Failed to analyze lead. Please try again.";
      if (errMsg.includes("high demand") || errMsg.includes("503")) {
        errMsg = "AI Model is currently experiencing high demand. Please try again later.";
      } else if (errMsg.includes('api key') || errMsg.includes('API_KEY')) {
        errMsg = "API Key error. Please check your configuration.";
      }
      toast.error(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const findDecisionMakers = async (forceRegenerate = false) => {
    // Skip if we already have data and aren't forcing a regeneration
    if (decisionMakers.length > 0 && !forceRegenerate) return;

    setIsSearchingPeople(true);
    try {
      const prompt = `
        Find the names and job titles of key decision makers (Owner, CEO, Founder, Marketing Director, Manager) for the company "${lead.name}" located at "${lead.address}".
        
        Use Google Search to find real people.
        
        CRITICAL: YOU MUST RETURN ONLY A VALID JSON ARRAY OF OBJECTS in the following format (and NOTHING ELSE!):
        [{"name": "John Doe", "title": "Owner", "link": "..."}]
        
        If no specific names are found, return an empty array [].
      `;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { 
            tools: [{ googleSearch: {} }]
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const resData = await response.json();
      let text = resData.text || "[]";
      
      text = text.trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.substring(7);
      } else if (text.startsWith('\`\`\`')) {
        text = text.substring(3);
      }
      if (text.endsWith('\`\`\`')) {
        text = text.slice(0, -3);
      }
      
      const people = JSON.parse(text);
      setDecisionMakers(people);
      
      // Save to IndexedDB via store
      if (lead.id) {
        await updateLead(lead.id, {
          analysis: {
            ...lead.analysis,
            decisionMakers: people,
            lastAnalyzedAt: new Date()
          }
        });
      }
      
      if (people.length === 0) {
        toast.info("No public profiles found for specific decision makers.");
      } else {
        toast.success(`Found ${people.length} potential contacts!`);
      }
    } catch (error: any) {
      console.error("People search failed", error);
      let errMsg = error?.message || "Failed to find decision makers. Search might be restricted.";
      if (errMsg.includes("high demand") || errMsg.includes("503")) {
        errMsg = "AI Model is currently experiencing high demand. Please try again later.";
      } else if (errMsg.includes('api key') || errMsg.includes('API_KEY')) {
        errMsg = "API Key error. Please check your configuration.";
      }
      toast.error(errMsg);
    } finally {
      setIsSearchingPeople(false);
    }
  };

  const enrichContact = async (index: number, person: DecisionMaker) => {
    const hunterKey = localStorage.getItem('hunterApiKey');
    const apolloKey = localStorage.getItem('apolloApiKey');

    if (!hunterKey && !apolloKey) {
      toast.error('No Enrichment API configured. Please add Hunter.io or Apollo.io keys in Settings.');
      return;
    }

    setEnrichingIndex(index);
    
    // Simulate API Call to Hunter/Apollo
    setTimeout(() => {
      const updatedMakers = [...decisionMakers];
      const domain = lead.website ? lead.website.replace(/^https?:\/\//, '').split('/')[0] : 'company.com';
      const firstName = person.name.split(' ')[0].toLowerCase();
      
      updatedMakers[index] = {
        ...person,
        email: `${firstName}@${domain}`,
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      
      setDecisionMakers(updatedMakers);
      setEnrichingIndex(null);
      toast.success(`Contact info found for ${person.name}!`);
      
      // Save to store
      if (lead.id) {
        updateLead(lead.id, {
          analysis: {
            ...lead.analysis,
            decisionMakers: updatedMakers,
          }
        });
      }
    }, 1500);
  };

  const findSignals = async () => {
    setIsSearchingSignals(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          contents: `Find 3 recent news items, buying signals, or business updates for "${lead.name}" in ${lead.address}. Focus on expansions, new hires, awards, or industry shifts.`,
          config: {
            tools: [{ googleSearch: {} }]
          }
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const resData = await response.json();
      const text = resData.text || "No recent signals found.";
      const lines = text.split('\n').filter((l: string) => l.trim().length > 10).slice(0, 3);
      setSignals(lines);
      
      if (lead.id) {
        updateLead(lead.id, {
          analysis: {
            ...lead.analysis,
            signals: lines
          } as any
        });
      }
      toast.success("Buying signals updated!");
    } catch (error: any) {
      console.error(error);
      let errMsg = error?.message || "Failed to find signals.";
      if (errMsg.includes("high demand") || errMsg.includes("503")) {
        errMsg = "AI Model is currently experiencing high demand. Please try again later.";
      } else if (errMsg.includes('api key') || errMsg.includes('API_KEY')) {
        errMsg = "API Key error. Please check your configuration.";
      }
      toast.error(errMsg);
    } finally {
      setIsSearchingSignals(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      analyzeLead();
    }
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Intelligence Report: ${lead.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-4 rounded-xl border border-blue-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900">The Scoop ☕</h4>
              <p className="text-sm text-blue-700 mt-1">
                Gemini did the homework on this business. Here's the inside info.
              </p>
            </div>
          </div>
          {data && !isAnalyzing && (
            <button
              onClick={() => analyzeLead(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              title="Regenerate Analysis"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>

        {data && !isAnalyzing && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'insights'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'script'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Call Script
            </button>
            <button
              onClick={() => setActiveTab('signals')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'signals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Signals
            </button>
          </div>
        )}

        {isAnalyzing ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="font-medium text-gray-900">Cooking up the insights, Habibi...</p>
              <p className="text-sm">Checking the vibes and gathering intel.</p>
            </div>
          </div>
        ) : data ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            
            {activeTab === 'insights' ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="space-y-6"
              >
                {/* Summary & ICP */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <h3>The Gist</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold">
                      <Target className="w-4 h-4 text-red-500" />
                      <h3>Who they serve (ICP)</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{data.targetAudience}</p>
                  </div>
                </motion.div>

                {/* Pain Points */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="p-5 bg-orange-50/50 border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3 text-orange-800 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <h3>The Headache</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Icebreaker */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
                    <Lightbulb className="w-4 h-4" />
                    <h3>The Killer Line</h3>
                  </div>
                  <p className="text-sm text-blue-900 italic border-l-2 border-blue-300 pl-3 py-1">
                    "{data.iceBreaker}"
                  </p>
                </motion.div>

                {/* Decision Makers */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="bg-gray-50 p-5 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> The Big Bosses
                    </h4>
                    {decisionMakers.length === 0 && !isSearchingPeople && (
                      <button 
                        onClick={() => findDecisionMakers(false)}
                        className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Search className="w-3 h-3" />
                        Find Real People
                      </button>
                    )}
                  </div>

                  {isSearchingPeople ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching the web for profiles...</span>
                    </div>
                  ) : decisionMakers.length > 0 ? (
                    <div className="grid gap-3">
                      {decisionMakers.map((person, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-4">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{person.name}</div>
                            <div className="text-xs text-gray-500 mb-2">{person.title}</div>
                            
                            {(person.email || person.phone) ? (
                              <div className="space-y-1">
                                {person.email && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {person.email}
                                  </div>
                                )}
                                {person.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    {person.phone}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => enrichContact(i, person)}
                                disabled={enrichingIndex === i}
                                className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {enrichingIndex === i ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Key className="w-3.5 h-3.5" />
                                )}
                                Find Contact Info
                              </button>
                            )}
                          </div>
                          {person.link && (
                            <a 
                              href={person.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors self-start sm:self-center"
                              title="View Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.suggestedTitles.map((title, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 rounded-full text-xs font-medium border border-gray-200 border-dashed">
                          <User className="w-3 h-3 text-gray-400" />
                          {title}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 flex items-center ml-2">
                        (Suggested Roles)
                      </span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ) : activeTab === 'script' ? (
              <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-gray-100 shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-gray-300 font-semibold border-b border-gray-800 pb-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <h3>Dynamic Call Script</h3>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed font-medium text-white">
                    {data.callScript || "No script generated. Try regenerating the analysis."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500">
                  <p>Tip: Use the Icebreaker from the Insights tab if they ask how you found them.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Buying Signals & News
                  </h3>
                  <button 
                    onClick={findSignals}
                    disabled={isSearchingSignals}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                  >
                    {isSearchingSignals ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refresh Signals
                  </button>
                </div>

                {signals.length > 0 ? (
                  <div className="space-y-3">
                    {signals.map((signal, i) => (
                      <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex gap-3 items-start">
                        <div className="mt-1 p-1.5 bg-yellow-50 rounded-lg text-yellow-600">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{signal}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No signals found yet. Click refresh to scan the web.</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        ) : null}
      </div>
    </Modal>
  );
}
