'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
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
    <div className="max-w-[1248px] mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-28 md:pt-14 animate-fk-fade">
      <h1 className="text-lg font-bold text-fk-text mb-4">My Cart ({items.length})</h1>
 
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="bg-white shadow-fk rounded-sm overflow-hidden">
            {items.map((item, index) => (
              <div key={item.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 ${index !== items.length - 1 ? 'border-b border-fk-divider' : ''}`}>
                <div className="w-full sm:w-28 h-28 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product?.image_url ? (
                    <img src={getImageUrl(item.product.image_url)} className="max-h-full max-w-full object-contain" alt={item.product.name} />
                  ) : (
                    <span className="text-4xl opacity-10">🛒</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-fk-text text-sm sm:text-base line-clamp-2 hover:text-fk-blue transition-colors cursor-pointer">{item.product?.name}</h3>
                  <p className="text-xs text-fk-muted mt-1 uppercase font-bold tracking-tight">Seller: QuickMart Retail</p>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-base sm:text-xl font-bold text-fk-text">₹{item.product?.price}</span>
                    {item.product?.compare_at_price > item.product?.price && (
                      <span className="text-xs sm:text-sm text-fk-muted line-through">₹{item.product?.compare_at_price}</span>
                    )}
                    <span className="text-xs sm:text-sm text-emerald-600 font-bold">Free Delivery</span>
                  </div>

                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center border border-fk-divider rounded-full">
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-fk-bg rounded-full transition-colors"><FiMinus size={12} /></button>
                      <span className="px-4 text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-fk-bg rounded-full transition-colors"><FiPlus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-sm font-bold text-fk-text hover:text-red-600 uppercase tracking-tight transition-colors">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white shadow-fk rounded-sm p-4 flex justify-end">
             <Link href="/checkout" className="bg-[#fb641b] text-white px-10 py-3 rounded-sm font-black text-sm uppercase shadow-lg hover:scale-[1.02] transition-all">Place Order</Link>
          </div>
        </div>

        <div className="w-full lg:w-[380px]">
          <div className="bg-white shadow-fk rounded-sm overflow-hidden sticky top-20">
            <h3 className="px-6 py-4 border-b border-fk-divider font-bold text-fk-muted uppercase text-sm tracking-widest">Price Details</h3>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm sm:text-base"><span className="text-fk-text">Price ({items.length} items)</span><span className="font-medium">₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-sm sm:text-base"><span className="text-fk-text">Discount</span><span className="text-emerald-600 font-medium">-₹0</span></div>
              <div className="flex justify-between text-sm sm:text-base"><span className="text-fk-text">Delivery Charges</span><span className="text-emerald-600 font-medium">FREE</span></div>
              <div className="border-t border-fk-divider border-dashed pt-4 flex justify-between text-lg font-bold"><span className="text-fk-text">Total Amount</span><span className="text-fk-text">₹{subtotal.toFixed(0)}</span></div>
            </div>
            <div className="p-4 bg-emerald-50 border-t border-fk-divider">
               <p className="text-sm text-emerald-700 font-bold">You will save ₹500 on this order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
