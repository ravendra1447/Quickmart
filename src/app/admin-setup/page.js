'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiShield, FiUser, FiMail, FiLock, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AdminSetup() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'super_admin' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend will only allow this if no admin exists
      const res = await authAPI.register(formData);
      setAuth(res.data.user, res.data.token);
      toast.success('Platform Initialized Successfully!');
      router.push('/admin/dashboard');
    } catch (err) { 
      toast.error(err.message || 'Setup failed. Admin might already exist.'); 
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 transition-all font-medium";

  return (
    <div className="min-h-screen bg-fk-bg flex items-center justify-center p-6">
      <div className="max-w-[500px] w-full bg-white rounded-[40px] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden">
        {/* Header */}
        <div className="bg-fk-blue p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
              <FiShield size={40} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">NearbyDukan Setup</h1>
            <p className="text-white/80 font-bold text-sm uppercase tracking-widest">Initialize Super Admin Account</p>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          <div className="relative group">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fk-blue transition-colors" />
            <input 
              type="text" placeholder="Your Full Name" className={`${inputClass} pl-12`}
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
          </div>

          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fk-blue transition-colors" />
            <input 
              type="email" placeholder="Admin Email Address" className={`${inputClass} pl-12`}
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required 
            />
          </div>

          <div className="relative group">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fk-blue transition-colors" />
            <input 
              type="tel" placeholder="Contact Phone Number" className={`${inputClass} pl-12`}
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required 
            />
          </div>

          <div className="relative group">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fk-blue transition-colors" />
            <input 
              type="password" placeholder="Secure Password" className={`${inputClass} pl-12`}
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" disabled={loading}
              className="w-full py-5 bg-fk-blue text-white font-black rounded-2xl text-lg hover:bg-fk-blue-hover shadow-xl shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Initializing...' : <><FiCheckCircle size={22} /> Complete Setup</>}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest leading-relaxed">
            Note: This setup page is only active when no super admin is present in the system.
          </p>
        </form>
      </div>
    </div>
  );
}
