import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Server, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function R2AccountsTab() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ accountId: '', accessKeyId: '', secretAccessKey: '', bucketName: '', endpoint: '' });

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/superadmin/r2', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAccounts(await res.json());
      }
    } catch (err) {
      toast.error('Failed to load R2 accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/superadmin/r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('R2 Account added successfully');
      setShowAddForm(false);
      setForm({ accountId: '', accessKeyId: '', secretAccessKey: '', bucketName: '', endpoint: '' });
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add R2 account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this R2 account?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/superadmin/r2/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      toast.success('Account deleted');
      fetchAccounts();
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/superadmin/r2/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current })
      });
      if (!res.ok) throw new Error();
      toast.success('Account status updated');
      fetchAccounts();
    } catch (err) {
      toast.error('Failed to update account status');
    }
  };

  if (loading) return <div className="p-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-orange-500" />
            R2 Storage Pool
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage Cloudflare R2 accounts used for distributed storage.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add R2 Account
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">New Cloudflare R2 Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
              <input required type="text" value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 1234567890abcdef" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bucket Name</label>
              <input required type="text" value={form.bucketName} onChange={e => setForm({...form, bucketName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. codieleads-storage" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label>
              <input required type="text" value={form.accessKeyId} onChange={e => setForm({...form, accessKeyId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label>
              <input required type="password" value={form.secretAccessKey} onChange={e => setForm({...form, secretAccessKey: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint (S3 API URL)</label>
              <input required type="url" value={form.endpoint} onChange={e => setForm({...form, endpoint: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="https://<ACCOUNT_ID>.r2.cloudflarestorage.com" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Account</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="col-span-full p-12 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">No R2 accounts configured</h3>
            <p className="text-gray-500 text-sm mt-1">Add an account to enable cloud storage capabilities.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} className={`bg-white rounded-xl border p-5 shadow-sm ${acc.isActive ? 'border-orange-200 ring-1 ring-orange-50' : 'border-gray-200 opacity-75'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${acc.isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{acc.bucketName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${acc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {acc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleActive(acc.id, acc.isActive)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title={acc.isActive ? "Disable" : "Enable"}>
                    {acc.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(acc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account ID:</span>
                  <span className="font-mono text-gray-900 text-xs">{acc.accountId.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Access Key:</span>
                  <span className="font-mono text-gray-900 text-xs">{acc.accessKeyId.substring(0, 8)}...</span>
                </div>
                <div className="flex flex-col mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-xs mb-1">Endpoint:</span>
                  <span className="font-mono text-gray-600 text-xs truncate" title={acc.endpoint}>{acc.endpoint}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
