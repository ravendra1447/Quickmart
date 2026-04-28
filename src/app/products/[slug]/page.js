'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiTruck, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { productAPI, getImageUrl } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width === 0) return;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeImage) {
      setActiveImage(newIndex);
    }
  };

  const scrollToImage = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (slug) {
      productAPI.getBySlug(slug).then((r) => setProduct(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [slug]);

  const handleAdd = async () => {
    if (!user) { window.location.href = '/login'; return; }
    const ok = await addItem(product.id, quantity);
    if (ok) toast.success(`${quantity} item(s) added to cart!`);
    else toast.error('Failed to add to cart');
  };

  const handleBuyNow = async () => {
    if (!user) { window.location.href = '/login'; return; }
    const ok = await addItem(product.id, quantity);
    if (ok) router.push('/checkout');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-dark-100 rounded-[32px]"></div>
        <div className="space-y-6 pt-8">
           <div className="h-4 bg-dark-100 rounded w-1/4"></div>
           <div className="h-10 bg-dark-100 rounded w-3/4"></div>
           <div className="h-6 bg-dark-100 rounded w-1/2"></div>
           <div className="space-y-2 pt-4">
              <div className="h-4 bg-dark-100 rounded w-full"></div>
              <div className="h-4 bg-dark-100 rounded w-full"></div>
              <div className="h-4 bg-dark-100 rounded w-2/3"></div>
           </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-32">
       <p className="text-6xl mb-6">🔍</p>
       <h2 className="text-2xl font-black text-dark-900">Product Not Found</h2>
       <p className="text-dark-500 mb-8">The product you are looking for might have been removed.</p>
       <Link href="/products" className="px-8 py-4 bg-[#fb641b] text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-[#e65a18] transition-all">Browse All Products</Link>
    </div>
  );

  let productImages = [];
  try {
    productImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
  } catch (e) { productImages = []; }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link href="/products" className="inline-flex items-center gap-3 text-dark-400 hover:text-[#fb641b] text-xs font-black uppercase tracking-widest mb-10 transition-all group">
        <div className="w-8 h-8 rounded-full border border-dark-100 flex items-center justify-center group-hover:bg-dark-50 transition-all"><FiArrowLeft /></div>
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Image Section (Swipeable Slider) */}
        <div className="space-y-6">
           <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-dark-50 overflow-hidden group relative">
              {/* Main Swipe Container */}
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="aspect-square flex overflow-x-auto snap-x snap-mandatory scrollbar-hide bg-dark-50/20"
              >
                 {productImages.length > 0 ? productImages.map((img, i) => (
                   <div key={i} className="min-w-full h-full flex items-center justify-center p-8 snap-center">
                     <img 
                       src={getImageUrl(img)} 
                       className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                       alt={`${product.name} ${i + 1}`} 
                       onError={(e) => {
                         e.target.onerror = null;
                         e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                       }}
                     />
                   </div>
                 )) : (
                   <div className="min-w-full h-full flex flex-col items-center justify-center gap-4 opacity-10">
                      <FiShoppingCart size={120} />
                      <span className="font-black text-xs uppercase tracking-[0.2em]">No Image Available</span>
                   </div>
                 )}
              </div>

              {/* Navigation Arrows (Control Scroller) */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={() => scrollToImage(Math.max(0, activeImage - 1))}
                    className={`absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-dark-900 transition-all z-20 ${activeImage === 0 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 hover:bg-[#fb641b] hover:text-white'}`}
                  >
                    <FiArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scrollToImage(Math.min(productImages.length - 1, activeImage + 1))}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center text-dark-900 transition-all z-20 ${activeImage === productImages.length - 1 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 hover:bg-[#fb641b] hover:text-white'}`}
                  >
                    <FiPlus className="rotate-45 scale-150" />
                  </button>
                </>
              )}
              
              {/* Floating Counter & Badge */}
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none z-20">
                 {productImages.length > 1 && (
                   <div className="px-4 py-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-black rounded-full tracking-[0.2em]">
                      {activeImage + 1} / {productImages.length}
                   </div>
                 )}
                 {product.compare_at_price && product.compare_at_price > product.price && (
                    <span className="px-4 py-2 bg-red-500 text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest">
                       {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                    </span>
                 )}
              </div>
           </div>

           {/* Thumbnails (Sync with Slider) */}
           {productImages.length > 1 && (
             <div className="flex gap-4 overflow-x-auto py-2 px-2 scrollbar-hide">
                {productImages.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => scrollToImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all p-1 bg-white overflow-hidden ${activeImage === i ? 'border-[#fb641b] shadow-lg shadow-orange-50 scale-105' : 'border-dark-50 hover:border-dark-100 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(img)} className="w-full h-full object-contain mix-blend-multiply" alt={`Thumb ${i+1}`} />
                  </button>
                ))}
             </div>
           )}
        </div>

        {/* Product Details Content */}
        <div className="pt-4 lg:pt-0">
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-orange-50 text-[#fb641b] text-[10px] font-black uppercase tracking-[0.15em] rounded-full">{product.category?.name}</span>
             {product.subcategory && <span className="text-dark-300 text-xs">/</span>}
             {product.subcategory && <span className="text-dark-400 text-[10px] font-bold uppercase tracking-widest">{product.subcategory.name}</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark-900 mb-6 leading-[1.1] tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-dark-50">
             <div className="w-10 h-10 rounded-full bg-dark-50 border border-dark-100 flex items-center justify-center font-black text-xs text-dark-700">
                {product.seller?.store_name?.charAt(0) || 'S'}
             </div>
             <div>
                <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest">Sold by</p>
                <p className="text-sm font-bold text-dark-700">{product.seller?.store_name || 'Premium Partner'}</p>
             </div>
             <div className="ml-auto px-4 py-2 bg-blue-50 rounded-xl text-blue-600 flex items-center gap-2">
                <FiCheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
             </div>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-5xl font-black text-dark-900 tracking-tighter">₹{Math.round(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <div className="flex flex-col">
                <span className="text-xl text-dark-300 line-through font-bold">₹{Math.round(product.compare_at_price)}</span>
                <span className="text-xs text-green-600 font-black uppercase tracking-widest">Save ₹{Math.round(product.compare_at_price - product.price)}</span>
              </div>
            )}
          </div>

          <p className="text-dark-500 text-base leading-relaxed mb-10 font-medium">{product.description || 'This premium product is carefully selected for quality and freshness. Order now for lightning fast delivery.'}</p>

          {/* Action Buttons */}
          {product.stock > 0 ? (
            <div className="space-y-6">
               <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center bg-dark-50 border border-dark-100 rounded-2xl p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center justify-center text-dark-600 active:scale-90"><FiMinus /></button>
                    <span className="w-12 text-center font-black text-xl text-dark-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-12 h-12 rounded-xl hover:bg-white hover:shadow-sm transition-all flex items-center justify-center text-dark-600 active:scale-90"><FiPlus /></button>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={handleAdd} className="w-full py-5 px-8 rounded-2xl border-2 border-dark-100 text-dark-700 font-black text-sm uppercase hover:bg-dark-50 hover:border-dark-200 transition-all active:scale-95 flex items-center justify-center gap-3">
                    <FiShoppingCart size={18} /> Add to Cart
                  </button>
                  <button onClick={handleBuyNow} className="w-full py-5 px-8 rounded-2xl bg-[#fb641b] text-white font-black text-sm uppercase shadow-2xl shadow-orange-100 hover:bg-[#e65a18] transition-all active:scale-95">
                    Buy It Now
                  </button>
               </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600">
               <FiAlertCircle size={24} />
               <p className="font-black text-sm uppercase tracking-widest">Currently Out of Stock</p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-12 border-t border-dark-50">
            <div className="flex items-center gap-4 p-5 bg-dark-50/50 rounded-2xl">
               <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#fb641b]"><FiTruck size={24} /></div>
               <div>
                  <p className="text-sm font-black text-dark-800">Fast Delivery</p>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-tight">10-30 Mins</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-dark-50/50 rounded-2xl">
               <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#fb641b]"><FiShield size={24} /></div>
               <div>
                  <p className="text-sm font-black text-dark-800">Secure Payment</p>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-tight">100% Verified</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
