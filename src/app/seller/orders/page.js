'use client';
import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiPackage, FiTruck, FiRefreshCw, FiFilter, FiUser, FiCheckCircle } from 'react-icons/fi';
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

  
  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [assigning, setAssigning] = useState(false);


  const fetchOrders = () => {
    setLoading(true);
    sellerAPI.getOrders({ limit: 100 }).then(r => setOrders(r.data || [])).catch(() => { }).finally(() => setLoading(false));
  };


  const fetchDeliveryBoys = () => {
    sellerAPI.getDeliveryBoys().then(r => {
      const list = r.data || r;
      setDeliveryBoys(Array.isArray(list) ? list : []);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, []);


  const handleRefresh = () => { setRefreshing(true); fetchOrders(); setTimeout(() => setRefreshing(false), 500); };

  const updateStatus = async (id, status) => {
    try {
      await sellerAPI.updateOrderStatus(id, { status });
      toast.success(`Order ${status}!`);
      fetchOrders();
    } catch (err) { toast.error(err.message); }
  };


  const handleAssignClick = (item) => {
    setActiveItem(item);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (partnerId) => {
    setAssigning(true);
    try {
      await sellerAPI.assignOrder(activeItem.id, partnerId);
      toast.success('Order assigned successfully! 🚚');
      setShowAssignModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to assign');
    }
    setAssigning(false);
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

    <div className="space-y-4 animate-pulse p-8">

      <div className="h-10 bg-dark-200 rounded-xl w-1/3"></div>
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-dark-100 rounded-2xl"></div>)}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-dark-900 tracking-tight">Order Management</h1>
          <p className="text-dark-500 mt-1 font-medium">View, process, and track your customer orders</p>
        </div>
        <button onClick={handleRefresh} className={`flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-dark-700 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all ${refreshing ? 'animate-spin' : ''}`}>
          <FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { key: 'all', label: 'All Orders', count: counts.all, icon: '📋' },
          { key: 'pending', label: 'New', count: counts.pending, icon: '🔔' },
          { key: 'confirmed', label: 'Accepted', count: counts.confirmed, icon: '✅' },

          { key: 'packed', label: 'Packed', count: counts.packed, icon: '📦' },
          { key: 'shipped', label: 'Out for Delivery', count: counts.shipped, icon: '🚚' },

          { key: 'delivered', label: 'Delivered', count: counts.delivered, icon: '✨' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all border-2 ${filter === t.key ? 'bg-fk-blue border-fk-blue text-white shadow-xl shadow-fk-blue/20' : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>
            <span>{t.icon}</span> {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${filter === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="grid gap-6">
        {filtered.map(item => (
          <div key={item.id} className={`bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${item.status === 'pending' ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>

            {/* Order Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Order ID</p>
                  <span className="font-black text-dark-900 text-lg">{item.order?.order_number}</span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Date</p>
                  <span className="font-bold text-dark-700 text-sm">

                    {new Date(item.created_at || item.createdAt || item.order?.created_at).toLocaleDateString()}

                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.order?.payment_method === 'cod' && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-black uppercase tracking-wider">Cash on Delivery</span>}
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>
                  {item.status?.split('_').join(' ')}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col lg:flex-row justify-between gap-8">

              {/* Product Details */}
              <div className="flex-1 flex gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                  <FiPackage className="text-slate-300" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark-900 mb-2 leading-tight">{item.product_name}</h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-0.5">Quantity</p>
                      <p className="font-bold text-dark-900">{item.quantity}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {item.status === 'packed' || item.status === 'confirmed' ? (
                      <button onClick={() => handleAssignClick(item)} className="w-full bg-fk-blue/10 border-2 border-dashed border-fk-blue/30 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-fk-blue/20 transition-all group">
                        <FiTruck className="text-fk-blue group-hover:scale-110 transition-transform" size={24} />
                        <p className="text-[10px] font-black text-fk-blue uppercase tracking-widest">Assign Delivery Boy</p>
                      </button>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 opacity-60">
                        <FiTruck className="text-slate-400" size={20} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Assignment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financials & Actions */}
              <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 min-w-[200px]">
                <div className="text-left lg:text-right mb-6 lg:mb-0">
                  <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-dark-900">₹{(item.price_at_purchase * item.quantity).toFixed(0)}</p>

                  <p className="text-xs font-bold text-[#008c00] bg-green-50 inline-block px-2 py-1 rounded mt-1">Earning: ₹{item.seller_earning}</p>

                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => rejectOrder(item.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-red-100 text-red-600 font-black text-sm hover:bg-red-50 hover:border-red-200 transition-all">
                        <FiX size={18} /> Reject
                      </button>
                      <button onClick={() => updateStatus(item.id, 'confirmed')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#fb641b] text-white font-black text-sm hover:bg-[#e65a18] shadow-lg shadow-orange-500/20 transition-all">
                        <FiCheck size={18} /> Accept Order
                      </button>
                    </>
                  )}

                  {statusFlow[item.status] && item.status !== 'pending' && item.status !== 'delivered' && (

                    <button onClick={() => updateStatus(item.id, statusFlow[item.status].next)}
                      className={`flex-1 lg:flex-none w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition-all shadow-lg ${statusFlow[item.status].color}`}>
                      {statusFlow[item.status].icon} Mark as {statusFlow[item.status].label}
                    </button>
                  )}
                  {(item.status === 'delivered' || item.status === 'cancelled') && (
                    <div className="flex items-center gap-2 text-sm font-black text-dark-400 px-4 py-2 bg-slate-50 rounded-xl">

                      <FiCheckCircle className="text-green-500" /> {item.status.toUpperCase()}

                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="text-slate-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-dark-900 mb-2">No orders found</h3>

            <p className="text-dark-500 font-medium">When you receive new orders, they will appear here.</p>
          </div>
        )}
      </div>


      {/* Assign Partner Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
            <button onClick={() => setShowAssignModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-black transition-colors">✕</button>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-dark-900 tracking-tight mb-2">Assign Delivery Partner</h3>
              <p className="text-dark-500 font-medium text-sm">Select a partner for Order #{activeItem?.order?.order_number}</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {deliveryBoys.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FiUser className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-dark-400 font-bold text-sm">No partners available.</p>
                  <p className="text-[10px] text-dark-400 uppercase tracking-widest mt-1">Add them in Delivery Boys section</p>
                </div>
              ) : (
                deliveryBoys.map(boy => (
                  <button 
                    key={boy.id} 
                    onClick={() => handleAssignSubmit(boy.id)}
                    disabled={assigning}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 hover:border-fk-blue hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-fk-blue transition-colors">
                        <FiUser size={24} />
                      </div>
                      <div>
                        <p className="font-black text-dark-900 leading-tight">{boy.name || boy.user?.name || 'Partner'}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{boy.phone || boy.user?.phone}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${boy.status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {boy.status}
                    </div>
                  </button>
                ))
              )}
            </div>

            <p className="mt-8 text-center text-[10px] font-bold text-dark-400 uppercase tracking-widest">
              Only active partners are shown here.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
