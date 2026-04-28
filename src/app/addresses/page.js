'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiCheck, FiHome } from 'react-icons/fi';
import { addressAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ label: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', latitude: '', longitude: '', is_default: false });

  const fetch = () => { setLoading(true); addressAPI.list().then(r => setAddresses(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await addressAPI.update(editId, form); toast.success('Address updated'); }
      else { await addressAPI.create(form); toast.success('Address added'); }
      setShowForm(false); setEditId(null); fetch();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (a) => { setForm({ label: a.label, full_name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city, state: a.state, pincode: a.pincode, latitude: a.latitude || '', longitude: a.longitude || '', is_default: a.is_default }); setEditId(a.id); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await addressAPI.delete(id); toast.success('Deleted'); fetch(); } catch(err) { toast.error(err.message); }};
  const handleSetDefault = async (id) => { try { await addressAPI.setDefault(id); toast.success('Default address updated'); fetch(); } catch(err) { toast.error(err.message); }};
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { update('latitude', pos.coords.latitude); update('longitude', pos.coords.longitude); toast.success('Location detected!'); },
        () => toast.error('Location access denied')
      );
    } else { toast.error('Geolocation not supported'); }
  };

  const labelIcons = { Home: '🏠', Work: '💼', Other: '📍' };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">My Addresses</h1>
          <p className="text-dark-500 text-sm mt-1">Manage your delivery addresses</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ label: 'Home', full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', latitude: '', longitude: '', is_default: false }); }} className="btn-primary !py-2.5 text-sm flex items-center gap-2"><FiPlus /> Add Address</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">Label</label><select value={form.label} onChange={e => update('label', e.target.value)} className="input-field"><option value="Home">🏠 Home</option><option value="Work">💼 Work</option><option value="Other">📍 Other</option></select></div>
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">Full Name *</label><input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="input-field" required /></div>
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">Phone *</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" required /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium text-dark-700 mb-1 block">Address *</label><input value={form.address_line} onChange={e => update('address_line', e.target.value)} className="input-field" placeholder="House no, Street, Area..." required /></div>
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">City *</label><input value={form.city} onChange={e => update('city', e.target.value)} className="input-field" required /></div>
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">State *</label><input value={form.state} onChange={e => update('state', e.target.value)} className="input-field" required /></div>
            <div><label className="text-sm font-medium text-dark-700 mb-1 block">Pincode *</label><input value={form.pincode} onChange={e => update('pincode', e.target.value)} className="input-field" required /></div>
            <div className="flex items-end gap-2">
              <button type="button" onClick={detectLocation} className="btn-secondary !py-2.5 text-sm flex items-center gap-2 w-full"><FiMapPin /> Detect Location</button>
            </div>
          </div>
          {form.latitude && <p className="text-xs text-dark-500">📍 GPS: {form.latitude}, {form.longitude}</p>}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => update('is_default', e.target.checked)} className="rounded" />
            <label htmlFor="is_default" className="text-sm text-dark-700">Set as default address</label>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary !py-2.5">{editId ? 'Update' : 'Save'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary !py-2.5">Cancel</button></div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map(a => (
          <div key={a.id} className={`glass-card p-5 card-hover ${a.is_default ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{labelIcons[a.label] || '📍'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-dark-800">{a.label}</h3>
                    {a.is_default && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">Default</span>}
                  </div>
                  <p className="text-sm text-dark-700 mt-1">{a.full_name} · {a.phone}</p>
                  <p className="text-sm text-dark-500 mt-0.5">{a.address_line}, {a.city}, {a.state} - {a.pincode}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!a.is_default && <button onClick={() => handleSetDefault(a.id)} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Set as default"><FiCheck size={14} /></button>}
                <button onClick={() => handleEdit(a)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><FiEdit size={14} /></button>
                <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {addresses.length === 0 && <div className="text-center py-16"><span className="text-5xl">📍</span><p className="text-dark-500 mt-4">No saved addresses yet</p></div>}
      </div>
    </div>
  );
}
