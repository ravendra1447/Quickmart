'use client';
import { useState } from 'react';
import { 
  FiSearch, FiPackage, FiTruck, FiCreditCard, FiUser, 
  FiMessageSquare, FiMail, FiPhone, FiChevronRight, FiHelpCircle 
} from 'react-icons/fi';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    { id: 1, title: 'Orders', icon: <FiPackage />, desc: 'Track, cancel or return orders' },
    { id: 2, title: 'Delivery', icon: <FiTruck />, desc: 'Check delivery status & estimates' },
    { id: 3, title: 'Payments', icon: <FiCreditCard />, desc: 'Refunds & payment issues' },
    { id: 4, title: 'Account', icon: <FiUser />, desc: 'Manage profile & settings' },
  ];

  const faqs = [
    'How do I track my QuickMart order?',
    'What is the return policy for fresh items?',
    'How can I get a refund for a cancelled order?',
    'I want to change my delivery address',
    'How do I become a QuickMart Plus member?'
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] pt-32 pb-20">
      <div className="max-w-[1000px] mx-auto px-4">
        
        {/* Help Center Header */}
        <div className="bg-fk-blue rounded-2xl p-8 md:p-12 text-white text-center mb-8 relative overflow-hidden shadow-2xl">
           <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tight mb-6">How can we help you today?</h1>
              <div className="max-w-xl mx-auto relative">
                 <input 
                   type="text" 
                   placeholder="Search for issues, orders, or topics..." 
                   className="w-full py-4 px-14 rounded-xl text-[#212121] font-bold text-sm outline-none shadow-lg"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
           </div>
           {/* Decorative background elements */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
           {helpCategories.map((cat) => (
              <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-all cursor-pointer group">
                 <div className="w-14 h-14 bg-blue-50 text-fk-blue rounded-2xl flex items-center justify-center text-2xl group-hover:bg-fk-blue group-hover:text-white transition-all">
                    {cat.icon}
                 </div>
                 <div className="flex-1">
                    <h3 className="font-black text-slate-800">{cat.title}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">{cat.desc}</p>
                 </div>
                 <FiChevronRight className="text-slate-300" />
              </div>
           ))}
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-12">
           <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <FiHelpCircle className="text-fk-blue" /> Frequent Questions
           </h2>
           <div className="divide-y divide-slate-100">
              {faqs.map((faq, i) => (
                 <div key={i} className="py-4 flex items-center justify-between hover:bg-slate-50 transition-all px-2 rounded-lg cursor-pointer group">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-fk-blue transition-colors">{faq}</span>
                    <FiChevronRight className="text-slate-300" />
                 </div>
              ))}
           </div>
        </div>

        {/* Contact Us Section */}
        <div className="text-center">
           <h2 className="text-xl font-black text-slate-800 mb-8">Still need help? Contact us</h2>
           <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 transition-all">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare size={24} />
                 </div>
                 <h4 className="font-black text-slate-800 mb-1">Live Chat</h4>
                 <p className="text-[10px] font-black text-emerald-600 uppercase mb-4">Wait time: 2m</p>
                 <button className="text-xs font-black text-fk-blue border border-fk-blue px-6 py-2 rounded-full hover:bg-fk-blue hover:text-white transition-all uppercase tracking-wide">Start Chat</button>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 transition-all">
                 <div className="w-12 h-12 bg-blue-50 text-fk-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMail size={24} />
                 </div>
                 <h4 className="font-black text-slate-800 mb-1">Email Us</h4>
                 <p className="text-[10px] font-black text-blue-600 uppercase mb-4">Reply within 24h</p>
                 <button className="text-xs font-black text-fk-blue border border-fk-blue px-6 py-2 rounded-full hover:bg-fk-blue hover:text-white transition-all uppercase tracking-wide">Write Email</button>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 transition-all">
                 <div className="w-12 h-12 bg-orange-50 text-[#fb641b] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPhone size={24} />
                 </div>
                 <h4 className="font-black text-slate-800 mb-1">Call Support</h4>
                 <p className="text-[10px] font-black text-[#fb641b] uppercase mb-4">1800-QUICK-MART</p>
                 <button className="text-xs font-black text-fk-blue border border-fk-blue px-6 py-2 rounded-full hover:bg-fk-blue hover:text-white transition-all uppercase tracking-wide">Request Call</button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
