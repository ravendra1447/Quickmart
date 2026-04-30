'use client';
import { useState, useEffect } from 'react';
import { sellerAPI } from '@/lib/api';
import { FiPlus, FiTrash2, FiTruck, FiPhone, FiMail, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DeliveryBoysPage() {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', vehicle_type: 'bike', vehicle_number: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBoys();
  }, []);

  const fetchBoys = async () => {
    try {
      setLoading(true);
      const res = await sellerAPI.getDeliveryBoys();
      // Backend returns { success: true, data: [...] }
      const boysData = res?.data || res || [];
      setBoys(Array.isArray(boysData) ? boysData : []);
    } catch (err) {
      toast.error('Failed to load delivery boys');
      setBoys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await sellerAPI.createDeliveryBoy(formData);
      toast.success('Delivery boy added successfully');
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '', password: '', vehicle_type: 'bike', vehicle_number: '' });
      fetchBoys();
    } catch (err) {
      toast.error(err.message || 'Failed to add delivery boy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await sellerAPI.toggleDeliveryBoyStatus(id);
      toast.success(res.message || 'Status updated successfully');
      fetchBoys();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-dark-900">Delivery Boys</h1>
            {Array.isArray(boys) && boys.length > 0 && (
              <span className="px-3 py-1 bg-dark-50 text-dark-500 rounded-full text-xs font-black uppercase tracking-widest border border-dark-100">
                {boys.length} Total
              </span>
            )}
          </div>
          <p className="text-dark-500">Manage your private delivery fleet</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
        >
          <FiPlus /> Add Delivery Boy
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-dark-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : !Array.isArray(boys) || boys.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-dark-100">
          <div className="w-20 h-20 bg-dark-50 rounded-full flex items-center justify-center text-dark-300 text-3xl mx-auto mb-4">
            <FiTruck />
          </div>
          <h3 className="text-xl font-bold text-dark-900">No delivery boys yet</h3>
          <p className="text-dark-500 mb-6">Add your first delivery boy to start managing orders</p>
          <button onClick={() => setShowModal(true)} className="text-orange-500 font-bold hover:underline">Add Now</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-dark-50 text-dark-400 text-[10px] font-black uppercase tracking-widest border-b border-dark-100">
                  <th className="px-6 py-4">Delivery Boy</th>
                  <th className="px-6 py-4">Vehicle Info</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {boys.map((boy) => (
                  <tr key={boy.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black uppercase">
                          {boy.name ? boy.name[0] : '?'}
                        </div>
                        <span className="font-bold text-dark-900 text-sm">{boy.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-dark-700 uppercase tracking-tighter">{boy.vehicle_type}</p>
                      <p className="text-[10px] text-dark-400 font-bold">{boy.vehicle_number || 'No Number'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-dark-900">{boy.phone}</p>
                        <p className="text-[10px] text-dark-400 font-bold">{boy.email || 'No Email'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          boy.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {boy.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          boy.status === 'on_delivery' ? 'bg-blue-50 text-blue-600' : 'bg-zinc-50 text-zinc-400'
                        }`}>
                          {boy.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggle(boy.id)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          boy.is_active 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {boy.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Delivery Boy</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-50 rounded-xl"><FiX /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-dark-700">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-dark-700">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-dark-700">Email (Optional)</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-dark-700">Password for App</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-dark-700">Vehicle Type</label>
                  <select value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all appearance-none">
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="walk">Walk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-dark-700">Vehicle Number</label>
                  <input type="text" value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-orange-500 outline-none transition-all" placeholder="e.g. MH 12 AB 1234" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-dark-600 hover:bg-dark-50 rounded-2xl transition-all">Cancel</button>
                <button disabled={submitting} type="submit" className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                  {submitting ? 'Adding...' : 'Add Boy'} <FiCheck />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
