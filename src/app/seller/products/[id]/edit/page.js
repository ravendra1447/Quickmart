'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiUpload, FiPackage, FiTag, FiDollarSign, FiPlus, FiTrash2, FiInfo, FiLayers, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { sellerAPI, productAPI, getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: '', description: '', price: '', compare_at_price: '', 
    stock: '', category_id: '', subcategory_id: '', unit: 'piece', sku: '',
    is_active: true, is_available: true
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsRes, productRes] = await Promise.all([
          productAPI.getCategories(),
          sellerAPI.getProduct(id)
        ]);
        
        setCategories(catsRes.data || []);
        
        const p = productRes.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price || '',
          compare_at_price: p.compare_at_price || '',
          stock: p.stock || 0,
          category_id: p.category_id || '',
          subcategory_id: p.subcategory_id || '',
          unit: p.unit || 'piece',
          sku: p.sku || '',
          is_active: p.is_active,
          is_available: p.is_available
        });
        
        let imgs = [];
        try {
          imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
        } catch (e) { imgs = []; }
        setExistingImages(imgs);
        
      } catch (err) {
        toast.error('Failed to load product data');
        router.push('/seller/products');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, router]);

  useEffect(() => {
    if (form.category_id && categories.length > 0) {
      const cat = categories.find((c) => c.id == form.category_id);
      setSubcategories(cat?.subcategories || []);
    }
  }, [form.category_id, categories]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + existingImages.length + selected.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setLoading(true);
    const compressedFiles = await Promise.all(selected.map(file => compressImage(file)));
    setFiles([...files, ...compressedFiles]);
    const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setLoading(false);
  };

  const removeNewFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (img) => {
    setExistingImages(existingImages.filter(i => i !== img));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => { 
        if (form[k] !== undefined && form[k] !== null) {
          formData.append(k, form[k]); 
        }
      });
      
      // Append existing images that weren't deleted
      formData.append('existing_images', JSON.stringify(existingImages));
      
      // Append new files
      files.forEach((f) => formData.append('images', f));
      
      await sellerAPI.updateProduct(id, formData);
      toast.success('Product updated successfully!');
      router.push('/seller/products');
    } catch (err) { 
      toast.error(err.message || 'Failed to update product'); 
    }
    setSaving(false);
  };

  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const inputClass = "w-full px-5 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl text-dark-900 placeholder-dark-400 focus:bg-white focus:border-[#fb641b] focus:ring-4 focus:ring-[#fb641b]/5 outline-none transition-all font-bold text-sm";
  const labelClass = "text-xs font-black text-dark-400 uppercase tracking-[0.15em] ml-1 mb-2 block";

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-dark-300 animate-pulse">Loading Product Data...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-dark-100 py-8 mb-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/products" className="w-10 h-10 rounded-full border border-dark-100 flex items-center justify-center hover:bg-dark-50 transition-all"><FiArrowLeft /></Link>
            <div>
              <h1 className="text-2xl font-black text-dark-900 tracking-tight">Edit Product</h1>
              <p className="text-xs text-dark-500 font-bold uppercase tracking-widest mt-0.5">ID: #{id} • {form.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            {/* Essentials */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiPackage className="text-[#fb641b]" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Product Essentials</h2>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                    <label className={labelClass}>Product Title *</label>
                    <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass} rows={5} />
                  </div>
               </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiUpload className="text-indigo-500" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Manage Images</h2>
               </div>
               <div className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                    {/* Existing Images */}
                    {existingImages.map((src, i) => (
                      <div key={`old-${i}`} className="relative aspect-square rounded-[24px] overflow-hidden border-2 border-dark-50 group shadow-sm">
                        <Image src={getImageUrl(src)} className="w-full h-full object-cover" alt="Product" width={200} height={200} unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <button type="button" onClick={() => removeExistingImage(src)} className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center">
                              <FiTrash2 />
                           </button>
                        </div>
                      </div>
                    ))}
                    {/* New Previews */}
                    {previews.map((src, i) => (
                      <div key={`new-${i}`} className="relative aspect-square rounded-[24px] overflow-hidden border-2 border-[#fb641b]/20 group shadow-sm">
                        <Image src={src} className="w-full h-full object-cover" alt="Preview" width={200} height={200} unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                           <button type="button" onClick={() => removeNewFile(i)} className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center">
                              <FiTrash2 />
                           </button>
                        </div>
                        <span className="absolute top-2 right-2 bg-[#fb641b] text-white text-[8px] font-black uppercase px-2 py-1 rounded-md">New</span>
                      </div>
                    ))}
                    {existingImages.length + files.length < 5 && (
                      <label className="aspect-square rounded-[24px] border-2 border-dashed border-dark-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-dark-50 hover:border-[#fb641b] transition-all group">
                        <FiPlus size={24} className="text-dark-300" />
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
               </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="p-6 border-b border-dark-50 bg-dark-50/30 flex items-center gap-3">
                  <FiDollarSign className="text-emerald-500" />
                  <h2 className="text-sm font-black text-dark-800 uppercase tracking-tight">Pricing & Stock</h2>
               </div>
               <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className={labelClass}>Price (₹) *</label>
                      <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>MRP (₹)</label>
                      <input type="number" value={form.compare_at_price} onChange={(e) => update('compare_at_price', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClass}>Stock *</label>
                      <input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Unit</label>
                      <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className={inputClass}>
                        <option>piece</option><option>kg</option><option>gram</option><option>litre</option><option>dozen</option><option>pack</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>SKU</label>
                      <input value={form.sku} onChange={(e) => update('sku', e.target.value)} className={inputClass} />
                    </div>
                  </div>
               </div>
            </div>
          </div>

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
                      <select value={form.subcategory_id} onChange={(e) => update('subcategory_id', e.target.value)} className={inputClass}>
                        <option value="">Select Subcategory</option>
                        {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                   </div>
                   
                   <div className="pt-4 border-t border-dark-50 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                         <div className={`w-10 h-5 rounded-full transition-all relative ${form.is_active ? 'bg-[#fb641b]' : 'bg-dark-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.is_active ? 'left-6' : 'left-1'}`}></div>
                         </div>
                         <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="hidden" />
                         <span className="text-xs font-black text-dark-700 uppercase tracking-widest">Active Status</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                         <div className={`w-10 h-5 rounded-full transition-all relative ${form.is_available ? 'bg-green-500' : 'bg-dark-200'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.is_available ? 'left-6' : 'left-1'}`}></div>
                         </div>
                         <input type="checkbox" checked={form.is_available} onChange={e => update('is_available', e.target.checked)} className="hidden" />
                         <span className="text-xs font-black text-dark-700 uppercase tracking-widest">In Stock Status</span>
                      </label>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-dark-100 space-y-4">
                <button type="submit" disabled={saving} className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 transition-all active:scale-[0.98] ${saving ? 'bg-dark-100 text-dark-400 cursor-not-allowed' : 'bg-[#fb641b] text-white hover:bg-[#e65a18]'}`}>
                   {saving ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => router.push('/seller/products')} className="w-full py-4 rounded-2xl font-black text-sm text-dark-400 hover:text-dark-900 transition-all uppercase tracking-widest text-center">
                   Cancel Edits
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
