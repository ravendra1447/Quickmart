'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiUploadCloud, FiXCircle, FiGrid, FiLayers } from 'react-icons/fi';
import { adminAPI, commonAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddSub, setShowAddSub] = useState(null);
  const [form, setForm] = useState({ name: '', image_url: '' });
  const [subForm, setSubForm] = useState({ name: '', image_url: '' });

  const fetch = () => {
    setLoading(true);
    adminAPI.getCategories().then((r) => setCategories(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleImageUpload = async (e, isSub = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await commonAPI.uploadImage(formData);
      if (isSub) setSubForm(prev => ({ ...prev, image_url: res.data.url }));
      else setForm(prev => ({ ...prev, image_url: res.data.url }));
      toast.success('Image uploaded');
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!form.image_url) return toast.error('Please upload a category image');
    try { 
      await adminAPI.createCategory(form); 
      toast.success('Category created dynamically!'); 
      setForm({ name: '', image_url: '' }); 
      setShowAdd(false); 
      fetch(); 
    } catch (err) { toast.error(err.message); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure? This will remove all subcategories too.')) return;
    try { await adminAPI.deleteCategory(id); toast.success('Category removed'); fetch(); }
    catch (err) { toast.error(err.message); }
  };

  const addSubcategory = async (e, categoryId) => {
    e.preventDefault();
    try { 
      await adminAPI.createSubcategory({ category_id: categoryId, ...subForm }); 
      toast.success('Subcategory added'); 
      setSubForm({ name: '', image_url: '' }); 
      setShowAddSub(null); 
      fetch(); 
    } catch (err) { toast.error(err.message); }
  };

  const deleteSub = async (id) => {
    try { await adminAPI.deleteSubcategory(id); toast.success('Removed'); fetch(); }
    catch (err) { toast.error(err.message); }
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="animate-fk-fade pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Category Architecture</h1>
          <p className="text-sm text-slate-500 font-medium">Everything here is 100% dynamic and reflects on the homepage</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="px-6 py-3 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-xl shadow-fb-blue/20 transition-all flex items-center gap-2"
        >
          {showAdd ? <FiXCircle /> : <FiPlus />} {showAdd ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10 animate-fk-fade">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <FiGrid className="text-fb-blue" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Create Dynamic Category</h2>
          </div>
          <form onSubmit={addCategory} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className={labelClass}>Category Icon/Image *</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {form.image_url ? <img src={form.image_url} className="w-full h-full object-contain" /> : <FiImage className="text-slate-300" size={32} />}
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-fb-blue hover:text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} accept="image/*" />
                  </label>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <label className={labelClass}>Category Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. Electronics, Fashion" required />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={uploading} className="px-10 py-3.5 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-lg shadow-fb-blue/20 transition-all">Save Category</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-10 py-3.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
            <div className="flex flex-wrap items-center justify-between p-6 bg-slate-50/30 group-hover:bg-slate-50/80 transition-colors border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 p-2 shadow-sm">
                  <img src={cat.image_url || 'https://via.placeholder.com/128'} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{cat.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cat.subcategories?.length || 0} Dynamic Sub-sections</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddSub(showAddSub === cat.id ? null : cat.id)} className="p-3 rounded-xl bg-blue-50 text-fb-blue hover:bg-fb-blue hover:text-white transition-all"><FiPlus size={18} /></button>
                <button onClick={() => deleteCategory(cat.id)} className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 size={18} /></button>
              </div>
            </div>

            {showAddSub === cat.id && (
              <form onSubmit={(e) => addSubcategory(e, cat.id)} className="p-6 bg-blue-50/30 border-b border-slate-50 animate-fk-fade">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelClass}>Subcategory Name</label>
                    <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} className={inputClass} placeholder="e.g. Smartphones, T-Shirts" required />
                  </div>
                  <button type="submit" className="px-8 py-3.5 bg-fk-blue text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-fk-blue-hover transition-all">Add Sub-cat</button>
                </div>
              </form>
            )}

            {cat.subcategories?.length > 0 && (
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {cat.subcategories.map((sub) => (
                    <div key={sub.id} className="relative flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl group/sub hover:border-fb-blue transition-all">
                      <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                      <button onClick={() => deleteSub(sub.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/sub:opacity-100"><FiTrash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && !loading && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <FiLayers className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-slate-900 font-black">No Categories Yet</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Start by adding your first dynamic category to populate the homepage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
