'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTag, FiPercent, FiXCircle, FiCheckCircle, FiInfo, FiTrendingUp } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ 
    code: '', description: '', discount_type: 'percentage', 
    discount_value: '', min_order_amount: '', max_discount: '', 
    usage_limit: '', per_user_limit: 1, is_active: true 
  });

  const fetch = () => { 
    setLoading(true); 
    adminAPI.getCoupons().then(r => setCoupons(r.data || [])).catch(() => {}).finally(() => setLoading(false)); 
  };
  useEffect(fetch, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { 
        await adminAPI.updateCoupon(editId, form); 
        toast.success('Coupon updated successfully'); 
      }
      else { 
        await adminAPI.createCoupon(form); 
        toast.success('New coupon created'); 
      }
      setShowForm(false); 
      setEditId(null); 
      setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', usage_limit: '', per_user_limit: 1, is_active: true }); 
      fetch();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (c) => { 
    setForm({ 
      code: c.code, description: c.description || '', 
      discount_type: c.discount_type, discount_value: c.discount_value, 
      min_order_amount: c.min_order_amount || '', max_discount: c.max_discount || '', 
      usage_limit: c.usage_limit || '', per_user_limit: c.per_user_limit, is_active: c.is_active 
    }); 
    setEditId(c.id); 
    setShowForm(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { 
    if (!confirm('Are you sure you want to delete this coupon?')) return; 
    try { 
      await adminAPI.deleteCoupon(id); 
      toast.success('Coupon deleted'); 
      fetch(); 
    } catch(err) { toast.error(err.message); }
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  if (loading && coupons.length === 0) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-md w-1/4"></div>
      <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
    </div>
  );

  return (
    <div className="animate-fk-fade pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Coupons & Offers</h1>
          <p className="text-sm text-slate-500 font-medium">Create discount codes to boost your platform sales</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', usage_limit: '', per_user_limit: 1, is_active: true }); }} 
          className="px-6 py-3 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-xl shadow-fb-blue/20 transition-all flex items-center gap-2"
        >
          {showForm ? <FiXCircle /> : <FiPlus />} {showForm ? 'Close Form' : 'Add New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10 animate-fk-fade">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <FiTag className="text-fb-blue" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{editId ? 'Edit Discount Details' : 'Configure New Coupon'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Coupon Code *</label>
                <input value={form.code} onChange={e => update('code', e.target.value.toUpperCase())} className={`${inputClass} font-mono font-bold text-fb-blue`} placeholder="e.g. WELCOME50" required />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Short Description</label>
                <input value={form.description} onChange={e => update('description', e.target.value)} className={inputClass} placeholder="e.g. 50% off on first order" />
              </div>
              <div>
                <label className={labelClass}>Discount Type</label>
                <select value={form.discount_type} onChange={e => update('discount_type', e.target.value)} className={inputClass}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Discount Value *</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{form.discount_type === 'percentage' ? '%' : '₹'}</span>
                  <input type="number" value={form.discount_value} onChange={e => update('discount_value', e.target.value)} className={inputClass} placeholder="0" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Min Order Amount</label>
                <input type="number" value={form.min_order_amount} onChange={e => update('min_order_amount', e.target.value)} className={inputClass} placeholder="₹ 0" />
              </div>
              <div>
                <label className={labelClass}>Max Discount (Limit)</label>
                <input type="number" value={form.max_discount} onChange={e => update('max_discount', e.target.value)} className={inputClass} placeholder="₹ No limit" />
              </div>
              <div>
                <label className={labelClass}>Total Usage Limit</label>
                <input type="number" value={form.usage_limit} onChange={e => update('usage_limit', e.target.value)} className={inputClass} placeholder="e.g. 1000" />
              </div>
              <div>
                <label className={labelClass}>Per User Limit</label>
                <input type="number" value={form.per_user_limit} onChange={e => update('per_user_limit', e.target.value)} className={inputClass} placeholder="1" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors w-full border border-slate-100">
                  <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="w-5 h-5 rounded text-fb-blue" />
                  <span className="text-sm font-black text-slate-700">Coupon Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-10 py-3.5 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-lg shadow-fb-blue/20 transition-all">
                {editId ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-10 py-3.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon Code</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount Info</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Usage</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-mono font-black text-fb-blue text-sm bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-fb-blue/10 mb-1">{c.code}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{c.description || 'No description'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">MIN ORDER: ₹{c.min_order_amount || 0}</p>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-slate-900">{c.used_count || 0}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">of {c.usage_limit || '∞'}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {c.is_active ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleEdit(c)} className="p-2.5 rounded-xl bg-blue-50 text-fb-blue hover:bg-fb-blue hover:text-white transition-all"><FiEdit size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {coupons.length === 0 && !loading && (
          <div className="py-20 text-center">
            <FiTag className="mx-auto text-slate-200 mb-4" size={40} />
            <h3 className="text-slate-900 font-black">No Coupons Found</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Start creating promotional codes to grow your platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}
