'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiShoppingBag, FiSearch } from 'react-icons/fi';
import { orderAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';

const statusConfig = {
  pending: { label: 'Processing', color: 'text-orange-600', bg: 'bg-orange-50', icon: <FiClock /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50', icon: <FiCheckCircle /> },
  packed: { label: 'Packed', color: 'text-purple-600', bg: 'bg-purple-50', icon: <FiPackage /> },
  shipped: { label: 'Shipped', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <FiTruck /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <FiTruck className="animate-bounce" /> },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', icon: <FiCheckCircle /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: <FiXCircle /> },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      orderAPI.list({ limit: 50 })
        .then((r) => setOrders(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4">🔐</p>
      <h2 className="text-2xl font-bold text-dark-800">Please Login</h2>
      <p className="text-dark-500 mt-2">Login to view and track your orders.</p>
      <Link href="/login" className="bg-[#fb641b] text-white px-8 py-3 rounded-xl font-bold mt-6 shadow-lg shadow-orange-100">Login Now</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Ultra Premium Header */}
      <div className="bg-white border-b border-slate-100 pt-24 md:pt-20 pb-6 sm:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                   <Link href="/" className="hover:text-fk-blue transition-colors">Home</Link>
                   <span>/</span>
                   <span className="text-slate-900">Orders</span>
                </nav>
                <div className="flex items-center gap-4">
                   <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Order History</h1>
                   <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black">{orders.length}</div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-2 uppercase tracking-[0.15em] flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   Real-time delivery tracking active
                </p>
              </div>
              <div className="relative w-full md:w-80">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="text-slate-400" size={16} />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Find an order..." 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-fk-blue/5 focus:bg-white focus:border-fk-blue/20 outline-none transition-all text-sm font-bold placeholder:text-slate-400 shadow-sm" 
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-32 shadow-sm"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 sm:p-20 text-center border border-slate-100 mt-4 shadow-xl shadow-slate-200/20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
               <FiPackage className="text-slate-200" size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">No orders to show</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Start your shopping journey now</p>
            <Link href="/products" className="bg-[#fb641b] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-100 inline-block mt-10 hover:translate-y-[-2px] transition-transform">Explore Catalog</Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="group block bg-white rounded-[1.8rem] border border-slate-100 hover:border-fk-blue/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden shadow-sm relative">
                  {/* Left Status Bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 sm:w-2 ${config.bg.replace('bg-', 'bg-')}`}></div>
                  
                  <div className="p-4 sm:p-7 ml-1.5 sm:ml-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-inner ${config.bg} ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                             <h3 className="text-base sm:text-xl font-black text-slate-800 tracking-tight truncate">#{order.order_number}</h3>
                             <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${config.bg} ${config.color} border border-current/10`}>
                                <div className={`w-1 h-1 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`}></div>
                                {config.label}
                             </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <FiClock className="opacity-50" />
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                <p className="text-sm sm:text-lg font-black text-[#fb641b] tracking-tighter">
                                   ₹{parseFloat(order.total).toFixed(0)}
                                </p>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-4">
                         <div className="hidden sm:flex flex-col items-end">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Packet Size</p>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[9px] font-black border border-slate-100">{order.items?.length || 0} ITEMS</span>
                         </div>
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 group-hover:bg-[#fb641b] group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-sm border border-slate-100">
                            <FiChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                         </div>
                      </div>
                    </div>
                    
                    {/* Compact Tracking Steps Mock */}
                    <div className="mt-6 flex items-center gap-1.5 sm:gap-2">
                       {order.items?.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                             <div className={`h-full ${idx === 0 ? config.bg.replace('bg-', 'bg-').split('-')[0] + '-' + config.bg.replace('bg-', 'bg-').split('-')[1] : 'bg-slate-100'} transition-all duration-1000`}></div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                       {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="px-3 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[140px] hover:bg-white transition-colors">
                             {item.product_name}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="text-[9px] font-black text-fk-blue bg-blue-50 px-2 py-1 rounded-lg">+{order.items.length - 3} MORE</div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
