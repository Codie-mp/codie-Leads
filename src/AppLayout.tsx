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
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8fa]/90 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-5">
          <button type="button" className="flex items-center gap-2 self-start" onClick={() => setView('dashboard')} aria-label="Go to workspace overview">
            <Logo />
          </button>

          <div className="w-full overflow-x-auto lg:w-auto">
            <div className="flex min-w-max items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'search', label: 'Find leads', icon: SearchIcon },
                { id: 'scrape', label: 'ICP scraper', icon: Target },
                { id: 'saved', label: 'Saved leads', icon: Database },
                { id: 'campaigns', label: 'Campaigns', icon: Send },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'billing', label: 'Billing', icon: Zap },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id as typeof view)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm",
                    view === id ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              <NotificationBell />
              {!!user?.isSuperAdmin && (
                <button
                  onClick={() => router.push('/superadmin')}
                  className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 sm:px-4 sm:text-sm"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                aria-label="Sign out"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 sm:px-4 sm:text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 pb-20">
        {view === 'dashboard' ? (
          <DashboardView
            onSelectRecentSearch={(q) => {
              setSearchQuery(q);
              setView('search');
            }}
            onNavigateToView={(nextView) => setView(nextView)}
          />
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
              <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700"><Target className="h-3.5 w-3.5" /> Find your next accounts</div>
              <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 md:text-6xl">
                Build an outreach list your team can actually work.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Describe your ideal customer, choose the territory, and let CodieLead surface businesses worth a closer look.
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
                <p>No matches yet. Try widening your ICP or adding another city.</p>
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
                  <h3 className="font-bold text-gray-900 mb-2">Grounded business data</h3>
                  <p className="text-sm text-gray-500">Start with real businesses and useful context.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Clean list handoff</h3>
                  <p className="text-sm text-gray-500">Save, export, or move selected leads to a campaign.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/50 border border-white/50 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-yellow-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Signal before action</h3>
                  <p className="text-sm text-gray-500">Review ratings, websites, and fit before you reach out.</p>
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
