'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { FiMap, FiPackage, FiTruck, FiCheckCircle, FiUser, FiPhone, FiDollarSign, FiStar, FiActivity } from 'react-icons/fi';
import { adminAPI } from '@/lib/api';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl"><div className="animate-spin w-8 h-8 border-4 border-fk-blue border-t-transparent rounded-full"></div></div>
});

export default function AdminDeliveryPage() {
  const [assignments, setAssignments] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracking'); // tracking, fleet
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', vehicle_type: 'bike' });

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDeliveryPartner(formData);
      toast.success('Delivery Partner created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', vehicle_type: 'bike' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create partner');
    }
  };

  const fetchData = async () => {
    try {
      const [partnersRes, ordersRes] = await Promise.all([
        adminAPI.getDeliveryPartners(),
        adminAPI.getOrders({ status: 'shipped' }) // Or any status representing active delivery
      ]);
      setPartners(partnersRes.data);
      
      // Transform orders into map-ready assignments
      const activeAssignments = (ordersRes.data || []).filter(o => o.delivery).map(o => ({
        id: o.delivery.id,
        status: o.delivery.status,
        partner: {
          name: o.delivery.partner?.name || 'Partner',
          phone: o.delivery.partner?.phone || 'N/A',
          lat: o.delivery.partner?.latitude || 28.7041,
          lng: o.delivery.partner?.longitude || 77.1025
        },
        order: {
          order_number: o.order_number,
          total: o.total,
          payment_method: o.payment_method,
          shipping_address: `${o.shipping_city}, ${o.shipping_state}`
        }
      }));
      
      setAssignments(activeAssignments);
    } catch (err) {
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-[#fb641b] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-dark-900 tracking-tight">Logistics Management</h1>
          <p className="text-dark-500 mt-1 font-medium">Monitor your delivery fleet and track active shipments.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
           <button 
             onClick={() => setActiveTab('tracking')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'tracking' ? 'bg-fk-blue text-white shadow-lg' : 'text-slate-400 hover:text-dark-900'}`}
           >
              <FiMap /> Live Tracking
           </button>
           <button 
             onClick={() => setActiveTab('fleet')}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'fleet' ? 'bg-fk-blue text-white shadow-lg' : 'text-slate-400 hover:text-dark-900'}`}
           >
              <FiTruck /> Fleet Management
           </button>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
           <FiUser /> Add Delivery Partner
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-scale-up">
              <h2 className="text-2xl font-black text-dark-900 mb-2">Register Delivery Partner</h2>
              <p className="text-dark-500 mb-8 font-medium">Create credentials for a new fleet member.</p>
              
              <form onSubmit={handleAddPartner} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase text-dark-400 mb-2 block">Full Name</label>
                       <input 
                         required
                         type="text" 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-fk-blue font-bold transition-all"
                         placeholder="e.g. Rahul Kumar"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-dark-400 mb-2 block">Email Address</label>
                       <input 
                         required
                         type="email" 
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-fk-blue font-bold transition-all"
                         placeholder="rahul@example.com"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-dark-400 mb-2 block">Phone Number</label>
                       <input 
                         required
                         type="tel" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-fk-blue font-bold transition-all"
                         placeholder="9876543210"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-dark-400 mb-2 block">Login Password</label>
                       <input 
                         required
                         type="password" 
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-fk-blue font-bold transition-all"
                         placeholder="******"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-dark-400 mb-2 block">Vehicle Type</label>
                       <select 
                         value={formData.vehicle_type}
                         onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-fk-blue font-bold transition-all"
                       >
                          <option value="bike">Bike</option>
                          <option value="scooter">Scooter</option>
                          <option value="walk">On Foot</option>
                       </select>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-100 text-dark-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                       CANCEL
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-fk-blue text-white py-4 rounded-2xl font-black shadow-lg shadow-fb-blue/20 hover:bg-fk-blue-hover transition-all"
                    >
                       CREATE ACCOUNT
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'tracking' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]">
          {/* Left Side: Map */}
          <div className="lg:col-span-2 h-full rounded-[32px] overflow-hidden shadow-xl border border-slate-100 relative z-0">
             <MapComponent assignments={assignments} />
          </div>

          {/* Right Side: Active Deliveries List */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 flex flex-col h-full overflow-hidden">
             <h2 className="text-xl font-black text-dark-900 mb-6 flex items-center gap-2"><FiActivity className="text-fk-blue" /> Active Shipments</h2>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                {assignments.length === 0 ? (
                  <div className="text-center py-20 opacity-50 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <FiMap className="mx-auto mb-4 text-5xl text-slate-300" />
                    <p className="font-black text-slate-400">No active deliveries on map</p>
                  </div>
                ) : (
                  assignments.map(a => (
                    <div key={a.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-fk-blue hover:shadow-md transition-all cursor-pointer group">
                       <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                            a.status === 'in_transit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                          }`}>{a.status.replace('_', ' ')}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{a.order.order_number}</span>
                       </div>
                       <p className="font-black text-dark-900 text-lg group-hover:text-fk-blue transition-colors">{a.partner.name}</p>
                       <p className="text-xs text-dark-500 font-bold mb-4 flex items-center gap-1"><FiPhone size={12}/> {a.partner.phone}</p>
                       
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4 border-t border-slate-50">
                          <span className="text-slate-400">Total: ₹{a.order.total}</span>
                          <span className={a.order.payment_method === 'cod' ? 'text-rose-500 bg-rose-50 px-2 py-0.5 rounded' : 'text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded'}>
                             {a.order.payment_method === 'cod' ? 'COD' : 'PREPAID'}
                          </span>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fk-fade">
           {partners.map(p => (
              <div key={p.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                 <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover:bg-fk-blue/10 transition-colors">
                          {p.user?.avatar_url ? <img src={p.user.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" /> : '👤'}
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-dark-900">{p.name}</h3>
                          <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><FiPhone size={12}/> {p.phone}</p>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.status === 'idle' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      p.status === 'on_delivery' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                       {p.status}
                    </span>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FiCheckCircle/> Deliveries</p>
                       <p className="text-2xl font-black text-dark-900">{p.total_deliveries}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-4 rounded-2xl">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1"><FiDollarSign/> Earnings</p>
                       <p className="text-2xl font-black text-emerald-700">₹{p.total_earnings?.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-1">
                       {[1,2,3,4,5].map(star => (
                          <FiStar key={star} size={14} className={star <= Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                       ))}
                       <span className="text-xs font-black text-dark-900 ml-1">{p.rating}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.vehicle_type}</p>
                 </div>
              </div>
           ))}
           {partners.length === 0 && (
             <div className="col-span-full py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <FiUser className="mx-auto text-slate-200 mb-6" size={64} />
                <h3 className="text-2xl font-black text-dark-900 mb-2">No Delivery Partners Found</h3>
                <p className="text-dark-500 font-medium">Recruit and approve partners to see them here.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
