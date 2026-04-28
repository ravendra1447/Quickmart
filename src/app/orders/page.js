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
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-dark-100 py-8 mb-8">
        <div className="max-w-5xl mx-auto px-4">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-dark-900 tracking-tight">My Orders</h1>
                <p className="text-sm text-dark-500 font-bold mt-1 uppercase tracking-widest">Track & manage your deliveries</p>
              </div>
              <div className="relative max-w-md w-full">
                 <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                 <input 
                   type="text" 
                   placeholder="Search by Order ID or Status..." 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-[#fb641b] outline-none transition-all text-sm font-medium" 
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-dark-100 animate-pulse flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-dark-50 rounded-2xl"></div>
                   <div className="space-y-2">
                      <div className="h-5 bg-dark-50 rounded w-40"></div>
                      <div className="h-4 bg-dark-50 rounded w-24"></div>
                   </div>
                </div>
                <div className="h-8 bg-dark-50 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-sm border border-dark-100">
            <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <FiShoppingBag className="text-dark-200" size={40} />
            </div>
            <h2 className="text-2xl font-black text-dark-900 mb-2">No Orders Found</h2>
            <p className="text-dark-500 max-w-xs mx-auto mb-8 font-medium">Looks like you haven't placed any orders yet. Start shopping to fill this space!</p>
            <Link href="/products" className="bg-[#fb641b] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all inline-block">Explore Products</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="group block bg-white p-6 rounded-3xl border border-dark-100 hover:border-[#fb641b]/30 hover:shadow-2xl hover:shadow-dark-200/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-500 ${config.bg} ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black text-dark-900 leading-tight">Order #{order.order_number}</h3>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                              {config.label}
                           </span>
                        </div>
                        <p className="text-xs text-dark-400 font-bold uppercase tracking-widest">
                           {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm font-black text-dark-900 pt-1">
                           ₹{parseFloat(order.total).toFixed(0)} <span className="text-dark-400 font-bold text-xs ml-1">· {order.items?.length || 0} Items</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-dark-50">
                       <div className="hidden sm:block text-right">
                          <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Status Update</p>
                          <p className="text-xs font-bold text-dark-700">Order is currently {config.label.toLowerCase()}</p>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-dark-50 group-hover:bg-[#fb641b] group-hover:text-white flex items-center justify-center transition-all duration-300">
                          <FiChevronRight size={20} />
                       </div>
                    </div>
                  </div>
                  
                  {/* Order Items Snapshot (Horizontal mini list) */}
                  <div className="mt-6 flex items-center gap-2 overflow-hidden">
                     {order.items?.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="px-3 py-2 bg-dark-50/50 rounded-xl border border-dark-100/50 text-[10px] font-black text-dark-500 uppercase truncate max-w-[120px]">
                           {item.product_name}
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="text-[10px] font-black text-dark-400 ml-2">+{order.items.length - 4} more</div>
                      )}
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
