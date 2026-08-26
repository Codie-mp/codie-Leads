"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, Pencil, Trash2, CheckCircle2, XCircle,
  Users, Building2, PaintBucket, CreditCard, BarChart3, Activity,
  ChevronRight, X, Loader2, AlertTriangle, CheckCheck, Ban,
  TrendingUp, Coins, Globe, Settings, RefreshCw, Eye, EyeOff, Server, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { R2AccountsTab } from '../components/R2AccountsTab';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────
interface PricingPlan {
  id: string; name: string; monthlyPrice: number;
  yearlyPrice: number; creditsPerMonth: number;
  maxMembers: number;
  description?: string; active: boolean;
}
interface CreditPackage {
  id: string; name: string; price: number;
  credits: number; description?: string; active: boolean;
}
interface AIModel {
  id: string; name: string; provider: string;
  costPer1kTokensIn: number; costPer1kTokensOut: number;
  profitMultiplier: number; active: boolean;
}
interface Company {
  id: string; name: string; subscriptionTier: string;
  creditsBalance: number; active: boolean; createdAt: string;
  userCount?: number; leadCount?: number;
}
interface CompanyDetail {
  company: any; users: any[]; leadStats: any;
  campaignStats: any; subscriptions: any[]; recentActivity: any[];
}
interface User {
  id: string; email: string; firstName?: string; lastName?: string;
  role: string; companyName: string; companyId: string;
  isVerified: boolean; isSuperAdmin: boolean; createdAt: string;
}
interface Subscription {
  id: string; companyId: string; companyName: string; planName?: string;
  status: string; paymentProofUrl?: string; billingCycle?: string;
  createdAt: string; expiresAt?: string;
}
interface Stats {
  totalCompanies: number; totalUsers: number; totalLeads: number;
  activeCompanies: number; totalCreditsInSystem: number; pendingSubscriptions: number;
}
interface PlatformSettings {
  platform_name?: string; primary_color?: string; font_family?: string; logo_url?: string;
}

