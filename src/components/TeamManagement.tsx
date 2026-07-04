import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Plus, Trash2, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function TeamManagement() {
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer',
    firstName: '',
    lastName: '',
    sendInviteLink: true,
    password: ''
  });

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/company/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch team');
      const data = await res.json();
      setTeam(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/company/team/invite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inviteForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message || 'User invited successfully');
      
      if (data.inviteUrl) {
        // Show invite link so admin can copy it
        prompt("Copy this invite link to send to the user:", data.inviteUrl);
      }
      
      setShowInviteModal(false);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/company/team/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success('Role updated');
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the company?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/company/team/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('User removed');
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Team Management</h3>
            <p className="text-sm text-gray-500">Manage workspace members and roles</p>
          </div>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading team...</td></tr>
            ) : team.map(member => (
              <tr key={member.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {member.firstName?.[0] || member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    value={member.role} 
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(member.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleRemove(member.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={inviteForm.firstName} 
                    onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={inviteForm.lastName} 
                    onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input 
                    type="email" 
                    required
                    value={inviteForm.email} 
                    onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <div className="relative">
                  <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <select 
                    value={inviteForm.role}
                    onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={inviteForm.sendInviteLink}
                    onChange={e => setInviteForm({...inviteForm, sendInviteLink: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Generate Invite Link</span>
                </label>
                
                {!inviteForm.sendInviteLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password *</label>
                    <input 
                      type="text" 
                      required={!inviteForm.sendInviteLink}
                      value={inviteForm.password} 
                      onChange={e => setInviteForm({...inviteForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                      placeholder="e.g. Welcome123!"
                    />
                  </div>
                )}
                {inviteForm.sendInviteLink && (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start gap-2">
                    <LinkIcon className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>An invite link will be generated for you to copy and send to the user so they can set their own password.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Invite User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
