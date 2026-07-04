import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Webhook, Save } from 'lucide-react';
import { toast } from 'sonner';

export function CrmIntegrations() {
  const [hubspotKey, setHubspotKey] = useState('');
  const [salesforceKey, setSalesforceKey] = useState('');
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // Load CRM Integrations
      const crmRes = await fetch('/api/companyAdmin/crm', { headers: { 'Authorization': `Bearer ${token}` }});
      if (crmRes.ok) {
        const data = await crmRes.json();
        const hs = data.find((d: any) => d.provider === 'hubspot');
        const sf = data.find((d: any) => d.provider === 'salesforce');
        if (hs) setHubspotKey(hs.api_key);
        if (sf) setSalesforceKey(sf.api_key);
      }

      // Load Webhooks
      const whRes = await fetch('/api/webhooks', { headers: { 'Authorization': `Bearer ${token}` }});
      if (whRes.ok) {
        setWebhooks(await whRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveCrm = async (provider: string, apiKey: string) => {
    if (!apiKey) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/companyAdmin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ provider, apiKey, isActive: true })
      });
      if (!res.ok) throw new Error();
      toast.success(`${provider} integration saved`);
    } catch (err) {
      toast.error(`Failed to save ${provider}`);
    }
  };

  const addWebhook = async () => {
    if (!newWebhookUrl) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: newWebhookUrl, events: ['lead.created'] })
      });
      if (!res.ok) throw new Error();
      toast.success('Webhook added');
      setNewWebhookUrl('');
      loadData();
    } catch (err) {
      toast.error('Failed to add webhook');
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      toast.success('Webhook removed');
      loadData();
    } catch (err) {
      toast.error('Failed to delete webhook');
    }
  };

  return (
    <div className="space-y-6">
      {/* CRM Integrations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">CRM Sync</h3>
            <p className="text-sm text-gray-500">Push leads directly to your CRM</p>
          </div>
        </div>
        
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HubSpot Access Token</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={hubspotKey}
                onChange={(e) => setHubspotKey(e.target.value)}
                placeholder="Enter HubSpot Private App Token"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button onClick={() => saveCrm('hubspot', hubspotKey)} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salesforce API Token</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={salesforceKey}
                onChange={(e) => setSalesforceKey(e.target.value)}
                placeholder="Enter Salesforce Bearer Token"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button onClick={() => saveCrm('salesforce', salesforceKey)} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Webhooks</h3>
              <p className="text-sm text-gray-500">Send real-time updates to your external systems</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="url"
            value={newWebhookUrl}
            onChange={e => setNewWebhookUrl(e.target.value)}
            placeholder="https://your-domain.com/webhook"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button onClick={addWebhook} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{wh.url}</div>
                <div className="text-xs text-gray-500 mt-1">Events: {(wh.events || []).join(', ')}</div>
              </div>
              <button onClick={() => deleteWebhook(wh.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {webhooks.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No webhooks configured</p>
          )}
        </div>
      </div>
    </div>
  );
}
