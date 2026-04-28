'use client';
import { useEffect, useState } from 'react';
import { FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiToggleLeft, FiToggleRight, FiAlertCircle, FiRefreshCw, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import { sellerAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = () => {
    sellerAPI.getDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const toggleStore = async () => {
    if (!data?.store) return;
    setToggling(true);
    try {
      await sellerAPI.updateProfile({ is_open: !data.store.is_open });
      setData(d => ({ ...d, store: { ...d.store, is_open: !d.store.is_open } }));
      toast.success(data.store.is_open ? 'Store closed' : 'Store opened');
    } catch (err) { toast.error(err.message); }
    setToggling(false);
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-white rounded-xl shadow-sm"></div>
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl shadow-sm"></div>)}
      </div>
      <div className="h-64 bg-white rounded-xl shadow-sm"></div>
    </div>
  );

  const stats = [
    { label: 'Active Products', value: data?.activeProducts || 0, icon: <FiPackage />, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: <FiShoppingCart />, color: 'bg-indigo-500', trend: '+5%' },
    { label: 'Total Earnings', value: `₹${(data?.totalEarnings || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'bg-emerald-500', trend: '+18%' },
  ];

  return (
    <div className="animate-fk-fade">
      {/* Header with Title & Refresh */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Seller Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your store and track your performance</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
          <FiRefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Store Control Bar */}
      {data?.store && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-fk-blue/10 flex items-center justify-center text-3xl shadow-inner">🏪</div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{data.store.store_name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${data.store.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {data.store.status}
                </span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <FiStar className="text-amber-400" /> 4.8 Store Rating
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Store Status</p>
              <p className={`text-sm font-black ${data.store.is_open ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.store.is_open ? 'Accepting Orders' : 'Currently Closed'}
              </p>
            </div>
            <button 
              onClick={toggleStore} 
              disabled={toggling} 
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg ${
                data.store.is_open 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' 
                : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
              }`}
            >
              {data.store.is_open ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
              {data.store.is_open ? 'Close Store' : 'Open Store'}
            </button>
          </div>
        </div>
      )}

      {/* Pending Orders Alert */}
      {data?.pendingOrders > 0 && (
        <Link href="/seller/orders" className="block mb-8 group">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-3xl flex items-center gap-6 shadow-xl shadow-orange-500/20 transition-all group-hover:translate-x-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"><FiAlertCircle size={32} /></div>
            <div className="flex-1">
              <p className="font-black text-xl leading-tight">{data.pendingOrders} Orders Waiting for Acceptance!</p>
              <p className="text-white/80 text-sm font-bold mt-1">Accept them now to start delivery →</p>
            </div>
            <FiArrowRight size={24} className="opacity-50" />
          </div>
        </Link>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/10`}>{s.icon}</div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{s.trend}</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity / Orders */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2"><FiClock /> Recent Activity</h3>
            <Link href="/seller/orders" className="text-xs font-black text-fb-blue hover:underline">Manage All</Link>
          </div>
          <div className="p-2">
            {data?.recentOrders?.length > 0 ? (
              <div className="space-y-1">
                {data.recentOrders.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">📦</div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.product_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.order?.order_number || '#ORD-000'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{(item.price_at_purchase * item.quantity).toFixed(0)}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        item.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold italic">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        {/* Store Insights / Quick Links */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
            <h3 className="text-2xl font-black italic mb-2">Sell More!</h3>
            <p className="text-slate-400 text-sm font-bold">Add more products to your catalog to reach more customers this week.</p>
            <Link href="/seller/products" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-fb-blue text-white rounded-xl font-black text-sm hover:bg-fb-blue-hover transition-all">
              Go to Catalog <FiArrowRight />
            </Link>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 px-1">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/seller/products" className="p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                <FiPackage className="text-fb-blue mb-2" size={24} />
                <p className="text-xs font-black text-slate-900">Manage Inventory</p>
              </Link>
              <Link href="/seller/orders" className="p-4 bg-slate-50 hover:bg-orange-50 rounded-2xl transition-all border border-transparent hover:border-orange-100">
                <FiShoppingCart className="text-orange-500 mb-2" size={24} />
                <p className="text-xs font-black text-slate-900">Process Orders</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
