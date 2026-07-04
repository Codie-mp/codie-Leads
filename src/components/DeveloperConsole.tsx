"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Key, Copy, RefreshCw, Trash2, Plus, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export function DeveloperConsole() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/companyAdmin/api-keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setApiKeys(await res.json());
      }
    } catch (err) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/companyAdmin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: 'Production API Key' })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNewKey(data.key);
      fetchKeys();
      toast.success('API Key generated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any applications using it will immediately lose access.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/companyAdmin/api-keys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      toast.success('API Key revoked');
      fetchKeys();
    } catch (err) {
      toast.error('Failed to revoke key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Developer API Access</h3>
            <p className="text-sm text-gray-500">Generate API keys for programmatic access to your leads</p>
          </div>
        </div>
        <button 
          onClick={handleGenerateKey}
          className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition-colors text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Generate New Key
        </button>
      </div>

      {newKey && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Your New API Key</h4>
              <p className="text-sm text-yellow-700 mt-1 mb-3">
                Please copy this key and store it somewhere safe. For security reasons, <strong>we cannot show it to you again</strong>.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-white border border-yellow-300 px-3 py-2 rounded text-sm text-gray-900 select-all font-mono">
                  {newKey}
                </code>
                <button onClick={() => copyToClipboard(newKey)} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium text-sm transition-colors">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2">
        {loading ? (
          <div className="flex justify-center py-4"><RefreshCw className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No API keys generated yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{key.name || 'API Key'}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` · Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          API endpoint: <code>/api/v1/leads</code>. Send your API key in the Authorization header as <code>Bearer sk_YOUR_KEY</code>.
        </p>
      </div>
    </div>
  );
}
