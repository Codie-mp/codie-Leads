import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, ShieldCheck, Clock, CheckCircle2, AlertCircle, XCircle, ArrowUpRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface PricingPlan {
  id: string; name: string; monthly_price: number;
  yearly_price: number; credits_per_month: number;
  description: string;
}

export function BillingView() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [credits, setCredits] = useState<{ balance: number; history: any[] }>({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);

  // Subscribe state
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isBuyingCredits, setIsBuyingCredits] = useState(false);
  const [creditPackages, setCreditPackages] = useState<PricingPlan[]>([]);

  useEffect(() => {
    loadBillingData().then((fetchedPlans) => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPlan = searchParams.get('plan');
      if (urlPlan && fetchedPlans) {
        const found = fetchedPlans.find((p: any) => p.name.toLowerCase() === urlPlan.toLowerCase());
        if (found) {
          setSelectedPlan(found);
          setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 300);
        }
      }
    });
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [plansRes, subRes, credRes, pkgsRes] = await Promise.all([
        fetch('/api/billing/plans', { headers }),
        fetch('/api/billing/subscription', { headers }),
        fetch('/api/billing/credits', { headers }),
        fetch('/api/billing/credit-packages', { headers })
      ]);

      let fetchedPlans = [];
      if (plansRes.ok) {
        fetchedPlans = await plansRes.json();
        setPlans(fetchedPlans);
      }
      if (pkgsRes.ok) {
        const pkgs = await pkgsRes.json();
        // map credit packages to PricingPlan interface
        setCreditPackages(pkgs.map((p: any) => ({
          id: p.id, name: p.name, monthly_price: p.price, yearly_price: p.price,
          credits_per_month: p.credits, description: p.description
        })));
      }
      if (subRes.ok) setSubscription(await subRes.json());
      if (credRes.ok) setCredits(await credRes.json());
      
      return fetchedPlans;
    } catch (e) {
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !proofUrl) {
      toast.error('Please provide a payment proof URL (e.g. InstaPay screenshot)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          billingCycle: creditPackages.some(p => p.id === selectedPlan.id) ? 'one-time' : billingCycle,
          paymentProofUrl: proofUrl
        })
      });

      if (!res.ok) throw new Error(await res.text());
      
      toast.success('Subscription request submitted successfully!');
      setSelectedPlan(null);
      setProofUrl('');
      loadBillingData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const isPending = subscription?.status === 'pending';
  const isActive = subscription?.status === 'active';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" /> Subscription & Billing
        </h2>
        <p className="text-gray-500 mt-1">Manage your plan, credits, and view billing history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Status */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-400" /> Current Plan Status
          </h3>
          
          {isPending ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-800">Subscription Pending Approval</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You requested the <strong>{subscription.plan_name}</strong> plan ({subscription.billing_cycle}). Our team is verifying your payment proof. This usually takes less than 24 hours.
                  </p>
                </div>
              </div>
            </div>
          ) : isActive ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-green-800">Active Subscription</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You are on the <strong>{subscription.plan_name}</strong> plan ({subscription.billing_cycle}).
                      </p>
                    </div>
                    {subscription.expires_at && (
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-semibold uppercase tracking-wider">Expires</div>
                        <div className="font-medium text-green-800">{new Date(subscription.expires_at).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h4 className="font-bold text-gray-700">No Active Subscription</h4>
              <p className="text-sm text-gray-500 mt-1">Choose a plan below to unlock premium features and credits.</p>
            </div>
          )}
        </div>

        {/* Credit Balance */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
          <Zap className="absolute -right-6 -top-6 w-32 h-32 text-white opacity-10" />
          <h3 className="font-medium text-blue-100 mb-1">Available Credits</h3>
          <div className="text-5xl font-bold mb-2">{credits.balance.toLocaleString()}</div>
          <p className="text-sm text-blue-200 mb-6">Credits are used for extracting leads, emails, and phone numbers.</p>
          <button 
            onClick={() => { setIsBuyingCredits(true); setSelectedPlan(null); }}
            className="w-full bg-white/20 hover:bg-white/30 transition-colors text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            Buy More Credits <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plans Section */}
      {!isPending && (
        <div>
          <div className="flex items-center justify-between mb-6 mt-10">
            <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-semibold">
              <button 
                onClick={() => { setIsBuyingCredits(false); setBillingCycle('monthly'); }} 
                className={`px-4 py-1.5 rounded-md transition-colors ${!isBuyingCredits && billingCycle === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => { setIsBuyingCredits(false); setBillingCycle('yearly'); }} 
                className={`px-4 py-1.5 rounded-md transition-colors ${!isBuyingCredits && billingCycle === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Yearly <span className="text-green-600 text-xs ml-1">-20%</span>
              </button>
              <button 
                onClick={() => { setIsBuyingCredits(true); setSelectedPlan(null); }} 
                className={`px-4 py-1.5 rounded-md transition-colors ml-2 ${isBuyingCredits ? 'bg-white shadow-sm text-blue-600' : 'text-blue-500'}`}
              >
                Add-on Credits
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(isBuyingCredits ? creditPackages : plans).map(plan => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-2xl border-2 transition-all p-6 relative ${selectedPlan?.id === plan.id ? 'border-blue-600 shadow-md transform -translate-y-1' : 'border-gray-100 hover:border-blue-200'}`}
              >
                {selectedPlan?.id === plan.id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    Selected
                  </div>
                )}
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                  ${isBuyingCredits ? plan.monthly_price : (billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price)}
                  <span className="text-base font-medium text-gray-500">{isBuyingCredits ? ' flat' : `/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}</span>
                </div>
                <div className="text-sm font-bold text-blue-600 mb-4">{plan.credits_per_month.toLocaleString()} credits</div>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${selectedPlan?.id === plan.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : (isBuyingCredits ? 'Choose Package' : 'Choose Plan')}
                </button>
              </div>
            ))}
          </div>

          {/* Payment Proof Upload Form */}
          {selectedPlan && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-300">
              <h4 className="text-lg font-bold text-blue-900 mb-2">Complete Your Subscription</h4>
              <p className="text-sm text-blue-800 mb-6">
                You selected the <strong>{selectedPlan.name}</strong> {isBuyingCredits ? 'package' : `plan (${billingCycle})`}. Please transfer <strong>${isBuyingCredits ? selectedPlan.monthly_price : (billingCycle === 'monthly' ? selectedPlan.monthly_price : selectedPlan.yearly_price)}</strong> via InstaPay to <code className="bg-white px-2 py-0.5 rounded font-bold">01000000000</code> and provide the receipt URL below.
              </p>
              <div className="max-w-xl">
                <label className="block text-sm font-bold text-blue-900 mb-2">Payment Receipt (Image/PDF Link)</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="url" 
                      placeholder="https://imgur.com/... or Google Drive link" 
                      value={proofUrl}
                      onChange={e => setProofUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSubscribe}
                    disabled={isSubmitting || !proofUrl}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">Our team will verify your payment and activate your plan shortly.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      <div className="mt-12">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Credit History</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {credits.history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No transaction history found.</td>
                </tr>
              ) : (
                credits.history.map((tx: any) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
