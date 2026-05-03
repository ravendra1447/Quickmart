'use client';
import { useState } from 'react';
import { FiBell, FiChevronDown, FiAlertCircle, FiSettings, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    orders: true,
    reminders: true,
    recommendations: true,
    offers: true,
    community: true,
    feedback: true
  });

  const toggle = (key) => {
    setPreferences(p => ({ ...p, [key]: !p[key] }));
    toast.success('Preference updated!');
  };

  const sections = [
    { id: 'orders', title: 'My Orders', desc: 'Latest updates on your orders' },
    { id: 'reminders', title: 'Reminders', desc: 'Price Drops, Back-in-stock Products, etc.' },
    { id: 'recommendations', title: 'Recommendations by NearbyDukan', desc: 'Products, offers and curated content based on your interest' },
    { id: 'offers', title: 'New Offers', desc: 'Top Deals and more' },
    { id: 'community', title: 'My NearbyDukan Community', desc: 'Profile updates, Newsletters, etc.' },
    { id: 'feedback', title: 'Feedback and Review', desc: 'Rating and Reviews for your purchase' }
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] pt-32 pb-20">
      <div className="max-w-[1248px] mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Sidebar */}
          <div className="w-full md:w-80 space-y-4">
             <div className="bg-white shadow-sm rounded-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                   <div className="w-10 h-10 bg-fk-blue/10 text-fk-blue rounded-full flex items-center justify-center">
                      <FiBell size={20} />
                   </div>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Notification Preferences</span>
                </div>
                <div className="p-4 bg-blue-50/50 text-fk-blue font-bold text-sm border-l-4 border-fk-blue">
                   Desktop Notifications
                </div>
             </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 bg-white shadow-sm rounded-sm p-6 md:p-10 flex flex-col lg:flex-row gap-10">
             
             {/* Preferences List */}
             <div className="flex-1 space-y-8">
                <h2 className="text-lg font-black text-slate-800 mb-6">Desktop Notifications</h2>
                
                <div className="space-y-6">
                   {sections.map((s) => (
                      <div key={s.id} className="flex items-start gap-4 group">
                         <div 
                           onClick={() => toggle(s.id)}
                           className={`mt-1 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all cursor-pointer ${preferences[s.id] ? 'bg-fk-blue border-fk-blue shadow-lg shadow-blue-100' : 'border-slate-300 group-hover:border-slate-400'}`}
                         >
                            {preferences[s.id] && <FiCheck className="text-white" size={14} />}
                         </div>
                         <div className="flex-1 flex items-center justify-between cursor-pointer" onClick={() => toggle(s.id)}>
                            <div>
                               <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                               <p className="text-[11px] text-slate-400 font-bold mt-0.5">{s.desc}</p>
                            </div>
                            <FiChevronDown className="text-slate-300" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Right Graphic Panel (Matching Screenshot) */}
             <div className="w-full lg:w-80 flex flex-col items-center justify-center text-center p-6 border-l border-slate-50">
                <div className="relative w-40 h-40 mb-8">
                   <div className="absolute inset-0 bg-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-red-100 animate-pulse">
                      <FiAlertCircle className="text-white" size={60} />
                   </div>
                   {/* Decorative icons floating around */}
                   <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm"><FiBell className="text-slate-300" /></div>
                   <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm"><FiSettings className="text-slate-300" /></div>
                </div>
                
                <h3 className="text-xs font-black text-red-500 leading-tight mb-2">
                   Oops! You are missing out on a lot of important notifications.
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mb-6">
                   Please switch it on from Browser Settings.
                </p>
                
                <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                   <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                      <FiCheck />
                   </div>
                   <div className="text-left">
                      <p className="text-[9px] font-black text-emerald-800 uppercase tracking-tighter">How to Unblock</p>
                      <p className="text-[10px] font-bold text-emerald-600">Site Settings &gt; Notifications &gt; Allow</p>
                   </div>
                </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}
