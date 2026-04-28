'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiUploadCloud, FiXCircle, FiExternalLink, FiLayers, FiEye } from 'react-icons/fi';
import { adminAPI, commonAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', position: 0, is_active: true });

  const fetch = () => { 
    setLoading(true); 
    adminAPI.getBanners().then(r => setBanners(r.data || [])).catch(() => {}).finally(() => setLoading(false)); 
  };
  useEffect(fetch, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await commonAPI.uploadImage(formData);
      setForm(prev => ({ ...prev, image_url: res.data.url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url) return toast.error('Please upload a banner image');

    try {
      if (editId) { 
        await adminAPI.updateBanner(editId, form); 
        toast.success('Banner updated'); 
      }
      else { 
        await adminAPI.createBanner(form); 
        toast.success('New banner added'); 
      }
      setShowForm(false); 
      setEditId(null); 
      setForm({ title: '', image_url: '', link_url: '', position: 0, is_active: true }); 
      fetch();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (b) => { 
    setForm({ title: b.title, image_url: b.image_url, link_url: b.link_url || '', position: b.position, is_active: b.is_active }); 
    setEditId(b.id); 
    setShowForm(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { 
    if (!confirm('Are you sure you want to delete this banner?')) return; 
    try { 
      await adminAPI.deleteBanner(id); 
      toast.success('Banner removed'); 
      fetch(); 
    } catch(err) { toast.error(err.message); }
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  if (loading && banners.length === 0) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-md w-1/4"></div>
      <div className="h-40 bg-white rounded-2xl shadow-sm"></div>
    </div>
  );

  return (
    <div className="animate-fk-fade pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Promotional Banners</h1>
          <p className="text-sm text-slate-500 font-medium">Control the visual highlights of your marketplace</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: '', image_url: '', link_url: '', position: 0, is_active: true }); }} 
          className="px-6 py-3 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-xl shadow-fb-blue/20 transition-all flex items-center gap-2"
        >
          {showForm ? <FiXCircle /> : <FiPlus />} {showForm ? 'Close Form' : 'Create New Banner'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10 animate-fk-fade">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <FiLayers className="text-fb-blue" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{editId ? 'Modify Banner Information' : 'Upload New Promotion'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                <label className={labelClass}>Banner Graphics *</label>
                <div className="relative group">
                  {form.image_url ? (
                    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-fb-blue px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl">
                          Change Image
                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className={`aspect-[21/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${uploading ? 'bg-slate-50 border-fb-blue' : 'bg-slate-50 border-slate-200 hover:border-fb-blue hover:bg-blue-50/30'}`}>
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-fb-blue border-t-transparent"></div>
                      ) : (
                        <>
                          <FiUploadCloud size={32} className="text-slate-400 group-hover:text-fb-blue transition-colors" />
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-700">Upload Banner Image</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Recommended: 1200 x 400 px</p>
                          </div>
                        </>
                      )}
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Details */}
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Banner Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="e.g. Summer Mega Sale" required />
                </div>
                <div>
                  <label className={labelClass}>Target URL (On Click)</label>
                  <div className="relative">
                    <FiExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={form.link_url} onChange={e => update('link_url', e.target.value)} className={`${inputClass} pl-10`} placeholder="/products?category=summer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Banner Position</label>
                    <select value={form.position} onChange={e => update('position', e.target.value)} className={inputClass}>
                      <option value="0">Top Hero Slider</option>
                      <option value="10">Middle Advertisement</option>
                      <option value="20">Bottom Promo</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors w-full border border-slate-100">
                      <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="w-5 h-5 rounded text-fb-blue" />
                      <span className="text-sm font-black text-slate-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-slate-50">
              <button type="submit" disabled={uploading} className="px-10 py-3.5 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-lg shadow-fb-blue/20 transition-all">
                {editId ? 'Save Changes' : 'Publish Banner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-10 py-3.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row overflow-hidden group">
            <div className="md:w-72 aspect-[21/9] md:aspect-auto bg-slate-100 flex-shrink-0 relative overflow-hidden">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
              {!b.is_active && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Inactive</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-black text-slate-900">{b.title}</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">POS: {b.position}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <FiExternalLink className="text-fb-blue" /> {b.link_url || 'No redirect URL'}
              </p>
            </div>

            <div className="p-6 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-50">
              <button 
                onClick={() => handleEdit(b)} 
                className="p-3 rounded-xl bg-blue-50 text-fb-blue hover:bg-fb-blue hover:text-white transition-all shadow-sm shadow-fb-blue/5"
              >
                <FiEdit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(b.id)} 
                className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-500/5"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {banners.length === 0 && !loading && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <FiImage className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-slate-900 font-black">No Active Banners</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Upload your first promotional banner to engage customers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
