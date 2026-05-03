'use client';
import { useState, useEffect } from 'react';
import { FiGift, FiZap, FiChevronRight, FiStar, FiAward, FiShoppingBag, FiInfo } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

export default function RewardsPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] pt-32 pb-20">
      <div className="max-w-[1248px] mx-auto px-4">
        
        {/* Header / Hero Section */}
        <div className="bg-gradient-to-r from-fk-blue to-blue-800 rounded-2xl p-8 mb-6 relative overflow-hidden shadow-2xl">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-fk-yellow text-[#212121] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium</span>
                    <h1 className="text-3xl font-black italic tracking-tight">NearbyDukan Plus Zone</h1>
                 </div>
                 <p className="text-blue-100 font-bold max-w-md">Experience the next level of shopping with exclusive rewards, free delivery, and priority support.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 min-w-[280px]">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-100 font-black text-xs uppercase tracking-widest">Your Balance</span>
                    <FiInfo className="text-blue-200" />
                 </div>
                 <div className="flex items-end gap-2">
                    <div className="w-10 h-10 bg-fk-yellow rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                       <FiZap className="text-[#212121]" size={20} />
                    </div>
                    <span className="text-5xl font-black text-white leading-none">240</span>
                    <span className="text-fk-yellow font-black text-sm mb-1">NearbyCoins</span>
                 </div>
                 <button className="w-full mt-6 bg-fk-yellow text-[#212121] py-3 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all">REDEEM NOW</button>
              </div>
           </div>
           
           {/* Abstract shapes */}
           <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
           <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
           
           {/* Left Column: Benefits & Rewards */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Rewards Grid */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                 <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <FiGift className="text-fk-blue" /> Claim Your Rewards
                 </h2>
                 
                 <div className="grid sm:grid-cols-2 gap-4">
                    {[
                       { title: '₹100 Off on Grocery', cost: 50, color: 'bg-emerald-50', text: 'text-emerald-700', icon: <FiShoppingBag /> },
                       { title: 'Free Delivery Voucher', cost: 30, color: 'bg-blue-50', text: 'text-blue-700', icon: <FiZap /> },
                       { title: '10% Extra Cashback', cost: 100, color: 'bg-orange-50', text: 'text-orange-700', icon: <FiStar /> },
                       { title: 'Priority Local Delivery', cost: 20, color: 'bg-purple-50', text: 'text-purple-700', icon: <FiAward /> },
                    ].map((reward, i) => (
                       <div key={i} className={`p-6 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group ${reward.color}`}>
                          <div className="flex items-start justify-between mb-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-white ${reward.text}`}>
                                {reward.icon}
                             </div>
                             <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
                                <FiZap className="text-fk-yellow" size={12} />
                                <span className="text-[11px] font-black text-slate-800">{reward.cost}</span>
                             </div>
                          </div>
                          <h4 className="font-black text-slate-800 group-hover:text-fk-blue transition-colors">{reward.title}</h4>
                          <p className="text-xs text-slate-500 font-bold mt-1">Valid for 30 days from claim</p>
                          <div className="mt-4 flex items-center text-xs font-black text-fk-blue group-hover:gap-2 transition-all">
                             CLAIM REWARD <FiChevronRight />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* How it works */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                 <h2 className="text-lg font-black text-slate-800 mb-8">How to earn NearbyCoins?</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    {[
                       { step: '01', title: 'Shop Local', desc: 'Every ₹100 spent on NearbyDukan earns you 2 NearbyCoins.' },
                       { step: '02', title: 'Fast Review', desc: 'Review your local seller to earn 5 extra coins instantly.' },
                       { step: '03', title: 'Daily Login', desc: 'Login every day to keep your streak and win bonus coins.' }
                    ].map((s, i) => (
                       <div key={i} className="relative">
                          <span className="text-5xl font-black text-slate-50 absolute -top-4 -left-2 z-0">{s.step}</span>
                          <div className="relative z-10">
                             <h4 className="font-black text-slate-800 mb-2">{s.title}</h4>
                             <p className="text-xs text-slate-500 font-bold leading-relaxed">{s.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Mini Stats & Featured */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Membership Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                 <div className="bg-dark-900 p-6 text-white text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Member Since 2024</p>
                    <h3 className="text-xl font-black tracking-tight">{user?.name || 'NearbyDukan User'}</h3>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-black">
                       <FiStar className="text-fk-yellow" /> SILVER MEMBER
                    </div>
                 </div>
                 <div className="p-6">
                    <p className="text-xs font-bold text-slate-500 mb-4">60 coins more to reach GOLD</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                       <div className="w-[75%] h-full bg-fk-blue rounded-full"></div>
                    </div>
                    <ul className="space-y-4">
                       <li className="flex items-center gap-3 text-xs font-bold text-slate-700">
                          <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><FiAward size={14} /></div>
                          Unlimited Free Deliveries
                       </li>
                       <li className="flex items-center gap-3 text-xs font-bold text-slate-700">
                          <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><FiZap size={14} /></div>
                          Early access to local deals
                       </li>
                    </ul>
                 </div>
              </div>

              {/* Featured Partner */}
              <div className="bg-gradient-to-br from-orange-400 to-[#fb641b] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h4 className="text-lg font-black leading-tight mb-2">Refer a friend &<br/>earn 50 Coins!</h4>
                    <p className="text-xs font-bold opacity-80 mb-6">Spread the joy of local shopping</p>
                    <button className="bg-white text-[#fb641b] px-6 py-2 rounded-lg font-black text-xs uppercase shadow-lg shadow-orange-900/20 hover:scale-105 transition-all">INVITE NOW</button>
                 </div>
                 <FiGift className="absolute -bottom-6 -right-6 text-white/20 rotate-12 group-hover:scale-110 transition-transform" size={120} />
              </div>

           </div>

        </div>
      </div>
    </div>
  );
}
