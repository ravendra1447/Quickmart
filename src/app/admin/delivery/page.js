'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTruck, FiMapPin, FiPhone, FiMail, FiStar, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', vehicle_type: 'bike', vehicle_number: '', is_active: true 
  });

  const fetch = () => { 
    setLoading(true); 
    adminAPI.getDeliveryPartners().then(r => setPartners(r.data || [])).catch(() => {}).finally(() => setLoading(false)); 
  };
  useEffect(fetch, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { 
        await adminAPI.updateDeliveryPartner(editId, form); 
        toast.success('Partner updated successfully'); 
      }
      else { 
        await adminAPI.createDeliveryPartner(form); 
        toast.success('Delivery partner added'); 
      }
      setShowForm(false); 
      setEditId(null); 
      setForm({ name: '', phone: '', email: '', vehicle_type: 'bike', vehicle_number: '', is_active: true }); 
      fetch();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (p) => { 
    setForm({ 
      name: p.name, phone: p.phone, email: p.email || '', 
      vehicle_type: p.vehicle_type, vehicle_number: p.vehicle_number || '', is_active: p.is_active 
    }); 
    setEditId(p.id); 
    setShowForm(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => { 
    if (!confirm('Are you sure you want to remove this delivery partner?')) return; 
    try { 
      await adminAPI.deleteDeliveryPartner(id); 
      toast.success('Partner removed'); 
      fetch(); 
    } catch(err) { toast.error(err.message); }
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const statusBadges = {
    idle: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    on_delivery: 'bg-blue-50 text-blue-600 border-blue-100',
    offline: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  const vehicleIcons = { bike: '🏍️', scooter: '🛵', bicycle: '🚲', walk: '🚶' };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  if (loading && partners.length === 0) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-md w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl shadow-sm"></div>)}
      </div>
    </div>
  );

  return (
    <div className="animate-fk-fade pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Delivery Fleet</h1>
          <p className="text-sm text-slate-500 font-medium">Manage and track your last-mile delivery partners</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', phone: '', email: '', vehicle_type: 'bike', vehicle_number: '', is_active: true }); }} 
          className="px-6 py-3 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-xl shadow-fb-blue/20 transition-all flex items-center gap-2"
        >
          {showForm ? <FiXCircle /> : <FiPlus />} {showForm ? 'Close Form' : 'Add New Partner'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-10 animate-fk-fade">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
            <FiTruck className="text-fb-blue" size={20} />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{editId ? 'Edit Partner Details' : 'New Partner Registration'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Partner Name *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Full Name" required />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.phone} onChange={e => update('phone', e.target.value)} className={`${inputClass} pl-10`} placeholder="9876543210" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.email} onChange={e => update('email', e.target.value)} className={`${inputClass} pl-10`} placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select value={form.vehicle_type} onChange={e => update('vehicle_type', e.target.value)} className={inputClass}>
                  <option value="bike">Motorcycle (Bike)</option>
                  <option value="scooter">Scooter</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walk">On Foot (Walk)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Vehicle Plate Number</label>
                <input value={form.vehicle_number} onChange={e => update('vehicle_number', e.target.value)} className={inputClass} placeholder="UP32 AB 1234" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors w-full border border-transparent hover:border-slate-100">
                  <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} className="w-5 h-5 rounded text-fb-blue focus:ring-fb-blue" />
                  <span className="text-sm font-black text-slate-700">Account Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-10 py-3.5 bg-fk-blue text-white font-black rounded-xl text-sm hover:bg-fk-blue-hover shadow-lg shadow-fb-blue/20 transition-all">
                {editId ? 'Save Changes' : 'Register Partner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-10 py-3.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm hover:bg-slate-200 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map(p => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-50 transition-colors">
                  {vehicleIcons[p.vehicle_type] || '🏍️'}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadges[p.status] || 'bg-slate-100'}`}>
                  {p.status?.replace('_', ' ')}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">{p.name}</h3>
              <div className="flex flex-col gap-1.5 mb-6">
                <p className="text-sm text-slate-500 font-bold flex items-center gap-2"><FiPhone className="text-fb-blue" size={14} /> {p.phone}</p>
                {p.vehicle_number && <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2"><FiTruck className="text-slate-400" size={14} /> {p.vehicle_number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deliveries</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{p.total_deliveries || 0}</span>
                    <FiTrendingUp className="text-emerald-500" size={14} />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{p.rating || '5.0'}</span>
                    <FiStar className="text-amber-500 fill-amber-500" size={14} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleEdit(p)} 
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-fb-blue rounded-xl text-xs font-black hover:bg-fb-blue hover:text-white transition-all"
                >
                  <FiEdit /> Edit Profile
                </button>
                <button 
                  onClick={() => handleDelete(p.id)} 
                  className="w-12 flex items-center justify-center py-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {partners.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <FiTruck size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Delivery Partners</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Start by adding your first delivery partner to handle orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
