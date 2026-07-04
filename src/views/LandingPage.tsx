"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Building2, Users, Map, Database, Zap, Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetch('/api/public/pricing-plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans selection:bg-blue-200">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px]" />
        <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[30%] rounded-full bg-yellow-200/40 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign In
          </Link>
          <a href="#pricing" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 overflow-hidden">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-8 ring-1 ring-blue-200">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              CodieLead SaaS is Live
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Scale Your Outbound <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-yellow-500 to-orange-500">
                On Autopilot
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Find decision-makers, scrape Google Maps leads instantly, and enrich your B2B contacts with AI-powered intent scoring.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing" className="group w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/login" className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm ring-1 ring-gray-200">
                Book Demo
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 14-day free trial</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative z-10 py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Lead Generation</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Everything a GTM team needs to close more deals, bundled into one powerful platform.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Map className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Maps Extraction</h3>
              <p className="text-gray-600 leading-relaxed">
                Extract thousands of targeted local businesses from Google Maps with emails, phone numbers, and ratings in seconds.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Enrichment</h3>
              <p className="text-gray-600 leading-relaxed">
                Let Gemini 3.1 Pro analyze business websites, find key decision-makers, and generate personalized icebreakers instantly.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Multi-Tenant CRM</h3>
              <p className="text-gray-600 leading-relaxed">
                Isolated workspaces for your team. Advanced RBAC, custom campaigns, and one-click data syncing to HubSpot or Salesforce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 bg-[#F8F9FC]" id="pricing">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Choose the plan that fits your growth. 1 month free when billed annually.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loadingPlans ? (
              <div className="col-span-3 text-center py-12 text-gray-500">Loading plans...</div>
            ) : plans.length > 0 ? (
              plans.map((plan, i) => (
                <div key={plan.id} className={`p-8 rounded-3xl ${plan.name === 'pro' ? 'bg-gray-900 text-white border border-gray-800 shadow-2xl relative transform md:-translate-y-4' : 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-xl'} transition-shadow flex flex-col`}>
                  {plan.name === 'pro' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2 capitalize">{plan.name}</h3>
                  <p className={plan.name === 'pro' ? 'text-gray-400 mb-6' : 'text-gray-500 mb-6'}>{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">${plan.monthly_price}</span>
                    <span className={plan.name === 'pro' ? 'text-gray-400' : 'text-gray-500'}>/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3"><CheckCircle2 className={`w-5 h-5 ${plan.name === 'pro' ? 'text-yellow-500' : 'text-blue-600'}`} /> {plan.credits_per_month.toLocaleString()} Credits / month</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className={`w-5 h-5 ${plan.name === 'pro' ? 'text-yellow-500' : 'text-blue-600'}`} /> {plan.max_members || 1} Team Member{(plan.max_members || 1) !== 1 ? 's' : ''}</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className={`w-5 h-5 ${plan.name === 'pro' ? 'text-yellow-500' : 'text-blue-600'}`} /> Google Maps Scraping</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className={`w-5 h-5 ${plan.name === 'pro' ? 'text-yellow-500' : 'text-blue-600'}`} /> AI Enrichment</li>
                  </ul>
                  <Link href={isAuthenticated ? `/app?view=billing&plan=${plan.name}` : `/register?plan=${plan.name}`} className={`w-full block text-center py-3 px-6 rounded-xl font-bold transition-colors ${plan.name === 'pro' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                    Start with {plan.name}
                  </Link>
                </div>
              ))
            ) : (
              // Fallback cards if DB fails or is empty
              <>
                {/* Starter Plan */}
                <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">Starter</h3>
                  <p className="text-gray-500 mb-6">Perfect for small teams starting outreach.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">$25</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> 1,000 Credits / month</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> Google Maps Scraping</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> 1 Team Member</li>
                  </ul>
                  <Link href={isAuthenticated ? "/app?view=billing&plan=starter" : "/register?plan=starter"} className="w-full block text-center py-3 px-6 rounded-xl font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    Start with Starter
                  </Link>
                </div>
                
                {/* Pro Plan */}
                <div className="p-8 rounded-3xl bg-gray-900 text-white border border-gray-800 shadow-2xl relative flex flex-col transform md:-translate-y-4">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <p className="text-gray-400 mb-6">For scaling GTM teams and agencies.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">$100</span>
                    <span className="text-gray-400">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> 5,000 Credits / month</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> AI Website Enrichment</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> 5 Team Members</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> CRM Integrations</li>
                  </ul>
                  <Link href={isAuthenticated ? "/app?view=billing&plan=pro" : "/register?plan=pro"} className="w-full block text-center py-3 px-6 rounded-xl font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors">
                    Start Free Pro Trial
                  </Link>
                </div>
                
                {/* Enterprise Plan */}
                <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <p className="text-gray-500 mb-6">Custom limits and dedicated support.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">Custom</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> Unlimited Credits</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> Unlimited Team Members</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> Dedicated Account Manager</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600" /> API Access & Webhooks</li>
                  </ul>
                  <Link href={isAuthenticated ? "/app?view=billing&plan=enterprise" : "/register?plan=enterprise"} className="w-full block text-center py-3 px-6 rounded-xl font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    Contact Sales
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