// ── API Helper ─────────────────────────────────────────────────────────────
const api = async (path: string, options?: RequestInit) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`/api/superadmin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    
    // Automatically logout if 401
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    throw new Error(err.error || 'Request failed');
  }
  const data = await res.json();
  // Handle raw MySQL query responses which return [rows, fields]
  if (Array.isArray(data) && data.length === 2 && Array.isArray(data[0]) && Array.isArray(data[1])) {
    return data[0];
  }
  return data;
};

// ── Sub-components ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`text-sm font-semibold ${color} mb-1`}>{label}</div>
    <div className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

const Badge = ({ value, map }: { value: string; map: Record<string, string> }) => {
  const cls = map[value] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{value}</span>;
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

// ── Company Detail Modal ───────────────────────────────────────────────────
const CompanyDetailModal = ({ companyId, onClose }: { companyId: string; onClose: () => void }) => {
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [grantAmount, setGrantAmount] = useState('');
  const [grantReason, setGrantReason] = useState('');
  const [deductAmount, setDeductAmount] = useState('');

  useEffect(() => {
    api(`/companies/${companyId}`)
      .then(setDetail)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleGrant = async () => {
    if (!grantAmount) return;
    try {
      await api('/credits/grant', { method: 'POST', body: JSON.stringify({ companyId, amount: parseInt(grantAmount), reason: grantReason || 'Admin grant' }) });
      toast.success(`Granted ${grantAmount} credits`);
      setGrantAmount(''); setGrantReason('');
      api(`/companies/${companyId}`).then(setDetail);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeduct = async () => {
    if (!deductAmount) return;
    try {
      await api('/credits/deduct', { method: 'POST', body: JSON.stringify({ companyId, amount: parseInt(deductAmount), reason: 'Admin deduction' }) });
      toast.success(`Deducted ${deductAmount} credits`);
      setDeductAmount('');
      api(`/companies/${companyId}`).then(setDetail);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleToggleActive = async () => {
    if (!detail?.company) return;
    const newState = !detail.company.active;
    try {
      await api(`/companies/${companyId}`, { method: 'PUT', body: JSON.stringify({ active: newState }) });
      toast.success(newState ? 'Company activated' : 'Company suspended');
      api(`/companies/${companyId}`).then(setDetail);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Company Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : !detail ? (
          <div className="p-8 text-center text-gray-500">Failed to load company details.</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Company Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{detail.company?.name || 'Unknown'}</h3>
                <p className="text-gray-500 mt-1 text-sm">ID: {companyId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge value={detail.company?.subscription_tier || 'free'} map={{ starter: 'bg-blue-100 text-blue-800', pro: 'bg-purple-100 text-purple-800', enterprise: 'bg-yellow-100 text-yellow-800', free: 'bg-gray-100 text-gray-700' }} />
                  <Badge value={detail.company?.active ? 'active' : 'suspended'} map={statusColors} />
                </div>
              </div>
              <button
                onClick={handleToggleActive}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${detail.company?.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {detail.company?.active ? <><Ban className="w-4 h-4 inline mr-1" />Suspend</> : <><CheckCircle2 className="w-4 h-4 inline mr-1" />Activate</>}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Credits Balance" value={detail.company?.credits_balance ?? 0} color="text-blue-600" />
              <StatCard label="Total Leads" value={(detail.leadStats as any)?.total_leads ?? 0} color="text-green-600" />
              <StatCard label="Campaigns" value={(detail.campaignStats as any)?.total_campaigns ?? 0} color="text-purple-600" />
              <StatCard label="Team Members" value={detail.users?.length ?? 0} color="text-orange-600" />
            </div>

            {/* Lead Breakdown */}
            {detail.leadStats && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Lead Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div><div className="text-xl font-bold text-gray-900">{(detail.leadStats as any).new_leads ?? 0}</div><div className="text-gray-500">New</div></div>
                  <div><div className="text-xl font-bold text-gray-900">{(detail.leadStats as any).contacted_leads ?? 0}</div><div className="text-gray-500">Contacted</div></div>
                  <div><div className="text-xl font-bold text-gray-900">{(detail.leadStats as any).leads_last_30d ?? 0}</div><div className="text-gray-500">Last 30 Days</div></div>
                </div>
              </div>
            )}

            {/* Credit Controls */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Coins className="w-4 h-4 text-blue-600" /> Credit Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Grant Credits</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" placeholder="Amount" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button onClick={handleGrant} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="text" placeholder="Reason (optional)" value={grantReason} onChange={e => setGrantReason(e.target.value)} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Deduct Credits</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" placeholder="Amount" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button onClick={handleDeduct} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-gray-600" /> Team Members ({detail.users?.length ?? 0})</h4>
              {detail.users?.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">No team members</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {detail.users?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{u.email}</td>
                          <td className="px-4 py-2 text-gray-500">{u.first_name} {u.last_name}</td>
                          <td className="px-4 py-2 capitalize text-gray-600">{u.role}</td>
                          <td className="px-4 py-2">{u.is_verified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Subscriptions */}
            {detail.subscriptions?.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Subscription History</h4>
                <div className="space-y-2">
                  {detail.subscriptions.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      <div>
                        <span className="font-semibold text-gray-800">{s.plan_name || s.plan_id || 'Unknown plan'}</span>
                        <span className="text-gray-500 ml-2">({s.billing_cycle || 'monthly'})</span>
                      </div>
                      <Badge value={s.status || 'unknown'} map={statusColors} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'subscriptions' | 'plans' | 'credit-packages' | 'ai-models' | 'theming' | 'activity-logs' | 'r2'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({});
  const [activity, setActivity] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({ name: '', monthlyPrice: 0, yearlyPrice: 0, creditsPerMonth: 0, maxMembers: 1, description: '' });

  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [isCreditPackageModalOpen, setIsCreditPackageModalOpen] = useState(false);
  const [newCreditPackageData, setNewCreditPackageData] = useState({ name: '', price: 0, credits: 0, description: '' });

  const [isAIModelModalOpen, setIsAIModelModalOpen] = useState(false);
  const [newAIModelData, setNewAIModelData] = useState({ name: '', provider: '', costPer1kTokensIn: 0, costPer1kTokensOut: 0, profitMultiplier: 3.0 });

  const { logout } = useAuth();
  const router = useRouter();

  const loadStats = useCallback(() => {
    api('/stats').then(setStats).catch(e => toast.error(e.message));
  }, []);

  const loadTabData = useCallback(async (tab: string) => {
    setLoadingTab(true);
    try {
      switch (tab) {
        case 'overview': loadStats(); break;
        case 'companies': setCompanies(await api('/companies')); break;
        case 'users': setUsers(await api('/users')); break;
        case 'subscriptions': setSubscriptions(await api('/subscriptions')); break;
        case 'plans': setPlans(await api('/pricing-plans')); break;
        case 'credit-packages': setCreditPackages(await api('/credit-packages')); break;
        case 'ai-models': setAiModels(await api('/ai-models')); break;
        case 'theming': setSettings(await api('/platform-settings')); break;
        case 'activity-logs': setActivity(await api('/activity')); break;
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingTab(false);
    }
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  const handleSavePlan = async (plan: PricingPlan) => {
    setIsLoading(true);
    try {
      await api(`/pricing-plans/${plan.id}`, { method: 'PUT', body: JSON.stringify(plan) });
      toast.success(`Plan "${plan.name}" updated`);
    } catch (e: any) { toast.error(e.message); } finally { setIsLoading(false); }
  };

  const handleSaveCreditPackage = async (pkg: CreditPackage) => {
    setIsLoading(true);
    try {
      await api(`/credit-packages/${pkg.id}`, { method: 'PUT', body: JSON.stringify(pkg) });
      toast.success(`Package "${pkg.name}" updated`);
    } catch (e: any) { toast.error(e.message); } finally { setIsLoading(false); }
  };

  const handleSaveAIModel = async (model: AIModel) => {
    setIsLoading(true);
    try {
      await api(`/ai-models/${model.id}`, { method: 'PUT', body: JSON.stringify(model) });
      toast.success(`Model "${model.name}" updated`);
    } catch (e: any) { toast.error(e.message); } finally { setIsLoading(false); }
  };

  const handleApproveSub = async (sub: Subscription) => {
    const creditsMap: Record<string, number> = { starter: 2500, pro: 12500, enterprise: 50000 };
    const planName = sub.planName || 'starter';
    try {
      await api(`/subscriptions/${sub.id}/approve`, { method: 'PUT', body: JSON.stringify({ creditsToGrant: creditsMap[planName] || 2500, planName }) });
      toast.success('Subscription approved — credits granted');
      setSubscriptions(await api('/subscriptions'));
      loadStats();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRejectSub = async (subId: string, reason: string) => {
    try {
      await api(`/subscriptions/${subId}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });
      toast.success('Subscription rejected');
      setSubscriptions(await api('/subscriptions'));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await api('/platform-settings', { method: 'PUT', body: JSON.stringify(settings) });
      toast.success('Platform settings saved');
    } catch (e: any) { toast.error(e.message); } finally { setIsLoading(false); }
  };

  const handleToggleCompany = async (id: string, active: boolean) => {
    try {
      await api(`/companies/${id}`, { method: 'PUT', body: JSON.stringify({ active: !active }) });
      toast.success(!active ? 'Company activated' : 'Company suspended');
      setCompanies(await api('/companies'));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      if (updates.delete) {
        await api(`/users/${userId}`, { method: 'DELETE' });
        toast.success('User deleted successfully');
      } else {
        await api(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) });
        toast.success('User updated successfully');
      }
      setUsers(await api('/users'));
    } catch (e: any) { toast.error(e.message); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'plans', label: 'Plans', icon: TrendingUp },
    { id: 'credit-packages', label: 'Credit Packages', icon: Coins },
    { id: 'ai-models', label: 'AI Models', icon: Server },
    { id: 'theming', label: 'Platform Theming', icon: PaintBucket },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Super Admin Control Panel</h1>
            <p className="text-xs text-gray-500">Full platform control — handle with care</p>
          </div>
        </div>
        <button onClick={() => { loadStats(); loadTabData(activeTab); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
                {tab.id === 'subscriptions' && (stats?.pendingSubscriptions ?? 0) > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats?.pendingSubscriptions}
                  </span>
                )}
              </button>
            );
          })}
          
          <div className="mt-auto px-5 pb-6">
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {loadingTab && (
            <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
                <StatCard label="Total Companies" value={stats?.totalCompanies ?? '—'} color="text-blue-600" sub={`${stats?.activeCompanies ?? 0} active`} />
                <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} color="text-purple-600" />
                <StatCard label="Total Leads" value={stats?.totalLeads ?? '—'} color="text-green-600" />
                <StatCard label="Credits in System" value={stats?.totalCreditsInSystem?.toLocaleString() ?? '—'} color="text-orange-600" />
                <StatCard label="Pending Subscriptions" value={stats?.pendingSubscriptions ?? '—'} color="text-red-600" sub="Awaiting approval" />
                <StatCard label="Active Subscriptions" value={stats?.activeCompanies ?? '—'} color="text-teal-600" sub="Paying customers" />
              </div>
              {(stats?.pendingSubscriptions ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-yellow-800">{stats?.pendingSubscriptions} subscription(s) awaiting approval</div>
                      <div className="text-sm text-yellow-700">Review and approve payment proofs to activate subscriptions</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('subscriptions')} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center gap-1">
                    Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── COMPANIES ── */}
          {activeTab === 'companies' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Companies ({companies.length})</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Company', 'Plan', 'Credits', 'Users', 'Leads', 'Status', 'Created', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {companies.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No companies found</td></tr>
                    ) : companies.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900 text-sm">{c.name}</td>
                        <td className="px-5 py-3">
                          <Badge value={c.subscriptionTier || (c as any).subscription_tier || 'free'} map={{ starter: 'bg-blue-100 text-blue-800', pro: 'bg-purple-100 text-purple-800', enterprise: 'bg-yellow-100 text-yellow-800', free: 'bg-gray-100 text-gray-700' }} />
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700 font-mono">{(c.creditsBalance ?? (c as any).credits_balance ?? 0).toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{c.userCount ?? (c as any).user_count ?? 0}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{c.leadCount ?? (c as any).lead_count ?? 0}</td>
                        <td className="px-5 py-3">
                          <Badge value={c.active ? 'active' : 'suspended'} map={statusColors} />
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(c.createdAt || (c as any).created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedCompanyId(c.id)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <button onClick={() => handleToggleCompany(c.id, c.active)} className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded transition-colors ${c.active ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}>
                              {c.active ? <><Ban className="w-3 h-3" /> Suspend</> : <><CheckCircle2 className="w-3 h-3" /> Activate</>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Users ({users.length})</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Email', 'Name', 'Company', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {users.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{u.email}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{u.firstName || (u as any).first_name} {u.lastName || (u as any).last_name}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{(u as any).company_name || '—'}</td>
                        <td className="px-5 py-3">
                          <select
                            defaultValue={u.role}
                            onChange={e => handleUpdateUser(u.id, { role: e.target.value })}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          >
                            {['viewer', 'editor', 'manager', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          {u.isVerified || (u as any).is_verified
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <button onClick={() => handleUpdateUser(u.id, { isVerified: true })} className="text-xs text-yellow-600 hover:text-yellow-800 font-semibold underline">Verify</button>
                          }
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt || (u as any).created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => { if(confirm('Delete this user permanently?')) handleUpdateUser(u.id, { delete: true }); }}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {activeTab === 'subscriptions' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
              </div>
              {subscriptions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No subscriptions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map(s => (
                    <div key={s.id} className={`bg-white rounded-xl border shadow-sm p-5 ${s.status === 'pending' ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{(s as any).company_name || s.companyId}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            Plan: <span className="font-semibold capitalize">{s.planName || (s as any).plan_name || (s as any).plan_id || 'Unknown'}</span>
                            &nbsp;·&nbsp;{(s as any).billing_cycle || 'monthly'}
                            &nbsp;·&nbsp;Submitted {new Date((s as any).created_at || s.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge value={s.status} map={statusColors} />
                      </div>
                      {(s as any).payment_proof_url && (
                        <div className="mt-3">
                          <a href={(s as any).payment_proof_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View Payment Proof
                          </a>
                        </div>
                      )}
                      {s.status === 'pending' && (
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => handleApproveSub(s)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                            <CheckCheck className="w-4 h-4" /> Approve & Grant Credits
                          </button>
                          <button onClick={() => { const r = prompt('Rejection reason:'); if(r !== null) handleRejectSub(s.id, r); }} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREDIT PACKAGES ── */}
          {activeTab === 'credit-packages' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Credit Packages</h2>
                <button
                  onClick={() => setIsCreditPackageModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Package
                </button>
              </div>
              <div className="space-y-4">
                {creditPackages.map(pkg => (
                  <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                        <Badge value={pkg.active ? 'active' : 'inactive'} map={{ active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600' }} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveCreditPackage(pkg)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Save</button>
                        <button onClick={async () => { await api(`/credit-packages/${pkg.id}`, { method: 'DELETE' }); setCreditPackages(await api('/credit-packages')); toast.success('Package archived'); }} className="text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Archive</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Price ($)</label>
                        <input type="number" value={pkg.price} onChange={e => setCreditPackages(creditPackages.map(p => p.id === pkg.id ? { ...p, price: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Credits</label>
                        <input type="number" value={pkg.credits} onChange={e => setCreditPackages(creditPackages.map(p => p.id === pkg.id ? { ...p, credits: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <input type="text" value={pkg.description || ''} onChange={e => setCreditPackages(creditPackages.map(p => p.id === pkg.id ? { ...p, description: e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AI MODELS ── */}
          {activeTab === 'ai-models' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Models</h2>
                <button
                  onClick={() => setIsAIModelModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Model
                </button>
              </div>
              <div className="space-y-4">
                {aiModels.map(model => (
                  <div key={model.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{model.name}</h3>
                        <Badge value={model.active ? 'active' : 'inactive'} map={{ active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600' }} />
                        <Badge value={model.provider} map={{ openai: 'bg-indigo-100 text-indigo-800', anthropic: 'bg-orange-100 text-orange-800', google: 'bg-blue-100 text-blue-800' }} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveAIModel(model)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Save</button>
                        <button onClick={async () => { await api(`/ai-models/${model.id}`, { method: 'DELETE' }); setAiModels(await api('/ai-models')); toast.success('Model archived'); }} className="text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Archive</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provider</label>
                        <input type="text" value={model.provider} onChange={e => setAiModels(aiModels.map(m => m.id === model.id ? { ...m, provider: e.target.value } : m))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Cost / 1k In ($)</label>
                        <input type="number" step="0.0001" value={model.costPer1kTokensIn} onChange={e => setAiModels(aiModels.map(m => m.id === model.id ? { ...m, costPer1kTokensIn: +e.target.value } : m))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Cost / 1k Out ($)</label>
                        <input type="number" step="0.0001" value={model.costPer1kTokensOut} onChange={e => setAiModels(aiModels.map(m => m.id === model.id ? { ...m, costPer1kTokensOut: +e.target.value } : m))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Profit Multiplier (e.g. 3.0 = 3x)</label>
                        <input type="number" step="0.1" value={model.profitMultiplier} onChange={e => setAiModels(aiModels.map(m => m.id === model.id ? { ...m, profitMultiplier: +e.target.value } : m))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLANS ── */}
          {activeTab === 'plans' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Plan
                </button>
              </div>
              <div className="space-y-4">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        <Badge value={plan.active ? 'active' : 'inactive'} map={{ active: 'bg-green-100 text-green-800', inactive: 'bg-gray-100 text-gray-600' }} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSavePlan(plan)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Save</button>
                        <button onClick={async () => { await api(`/pricing-plans/${plan.id}`, { method: 'DELETE' }); setPlans(await api('/pricing-plans')); toast.success('Plan archived'); }} className="text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Archive</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Monthly Price ($)</label>
                        <input type="number" value={plan.monthlyPrice} onChange={e => setPlans(plans.map(p => p.id === plan.id ? { ...p, monthlyPrice: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Yearly Price ($)</label>
                        <input type="number" value={plan.yearlyPrice} onChange={e => setPlans(plans.map(p => p.id === plan.id ? { ...p, yearlyPrice: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Credits / Month</label>
                        <input type="number" value={plan.creditsPerMonth} onChange={e => setPlans(plans.map(p => p.id === plan.id ? { ...p, creditsPerMonth: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Max Team Members</label>
                        <input type="number" min="1" value={plan.maxMembers || 1} onChange={e => setPlans(plans.map(p => p.id === plan.id ? { ...p, maxMembers: +e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <input type="text" value={plan.description || ''} onChange={e => setPlans(plans.map(p => p.id === plan.id ? { ...p, description: e.target.value } : p))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && !loadingTab && (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No plans yet. Create your first plan.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── THEMING ── */}
          {activeTab === 'theming' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Platform Theming</h2>
                <button onClick={handleSaveSettings} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
                  <input type="text" value={settings.platform_name || ''} onChange={e => setSettings(s => ({ ...s, platform_name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
                  <input type="text" placeholder="https://..." value={settings.logo_url || ''} onChange={e => setSettings(s => ({ ...s, logo_url: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={settings.primary_color || '#2563EB'} onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))} className="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer p-1" />
                    <input type="text" value={settings.primary_color || '#2563EB'} onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))} className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Font</label>
                  <select value={settings.font_family || 'inter'} onChange={e => setSettings(s => ({ ...s, font_family: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="inter">Inter (Default)</option>
                    <option value="roboto">Roboto</option>
                    <option value="poppins">Poppins</option>
                    <option value="outfit">Outfit</option>
                    <option value="opensans">Open Sans</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-400">Controls the global font family across the entire platform.</p>
                </div>
              </div>
              {/* Preview */}
              {settings.primary_color && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-4">Live Preview</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: settings.primary_color }} />
                    <button className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: settings.primary_color }}>
                      Sample Button
                    </button>
                    <span className="text-sm font-semibold" style={{ color: settings.primary_color }}>
                      {settings.platform_name || 'Codie Leads'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── R2 POOL MANAGER ── */}
          {activeTab === 'r2' && (
            <R2AccountsTab />
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === 'activity-logs' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Activity Feed</h2>
              {activity.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No activity recorded yet</p>
                  <p className="text-sm mt-1">Activity is logged as users interact with the platform</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['User', 'Company', 'Action', 'Entity', 'Time'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {activity.map((a, index) => (
                        <tr key={a.id || index} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm text-gray-700">{a.user_email || a.user_id || '—'}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{a.company_name || '—'}</td>
                          <td className="px-5 py-3 text-sm font-mono text-blue-700">{a.action}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{a.entity_type && `${a.entity_type}${a.entity_id ? ` #${a.entity_id.substring(0,8)}` : ''}`}</td>
                          <td className="px-5 py-3 text-xs text-gray-400">{new Date(a.time || a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Company Detail Modal */}
      {selectedCompanyId && (
        <CompanyDetailModal
          companyId={selectedCompanyId}
          onClose={() => { setSelectedCompanyId(null); loadTabData('companies'); }}
        />
      )}
      {/* Add Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Plan</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name</label>
                <input type="text" placeholder="e.g. Pro" value={newPlanData.name} onChange={(e) => setNewPlanData({...newPlanData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Price ($)</label>
                  <input type="number" min="0" value={newPlanData.monthlyPrice} onChange={(e) => setNewPlanData({...newPlanData, monthlyPrice: +e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Yearly Price ($)</label>
                  <input type="number" min="0" value={newPlanData.yearlyPrice} onChange={(e) => setNewPlanData({...newPlanData, yearlyPrice: +e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Credits Per Month</label>
                  <input type="number" min="0" value={newPlanData.creditsPerMonth} onChange={(e) => setNewPlanData({...newPlanData, creditsPerMonth: +e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Team Members</label>
                  <input type="number" min="1" value={newPlanData.maxMembers} onChange={(e) => setNewPlanData({...newPlanData, maxMembers: +e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input type="text" placeholder="Optional brief description" value={newPlanData.description} onChange={(e) => setNewPlanData({...newPlanData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsPlanModalOpen(false);
                  setNewPlanData({ name: '', monthlyPrice: 0, yearlyPrice: 0, creditsPerMonth: 0, maxMembers: 1, description: '' });
                }}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newPlanData.name.trim()) {
                    toast.error("Plan name cannot be empty");
                    return;
                  }
                  try {
                    await api('/pricing-plans', { method: 'POST', body: JSON.stringify(newPlanData) });
                    setPlans(await api('/pricing-plans'));
                    toast.success('Plan created');
                    setIsPlanModalOpen(false);
                    setNewPlanData({ name: '', monthlyPrice: 0, yearlyPrice: 0, creditsPerMonth: 0, maxMembers: 1, description: '' });
                  } catch (e: any) { toast.error(e.message); }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
