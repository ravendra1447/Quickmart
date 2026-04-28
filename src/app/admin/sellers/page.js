'use client';
import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSellers = () => {
    setLoading(true);
    adminAPI.getSellers({ status: filter || undefined }).then((r) => setSellers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchSellers, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateSellerStatus(id, { status });
      toast.success(`Seller ${status}`);
      fetchSellers();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-dark-900">Manage Sellers</h1>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'gradient-primary text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Seller</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Store</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Earnings</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-dark-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-dark-800">{seller.user?.name}</p>
                  <p className="text-xs text-dark-500">{seller.user?.email}</p>
                </td>
                <td className="px-5 py-4 text-dark-700">{seller.store_name}</td>
                <td className="px-5 py-4">
                  <span className={seller.status === 'approved' ? 'badge-success' : seller.status === 'pending' ? 'badge-warning' : 'badge-danger'}>{seller.status}</span>
                </td>
                <td className="px-5 py-4 font-semibold">₹{seller.total_earnings || 0}</td>
                <td className="px-5 py-4 text-right">
                  {seller.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => updateStatus(seller.id, 'approved')} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"><FiCheck size={16} /></button>
                      <button onClick={() => updateStatus(seller.id, 'rejected')} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><FiX size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sellers.length === 0 && <p className="text-center py-10 text-dark-400">No sellers found</p>}
      </div>
    </div>
  );
}
