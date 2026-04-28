'use client';
import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';
import { sellerAPI } from '@/lib/api';

export default function SellerEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerAPI.getEarnings().then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 bg-dark-100 rounded-2xl animate-pulse"></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">Earnings</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500 mb-1">Total Earnings</p>
              <p className="text-3xl font-extrabold text-green-600">₹{(data?.totalEarnings || 0).toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg"><FiDollarSign size={24} /></div>
          </div>
        </div>
        <div className="glass-card p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500 mb-1">Platform Commission</p>
              <p className="text-3xl font-extrabold text-orange-600">₹{(data?.totalCommission || 0).toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg"><FiTrendingUp size={24} /></div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold text-dark-800 mb-4">Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
            <div className="flex items-center gap-3"><FiShoppingCart className="text-blue-500" /><span className="text-dark-700 font-medium">Total Order Items</span></div>
            <span className="font-bold text-dark-900">{data?.totalOrders || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
            <div className="flex items-center gap-3"><FiCheckCircle className="text-green-500" /><span className="text-dark-700 font-medium">Delivered Orders</span></div>
            <span className="font-bold text-dark-900">{data?.deliveredOrders || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
            <div className="flex items-center gap-3"><FiDollarSign className="text-green-500" /><span className="text-dark-700 font-medium">Net Earnings (After Fees)</span></div>
            <span className="font-bold text-green-600">₹{(data?.totalEarnings || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
            <div className="flex items-center gap-3"><FiTrendingUp className="text-orange-500" /><span className="text-dark-700 font-medium">Store Status</span></div>
            <span className={data?.storeStatus === 'approved' ? 'badge-success' : 'badge-warning'}>{data?.storeStatus || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
