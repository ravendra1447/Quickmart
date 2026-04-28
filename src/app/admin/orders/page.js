'use client';
import { useEffect, useState } from 'react';
import { FiPackage, FiUser, FiCreditCard, FiCalendar, FiArrowRight, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    adminAPI.getOrders({ status: filter || undefined, limit: 50 }).then((r) => setOrders(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [filter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const statusBadges = { 
    pending: 'bg-amber-50 text-amber-600 border-amber-100', 
    confirmed: 'bg-blue-50 text-blue-600 border-blue-100', 
    shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
    out_for_delivery: 'bg-purple-50 text-purple-600 border-purple-100', 
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    returned: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  const paymentBadges = {
    paid: 'bg-emerald-500 text-white',
    pending: 'bg-amber-500 text-white',
    failed: 'bg-rose-500 text-white',
    refunded: 'bg-slate-500 text-white'
  };

  return (
    <div className="animate-fk-fade pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor and manage all marketplace transactions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${filter === f ? 'bg-fk-blue text-white border-fk-blue shadow-lg shadow-fb-blue/20' : 'bg-white text-slate-400 border-slate-100 hover:border-fb-blue hover:text-fb-blue'}`}>
              {f || 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Info</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financials</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-fb-blue/10 group-hover:text-fb-blue transition-colors">
                      <FiPackage size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">#{o.order_number}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                        <FiCalendar size={10} /> {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-1">
                    <FiUser className="text-fb-blue" size={14} />
                    <span className="text-sm font-black text-slate-900">{o.user?.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{o.shipping_city}, {o.shipping_state}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 mb-1">₹{o.total}</span>
                    <div className="flex items-center gap-2">
                       <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${paymentBadges[o.payment_status] || 'bg-slate-100'}`}>
                         {o.payment_status}
                       </span>
                       <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{o.payment_method}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadges[o.status] || 'bg-slate-100'}`}>
                    {o.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {o.status !== 'delivered' && o.status !== 'cancelled' && (
                      <select 
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none focus:border-fb-blue transition-all"
                      >
                        <option value="">Update Status</option>
                        <option value="confirmed">Confirm</option>
                        <option value="shipped">Ship</option>
                        <option value="delivered">Deliver</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                    <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-fb-blue transition-all">
                      <FiArrowRight />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="py-20 text-center">
            <FiPackage className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-slate-900 font-black">No Orders Found</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Transactions will appear here once customers start buying.</p>
          </div>
        )}
      </div>
    </div>
  );
}
