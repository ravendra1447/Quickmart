'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiShoppingBag, FiZap, FiShield } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { getImageUrl } from '@/lib/api';

export default function CartPage() {
  const { user } = useAuthStore();
  const { items, subtotal, fetchCart, updateItem, removeItem, clearCart } = useCartStore();

  useEffect(() => { if (user) fetchCart(); }, [user]);

  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔒</p>
      <h2 className="text-xl font-bold text-dark-800 mb-2">Please login to view your cart</h2>
      <Link href="/login" className="btn-primary inline-block mt-4">Sign In</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-xl font-bold text-dark-800 mb-2">Your cart is empty</h2>
      <p className="text-dark-500 mb-6">Add some products to get started!</p>
      <Link href="/products" className="btn-primary inline-flex items-center gap-2"><FiShoppingBag /> Browse Products</Link>
    </div>
  );
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden">
      <div className="max-w-[1248px] mx-auto px-4 py-6 sm:py-10 pt-24 md:pt-24">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-fk-blue to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                 <FiShoppingBag size={20} />
              </div>
              My Shopping Cart
           </h1>
           <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FiZap className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Free Delivery Active</span>
           </div>
        </div>
  
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
          <div className="flex-1">
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantity</span>
              </div>
              {items.map((item, index) => {
                let productImages = [];
                try {
                  productImages = typeof item.product?.images === 'string' ? JSON.parse(item.product.images) : (item.product?.images || []);
                } catch (e) { productImages = []; }
                const mainImage = productImages.length > 0 ? productImages[0] : null;

                return (
                  <div key={item.id} className={`p-3 sm:p-5 flex gap-4 sm:gap-6 transition-all hover:bg-slate-50/50 ${index !== items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 group">
                      {mainImage ? (
                        <img src={getImageUrl(mainImage)} className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-500" alt={item.product?.name} />
                      ) : (
                        <span className="text-2xl opacity-10">🛒</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-[8px] text-fk-blue font-black uppercase tracking-widest mb-0.5">Fast Delivery</p>
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1 sm:line-clamp-2 leading-tight hover:text-fk-blue transition-colors cursor-pointer">{item.product?.name}</h3>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center flex-shrink-0"><FiTrash2 size={16} /></button>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-5 mt-2">
                        <div className="flex items-baseline gap-1.5">
                           <span className="text-lg sm:text-xl font-black text-slate-900">₹{item.product?.price}</span>
                           {item.product?.compare_at_price > item.product?.price && (
                             <span className="text-[10px] sm:text-xs text-slate-300 line-through font-bold">₹{item.product?.compare_at_price}</span>
                           )}
                        </div>
                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-wider flex items-center gap-1">
                           <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                           Free
                        </div>
                      </div>
    
                      <div className="flex items-center mt-3">
                        <div className="flex items-center bg-slate-100/50 border border-slate-200 rounded-xl p-0.5">
                          <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-lg hover:bg-slate-50 transition-all active:scale-90"><FiMinus size={12} /></button>
                          <span className="px-4 text-sm font-black text-slate-800">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-lg hover:bg-slate-50 transition-all active:scale-90"><FiPlus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className="w-full lg:w-[420px]">
            <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] border border-slate-100 overflow-hidden sticky top-24">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white"><FiShield size={16} /></div>
                 <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.15em]">Order Summary</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between text-sm font-bold"><span className="text-slate-400">Items Total</span><span className="text-slate-800 font-black">₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-sm font-bold"><span className="text-slate-400">Platform Fee</span><span className="text-slate-800 font-black">₹15</span></div>
                <div className="flex justify-between text-sm font-bold"><span className="text-slate-400">Delivery</span><span className="text-emerald-500 font-black tracking-widest uppercase text-[10px]">Free</span></div>
                
                <div className="pt-6 border-t border-slate-100 border-dashed">
                   <div className="flex justify-between items-center">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                         <p className="text-4xl font-black text-[#fb641b] tracking-tighter">₹{(subtotal + 15).toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                         <span className="px-3 py-1 bg-[#fb641b] text-white text-[10px] font-black rounded-lg shadow-lg shadow-orange-100">SAVED ₹500</span>
                      </div>
                   </div>
                </div>
              </div>
  
              <div className="p-8 pt-0">
                 <Link 
                   href={subtotal >= 150 ? "/checkout" : "#"} 
                   className={`group w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] font-black text-sm uppercase shadow-2xl transition-all active:scale-95 ${subtotal >= 150 ? 'bg-[#fb641b] text-white shadow-orange-100 hover:bg-[#e65a18]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                   onClick={(e) => { if (subtotal < 150) e.preventDefault(); }}
                 >
                   <span className="flex items-center gap-3">
                      {subtotal >= 150 ? <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> : null}
                      {subtotal >= 150 ? 'Place Order' : `Add ₹${(150 - subtotal).toFixed(0)}`}
                   </span>
                   {subtotal >= 150 && <FiShield size={20} className="opacity-40" />}
                 </Link>
                 
                 {subtotal < 150 && (
                   <div className="mt-4 flex items-center gap-2 text-rose-500">
                      <FiZap size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Min. order ₹150 required</p>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-40">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" className="h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 z-[50] flex items-center justify-between shadow-[0_-15px_30px_rgba(0,0,0,0.08)]">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">To Pay</p>
            <p className="text-2xl font-black text-[#fb641b] tracking-tight">₹{(subtotal + 15).toFixed(0)}</p>
         </div>
         <Link 
           href={subtotal >= 150 ? "/checkout" : "#"} 
           className={`px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-2 transition-all active:scale-95 ${subtotal >= 150 ? 'bg-[#fb641b] text-white shadow-orange-100' : 'bg-slate-100 text-slate-400'}`}
           onClick={(e) => { if (subtotal < 150) e.preventDefault(); }}
         >
           {subtotal >= 150 ? (
             <>Place Order <FiArrowRight size={16} /></>
           ) : 'Add More'}
         </Link>
      </div>
      <div className="h-24 md:hidden"></div>
    </div>
  );
}
