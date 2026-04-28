'use client';
import { useState } from 'react';
import { FiLock, FiSave, FiShield, FiUser } from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function AdminSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    
    setLoading(true);
    try {
      await authAPI.changePassword(form);
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to update password'); }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="animate-fk-fade max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Admin Account Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your security and profile details</p>
      </div>

      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-fk-blue text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20">
            {user?.name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <FiLock className="text-fb-blue" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Security & Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
            <div>
              <label className={labelClass}>Current Password</label>
              <input 
                type="password" 
                className={inputClass} 
                value={form.currentPassword}
                onChange={e => setForm({...form, currentPassword: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input 
                type="password" 
                className={inputClass} 
                value={form.newPassword}
                onChange={e => setForm({...form, newPassword: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input 
                type="password" 
                className={inputClass} 
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-3.5 bg-fb-blue text-white font-black rounded-2xl text-sm hover:bg-fb-blue-hover shadow-xl shadow-fb-blue/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <FiSave /> {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Safety Note */}
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
          <FiShield className="text-fb-blue shrink-0 mt-1" size={20} />
          <div>
            <p className="text-sm font-black text-slate-900">Security Tip</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">Ensure your password is at least 8 characters long and contains a mix of letters, numbers, and symbols for maximum security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
