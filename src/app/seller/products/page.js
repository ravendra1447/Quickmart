'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiRefreshCw, FiPackage } from 'react-icons/fi';
import Image from 'next/image';
import { sellerAPI, getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    sellerAPI.getProducts({ limit: 100 }).then(r => setProducts(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetchProducts, []);

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await sellerAPI.deleteProduct(id); toast.success('Product deleted'); fetchProducts(); }
    catch (err) { toast.error(err.message); }
  };

  const toggleAvailability = async (product) => {
    try {
      await sellerAPI.updateProduct(product.id, { is_available: !product.is_available });
      toast.success(product.is_available ? 'Marked out of stock' : 'Marked available');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !p.is_available } : p));
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (product) => {
    try {
      await sellerAPI.updateProduct(product.id, { is_active: !product.is_active });
      toast.success(product.is_active ? 'Product hidden' : 'Product visible');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 bg-dark-100 rounded-xl"></div>)}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">My Products</h1>
          <p className="text-sm text-dark-500 mt-1">{products.length} products total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProducts} className="btn-secondary !py-2.5 text-sm flex items-center gap-2"><FiRefreshCw size={14} /> Refresh</button>
          <Link href="/seller/products/new" className="btn-primary !py-2.5 text-sm flex items-center gap-2"><FiPlus /> Add Product</Link>
        </div>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50 border-b border-dark-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Product</th>
              <th className="text-left px-5 py-3 font-semibold text-dark-600">Category</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Price</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Stock</th>
              <th className="text-center px-5 py-3 font-semibold text-dark-600">Available</th>
              <th className="text-center px-5 py-3 font-semibold text-dark-600">Visible</th>
              <th className="text-right px-5 py-3 font-semibold text-dark-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-dark-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-dark-50 border border-dark-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                       {(() => {
                         let imgs = [];
                         try {
                           imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
                         } catch (e) { imgs = []; }
                         
                         if (imgs.length > 0) {
                           return <Image src={getImageUrl(imgs[0])} className="w-full h-full object-contain" alt={p.name} width={48} height={48} />;
                         }
                         return <FiPackage className="text-dark-200" />;
                       })()}
                    </div>
                    <div>
                      <p className="font-bold text-dark-800 leading-tight mb-0.5">{p.name}</p>
                      <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest">{p.unit || 'piece'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-dark-600">{p.category?.name}</td>
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-dark-900">₹{p.price}</span>
                  {p.compare_at_price && <span className="text-xs text-dark-400 line-through ml-1">₹{p.compare_at_price}</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-semibold ${p.stock <= 0 ? 'text-red-600' : p.stock < 10 ? 'text-yellow-600' : 'text-dark-800'}`}>
                    {p.stock}
                  </span>
                  {p.stock <= 0 && <span className="text-xs text-red-500 ml-1">⚠️</span>}
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => toggleAvailability(p)}
                    className={`p-1.5 rounded-lg transition-all ${p.is_available ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}>
                    {p.is_available ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
                  </button>
                </td>
                <td className="px-5 py-4 text-center">
                  <button onClick={() => toggleActive(p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${p.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    {p.is_active ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Link href={`/seller/products/${p.id}/edit`} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"><FiEdit size={15} /></Link>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">📦</span>
            <p className="text-dark-500 mt-4">No products yet</p>
            <Link href="/seller/products/new" className="btn-primary inline-block mt-4 text-sm">Add Your First Product</Link>
          </div>
        )}
      </div>
    </div>
  );
}
