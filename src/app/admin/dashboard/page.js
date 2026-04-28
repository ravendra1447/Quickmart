'use client';
import { useEffect, useState } from 'react';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp, FiUserPlus, FiTruck, FiPercent, FiImage, FiTag, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    adminAPI.getAnalytics().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); setTimeout(() => setRefreshing(false), 500); };

  if (loading) return <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-dark-100 rounded-2xl animate-pulse"></div>)}</div>;

  const stats = [
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'from-green-500 to-emerald-600', link: null },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: <FiShoppingCart />, color: 'from-blue-500 to-indigo-600', link: '/admin/orders' },
    { label: 'Total Products', value: data?.totalProducts || 0, icon: <FiPackage />, color: 'from-purple-500 to-violet-600', link: '/admin/products' },
    { label: 'Total Customers', value: data?.totalCustomers || 0, icon: <FiUsers />, color: 'from-orange-500 to-red-500', link: null },
    { label: 'Total Sellers', value: data?.totalSellers || 0, icon: <FiUserPlus />, color: 'from-pink-500 to-rose-600', link: '/admin/sellers' },
    { label: 'Platform Fees', value: `₹${(data?.platformFees || 0).toLocaleString()}`, icon: <FiTrendingUp />, color: 'from-teal-500 to-cyan-600', link: null },
    { label: 'Delivery Partners', value: `${data?.activeDeliveryPartners || 0} / ${data?.totalDeliveryPartners || 0}`, icon: <FiTruck />, color: 'from-amber-500 to-orange-600', link: '/admin/delivery' },
    { label: 'Active Coupons', value: data?.totalCoupons || 0, icon: <FiPercent />, color: 'from-lime-500 to-green-600', link: '/admin/coupons' },
    { label: 'Active Banners', value: data?.totalBanners || 0, icon: <FiImage />, color: 'from-sky-500 to-blue-600', link: '/admin/banners' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
        <button onClick={handleRefresh} className={`btn-secondary !py-2 !px-4 text-sm flex items-center gap-2 ${refreshing ? 'animate-spin' : ''}`}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => {
          const Card = (
            <div key={i} className="glass-card p-5 card-hover cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-extrabold text-dark-900">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>{s.icon}</div>
              </div>
            </div>
          );
          return s.link ? <Link key={i} href={s.link}>{Card}</Link> : <div key={i}>{Card}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-dark-800 mb-4">Order Status</h3>
          <div className="space-y-2">
            {(data?.ordersByStatus || []).map(s => {
              const colors = { pending: 'bg-yellow-500', confirmed: 'bg-blue-500', packed: 'bg-indigo-500', shipped: 'bg-purple-500', out_for_delivery: 'bg-cyan-500', delivered: 'bg-green-500', cancelled: 'bg-red-500' };
              const pct = data?.totalOrders ? Math.round((s.count / data.totalOrders) * 100) : 0;
              return (
                <div key={s.status} className="flex items-center gap-3 p-2">
                  <div className={`w-3 h-3 rounded-full ${colors[s.status] || 'bg-dark-300'}`}></div>
                  <span className="text-sm font-medium text-dark-700 capitalize flex-1">{s.status?.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-dark-400">{pct}%</span>
                  <span className="font-bold text-dark-900 text-sm w-8 text-right">{s.count}</span>
                </div>
              );
            })}
            {(!data?.ordersByStatus || data.ordersByStatus.length === 0) && <p className="text-sm text-dark-400 text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-dark-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <span className="text-sm text-dark-600">⏳ Pending Sellers</span>
              <span className="font-bold text-orange-600">{data?.pendingSellers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-dark-600">📦 Recent Orders (30d)</span>
              <span className="font-bold text-blue-600">{data?.recentOrderCount || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <span className="text-sm text-dark-600">💰 Revenue (30d)</span>
              <span className="font-bold text-green-600">₹{(data?.recentRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm text-dark-600">🚚 On Delivery Now</span>
              <span className="font-bold text-purple-600">{data?.busyDeliveryPartners || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <span className="text-sm text-dark-600">🎟️ Coupons Used</span>
              <span className="font-bold text-pink-600">{data?.totalCouponUsage || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
              <span className="text-sm text-dark-600">💸 Coupon Discounts</span>
              <span className="font-bold text-cyan-600">₹{(data?.totalCouponDiscounts || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Sellers */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-dark-800 mb-4">🏪 Top Sellers</h3>
            {(data?.topSellers || []).length > 0 ? (
              <div className="space-y-3">
                {data.topSellers.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-600">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-800 truncate">{s.store_name}</p>
                      <p className="text-xs text-dark-500">{s.is_open ? '🟢 Open' : '🔴 Closed'}</p>
                    </div>
                    <span className="font-bold text-green-600 text-sm">₹{parseFloat(s.total_earnings || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-dark-400 text-center py-4">No sellers yet</p>}
          </div>

          {/* Recent Orders */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-800">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs text-primary-600 font-semibold">View All →</Link>
            </div>
            {(data?.recentOrders || []).length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-2 bg-dark-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-dark-800">{o.order_number}</p>
                      <p className="text-xs text-dark-500">{o.user?.name || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-dark-900">₹{parseFloat(o.total).toFixed(0)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-dark-400 text-center py-4">No orders yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
