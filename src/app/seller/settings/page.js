'use client';
import { useEffect, useState } from 'react';
import { FiMapPin, FiClock, FiSave, FiPhone, FiInfo, FiCompass, FiZap, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { sellerAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const ServiceAreasSection = ({ inputClass, labelClass }) => {
  const [areas, setAreas] = useState([]);
  const [newPincode, setNewPincode] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  const fetchAreas = () => {
    sellerAPI.getStoreAreas().then(r => setAreas(r.data)).catch((err) => {
      console.error('Fetch Areas Error:', err);
    });
  };

  useEffect(fetchAreas, []);

  const addArea = async () => {
    if (!newPincode) return toast.error('Pincode is required');
    try {
      console.log('Adding area:', { pincode: newPincode, area_name: newAreaName });
      await sellerAPI.addStoreArea({ pincode: newPincode, area_name: newAreaName });
      setNewPincode('');
      setNewAreaName('');
      fetchAreas();
      toast.success('Area added!');
    } catch (err) { 
      console.error('Add Area Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to add area'); 
    }
  };

  const removeArea = async (id) => {
    try {
      await sellerAPI.removeStoreArea(id);
      fetchAreas();
      toast.success('Area removed');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner"><FiZap size={20} /></div>
        <h2 className="text-lg font-black text-slate-900">Serviceable Pincodes</h2>
      </div>
      <div className="p-8">
         <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex-1">
               <label className={labelClass}>Area Name (Optional)</label>
               <input value={newAreaName} onChange={e => setNewAreaName(e.target.value)} className={inputClass} placeholder="e.g. Indiranagar" />
            </div>
            <div className="w-full md:w-48">
               <label className={labelClass}>Pincode</label>
               <input value={newPincode} onChange={e => setNewPincode(e.target.value)} className={inputClass} placeholder="e.g. 226010" maxLength={6} />
            </div>
            <div className="flex items-end">
               <button type="button" onClick={addArea} className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all">ADD AREA</button>
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {areas.map(area => (
               <div key={area.id} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between group hover:border-fb-blue transition-all">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{area.area_name}</p>
                     <p className="text-sm font-black text-slate-800">{area.pincode}</p>
                  </div>
                  <button type="button" onClick={() => removeArea(area.id)} className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                     <FiZap className="rotate-45" size={12} />
                  </button>
               </div>
            ))}
            {areas.length === 0 && (
               <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold italic text-sm">
                  No specific pincodes added. Radius logic will be used.
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default function SellerStoreSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    store_name: '', store_description: '', business_address: '', store_phone: '',
    latitude: '', longitude: '', delivery_radius_km: 3, auto_accept: false,
    store_timings: { open: '08:00', close: '22:00' }, is_open: true,
  });

  useEffect(() => {
    console.log('🔄 Fetching seller profile...');
    
    sellerAPI.getProfile().then(r => {
      console.log('✅ Seller profile response:', r);
      const p = r.data;
      console.log('📋 Profile data:', p);
      setProfile(p);
      setForm({
        store_name: p.sellerProfile?.store_name || '',
        store_description: p.sellerProfile?.store_description || '',
        business_address: p.sellerProfile?.business_address || '',
        store_phone: p.sellerProfile?.store_phone || '',
        latitude: p.sellerProfile?.latitude || '',
        longitude: p.sellerProfile?.longitude || '',
        delivery_radius_km: p.sellerProfile?.delivery_radius_km || 3,
        auto_accept: p.sellerProfile?.auto_accept || false,
        store_timings: p.sellerProfile?.store_timings || { open: '08:00', close: '22:00' },
        is_open: p.sellerProfile?.is_open !== false,
        upi_id: p.upi_id || '',
        account_no: p.bank_details?.account_no || '',
        ifsc: p.bank_details?.ifsc || '',
        bank_name: p.bank_details?.bank_name || '',
      });
    }).catch((error) => {
      console.error('❌ Error fetching seller profile:', error);
      toast.error('Failed to load profile. Please try again.');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await sellerAPI.updateProfile(form);
      toast.success('Store settings saved successfully!');
    } catch (err) { toast.error(err.message); }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Detecting location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => { 
          // Only update lat/lng, keep other values unchanged
          setForm(f => ({ 
            ...f, 
            latitude: pos.coords.latitude, 
            longitude: pos.coords.longitude 
          })); 
          toast.dismiss();
          toast.success('Location updated!'); 
        },
        () => {
          toast.dismiss();
          toast.error('Location access denied');
        }
      );
    }
  };

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-md w-1/4"></div>
      <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
      <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
    </div>
  );

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fk-blue focus:ring-4 focus:ring-fk-blue/5 outline-none transition-all font-medium text-sm";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="animate-fk-fade pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Store Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Configure your shop identity and operational details</p>
      </div>

      <div className="space-y-8 max-w-5xl">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-fb-blue shadow-inner"><FiInfo size={20} /></div>
              <h2 className="text-lg font-black text-slate-900">Basic Information</h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Store Display Name</label>
                <input value={form.store_name} onChange={e => update('store_name', e.target.value)} className={inputClass} placeholder="e.g. Fresh Mart" />
              </div>
              <div>
                <label className={labelClass}>Contact Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.store_phone} onChange={e => update('store_phone', e.target.value)} className={`${inputClass} pl-10`} placeholder="e.g. +91 9876543210" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Store Description</label>
                <textarea value={form.store_description} onChange={e => update('store_description', e.target.value)} className={inputClass} rows={3} placeholder="Tell customers what you sell..." />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Business Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-4 text-slate-400" />
                  <textarea value={form.business_address} onChange={e => update('business_address', e.target.value)} className={`${inputClass} pl-10`} rows={2} placeholder="Full shop address..." />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Radius Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner"><FiCompass size={20} /></div>
              <h2 className="text-lg font-black text-slate-900">Location & Delivery</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input value={form.latitude} onChange={e => update('latitude', e.target.value)} className={inputClass} placeholder="26.8467" />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input value={form.longitude} onChange={e => update('longitude', e.target.value)} className={inputClass} placeholder="80.9462" />
                </div>
                <div>
                  <label className={labelClass}>Delivery Radius (KM)</label>
                  <input type="number" step="0.5" value={form.delivery_radius_km} onChange={e => update('delivery_radius_km', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <button type="button" onClick={detectLocation} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:bg-white hover:border-fb-blue hover:text-fb-blue shadow-sm transition-all flex items-center gap-2">
                   <FiMapPin /> Update My Current Location
                 </button>
                 <p className="text-xs text-slate-400 font-bold max-w-xs">Your location is saved permanently. Use this button to update coordinates only.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button type="submit" className="px-12 py-4 bg-fk-blue text-white font-black rounded-2xl text-lg hover:bg-fk-blue-hover shadow-xl shadow-fb-blue/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3">
              <FiSave size={22} /> Save Profile Changes
            </button>
          </div>
        </form>

        {/* Serviceable Pincodes Section */}
        <ServiceAreasSection inputClass={inputClass} labelClass={labelClass} />

        {/* Bank & Payouts Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner"><FiCreditCard size={20} /></div>
            <h2 className="text-lg font-black text-slate-900">Bank & Payout Details</h2>
          </div>
          <div className="p-8">
            <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest">Required for receiving your sales earnings</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>UPI ID</label>
                <input value={form.upi_id} onChange={e => update('upi_id', e.target.value)} className={inputClass} placeholder="merchant@upi" />
              </div>
              <div>
                <label className={labelClass}>Bank Name</label>
                <input value={form.bank_name} onChange={e => update('bank_name', e.target.value)} className={inputClass} placeholder="e.g. ICICI Bank" />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input value={form.account_no} onChange={e => update('account_no', e.target.value)} className={inputClass} placeholder="XXXX XXXX XXXX" />
              </div>
              <div>
                <label className={labelClass}>IFSC Code</label>
                <input value={form.ifsc} onChange={e => update('ifsc', e.target.value)} className={inputClass} placeholder="ICIC0001234" />
              </div>
            </div>
          </div>
        </div>

        {/* Timings Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner"><FiClock size={20} /></div>
            <h2 className="text-lg font-black text-slate-900">Operational Timings</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className={labelClass}>Store Opens</label>
                    <input type="time" value={form.store_timings.open} onChange={e => setForm(f => ({ ...f, store_timings: { ...f.store_timings, open: e.target.value } }))} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Store Closes</label>
                    <input type="time" value={form.store_timings.close} onChange={e => setForm(f => ({ ...f, store_timings: { ...f.store_timings, close: e.target.value } }))} className={inputClass} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className={labelClass}>Automation & Status</label>
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${form.auto_accept ? 'bg-fb-blue-bg border-fb-blue/20' : 'bg-slate-50 border-slate-100'}`} onClick={() => update('auto_accept', !form.auto_accept)}>
                    <div className="flex items-center gap-3">
                      <FiZap className={form.auto_accept ? 'text-fb-blue' : 'text-slate-400'} size={20} />
                      <div>
                        <p className="text-sm font-black text-slate-900">Auto-Accept Orders</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Orders will be confirmed instantly</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${form.auto_accept ? 'bg-fb-blue text-white' : 'bg-slate-200'}`}>
                      {form.auto_accept && <FiCheckCircle size={14} />}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${form.is_open ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`} onClick={() => update('is_open', !form.is_open)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${form.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Store Visibility</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{form.is_open ? 'Customers can see and buy' : 'Store is currently hidden'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${form.is_open ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {form.is_open ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
