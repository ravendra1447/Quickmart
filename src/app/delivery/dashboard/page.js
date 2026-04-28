'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { deliveryAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCheckCircle, FiPackage, FiPhone, FiUser, FiDollarSign, FiMap, FiTruck } from 'react-icons/fi';

const MapComponent = dynamic(() => import('../../admin/delivery/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl"><div className="animate-spin w-8 h-8 border-4 border-fk-blue border-t-transparent rounded-full"></div></div>
});

export default function DeliveryDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assigned'); // assigned, picked_up, delivered, profile
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ vehicle_type: '', vehicle_number: '', status: '' });
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [otp, setOtp] = useState('');

  const fetchDashboard = async () => {
    try {
      const [dashRes, assignRes] = await Promise.all([
        deliveryAPI.getDashboard(),
        deliveryAPI.getAssignments({ limit: 50 })
      ]);
      setDashboard(dashRes.data);
      setAssignments(assignRes.data.assignments);
      setProfileForm({
        vehicle_type: dashRes.data.partner.vehicle_type,
        vehicle_number: dashRes.data.partner.vehicle_number || '',
        status: dashRes.data.partner.status
      });
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReachedHub = async (id) => {
    try {
      await deliveryAPI.markReachedHub(id);
      toast.success('Reached Hub! Handed over to Distributor.');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handlePickup = async (id) => {
    try {
      await deliveryAPI.markPickedUp(id);
      toast.success('Order marked as Picked Up!');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeliverClick = (assignment) => {
    setActiveAssignment(assignment);
    setShowOtpModal(true);
    setOtp('');
  };

  const submitOtpDelivery = async () => {
    if (!otp || otp.length !== 4) return toast.error('Enter a valid 4-digit OTP');
    try {
      await deliveryAPI.verifyOtp(activeAssignment.id, otp);
      toast.success('Order Delivered Successfully! 🎉');
      setShowOtpModal(false);
      setActiveAssignment(null);
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await deliveryAPI.updateProfile(profileForm);
      toast.success('Profile updated successfully!');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update profile');
    }
    setSavingProfile(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const activeDeliveries = assignments.filter(a => a.status !== 'delivered' && a.status !== 'cancelled');
  const pastDeliveries = assignments.filter(a => a.status === 'delivered');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-dark-900 tracking-tight">Welcome, {dashboard?.partner?.name}!</h1>
        <p className="text-dark-500 mt-1 font-medium">Here are your active deliveries and stats.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active', value: dashboard?.activeAssignments || 0, icon: <FiPackage className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'Done Today', value: dashboard?.completedToday || 0, icon: <FiCheckCircle className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Total Delivered', value: dashboard?.totalDeliveries || 0, icon: <FiCheckCircle className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Rating', value: `${dashboard?.rating || '5.0'} ★`, icon: <span className="text-yellow-500 text-xl">★</span>, bg: 'bg-yellow-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mb-3 text-xl`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-dark-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {activeDeliveries.length > 0 && (
         <div className="mb-8 h-[350px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative z-0">
            <MapComponent assignments={activeDeliveries} />
         </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-x-auto">
        {[
          { id: 'assigned', label: 'New Tasks', icon: <FiPackage /> },
          { id: 'picked_up', label: 'In Progress', icon: <FiTruck /> },
          { id: 'delivered', label: 'Completed', icon: <FiCheckCircle /> },
          { id: 'profile', label: 'Profile', icon: <FiUser /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} 
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${tab === t.id ? 'bg-[#fb641b] text-white shadow-lg shadow-orange-200' : 'text-dark-400 hover:bg-slate-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-12">
        {tab === 'profile' ? (
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-fk-fade">
              <h3 className="text-2xl font-black text-dark-900 mb-8">Delivery Profile</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-lg">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Work Status</label>
                       <select 
                         value={profileForm.status} 
                         onChange={e => setProfileForm({...profileForm, status: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-dark-800 outline-none focus:border-orange-500 transition-all appearance-none"
                       >
                          <option value="idle">Online (Idle)</option>
                          <option value="on_delivery" disabled>On Delivery (Auto)</option>
                          <option value="offline">Offline</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Vehicle Type</label>
                       <select 
                         value={profileForm.vehicle_type} 
                         onChange={e => setProfileForm({...profileForm, vehicle_type: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-dark-800 outline-none focus:border-orange-500 transition-all appearance-none"
                       >
                          <option value="bike">Bike</option>
                          <option value="scooter">Scooter</option>
                          <option value="bicycle">Bicycle</option>
                          <option value="walk">On Foot</option>
                       </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 block">Vehicle Number</label>
                       <input 
                         value={profileForm.vehicle_number} 
                         onChange={e => setProfileForm({...profileForm, vehicle_number: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-dark-800 outline-none focus:border-orange-500 transition-all"
                         placeholder="e.g. UP 32 XX 0000"
                       />
                    </div>
                 </div>
                 <button type="submit" disabled={savingProfile} className="w-full py-5 bg-[#fb641b] text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all disabled:opacity-50">
                    {savingProfile ? 'Saving Changes...' : 'Update Delivery Profile'}
                 </button>
              </form>
           </div>
        ) : assignments.filter(a => (tab === 'delivered' ? a.status === 'delivered' : a.status === tab)).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 animate-fk-fade">
            <FiPackage className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-dark-500 font-bold">No {tab.replace('_', ' ')} tasks found.</p>
          </div>
        ) : (
          assignments.filter(a => (tab === 'delivered' ? a.status === 'delivered' : a.status === tab)).map(a => (
            <div key={a.id} className="bg-white rounded-[24px] p-6 shadow-md border-l-4 border-[#fb641b]">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {a.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-dark-400">Order #{a.order?.order_number}</span>
                    {a.order?.payment_method === 'cod' ? (
                       <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black flex items-center gap-1"><FiDollarSign/> COD (Collect Cash)</span>
                    ) : (
                       <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black flex items-center gap-1"><FiCheckCircle/> PREPAID</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-2 flex items-center gap-1"><FiPackage /> {a.assignment_type === 'pickup' ? 'Pickup From Seller' : 'Pickup From Hub'}</p>
                      {a.order?.items?.map(item => (
                        <p key={item.id} className="text-sm font-bold text-dark-800 leading-tight mb-1">{item.product_name} <span className="text-dark-400 font-normal">x{item.quantity}</span></p>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1"><FiMapPin /> {a.assignment_type === 'pickup' ? 'Deliver to Hub' : 'Deliver To Customer'}</p>
                      <p className="text-sm font-bold text-dark-900 flex items-center gap-2 mb-1"><FiUser className="text-blue-500"/> {a.assignment_type === 'pickup' ? 'Logistics Hub' : (a.order?.user?.name || 'Customer')}</p>
                      <p className="text-sm font-bold text-dark-900 flex items-center gap-2"><FiPhone className="text-blue-500"/> {a.assignment_type === 'pickup' ? 'Central Sorting' : (a.order?.user?.phone || 'N/A')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1">{a.assignment_type === 'pickup' ? 'Pickup Fee' : 'Delivery Fee'}</p>
                  <p className="text-2xl font-black text-[#008c00] mb-4">₹{a.delivery_fee}</p>
                  
                  {a.status === 'assigned' && (
                    <button onClick={() => handlePickup(a.id)} className="w-full py-3 bg-[#2874f0] hover:bg-blue-600 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                      <FiPackage size={16} /> Mark Picked Up
                    </button>
                  )}
                  {a.status === 'picked_up' && a.assignment_type === 'pickup' && (
                    <button onClick={() => handleReachedHub(a.id)} className="w-full py-3 bg-[#fb641b] hover:bg-orange-600 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                      <FiTruck size={16} /> Mark Reached Hub
                    </button>
                  )}
                  {(a.status === 'picked_up' || a.status === 'in_transit') && a.assignment_type === 'delivery' && (
                    <button onClick={() => handleDeliverClick(a)} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 animate-pulse">
                      <FiCheckCircle size={16} /> Enter OTP to Deliver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && activeAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in relative">
            <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black">✕</button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 text-fk-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-dark-900">Verify Delivery</h3>
              <p className="text-dark-500 text-sm mt-1">Ask the customer for the 4-digit OTP shown in their app.</p>
            </div>

            {activeAssignment.order?.payment_method === 'cod' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center animate-pulse">
                 <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Alert: Cash on Delivery</p>
                 <p className="text-3xl font-black text-red-700">₹{activeAssignment.order.total}</p>
                 <p className="text-xs text-red-500 font-bold mt-1">Please collect this exact amount in cash.</p>
              </div>
            )}

            <input 
              type="text"
              placeholder="Enter 4-Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,4))}
              className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-xl border-2 border-slate-200 focus:border-fk-blue outline-none mb-6"
            />
            
            <button 
              onClick={submitOtpDelivery}
              disabled={otp.length !== 4}
              className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-lg rounded-xl transition-all shadow-lg"
            >
              Verify & Complete Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
