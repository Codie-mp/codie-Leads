import React, { useState, useEffect } from 'react';
import { Save, Key, Database, Mail, Shield, Smartphone, Puzzle, Copy, ExternalLink, Download, TrendingUp, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { TeamManagement } from './TeamManagement';
import { DeveloperConsole } from './DeveloperConsole';
import { CrmIntegrations } from './CrmIntegrations';

export function SettingsView() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [appUrl, setAppUrl] = useState(window.location.origin);
  const [keys, setKeys] = useState({
    hunterApiKey: '',
    apolloApiKey: '',
    hubspotToken: '',
    salesforceToken: '',
  });

  const [weights, setWeights] = useState({
    website: 40,
    phone: 30,
    rating45: 20,
    rating40: 10,
    badRating: -10,
    highPrice: 10
  });

  useEffect(() => {
    // Load existing keys from localStorage
    setKeys({
      hunterApiKey: localStorage.getItem('hunterApiKey') || '',
      apolloApiKey: localStorage.getItem('apolloApiKey') || '',
      hubspotToken: localStorage.getItem('hubspotToken') || '',
      salesforceToken: localStorage.getItem('salesforceToken') || '',
    });

    const savedWeights = localStorage.getItem('scoringWeights');
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('hunterApiKey', keys.hunterApiKey);
    localStorage.setItem('apolloApiKey', keys.apolloApiKey);
    localStorage.setItem('hubspotToken', keys.hubspotToken);
    localStorage.setItem('salesforceToken', keys.salesforceToken);
    localStorage.setItem('scoringWeights', JSON.stringify(weights));
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workspace Settings</h2>
        <p className="text-gray-500 mt-1">Configure external APIs, manage your team, and view billing details.</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Team Management */}
          <TeamManagement />

          {/* Subscription & Billing */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Subscription & Billing</h3>
                <p className="text-sm text-gray-500">Manage your plan and credits</p>
              </div>
            </div>
            <div className="pt-2 text-sm text-gray-600 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Current Plan: Starter</p>
                <p className="mt-1">Credits remaining: <span className="font-bold text-emerald-600">--</span></p>
              </div>
              <button 
                onClick={() => toast.info("To upgrade your plan, please contact the Super Admin.")}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Enrichment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Enrichment</h3>
              <p className="text-sm text-gray-500">Find decision makers and verify emails</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hunter.io API Key</label>
              <input
                type="password"
                value={keys.hunterApiKey}
                onChange={(e) => setKeys({ ...keys, hunterApiKey: e.target.value })}
                placeholder="Enter Hunter.io API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used for finding and verifying email addresses.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apollo.io API Key</label>
              <input
                type="password"
                value={keys.apolloApiKey}
                onChange={(e) => setKeys({ ...keys, apolloApiKey: e.target.value })}
                placeholder="Enter Apollo.io API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used for extracting B2B contacts and intent data.</p>
            </div>
          </div>
        </div>

        {/* CRM and Webhooks */}
        {isAdmin && (
          <CrmIntegrations />
        )}

        {/* CodieLeads API Access */}
        {isAdmin && (
          <DeveloperConsole />
        )}
      </div>

      {/* Lead Scoring Configuration */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Lead Scoring Weights</h3>
            <p className="text-sm text-gray-500">Customize how leads are prioritized in your pipeline.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contactability</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Has Website</label>
              <input
                type="number"
                value={weights.website}
                onChange={(e) => setWeights({ ...weights, website: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Has Phone</label>
              <input
                type="number"
                value={weights.phone}
                onChange={(e) => setWeights({ ...weights, phone: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality (Ratings)</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating ≥ 4.5</label>
              <input
                type="number"
                value={weights.rating45}
                onChange={(e) => setWeights({ ...weights, rating45: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating ≥ 4.0</label>
              <input
                type="number"
                value={weights.rating40}
                onChange={(e) => setWeights({ ...weights, rating40: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating &lt; 3.5 (Penalty)</label>
              <input
                type="number"
                value={weights.badRating}
                onChange={(e) => setWeights({ ...weights, badRating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Other Signals</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">High Price Level ($$$+)</label>
              <input
                type="number"
                value={weights.highPrice}
                onChange={(e) => setWeights({ ...weights, highPrice: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Browser Extension */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Browser Extension</h3>
            <p className="text-sm text-gray-500">Collect leads directly from LinkedIn and company websites</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Extension Configuration</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appUrl);
                    toast.success('URL copied to clipboard');
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                  title="Copy App URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Copy this URL into the extension settings to connect it to your Codie Leads instance.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900">Installation Steps:</h4>
              <ol className="text-xs text-gray-600 space-y-2 list-decimal pl-4">
                <li>Download the extension source files.</li>
                <li>Open Chrome and go to <code className="bg-gray-100 px-1 rounded">chrome://extensions</code>.</li>
                <li>Enable <strong>Developer Mode</strong> in the top right.</li>
                <li>Click <strong>Load unpacked</strong> and select the extension folder.</li>
                <li>Click the extension icon and paste the App URL above.</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <Puzzle className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Codie Leads Collector</h4>
            <p className="text-xs text-gray-500 text-center mb-6 max-w-[200px]">
              The official browser companion for GTM Engineers.
            </p>
            <a
              href="/extension/manifest.json"
              target="_blank"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Extension
            </a>
            <p className="text-[10px] text-gray-400 mt-4">
              Version 1.0.0 • Manifest V3
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
