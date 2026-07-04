import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Loader2, Lightbulb, Compass, Zap } from 'lucide-react';
import { generateKeywordsFromIntent, generateNicheSuggestions } from '@/services/gemini';
import { cn } from '@/lib/utils';

interface IntentSearchProps {
  onSelectQuery: (query: string) => void;
}

export function IntentSearch({ onSelectQuery }: IntentSearchProps) {
  const [intent, setIntent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [nicheSuggestions, setNicheSuggestions] = useState<{ category: string; niches: string[] }[]>([]);
  const [isLoadingNiches, setIsLoadingNiches] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;

    setIsGenerating(true);
    setGeneratedQueries([]);
    try {
      const queries = await generateKeywordsFromIntent(intent);
      setGeneratedQueries(queries);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExploreNiches = async () => {
    setIsLoadingNiches(true);
    try {
      const suggestions = await generateNicheSuggestions();
      setNicheSuggestions(suggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingNiches(false);
    }
  };

  useEffect(() => {
    if (isOpen && nicheSuggestions.length === 0) {
      handleExploreNiches();
    }
  }, [isOpen]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors",
            isOpen ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
          )}
        >
          <Sparkles className="w-4 h-4" />
          {isOpen ? "Hide AI Assistant" : "Find leads by intent (AI Powered)"}
        </button>

        {isOpen && (
          <button
            onClick={handleExploreNiches}
            disabled={isLoadingNiches}
            className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            {isLoadingNiches ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
            Refresh Suggestions
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6 shadow-sm">
                <form onSubmit={handleGenerate} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe your ideal leads in natural language
                  </label>
                  <div className="relative">
                    <textarea
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="e.g. I'm looking for high-end italian restaurants in New York that might need a new POS system..."
                      className="w-full p-4 pr-12 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px] resize-none text-sm bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !intent.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600/70">
                    <Lightbulb className="w-3 h-3" />
                    <span>Powered by Gemini 3 Flash</span>
                  </div>
                </form>

                {generatedQueries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Suggested Search Queries</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedQueries.map((query, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => onSelectQuery(query)}
                          className="text-left px-4 py-2 bg-white border border-blue-100 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:shadow-md hover:text-blue-700 transition-all flex items-center gap-2 group"
                        >
                          <span>{query}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Compass className="w-3 h-3" />
                  Niche Explorer
                </h4>
                
                <div className="space-y-6">
                  {isLoadingNiches ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-50 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-50 rounded w-2/3"></div>
                      </div>
                    ))
                  ) : (
                    nicheSuggestions.map((suggestion, i) => (
                      <div key={i} className="space-y-2">
                        <div className="text-xs font-bold text-gray-900">{suggestion.category}</div>
                        <div className="flex flex-col gap-1">
                          {suggestion.niches.map((niche, j) => (
                            <button
                              key={j}
                              onClick={() => onSelectQuery(niche)}
                              className="text-left text-[11px] text-gray-500 hover:text-blue-600 hover:underline flex items-center gap-1 group"
                            >
                              <Zap className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {niche}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
