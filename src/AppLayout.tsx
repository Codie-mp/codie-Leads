"use client";
import { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsTable } from './components/ResultsTable';
import { CategoryManager } from './components/CategoryManager';
import { IntentSearch } from './components/IntentSearch';
import { SavedLeadsView } from './components/SavedLeadsView';
import { SettingsView } from './components/SettingsView';
import { BillingView } from './components/BillingView';
import { ResultsSkeleton } from './components/ResultsSkeleton';
import { searchPlaces, PlaceResult, SearchFilters } from './services/gemini';
import { motion } from 'motion/react';
import { Map, Zap, Database, Search as SearchIcon, Settings, LayoutDashboard, Send, Target, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { Logo } from './components/Logo';
import { WelcomePopup } from './components/WelcomePopup';
import { DashboardView } from './components/DashboardView';
import { CampaignsView } from './components/CampaignsView';
import { ScrapeView } from './components/ScrapeView';
import { NotificationBell } from './components/NotificationBell';

import { useStore } from './store/useLeadStore';

import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function AppLayout() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'search' | 'saved' | 'settings' | 'dashboard' | 'campaigns' | 'scrape' | 'billing'>('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as any;
    if (viewParam && ['search', 'saved', 'settings', 'dashboard', 'campaigns', 'scrape', 'billing'].includes(viewParam)) {
      setView(viewParam);
    }
  }, []);

  const { isLoaded, fetchData } = useStore();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetch('/api/billing/subscription', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setSubscription(data))
        .catch(console.error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) {
      fetchData();
    }
  }, [isLoaded, fetchData]);

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setIsLoading(true);
    setPlaces([]);
    setHasSearched(true);
    try {
      const result = await searchPlaces(query, filters, (streamedPlaces) => {
        setPlaces(streamedPlaces);
      });
      setPlaces(result.places);
      
      // Save recent search
      import('./store/useLeadStore').then(({ useStore }) => {
        useStore.getState().addRecentSearch({
          query,
          filters,
          timestamp: new Date(),
          resultsCount: result.places.length
        }).catch(err => console.error("Could not save recent search", err));
      });
      
    } catch (error) {
      console.error(error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadList = (loadedPlaces: PlaceResult[]) => {
    setPlaces(loadedPlaces);
    setHasSearched(true);
    setView('search'); // Switch back to search view when loading a list
  };

  const handleIntentQuerySelect = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans selection:bg-blue-200">
      <Toaster position="top-center" richColors />
      <WelcomePopup />

      {/* Subscription Expiry Banner */}
      {subscription?.status === 'active' && subscription?.expires_at && (
        (() => {
          const daysLeft = Math.ceil((new Date(subscription.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0 && daysLeft <= 7) {
            return (
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-center text-sm font-medium text-yellow-800 z-50 relative">
                <AlertCircle className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Your subscription expires in {daysLeft} days. 
                <button onClick={() => setView('billing')} className="ml-2 underline font-bold text-yellow-900">Renew now</button>
              </div>
            );
          }
          return null;
        })()
      )}

      {/* Expired Subscription Overlay */}
      {subscription && (subscription.status === 'expired' || subscription.status === 'cancelled') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Expired</h2>
            <p className="text-gray-600 mb-6">
              Your subscription has ended. Please renew to continue accessing the platform and your saved leads.
            </p>
            <button 
              onClick={() => {
                setView('billing');
                // We'll close the overlay temporarily to let them use the billing page
                // Ideally we'd wrap only the protected views, but for now we set the view
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Go to Billing
            </button>
          </div>
        </div>
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[30%] rounded-full bg-yellow-200/30 blur-3xl" />
      </div>

      {/* Navigation / Header */}
      <div className="relative z-20 container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('search')}>
          <Logo />
        </div>
        
        <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setView('dashboard')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'dashboard' 
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setView('search')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'search' 
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <SearchIcon className="w-4 h-4" />
            Search
          </button>
          <button
            onClick={() => setView('scrape')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'scrape' 
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Target className="w-4 h-4" />
            ICP Scraper
          </button>
          <button
            onClick={() => setView('saved')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'saved' 
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Database className="w-4 h-4" />
            Saved Leads
          </button>
          <button
            onClick={() => setView('campaigns')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'campaigns' 
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Send className="w-4 h-4" />
            Campaigns
          </button>
            <button
              onClick={() => setView('settings')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
                view === 'settings' ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={() => setView('billing')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all",
                view === 'billing' ? "bg-white shadow-sm text-emerald-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Zap className="w-4 h-4" /> Billing
            </button>
            <NotificationBell />
          {!!user?.isSuperAdmin && (
            <button
              onClick={() => router.push('/superadmin')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white shadow-sm ring-1 ring-black/5 hover:bg-gray-800 transition-all ml-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Super Admin
            </button>
          )}
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-20">
        {view === 'dashboard' ? (
          <DashboardView onSelectRecentSearch={(q) => {
            setSearchQuery(q);
            setView('search');
          }} />
        ) : view === 'search' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 mt-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
                  Public Data,
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-blue-500 to-cyan-500">
                  Wallah Simple.
                </span>
              </h1>
              
              <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                The ultimate hack for GTM Engineers to find leads on Maps. 
                Just type, search, and export. <span className="font-semibold text-blue-600">Yalla</span>, let's get to work.
              </p>
            </motion.div>

            <IntentSearch onSelectQuery={handleIntentQuerySelect} />

            <SearchForm onSearch={handleSearch} isLoading={isLoading} initialQuery={searchQuery} />

            {isLoading && places.length === 0 && <ResultsSkeleton />}

            {hasSearched && !isLoading && places.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center mt-12 text-gray-400"
              >
                <p>Mafish results, <span className="font-medium">Habibi</span>. Try tweaking your search.</p>
              </motion.div>
            )}

            {places.length > 0 && <ResultsTable places={places} isLoading={isLoading} />}
            
            {!hasSearched && !isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center"
              >
                <div className="p-6 rounded-2xl bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Map className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Official Maps Data</h3>
                  <p className="text-sm text-gray-500">Straight from Google. Wallah accurate.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Export Fast</h3>
                  <p className="text-sm text-gray-500">CSV, Excel, or JSON. Khalas, you're done.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-yellow-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Full Option</h3>
                  <p className="text-sm text-gray-500">Ratings, websites, and phones. Everything you need, Boss.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : view === 'saved' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8"
          >
            <SavedLeadsView />
          </motion.div>
        ) : view === 'campaigns' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8"
          >
            <CampaignsView />
          </motion.div>
        ) : view === 'scrape' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8"
          >
            <ScrapeView onNavigateToSaved={() => setView('saved')} />
          </motion.div>
        ) : view === 'settings' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8"
          >
            <SettingsView />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8"
          >
            <BillingView />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400">
        <p>
          Crafted with 💜 by{' '}
          <a 
            href="https://codiemarket.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
          >
            Codie
          </a>
        </p>
      </footer>
    </div>
  );
}

function Star({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
