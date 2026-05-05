'use client';
import { deliveryAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiDollarSign, FiMapPin, FiPackage, FiPhone, FiTruck, FiUser } from 'react-icons/fi';

const MapComponent = dynamic(() => import('../../admin/delivery/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-3xl"><div className="animate-spin w-8 h-8 border-4 border-fk-blue border-t-transparent rounded-full"></div></div>
});

export default function DeliveryDashboard() {

  const { user, isLoading: authLoading } = useAuthStore();
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [settlementForm, setSettlementForm] = useState({ seller_id: '', amount: '', notes: '' });
  const [submittingSettlement, setSubmittingSettlement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('assigned');
  const [profileForm, setProfileForm] = useState({ vehicle_type: 'bike', vehicle_number: '', status: 'idle' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const fetchDashboard = async () => {
    try {
      const [dashRes, assignRes] = await Promise.all([
        deliveryAPI.getDashboard(),
        deliveryAPI.getAssignments({ limit: 50 })
      ]);
      console.log('Dashboard data:', dashRes.data);
      console.log('Cash in hand:', dashRes.data?.partner?.cashInHand);
      setDashboard(dashRes.data);
      setAssignments(assignRes.data?.assignments || []);
      setProfileForm({
        vehicle_type: dashRes.data.partner.vehicle_type,
        vehicle_number: dashRes.data.partner.vehicle_number || '',
        status: dashRes.data.partner.status
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };


  const fetchAssignments = () => {
    deliveryAPI.getAssignments().then(r => {
      const data = r.data || r;
      setAssignments(Array.isArray(data.assignments) ? data.assignments : (Array.isArray(data) ? data : []));
    }).catch(() => {});
  };

  const fetchSettlements = async () => {
    try {
      const res = await deliveryAPI.getSettlements();
      setSettlementHistory(res.data || res);
    } catch (err) {
      console.error('Failed to fetch settlements');
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
      fetchAssignments();
      fetchSettlements();
    }
  }, [authLoading, user]);


  const handleReachedHub = async (id) => {
    try {
      await deliveryAPI.markReachedHub(id);
      toast.success('Reached Hub! Handed over to Distributor.');
      fetchDashboard();

      fetchAssignments();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handlePickup = async (id) => {
    try {
      await deliveryAPI.markPickedUp(id);
      toast.success('Order marked as Picked Up!');
      fetchDashboard();

      fetchAssignments();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeliverClick = (assignment) => {
    setActiveAssignment(assignment);
    // Generate random 4-digit OTP
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setShowOtpModal(true);
    setOtp('');
  };

  const submitOtpDelivery = async () => {
    if (!otp || otp.length !== 4) return toast.error('Enter a valid 4-digit OTP');
    
    // First verify against generated OTP
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP! Please try again.');
      setOtp('');
      return;
    }
    
    try {
      await deliveryAPI.verifyOtp(activeAssignment.id, otp);
      toast.success('Order Delivered Successfully! 🎉');
      setShowOtpModal(false);
      setActiveAssignment(null);
      setGeneratedOtp('');
      fetchDashboard();
      fetchAssignments();
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


  const handleSubmitSettlement = async (e) => {
    e.preventDefault();
    if (!settlementForm.seller_id || !settlementForm.amount) return toast.error('Fill all required fields');
    if (parseFloat(settlementForm.amount) > parseFloat(dashboard?.cashInHand || 0)) {
      return toast.error('Amount cannot exceed cash in hand');
    }
    
    console.log('Submitting settlement:', settlementForm);
    console.log('Available sellers:', uniqueSellers);
    
    setSubmittingSettlement(true);
    try {
      await deliveryAPI.submitSettlement(settlementForm);
      toast.success('Settlement request submitted! 🚀');
      setShowSettlementModal(false);
      setSettlementForm({ seller_id: '', amount: '', notes: '' });
      fetchDashboard();
      fetchSettlements();
    } catch (err) {
      console.error('Settlement error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit settlement');
    }
    setSubmittingSettlement(false);
  };

  const handleConfirmSettlement = async (settlementId) => {
    if (!confirm('Are you sure you want to confirm this settlement? The cash will be transferred to the seller.')) return;
    
    try {
      await deliveryAPI.confirmSettlement(settlementId);
      toast.success('Cash transferred to seller successfully! 💰');
      fetchDashboard();
      fetchSettlements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm settlement');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const openGoogleMaps = async (assignment) => {
    try {
      let deliveryBoyLocation = null;
      
      // Try to get delivery boy's current location
      try {
        deliveryBoyLocation = await getCurrentLocation();
      } catch (error) {
        console.log('Could not get current location:', error);
        // Fallback to partner location from assignment if available
        if (assignment.partner?.lat && assignment.partner?.lng) {
          deliveryBoyLocation = {
            lat: assignment.partner.lat,
            lng: assignment.partner.lng
          };
        }
      }

      // Get complete customer address with proper formatting
      let customerAddress;
      if (assignment.assignment_type === 'pickup') {
        customerAddress = 'Central Hub sorting center, Delhi, India';
      } else {
        // Build complete customer address
        const addressParts = [];
        
        if (assignment.order?.shipping_address) {
          addressParts.push(assignment.order.shipping_address);
        }
        if (assignment.order?.shipping_city) {
          addressParts.push(assignment.order.shipping_city);
        }
        if (assignment.order?.shipping_state) {
          addressParts.push(assignment.order.shipping_state);
        }
        if (assignment.order?.shipping_pincode) {
          addressParts.push(assignment.order.shipping_pincode);
        }
        
        customerAddress = addressParts.length > 0 
          ? `${addressParts.join(', ')}, India`
          : 'Customer Location, India';
      }

      let googleMapsUrl;
      
      if (deliveryBoyLocation) {
        // Create a route from delivery boy to customer with complete address
        const origin = `${deliveryBoyLocation.lat},${deliveryBoyLocation.lng}`;
        const destination = encodeURIComponent(customerAddress);
        googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
      } else {
        // Just search for customer address if no delivery location available
        googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`;
      }

      console.log('Opening Google Maps with URL:', googleMapsUrl);
      console.log('Customer Address:', customerAddress);
      
      // Open Google Maps in new tab
      window.open(googleMapsUrl, '_blank');
      
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      toast.error('Failed to open Google Maps');
    }
  };

  if (authLoading || loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div><p className="ml-4 font-black text-dark-400 animate-pulse">Initializing Dashboard...</p></div>;

  if (!user) return null; // Let the api interceptor handle redirect

  // Extract unique sellers from assignments to populate the settlement modal
  const uniqueSellers = [];
  const seenSellers = new Set();
  assignments?.forEach(a => {
    a.order?.items?.forEach(item => {
      // Try different ways to get seller profile ID
      const sellerProfileId = item.seller?.sellerProfile?.id || item.seller_id;
      const sellerName = item.seller?.sellerProfile?.store_name || item.seller?.name || 'Unknown Seller';
      
      if (sellerProfileId && !seenSellers.has(sellerProfileId)) {
        seenSellers.add(sellerProfileId);
        uniqueSellers.push({ id: sellerProfileId, name: sellerName });
        console.log('Found seller:', { id: sellerProfileId, name: sellerName });
      }
    });
  });
  
  console.log('Final unique sellers:', uniqueSellers);

  const activeDeliveries = assignments.filter(a => a.status !== 'delivered' && a.status !== 'cancelled');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-dark-900 tracking-tight">Welcome, {dashboard?.partner?.name}!</h1>
          <p className="text-dark-500 mt-1 font-medium">Here are your active deliveries and stats.</p>
        </div>
        <div className="hidden md:block">
           <div className={`px-4 py-2 rounded-2xl ${dashboard?.partner?.status === 'idle' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} text-xs font-black uppercase tracking-widest`}>
              {dashboard?.partner?.status === 'idle' ? '● Online' : '● On Delivery'}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Active', value: dashboard?.activeAssignments || 0, icon: <FiPackage className="text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'Done Today', value: dashboard?.completedToday || 0, icon: <FiCheckCircle className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Total Done', value: dashboard?.totalDeliveries || 0, icon: <FiCheckCircle className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Rating', value: `${dashboard?.rating || '5.0'} ★`, icon: <span className="text-yellow-500 text-xl">★</span>, bg: 'bg-yellow-50' },
          { 
            label: 'Cash in Hand', 
            value: `₹${parseFloat(dashboard?.cashInHand || 0).toFixed(2)}`, 
            icon: <FiDollarSign className="text-red-500" />, 
            bg: parseFloat(dashboard?.cashInHand || 0) > 0 ? 'bg-red-100 border-2 border-red-200' : 'bg-red-50',
            action: parseFloat(dashboard?.cashInHand || 0) > 0 && (
              <button onClick={() => setShowSettlementModal(true)} className="mt-2 text-[9px] font-black uppercase bg-red-600 text-white px-3 py-1 rounded-full shadow-sm hover:scale-105 transition-all">Settle Now</button>
            )
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mb-2 text-lg`}>
              {stat.icon}
            </div>
            <p className="text-[9px] font-black text-dark-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-dark-900">{stat.value}</p>
            {stat.action}

          </div>
        ))}
      </div>

      {activeDeliveries.length > 0 && (
         <div className="mb-8 h-[350px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative z-0">
            <MapComponent assignments={activeDeliveries} />
         </div>
      )}

      {/* Tabs */}

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'assigned', label: 'New', icon: <FiPackage /> },
          { id: 'picked_up', label: 'Running', icon: <FiTruck /> },
          { id: 'delivered', label: 'Done', icon: <FiCheckCircle /> },
          { id: 'history', label: 'Cash Logs', icon: <FiDollarSign /> },

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

        ) : tab === 'history' ? (
           <div className="space-y-4 animate-fk-fade">
              {settlementHistory.length === 0 ? (
                 <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                    <FiDollarSign className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-dark-500 font-bold">No cash settlement logs found.</p>
                 </div>
              ) : (
                 settlementHistory.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${s.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                             <FiDollarSign />
                          </div>
                          <div>
                             <p className="text-sm font-black text-dark-900">₹{s.amount} to {s.seller?.store_name || 'Seller'}</p>
                             <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">{new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString()}</p>
                             {s.status === 'confirmed' && s.settled_at && (
                               <p className="text-[9px] text-green-600 font-medium mt-1">✅ Cash transferred on {new Date(s.settled_at).toLocaleDateString()}</p>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                           {s.status}
                         </div>
                         {s.status === 'pending' && (
                           <button 
                             onClick={() => handleConfirmSettlement(s.id)}
                             className="px-3 py-1 bg-green-500 text-white rounded-lg text-[10px] font-black hover:bg-green-600 transition-all"
                           >
                             Confirm
                           </button>
                         )}
                       </div>
                    </div>
                 ))
              )}
           </div>

        ) : assignments.filter(a => (tab === 'delivered' ? a.status === 'delivered' : a.status === tab)).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 animate-fk-fade">
            <FiPackage className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-dark-500 font-bold">No {tab.replace('_', ' ')} tasks found.</p>
          </div>
        ) : (
          assignments.filter(a => (tab === 'delivered' ? a.status === 'delivered' : a.status === tab)).map(a => (
            <div key={a.id} className="bg-white rounded-[24px] p-6 shadow-md border-l-4 border-[#fb641b]">

              {/* Order Item Card (Keeping existing UI) */}

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

                      {a.order?.items?.map((item, idx) => (
                        <div key={item.id || idx} className="mb-2 border-b border-dark-100 last:border-0 pb-2 last:pb-0">
                          <p className="text-sm font-bold text-dark-800 leading-tight">{item.product_name} <span className="text-dark-400 font-normal">x{item.quantity}</span></p>
                          {a.assignment_type === 'pickup' && item.seller?.sellerProfile && (
                            <div className="mt-1 text-[11px] text-dark-600 bg-white/50 p-2 rounded-lg border border-dark-100">
                              <p className="font-bold text-orange-600">{item.seller.sellerProfile.store_name}</p>
                              <p className="line-clamp-1">{item.seller.sellerProfile.business_address}</p>
                              <p className="text-dark-400 mt-0.5">📞 {item.seller.sellerProfile.store_phone || item.seller.phone}</p>
                            </div>
                          )}
                        </div>

                      ))}
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1"><FiMapPin /> {a.assignment_type === 'pickup' ? 'Deliver to Hub' : 'Deliver To Customer'}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-dark-900 flex items-center gap-2">
                           <FiUser className="text-blue-500 flex-shrink-0"/> 
                           <span className="line-clamp-1">{a.assignment_type === 'pickup' ? 'Logistics Hub' : (a.order?.shipping_name || a.order?.user?.name || 'Customer')}</span>
                        </p>
                        <p className="text-[11px] font-bold text-dark-600 flex items-start gap-2">
                           <FiMapPin className="text-blue-500 mt-0.5 flex-shrink-0"/>
                           <span>
                             {a.assignment_type === 'pickup' ? 'Central Hub sorting center' : 
                              `${a.order?.shipping_address}, ${a.order?.shipping_city} - ${a.order?.shipping_pincode}`}
                           </span>
                        </p>
                        <p className="text-sm font-black text-blue-600 flex items-center gap-2 pt-1">
                           <FiPhone className="text-blue-500 flex-shrink-0"/> 
                           {a.assignment_type === 'pickup' ? 'Central Sorting' : (a.order?.shipping_phone || a.order?.user?.phone || 'N/A')}
                        </p>
                        <button
                          onClick={() => openGoogleMaps(a)}
                          className="mt-2 w-full py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <FiMapPin size={14} />
                          View on Google Maps
                        </button>
                      </div>

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


      {/* Settle Cash Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in relative">
            <button onClick={() => setShowSettlementModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black">✕</button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <FiDollarSign />
              </div>
              <h3 className="text-2xl font-black text-dark-900">Settle Cash</h3>
              <p className="text-dark-500 text-sm mt-1">Submit collected cash to the seller.</p>
            </div>

            <form onSubmit={handleSubmitSettlement} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1 block">Select Seller</label>
                  <select 
                    value={settlementForm.seller_id}
                    onChange={e => setSettlementForm({...settlementForm, seller_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-dark-800 outline-none focus:border-red-500 appearance-none"
                    required
                  >
                     <option value="">-- Choose Seller --</option>
                     {uniqueSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-1 block">Amount to Submit</label>
                  <input 
                    type="number"
                    placeholder="e.g. 500"
                    value={settlementForm.amount}
                    onChange={e => setSettlementForm({...settlementForm, amount: e.target.value})}
                    max={dashboard?.cashInHand}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-bold text-dark-800 outline-none focus:border-red-500"
                    required
                  />
                  <p className="text-[10px] text-red-500 font-bold mt-1">Max Available: ₹{dashboard?.cashInHand}</p>
               </div>
               <button 
                 type="submit"
                 disabled={submittingSettlement}
                 className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-xl transition-all shadow-lg disabled:opacity-50"
               >
                 {submittingSettlement ? 'Submitting...' : 'Submit to Seller'}
               </button>
            </form>
          </div>
        </div>
      )}


      {/* OTP Modal */}
      {showOtpModal && activeAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in relative">
            <button onClick={() => setShowOtpModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-black text-lg">✕</button>
            
            <div className="text-center mb-4">
              <h3 className="text-lg font-black text-dark-900 mb-2">Delivery OTP</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                <p className="text-4xl font-black text-blue-600 tracking-widest">
                  {generatedOtp}
                </p>
                <p className="text-[10px] text-blue-500 mt-1">Show this to customer</p>
              </div>
            </div>

            {activeAssignment.order?.payment_method === 'cod' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 text-center">
                 <p className="text-[9px] font-black text-red-600 uppercase">COD: ₹{activeAssignment.order.total}</p>
              </div>
            )}

            <input 
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,4))}
              className="w-full text-center text-2xl font-black tracking-[0.3em] py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none mb-3"
            />
            
            <button 
              onClick={submitOtpDelivery}
              disabled={otp.length !== 4}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm rounded-lg transition-all"
            >
              Verify Delivery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
