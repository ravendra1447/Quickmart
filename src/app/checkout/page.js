'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCreditCard, FiTruck, FiMapPin, FiTag, FiX, FiPlus, FiCheck, FiClock, FiShield, FiPhone, FiUser, FiArrowRight } from 'react-icons/fi';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { orderAPI, addressAPI, hyperlocalAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, subtotal, fetchCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddress, setSaveAddress] = useState(false);

  // Saved addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Delivery
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(20);

  // Scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    if (user) {
      fetchCart();
      addressAPI.list().then(r => {
        const addrs = r.data || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) selectAddress(def);
      }).catch(() => {});
      setShipping(s => ({ ...s, name: user.name || '', phone: user.phone || '' }));
    }
  }, [user]);

  const selectAddress = (addr) => {
    setSelectedAddress(addr);
    setShipping({
      name: addr.full_name, phone: addr.phone, address: addr.address_line,
      city: addr.city, state: addr.state, pincode: addr.pincode,
    });
    setShowNewAddress(false);
    if (addr.latitude && addr.longitude) {
      hyperlocalAPI.getDeliveryEstimate({
        latitude: addr.latitude, longitude: addr.longitude,
        seller_lat: 26.8467, seller_lng: 80.9462, item_count: items.length,
      }).then(r => {
        setDeliveryFee(r.data?.delivery_fee || 0);
        setEstimatedTime(r.data?.estimated_minutes || 20);
      }).catch(() => {});
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await hyperlocalAPI.validateCoupon({ code: couponCode, cart_total: subtotal });
      setAppliedCoupon({ code: res.data.code, discount: res.data.discount, description: res.data.description });
      toast.success(`Coupon applied! ₹${res.data.discount} off`);
    } catch (err) { toast.error(err.message); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); };

  const discount = appliedCoupon?.discount || 0;
  const platformFee = 15;
  const finalTotal = Math.max(0, subtotal + deliveryFee + platformFee - discount);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      let addrId = selectedAddress?.id || null;
      if (!addrId && saveAddress) {
        try {
          const resAddr = await addressAPI.create({
            full_name: shipping.name, phone: shipping.phone, address_line: shipping.address,
            city: shipping.city, state: shipping.state, pincode: shipping.pincode,
            label: 'Other', is_default: false
          });
          addrId = resAddr.data.id;
        } catch (e) { console.error('Failed to save address', e); }
      }

      const payload = {
        shipping, payment_method: paymentMethod,
        address_id: addrId,
        coupon_code: appliedCoupon?.code || null,
        delivery_fee: deliveryFee,
      };
      if (isScheduled && scheduledAt) payload.scheduled_at = scheduledAt;
      const res = await orderAPI.checkout(payload);
      
      if (paymentMethod === 'online' && res.data?.stripeSessionUrl) {
        window.location.href = res.data.stripeSessionUrl;
      } else {
        await clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/success?order=${res.data?.order?.order_number || ''}`);
      }
    } catch (err) { toast.error(err.message || 'Failed to place order'); }
    setLoading(false);
  };

  const update = (f, v) => setShipping(s => ({ ...s, [f]: v }));

  if (!user) return <div className="text-center py-20"><p className="text-lg">Please login to checkout</p></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 -mt-16 sm:-mt-16">
      <div className="bg-white border-b border-dark-100 py-3 sm:py-6 mb-4 sm:mb-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/cart')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors md:hidden">
               <FiArrowRight className="rotate-180" size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight flex items-center gap-2">
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#fb641b] flex items-center justify-center text-white"><FiShield size={18} /></span>
              Checkout
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 text-sm font-bold text-[#fb641b]"><span className="w-6 h-6 rounded-full bg-[#fb641b] text-white flex items-center justify-center text-xs">1</span> Address</div>
            <div className="w-10 h-[2px] bg-dark-200"></div>
            <div className="flex items-center gap-2 text-sm font-bold text-dark-400"><span className="w-6 h-6 rounded-full bg-dark-200 text-white flex items-center justify-center text-xs">2</span> Delivery</div>
            <div className="w-10 h-[2px] bg-dark-200"></div>
            <div className="flex items-center gap-2 text-sm font-bold text-dark-400"><span className="w-6 h-6 rounded-full bg-dark-200 text-white flex items-center justify-center text-xs">3</span> Payment</div>
          </div>
          {/* Mobile Steps indicator */}
          <div className="md:hidden flex items-center gap-1">
             <div className="w-6 h-1 rounded-full bg-[#fb641b]"></div>
             <div className="w-2 h-1 rounded-full bg-slate-200"></div>
             <div className="w-2 h-1 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <form onSubmit={handleOrder} className="grid lg:grid-cols-12 gap-0 sm:gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Address */}
            <div className="bg-white sm:rounded-3xl shadow-sm border-y sm:border border-dark-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-dark-50 bg-dark-50/50 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-dark-800 flex items-center gap-3">
                  <FiMapPin className="text-[#fb641b]" /> 1. Delivery Address
                </h2>
                {addresses.length > 0 && (
                   <button type="button" onClick={() => { setSelectedAddress(null); setShowNewAddress(true); }} className="text-sm text-[#fb641b] font-bold hover:underline">
                      + Add New
                   </button>
                )}
              </div>
              
              <div className="p-6">
                {addresses.length > 0 && !showNewAddress ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map(a => (
                      <div key={a.id} onClick={() => selectAddress(a)}
                        className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all group ${selectedAddress?.id === a.id ? 'border-[#fb641b] bg-primary-50/30' : 'border-dark-100 hover:border-dark-200'}`}>
                        {selectedAddress?.id === a.id && (
                          <div className="absolute top-4 right-4 w-6 h-6 bg-[#fb641b] rounded-full flex items-center justify-center text-white">
                            <FiCheck size={14} />
                          </div>
                        )}
                        <p className="text-[10px] font-black text-[#fb641b] uppercase tracking-widest mb-1">{a.label}</p>
                        <p className="font-bold text-sm text-[#212121] mb-0.5">{a.full_name}</p>
                        <p className="text-xs text-dark-500 mb-2 flex items-center gap-1"><FiPhone size={10} /> {a.phone}</p>
                        <p className="text-xs text-dark-600 leading-relaxed line-clamp-2">{a.address_line}, {a.city}, {a.state} - {a.pincode}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">New Shipping Address</label>
                       <button 
                         type="button" 
                         onClick={async () => {
                           if (!navigator.geolocation) return toast.error('Geolocation is not supported');
                           setLoading(true);
                           navigator.geolocation.getCurrentPosition(async (pos) => {
                             const { latitude, longitude } = pos.coords;
                             try {
                               const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                               const data = await res.json();
                               const addr = data.address;
                               setShipping(s => ({
                                 ...s,
                                 address: data.display_name,
                                 city: addr.city || addr.town || addr.village || '',
                                 state: addr.state || '',
                                 pincode: addr.postcode || ''
                               }));
                               toast.success('Location fetched successfully!');
                             } catch (err) {
                               toast.error('Failed to get address from location');
                             } finally {
                               setLoading(false);
                             }
                           }, (error) => {
                             setLoading(false);
                             if (error.code === 1) {
                               toast.error('📍 Location Denied! Please enable it in browser settings.', { duration: 5000 });
                             } else {
                               toast.error('Location Error. Please enter manually.');
                             }
                           });
                         }}
                         className="flex items-center gap-2 text-xs font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-all active:scale-95"
                       >
                          <FiMapPin /> USE CURRENT LOCATION
                       </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                          <input value={shipping.name} onChange={e => update('name', e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="Enter your full name" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                          <input value={shipping.phone} onChange={e => update('phone', e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="10-digit mobile number" required />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">Street Address</label>
                       <textarea value={shipping.address} onChange={e => update('address', e.target.value)} className="w-full px-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" rows={3} placeholder="House No, Area, Landmark..." required />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">City</label>
                        <input value={shipping.city} onChange={e => update('city', e.target.value)} className="w-full px-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">State</label>
                        <input value={shipping.state} onChange={e => update('state', e.target.value)} className="w-full px-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1">Pincode</label>
                        <input value={shipping.pincode} onChange={e => update('pincode', e.target.value)} className="w-full px-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none" required />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-primary-50/50 rounded-2xl border border-primary-100 mt-4 transition-all hover:bg-primary-50">
                      <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="w-5 h-5 rounded-lg border-primary-300 text-[#fb641b] focus:ring-primary-500" />
                      <span className="text-sm font-bold text-primary-900">Save this address for my future orders</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Delivery Type */}
            <div className="bg-white sm:rounded-3xl shadow-sm border-y sm:border border-dark-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-dark-50 bg-dark-50/50">
                <h2 className="text-base sm:text-lg font-bold text-dark-800 flex items-center gap-3">
                  <FiTruck className="text-[#fb641b]" /> 2. Delivery Method
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setIsScheduled(false)} 
                    className={`flex-1 p-4 sm:p-6 rounded-2xl border-2 text-left transition-all ${!isScheduled ? 'border-[#fb641b] bg-primary-50/30' : 'border-dark-100 hover:border-dark-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xl sm:text-2xl">⚡</span>
                       {!isScheduled && <FiCheck className="text-[#fb641b]" />}
                    </div>
                    <p className="font-bold text-sm sm:text-base text-[#212121]">Standard</p>
                    <p className="text-[10px] sm:text-sm text-dark-500 mt-1">Delivery by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</p>
                  </button>
                  
                  <button type="button" onClick={() => setIsScheduled(true)} 
                    className={`flex-1 p-4 sm:p-6 rounded-2xl border-2 text-left transition-all ${isScheduled ? 'border-primary-600 bg-primary-50/30' : 'border-dark-100 hover:border-dark-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xl sm:text-2xl">📅</span>
                       {isScheduled && <FiCheck className="text-primary-600" />}
                    </div>
                    <p className="font-bold text-sm sm:text-base text-dark-900">Schedule</p>
                    <p className="text-[10px] sm:text-sm text-dark-500 mt-1">Pick a time slot</p>
                  </button>
                </div>
                
                {isScheduled && (
                  <div className="mt-6 animate-slide-up">
                    <label className="text-xs font-black text-dark-400 uppercase tracking-wider ml-1 block mb-2">Select Date & Time</label>
                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)} 
                      className="w-full px-4 py-3.5 bg-dark-50 border border-dark-100 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none font-bold" required={isScheduled} />
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="bg-white sm:rounded-3xl shadow-sm border-y sm:border border-dark-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-dark-50 bg-dark-50/50">
                <h2 className="text-base sm:text-lg font-bold text-dark-800 flex items-center gap-3">
                  <FiCreditCard className="text-[#fb641b]" /> 3. Payment Option
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {[
                  { key: 'cod', label: 'Cash on Delivery (COD)', icon: '💵', desc: 'Pay with cash or UPI at your doorstep' },
                  { key: 'online', label: 'Online Payment / UPI', icon: '📱', desc: 'UPI, Cards, Net Banking via Stripe' }
                ].map(m => (
                  <button type="button" key={m.key} onClick={() => setPaymentMethod(m.key)} 
                    className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 cursor-pointer transition-all text-left ${paymentMethod === m.key ? 'border-[#fb641b] bg-primary-50/30' : 'border-dark-100 hover:border-dark-200'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === m.key ? 'border-[#fb641b] bg-[#fb641b] shadow-lg shadow-primary-200' : 'border-dark-300'}`}>
                      {paymentMethod === m.key && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-3xl grayscale-[0.3] group-hover:grayscale-0 transition-all">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-[#212121] leading-none mb-1">{m.label}</p>
                      <p className="text-sm text-dark-500 font-medium">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl shadow-dark-200/50 border border-dark-100 overflow-hidden">
              <div className="p-6 border-b border-dark-50 bg-dark-900 text-white">
                <h3 className="font-bold text-lg">Order Summary</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-dark-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-dark-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-dark-900">₹{(item.product?.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                      <div>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Coupon Applied</p>
                        <span className="font-black text-green-800">{appliedCoupon.code}</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="p-2 text-green-700 hover:bg-green-100 rounded-xl transition-all">
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 px-4 py-3 bg-dark-50 border border-dark-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-primary-500 outline-none uppercase" />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} className="px-5 py-3 bg-dark-900 text-white rounded-2xl font-bold text-sm hover:bg-dark-800 transition-all flex items-center gap-2">
                        {couponLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FiTag />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Table */}
                <div className="space-y-3 pt-6 border-t border-dark-100">
                  <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Subtotal</span><span className="font-bold text-dark-900">₹{subtotal.toFixed(0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Delivery</span><span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-dark-900'}`}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Platform Fee</span><span className="font-bold text-dark-900">₹15</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Discount</span><span className="font-bold text-green-600">-₹{discount.toFixed(0)}</span></div>}
                  
                  <div className="pt-4 border-t border-dark-100 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-dark-400 font-black uppercase tracking-widest leading-none mb-1">Grand Total</p>
                      <p className="text-3xl font-black text-[#fb641b] tracking-tight">₹{finalTotal.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                {estimatedTime && !isScheduled && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><FiClock /></div>
                     <p className="text-xs font-bold text-orange-800 leading-tight">Lightning fast delivery within {estimatedTime} minutes!</p>
                  </div>
                )}

                {/* Mobile Fixed Bottom Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark-100 p-4 z-[50] flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                   <div>
                      <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest leading-none mb-1">To Pay</p>
                      <p className="text-xl font-black text-[#fb641b]">₹{finalTotal.toFixed(0)}</p>
                   </div>
                   <button type="submit" disabled={loading || items.length === 0} 
                     className={`px-8 py-3.5 rounded-xl font-black text-sm uppercase shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-[#fb641b] text-white active:scale-95'}`}>
                      {loading ? 'Processing...' : 'Place Order'}
                   </button>
                </div>

                <button type="submit" disabled={loading || items.length === 0} 
                  className={`hidden md:flex w-full mt-8 py-5 rounded-3xl font-black text-lg shadow-xl transition-all items-center justify-center gap-3 ${loading ? 'bg-gray-400' : 'bg-[#fb641b] hover:bg-[#e65a18] text-white shadow-orange-200 active:scale-[0.98]'}`}>
                  {loading ? (
                    <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                  ) : (
                    <>{paymentMethod === 'online' ? `Pay ₹${finalTotal.toFixed(0)}` : 'Confirm Order'} <FiArrowRight /></>
                  )}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-40">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                   <div className="w-[1px] h-4 bg-dark-300"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary-600 rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-primary-200">Exclusive Offer</p>
                <h4 className="text-xl font-black mb-2">Get 10% Cashback</h4>
                <p className="text-sm text-primary-100 leading-relaxed">Pay via UPI to get instant cashback on your first order. Use code <span className="font-black text-white">UPINEW10</span></p>
              </div>
              <FiTag className="absolute -bottom-4 -right-4 text-primary-500/30 rotate-12 transition-transform group-hover:scale-110" size={120} />
            </div>
          </div>
        </form>
      </div>
      {/* Spacer for mobile fixed bar */}
      <div className="h-24 md:hidden"></div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
