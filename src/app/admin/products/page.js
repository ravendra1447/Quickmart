'use client';
import { useEffect, useState } from 'react';
import { adminAPI, getImageUrl } from '@/lib/api';
import { FiPackage } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminAPI.getProducts({ page, limit: 20 }).then((r) => { setProducts(r.data || []); setTotal(r.pagination?.total || 0); }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-900">All Products ({total})</h1>
        <Link href="/admin/products/new" className="btn-primary">
          Add New Product
        </Link>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Product</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Seller</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Category</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Price</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Stock</th>
              <th className="text-center px-5 py-3 font-semibold text-dark-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-dark-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-dark-50 border border-dark-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                       {(() => {
                         let imgs = [];
                         try {
                           imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
                         } catch (e) { imgs = []; }
                         
                         if (imgs.length > 0) {
                           return <img src={getImageUrl(imgs[0])} className="w-full h-full object-contain" alt={p.name} />;
                         }
                         return <FiPackage className="text-dark-200" />;
                       })()}
                    </div>
                    <p className="font-bold text-dark-800 truncate max-w-[200px]">{p.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-dark-600">{p.seller?.name}</td>
                <td className="px-5 py-4 text-dark-600">{p.category?.name}</td>
                <td className="px-5 py-4 text-right font-semibold">₹{p.price}</td>
                <td className="px-5 py-4 text-right">{p.stock}</td>
                <td className="px-5 py-4 text-center"><span className={p.is_active ? 'badge-success' : 'badge-danger'}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-10 text-dark-400">No products</p>}
      </div>
    </div>
  );
}
