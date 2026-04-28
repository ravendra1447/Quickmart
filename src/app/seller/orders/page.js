'use client';
import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiPackage, FiTruck, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { sellerAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusFlow = {
  pending: { next: 'confirmed', label: 'Accept', icon: <FiCheck />, color: 'bg-green-500 hover:bg-green-600' },
  confirmed: { next: 'packed', label: 'Pack', icon: <FiPackage />, color: 'bg-indigo-500 hover:bg-indigo-600' },
  packed: { next: 'shipped', label: 'Ship', icon: <FiTruck />, color: 'bg-purple-500 hover:bg-purple-600' },
  shipped: { next: 'delivered', label: 'Delivered', icon: <FiCheck />, color: 'bg-green-500 hover:bg-green-600' },
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    sellerAPI.getOrders({ limit: 100 }).then(r => setOrders(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchOrders, []);

  const handleRefresh = () => { setRefreshing(true); fetchOrders(); setTimeout(() => setRefreshing(false), 500); };

  const updateStatus = async (id, status) => {
    try {
      await sellerAPI.updateOrderStatus(id, { status });
      toast.success(`Order ${status}!`);
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const rejectOrder = async (id) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    try {
      await sellerAPI.updateOrderStatus(id, { status: 'cancelled' });
      toast.success('Order rejected');
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = { all: orders.length, pending: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-dark-200 rounded-xl w-1/3"></div>
      {[1,2,3].map(i => <div key={i} className="h-24 bg-dark-100 rounded-2xl"></div>)}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-900">Orders</h1>
        <button onClick={handleRefresh} className={`btn-secondary !py-2.5 text-sm flex items-center gap-2 ${refreshing ? 'animate-spin' : ''}`}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All', count: counts.all },
          { key: 'pending', label: '🔔 New', count: counts.pending },
          { key: 'confirmed', label: '✅ Accepted', count: counts.confirmed },
          { key: 'packed', label: '📦 Packed', count: counts.packed },
          { key: 'shipped', label: '🚚 Shipped', count: counts.shipped },
          { key: 'delivered', label: '✨ Delivered', count: counts.delivered },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === t.key ? 'gradient-primary text-white shadow-lg' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'}`}>
            {t.label} {t.count > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div key={item.id} className={`glass-card p-5 card-hover ${item.status === 'pending' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-dark-800 text-lg">{item.order?.order_number}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[item.status] || 'bg-dark-100 text-dark-600'}`}>
                    {item.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {item.order?.payment_method === 'cod' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">COD</span>}
                </div>
                <p className="text-sm text-dark-700 font-medium">{item.product_name} × {item.quantity}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-dark-500">
                  <span>👤 {item.order?.user?.name || 'Customer'}</span>
                  <span>📍 {item.order?.shipping_city || ''}</span>
                  <span>🕐 {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-xl font-extrabold text-dark-900">₹{(item.price_at_purchase * item.quantity).toFixed(0)}</p>
                <p className="text-xs text-green-600 font-semibold">Earning: ₹{item.seller_earning}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(item.id, 'confirmed')}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                      <FiCheck size={16} /> Accept
                    </button>
                    <button onClick={() => rejectOrder(item.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all">
                      <FiX size={16} /> Reject
                    </button>
                  </>
                )}
                {statusFlow[item.status] && item.status !== 'pending' && (
                  <button onClick={() => updateStatus(item.id, statusFlow[item.status].next)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg ${statusFlow[item.status].color}`}>
                    {statusFlow[item.status].icon} {statusFlow[item.status].label}
                  </button>
                )}
                {(item.status === 'delivered' || item.status === 'cancelled') && (
                  <span className="text-xs text-dark-400 italic">Completed</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">📦</span>
            <p className="text-dark-500 mt-4 font-medium">No {filter === 'all' ? '' : filter} orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
