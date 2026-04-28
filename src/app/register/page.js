'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';
  
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', 
    role: isSetup ? 'super_admin' : 'customer' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      
      if (res.data.pendingApproval) {
        toast.success('Registration successful! Please wait for Super Admin approval.', { duration: 6000 });
        router.push('/login');
        return;
      }

      setAuth(res.data.user, res.data.token);
      toast.success('Registration successful!');
      if (res.data.user.role === 'super_admin') router.push('/admin/dashboard');
      else if (res.data.user.role === 'seller') router.push('/seller/dashboard');
      else router.push('/');
    } catch (err) { toast.error(err.message || 'Registration failed'); }
    setLoading(false);
  };

  const inputClass = "w-full px-5 py-4 bg-dark-50 border border-dark-100 rounded-2xl text-dark-900 placeholder-dark-400 focus:bg-white focus:border-[#fb641b] focus:ring-4 focus:ring-[#fb641b]/5 outline-none transition-all font-bold text-sm";
  const labelClass = "text-[10px] font-black text-dark-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-1/3 h-full bg-[#fb641b]/5 -z-10 skew-x-12 translate-x-20"></div>
      <div className="fixed bottom-0 left-0 w-1/4 h-1/2 bg-blue-500/5 -z-10 -skew-x-12 -translate-x-20"></div>

      <div className="max-w-6xl w-full mx-auto px-4 py-12 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Marketing/Visual */}
        <div className="lg:w-1/2 space-y-10 hidden lg:block">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#fb641b] rounded-full text-xs font-black uppercase tracking-widest">
              <FiTrendingUp />
              Fastest Growing Marketplace
           </div>
           
           <h1 className="text-6xl font-black text-dark-900 tracking-tighter leading-[1.1]">
              Join the future of <br />
              <span className="text-[#fb641b]">Smart Shopping.</span>
           </h1>
           
           <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-dark-50 flex items-center justify-center text-[#fb641b] flex-shrink-0">
                    <FiCheckCircle size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-dark-800 text-lg">Verified Sellers</h3>
                    <p className="text-dark-400 font-medium">Shop with confidence from pre-vetted premium brands.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-dark-50 flex items-center justify-center text-[#fb641b] flex-shrink-0">
                    <FiShield size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-dark-800 text-lg">Secure Payments</h3>
                    <p className="text-dark-400 font-medium">Your transactions are protected by industry-grade encryption.</p>
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-dark-50 flex items-center gap-8">
              <div>
                 <p className="text-2xl font-black text-dark-900">50K+</p>
                 <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Active Users</p>
              </div>
              <div>
                 <p className="text-2xl font-black text-dark-900">1.2K+</p>
                 <p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Global Brands</p>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-[480px]">
          <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-dark-50 overflow-hidden relative">
            
            <div className="p-8 sm:p-12">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-dark-900 tracking-tight mb-2">Create Account</h2>
                <p className="text-dark-400 font-medium">Join us today and start your journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Switcher */}
                {!isSetup && (
                  <div className="mb-8">
                    <label className={labelClass}>Register as</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                        type="button" 
                        onClick={() => setFormData({...formData, role: 'customer'})}
                        className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all border-2 ${formData.role === 'customer' ? 'bg-[#fb641b] border-[#fb641b] text-white shadow-xl shadow-orange-100' : 'bg-white border-dark-100 text-dark-400 hover:border-dark-200'}`}
                       >
                          <FiUser size={18} />
                          Customer
                       </button>
                       <button 
                        type="button" 
                        onClick={() => setFormData({...formData, role: 'seller'})}
                        className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all border-2 ${formData.role === 'seller' ? 'bg-[#fb641b] border-[#fb641b] text-white shadow-xl shadow-orange-100' : 'bg-white border-dark-100 text-dark-400 hover:border-dark-200'}`}
                       >
                          <FiShoppingBag size={18} />
                          Seller
                       </button>
                    </div>
                  </div>
                )}

                {isSetup && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-[10px] text-blue-600 font-black mb-8 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    <FiShield size={14} />
                    Super Admin Setup Mode
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" placeholder="John Doe" className={inputClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" placeholder="john@example.com" className={inputClass} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input type="tel" placeholder="9876543210" className={inputClass} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="password" placeholder="••••••••" className={inputClass} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(251,100,27,0.2)] ${loading ? 'bg-dark-100 text-dark-400 cursor-not-allowed' : 'bg-[#fb641b] text-white hover:bg-[#e65a18] transform hover:-translate-y-1'}`}
                >
                  {loading ? 'Creating Account...' : 'Sign Up Now'}
                  {!loading && <FiArrowRight size={22} />}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-dark-100 text-center">
                <p className="text-dark-600 font-bold">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#fb641b] font-black hover:underline ml-1 underline-offset-4 decoration-2">Log In</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof for Roles */}
          <div className="mt-8 px-8 flex items-center justify-center gap-6">
             <div className="flex flex-col items-center bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-dark-100">
                <span className="text-[10px] font-black text-dark-400 uppercase tracking-[0.2em] mb-1">Signup as</span>
                <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${formData.role === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                   {formData.role === 'customer' ? 'Customer - Shop Now' : 'Seller - Start Selling'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
