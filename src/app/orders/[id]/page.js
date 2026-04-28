'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiCircle, FiTruck, FiPhone, FiClock, FiTag, FiRefreshCw, FiMapPin, FiShield, FiPackage, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { orderAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const steps = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const stepLabels = { pending: 'Order Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
const stepIcons = { pending: '📝', confirmed: '✅', packed: '📦', shipped: '🚚', out_for_delivery: '🏃', delivered: '🎉' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = () => {
    if (id) orderAPI.getById(id).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;
    const timer = setInterval(fetchOrder, 30000);
    return () => clearInterval(timer);
  }, [order?.status]);

  const handleRefresh = () => { setRefreshing(true); fetchOrder(); setTimeout(() => setRefreshing(false), 500); };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-20 animate-pulse space-y-8">
      <div className="h-8 bg-dark-100 rounded w-1/4"></div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-96 bg-dark-50 rounded-3xl"></div>
        <div className="lg:col-span-4 h-96 bg-dark-50 rounded-3xl"></div>
      </div>
    </div>
  );
  
  if (!order) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4">🔍</p>
      <h2 className="text-2xl font-bold text-dark-800">Order not found</h2>
      <Link href="/orders" className="btn-primary mt-6">Go to My Orders</Link>
    </div>
  );

  const currentStepIdx = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-dark-100 py-6 mb-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="w-10 h-10 rounded-full border border-dark-100 flex items-center justify-center hover:bg-dark-50 transition-all"><FiArrowLeft /></Link>
            <div>
              <h1 className="text-xl font-black text-dark-900 tracking-tight">Order #{order.order_number}</h1>
              <p className="text-xs text-dark-500 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleRefresh} className={`p-2.5 rounded-xl border border-dark-100 text-dark-600 flex items-center gap-2 hover:bg-dark-50 transition-all font-bold text-sm ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
             </button>
             <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest ${
                isCancelled ? 'bg-red-100 text-red-700' :
                isDelivered ? 'bg-green-100 text-green-700' :
                'bg-primary-100 text-primary-700'
              }`}>{isCancelled ? 'CANCELLED' : order.status?.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Tracking Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Map & Live Status */}
            <div className="bg-white rounded-[32px] shadow-sm border border-dark-100 overflow-hidden">
               <div className="relative h-[400px] bg-dark-100">
                  {!isCancelled && (order.deliveryAddress?.latitude || order.items?.[0]?.product?.seller?.sellerProfile?.latitude) ? (
                    <>
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        className="grayscale-[0.2] contrast-[1.1] brightness-[1.05]"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(order.deliveryAddress?.longitude || 80.9) - 0.015}%2C${parseFloat(order.deliveryAddress?.latitude || 26.8) - 0.015}%2C${parseFloat(order.deliveryAddress?.longitude || 80.9) + 0.015}%2C${parseFloat(order.deliveryAddress?.latitude || 26.8) + 0.015}&layer=mapnik&marker=${order.deliveryAddress?.latitude || 26.8}%2C${order.deliveryAddress?.longitude || 80.9}`}
                      ></iframe>
                      
                      {/* Floating Info Overlay */}
                      <div className="absolute top-6 left-6 right-6">
                         <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-dark-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-[#fb641b]/10 flex items-center justify-center text-[#fb641b]">
                                  <FiTruck size={24} className={!isDelivered && !isCancelled ? 'animate-bounce' : ''} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-[#fb641b] uppercase tracking-[0.2em] mb-0.5">Live Delivery Status</p>
                                  <h3 className="text-lg font-black text-dark-900 leading-tight">
                                     {isDelivered ? 'Order Delivered! 🎉' : isCancelled ? 'Order Cancelled ❌' : stepLabels[order.status]}
                                  </h3>
                               </div>
                            </div>
                            {!isDelivered && !isCancelled && order.estimated_delivery_min && (
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest mb-0.5">Estimated In</p>
                                  <p className="text-xl font-black text-dark-900 leading-none">{order.estimated_delivery_min} Mins</p>
                               </div>
                            )}
                         </div>
                      </div>

                      {/* Map Markers Info */}
                      <div className="absolute bottom-6 left-6 flex flex-col gap-3">
                         <div className="flex items-center gap-3 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-lg border border-dark-50 pr-6">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white"><FiShoppingBag size={14} /></div>
                            <div><p className="text-[10px] font-black text-dark-400 uppercase leading-none">From</p><p className="text-xs font-bold">{order.items?.[0]?.product?.seller?.sellerProfile?.store_name || 'Store'}</p></div>
                         </div>
                         <div className="flex items-center gap-3 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-lg border border-dark-50 pr-6">
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white"><FiMapPin size={14} /></div>
                            <div><p className="text-[10px] font-black text-dark-400 uppercase leading-none">To</p><p className="text-xs font-bold">{order.shipping_name}</p></div>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-50">
                       <span className="text-5xl mb-4">📍</span>
                       <p className="font-bold text-dark-400">Map tracking not available</p>
                    </div>
                  )}
               </div>

               {/* Step Timeline */}
               <div className="p-8 bg-dark-50/30">
                  <div className="relative flex items-center justify-between">
                     <div className="absolute left-0 right-0 h-[3px] bg-dark-100 top-5 -z-0"></div>
                     <div className="absolute left-0 h-[3px] bg-[#fb641b] top-5 -z-0 transition-all duration-1000" style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}></div>
                     
                     {steps.map((step, i) => (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                              i < currentStepIdx ? 'bg-[#fb641b] text-white shadow-lg shadow-orange-200' :
                              i === currentStepIdx ? 'bg-[#fb641b] text-white ring-4 ring-orange-100 shadow-xl shadow-orange-200 animate-pulse' :
                              'bg-white border-2 border-dark-100 text-dark-300'
                           }`}>
                              {i < currentStepIdx ? <FiCheckCircle size={18} /> : <span className="text-lg">{stepIcons[step]}</span>}
                           </div>
                           <p className={`text-[10px] font-black uppercase tracking-wider mt-3 ${i <= currentStepIdx ? 'text-dark-900' : 'text-dark-300'}`}>{stepLabels[step]}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Delivery Details */}
            <div className="grid sm:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-dark-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FiMapPin /></div>
                     <h3 className="font-black text-dark-900 uppercase text-xs tracking-widest">Delivery Address</h3>
                  </div>
                  <div className="space-y-1">
                     <p className="font-bold text-dark-900">{order.shipping_name}</p>
                     <p className="text-sm text-dark-500 font-medium flex items-center gap-1"><FiPhone size={12} /> {order.shipping_phone}</p>
                     <p className="text-sm text-dark-600 mt-2 leading-relaxed">{order.shipping_address}</p>
                     <p className="text-sm text-dark-600 font-bold">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                  </div>
               </div>

               <div className="bg-white rounded-3xl p-6 shadow-sm border border-dark-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><FiShield /></div>
                     <h3 className="font-black text-dark-900 uppercase text-xs tracking-widest">Order Info</h3>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center"><span className="text-xs font-bold text-dark-400 uppercase">Status</span><span className="text-xs font-black text-[#fb641b] uppercase tracking-widest">{order.status?.replace(/_/g, ' ')}</span></div>
                     <div className="flex justify-between items-center"><span className="text-xs font-bold text-dark-400 uppercase">Payment</span><span className="text-xs font-black text-dark-800 uppercase tracking-widest">{order.payment_method === 'cod' ? 'Cash / UPI' : 'Paid Online'}</span></div>
                     <div className="flex justify-between items-center"><span className="text-xs font-bold text-dark-400 uppercase">Items</span><span className="text-xs font-black text-dark-800 uppercase tracking-widest">{order.items?.length} Items</span></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Order Items & Summary */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-3xl shadow-sm border border-dark-100 overflow-hidden">
                <div className="p-6 border-b border-dark-50 bg-dark-900 text-white flex items-center justify-between">
                   <h3 className="font-bold">Items Ordered</h3>
                   <FiPackage />
                </div>
                <div className="p-6">
                   <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-dark-50 flex items-center justify-center text-2xl flex-shrink-0">🍱</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-dark-900 truncate">{item.product_name}</p>
                              <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest">Qty: {item.quantity} × ₹{parseFloat(item.price_at_purchase).toFixed(0)}</p>
                              <p className="text-sm font-black text-[#fb641b] mt-1">₹{(item.price_at_purchase * item.quantity).toFixed(0)}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <div className="space-y-3 pt-6 border-t border-dark-100">
                      <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Subtotal</span><span className="font-bold text-dark-900">₹{parseFloat(order.subtotal).toFixed(0)}</span></div>
                      {parseFloat(order.delivery_fee) > 0 && <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Delivery</span><span className="font-bold text-dark-900">₹{parseFloat(order.delivery_fee).toFixed(0)}</span></div>}
                      {parseFloat(order.coupon_discount) > 0 && <div className="flex justify-between text-sm"><span className="text-dark-500 font-medium">Discount</span><span className="font-bold text-green-600">-₹{parseFloat(order.coupon_discount).toFixed(0)}</span></div>}
                      
                      <div className="pt-4 border-t border-dark-100 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest leading-none mb-1">Grand Total</p>
                          <p className="text-3xl font-black text-dark-900 tracking-tight">₹{parseFloat(order.total).toFixed(0)}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Partner Card */}
             {order.delivery && (
                <div className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-[32px] p-6 text-white relative overflow-hidden group">
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform">
                         {order.delivery.partner?.name?.[0]}
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Delivery Partner</p>
                         <h4 className="text-lg font-black">{order.delivery.partner?.name}</h4>
                         <p className="text-sm text-dark-300 font-medium">{order.delivery.partner?.phone}</p>
                      </div>
                      <Link href={`tel:${order.delivery.partner?.phone}`} className="ml-auto w-12 h-12 rounded-full bg-[#fb641b] flex items-center justify-center text-white shadow-lg shadow-orange-900/50 hover:scale-110 active:scale-90 transition-all">
                         <FiPhone size={20} />
                      </Link>
                   </div>
                   <FiTruck className="absolute -bottom-8 -right-8 text-white/5 rotate-12" size={140} />
                </div>
             )}

             {/* Activity Logs */}
             {order.statusLogs && order.statusLogs.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-dark-100">
                   <h3 className="font-black text-dark-900 uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2"><FiInfo className="text-[#fb641b]" /> Order Logs</h3>
                   <div className="space-y-6">
                      {order.statusLogs.map((log, i) => (
                        <div key={log.id || i} className="flex gap-4 relative">
                           {i !== order.statusLogs.length - 1 && <div className="absolute left-[7px] top-4 w-[2px] h-full bg-dark-50"></div>}
                           <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 z-10 ${i === 0 ? 'bg-[#fb641b] shadow-lg shadow-orange-100' : 'bg-dark-100'}`}></div>
                           <div className="min-w-0">
                              <p className="text-sm font-black text-dark-800 capitalize leading-none mb-1">{log.status?.replace(/_/g, ' ')}</p>
                              {log.description && <p className="text-xs text-dark-500 mb-1">{log.description}</p>}
                              <p className="text-[10px] font-bold text-dark-400">{new Date(log.timestamp || log.created_at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'medium' })}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
