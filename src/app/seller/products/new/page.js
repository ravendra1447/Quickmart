'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiUpload, FiPackage, FiTag, FiDollarSign, FiPlus, FiTrash2, FiInfo, FiLayers, FiAlertCircle, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { sellerAPI, productAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', description: '', price: '', compare_at_price: '', 
    stock: '', category_id: '', subcategory_id: '', unit: 'piece', sku: '' 
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    productAPI.getCategories().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.category_id) {
      const cat = categories.find((c) => c.id == form.category_id);
      setSubcategories(cat?.subcategories || []);
      // Reset subcategory if it doesn't belong to the new category
      if (form.subcategory_id && !cat?.subcategories?.find(s => s.id == form.subcategory_id)) {
        update('subcategory_id', '');
      }
    } else {
      setSubcategories([]);
    }
  }, [form.category_id, categories]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setFiles([...files, ...selected]);
    const newPreviews = selected.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) return toast.error('Please select a category');
    
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => { 
        if (form[k] !== undefined && form[k] !== null && form[k] !== '') {
          formData.append(k, form[k]); 
        }
      });
      files.forEach((f) => formData.append('images', f));
      
      await sellerAPI.createProduct(formData);
      toast.success('Product listed successfully!');
      router.push('/seller/products');
    } catch (err) { 
      toast.error(err.message || 'Failed to list product'); 
    }
    setLoading(false);
  };

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const inputClass = "w-full px-5 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl text-dark-900 placeholder-dark-400 focus:bg-white focus:border-[#fb641b] focus:ring-4 focus:ring-[#fb641b]/5 outline-none transition-all font-bold text-sm";
  const labelClass = "text-xs font-black text-dark-400 uppercase tracking-[0.15em] ml-1 mb-2 block";

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-dark-100 py-8 mb-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/products" className="w-10 h-10 rounded-full border border-dark-100 flex items-center justify-center hover:bg-dark-50 transition-all"><FiArrowLeft /></Link>
            <div>
              <h1 className="text-2xl font-black text-dark-900 tracking-tight">List New Product</h1>
              <p className="text-xs text-dark-500 font-bold uppercase tracking-widest mt-0.5">Seller Inventory Manager</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl text-green-600">
             <FiCheckCircle size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Active Store</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Basic Info */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiPackage className="text-[#fb641b]" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Product Details</h2>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                    <label className={labelClass}>Product Title *</label>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} placeholder="e.g. Fresh Red Apples (1kg)" required />
                  </div>
                  <div>
                    <label className={labelClass}>Detailed Description</label>
                    <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass} rows={5} placeholder="Describe the quality, freshness, and source..." />
                  </div>
               </div>
            </div>

            {/* Section 2: Pricing & Inventory */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiDollarSign className="text-emerald-500" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Pricing & Stock</h2>
               </div>
               <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className={labelClass}>Selling Price (₹) *</label>
                      <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className={inputClass} placeholder="0.00" step="0.01" required />
                    </div>
                    <div>
                      <label className={labelClass}>M.R.P / Compare Price (₹)</label>
                      <input type="number" value={form.compare_at_price} onChange={(e) => update('compare_at_price', e.target.value)} className={inputClass} placeholder="0.00" step="0.01" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Initial Stock *</label>
                      <input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} className={inputClass} placeholder="0" required />
                    </div>
                    <div>
                      <label className={labelClass}>Unit</label>
                      <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className={inputClass}>
                        <option>piece</option><option>kg</option><option>gram</option><option>litre</option><option>dozen</option><option>pack</option>
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>SKU (Optional)</label>
                      <input value={form.sku} onChange={(e) => update('sku', e.target.value)} className={inputClass} placeholder="APP-001" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Section 3: Media */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiUpload className="text-indigo-500" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Product Images</h2>
               </div>
               <div className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-[24px] overflow-hidden border-2 border-dark-50 group shadow-sm">
                        <img src={src} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <button type="button" onClick={() => removeFile(i)} className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all">
                              <FiTrash2 />
                           </button>
                        </div>
                        {i === 0 && <span className="absolute bottom-2 left-2 bg-[#fb641b] text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">Main Cover</span>}
                      </div>
                    ))}
                    {files.length < 5 && (
                      <label className="aspect-square rounded-[24px] border-2 border-dashed border-dark-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-dark-50 hover:border-[#fb641b] transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-dark-50 flex items-center justify-center text-dark-300 group-hover:bg-[#fb641b] group-hover:text-white transition-all shadow-sm">
                          <FiPlus size={24} />
                        </div>
                        <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Add Photo</span>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="mt-8 text-[11px] text-dark-400 font-bold uppercase tracking-[0.1em] flex items-center gap-2"><FiInfo className="text-[#fb641b]" /> Recommended: High quality square images. Max 5.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Categorization & Publish */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
             <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
                <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                   <FiLayers className="text-amber-500" />
                   <h3 className="text-sm font-black text-dark-800 uppercase tracking-tight">Organization</h3>
                </div>
                <div className="p-6 space-y-6">
                   <div>
                      <label className={labelClass}>Main Category *</label>
                      <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className={inputClass} required>
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className={labelClass}>Sub-Category</label>
                      <select value={form.subcategory_id} onChange={(e) => update('subcategory_id', e.target.value)} className={inputClass} disabled={!form.category_id}>
                        <option value="">Select Subcategory</option>
                        {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      {!form.category_id && <p className="text-[10px] text-orange-500 font-bold mt-2 uppercase tracking-wider">Choose category first</p>}
                   </div>
                </div>
             </div>

             {/* Help Card */}
             <div className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-4">
                      <FiAlertCircle size={24} className="text-[#fb641b]" />
                   </div>
                   <h4 className="text-lg font-black mb-2 tracking-tight">Need Help?</h4>
                   <p className="text-sm text-dark-300 font-medium leading-relaxed">Ensure your product title and images are clear to get more orders. Contact admin for category requests.</p>
                </div>
                <FiShoppingBag className="absolute -bottom-8 -right-8 text-white/5 rotate-12" size={140} />
             </div>

             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-dark-100 space-y-4">
                <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 transition-all active:scale-[0.98] ${loading ? 'bg-dark-100 text-dark-400 cursor-not-allowed' : 'bg-[#fb641b] text-white hover:bg-[#e65a18]'}`}>
                   {loading ? 'Publishing...' : 'List Product'}
                </button>
                <button type="button" onClick={() => router.push('/seller/products')} className="w-full py-4 rounded-2xl font-black text-sm text-dark-400 hover:text-dark-900 transition-all uppercase tracking-widest">
                   Discard Draft
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
