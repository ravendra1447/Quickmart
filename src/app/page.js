'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { productAPI, hyperlocalAPI, getImageUrl } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    // Dynamic Fetching
    productAPI.getCategories().then((r) => setCategories(r.data || [])).catch(() => {});
    
    // Fetch Top Deals (Featured Products Only)
    productAPI.list({ limit: 10, is_featured: true }).then((r) => setFeaturedProducts(r.data || [])).catch(() => {});
    
    hyperlocalAPI.getBanners().then((r) => setBanners(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleAddToCart = async (productId) => {
    if (!user) { window.location.href = '/login'; return; }
    const ok = await addItem(productId);
    if (ok) toast.success('Added to cart!');
    else toast.error('Failed to add');
  };

  return (
    <div className="animate-fk-fade bg-fk-bg pb-12 pt-28 md:pt-14">
      {/* Professional Category Bar - Flipkart Style */}
      <section className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-[1248px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-6 sm:gap-10 pb-2">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="flex flex-col items-center gap-3 min-w-[80px] sm:min-w-[100px] group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-fb-blue shadow-sm transition-all group-hover:scale-105 duration-300 bg-slate-50">
                  <img 
                    src={getImageUrl(cat.image_url)} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                    }}
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-fb-blue transition-colors text-center line-clamp-1 uppercase tracking-tight">{cat.name}</span>
              </Link>
            ))}
            {categories.length === 0 && [1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[80px] sm:min-w-[100px] animate-pulse">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full"></div>
                 <div className="w-12 h-2 bg-slate-100 rounded mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Banner Slider - Enhanced Responsive Heights */}
      <section className="max-w-[1248px] mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="relative h-[200px] sm:h-[320px] lg:h-[400px] sm:rounded-sm overflow-hidden shadow-fk bg-white">
          {banners.length > 0 ? banners.map((b, i) => (
            <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === activeBanner ? 'opacity-100' : 'opacity-0'}`}>
              <Link href={b.link_url || '/products'}>
                {b.image_url ? (
                  <img src={getImageUrl(b.image_url)} className="w-full h-full object-cover lg:object-fill" alt={b.title} />
                ) : (
                  <div className="w-full h-full bg-fk-blue flex items-center justify-center text-white p-6 sm:p-12">
                    <div className="text-center">
                      <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black italic uppercase tracking-tighter drop-shadow-lg">{b.title}</h2>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-2 opacity-80">Special Dynamic Offer Only On QuickMart</p>
                      <div className="mt-6 inline-block bg-fk-yellow text-[#212121] px-8 py-2.5 rounded-sm font-black text-xs uppercase shadow-xl transform hover:scale-105 transition-all">Shop Now</div>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          )) : (
            <div className="w-full h-full bg-fk-blue flex items-center justify-center text-white">
              <div className="text-center animate-pulse">
                <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter">Big Saving Days</h2>
                <p className="text-xs font-black uppercase tracking-[0.3em] mt-2 opacity-70 italic">Exclusively on QuickMart</p>
              </div>
            </div>
          )}
          
          {/* Slider Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActiveBanner(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeBanner ? 'bg-white w-6' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Deals Section - 100% Dynamic */}
      <section className="max-w-[1248px] mx-auto px-2 sm:px-4 mt-4">
        <div className="bg-white rounded-sm shadow-fk flex flex-col">
          <div className="px-6 py-5 border-b border-fk-divider flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-fk-text">Top Deals on QuickMart</h2>
              <p className="text-xs text-emerald-600 font-bold mt-1 tracking-tight">Handpicked premium items just for you</p>
            </div>
            <Link href="/products?is_featured=true" className="bg-fk-blue text-white px-6 py-2.5 rounded-sm text-xs font-bold uppercase shadow-md hover:bg-fk-blue/90 transition-all">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-2 sm:p-4 gap-2 sm:gap-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 flex flex-col items-center text-center group cursor-pointer border border-slate-100 hover:shadow-xl transition-all rounded-sm relative">
                <Link href={`/products/${product.slug}`} className="w-full">
                  <div className="h-32 sm:h-48 w-full flex items-center justify-center mb-3 relative overflow-hidden bg-slate-50 rounded-sm">
                    {product.image_url || (product.images && product.images.length > 0) ? (
                      <img 
                        src={getImageUrl(product.image_url || product.images[0])} 
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        alt={product.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20">
                        <FiShoppingCart size={40} />
                        <span className="text-[8px] font-black uppercase">QuickMart</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Top Deal</span>
                  </div>
                  <h3 className="text-[11px] sm:text-sm font-bold text-slate-800 line-clamp-2 h-8 sm:h-10 mb-1 group-hover:text-fb-blue text-left">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-600 text-xs sm:text-lg font-black tracking-tight">₹{product.price}</span>
                    {product.compare_at_price > product.price && (
                      <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{product.compare_at_price}</span>
                    )}
                  </div>
                  <p className="text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase text-left">Free Delivery</p>
                </Link>
                
                <div className="mt-4 flex flex-col gap-2 w-full">
                  <button 
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product.id); }}
                    className="w-full py-2.5 bg-white border border-fb-blue text-fb-blue text-[11px] font-black rounded-sm hover:bg-blue-50 transition-all uppercase tracking-wider"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product.id).then(() => window.location.href='/cart'); }}
                    className="w-full py-2.5 bg-fb-blue text-white text-[11px] font-black rounded-sm hover:bg-fk-blue-hover transition-all uppercase tracking-wider shadow-lg shadow-fb-blue/20"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Middle Dynamic Advertisement Banner */}
      {banners.find(b => b.position >= 10) && (
        <section className="max-w-[1248px] mx-auto px-2 sm:px-4 mt-6">
          <div className="h-[150px] sm:h-[250px] w-full bg-white rounded-sm overflow-hidden shadow-fk">
            <Link href={banners.find(b => b.position >= 10).link_url || '#'}>
              <img 
                src={getImageUrl(banners.find(b => b.position >= 10).image_url)} 
                className="w-full h-full object-cover" 
                alt="Promotion"
              />
            </Link>
          </div>
        </section>
      )}

      {/* Seller Promo */}
      <section className="max-w-[1248px] mx-auto px-2 sm:px-4 mt-6">
        <div className="bg-white p-12 rounded-sm shadow-fk flex flex-col items-center text-center border-b-4 border-fb-blue relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-fk-yellow"></div>
          <h3 className="text-2xl font-black italic text-fb-blue mb-4 tracking-tighter">Become a QuickMart Seller</h3>
          <p className="text-fk-muted max-w-xl mb-10 font-bold text-sm">Tap into your local market and deliver within 10-30 minutes. Join 5000+ happy vendors today!</p>
          <Link href="/register" className="bg-[#fb641b] text-white px-14 py-4 rounded-sm font-black text-sm uppercase shadow-xl hover:scale-105 transition-all tracking-wide">Register Now</Link>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-fb-blue/5 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}
