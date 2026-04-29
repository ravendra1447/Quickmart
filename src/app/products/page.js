'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiShoppingCart, FiZap } from 'react-icons/fi';
import { productAPI, getImageUrl } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [filters, setFilters] = useState({
    category: searchParams?.get('category') || '',
    search: searchParams?.get('search') || '',
    sort: 'newest', page: 1, limit: 12,
  });

  useEffect(() => {
    productAPI.getCategories().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productAPI.list(filters).then((r) => {
      setProducts(r.data || []);
      setTotal(r.pagination?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const handleAddToCart = async (pid) => {
    if (!user) { window.location.href = '/login'; return; }
    const ok = await addItem(pid);
    if (ok) toast.success('Added to cart!');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] overflow-x-hidden">
      {/* Premium Page Header */}
      <div className="bg-white border-b border-slate-200 pt-24 md:pt-20 pb-4 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                <Link href="/" className="hover:text-fk-blue transition-colors">Home</Link>
                <span>/</span>
                <span className="text-slate-900">Products</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {filters.category ? filters.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Our Collection'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium italic">Discover {total} premium items</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-slate-50 rounded-xl px-4 py-1.5 border border-slate-200">
                <FiFilter className="text-slate-400" size={14} />
                <select 
                  value={filters.sort} 
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                  className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer pl-2 pr-8"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#fb641b] text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <FiFilter /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-[100] bg-white p-6' : 'hidden'} sm:block w-full sm:w-64 flex-shrink-0 transition-all`}>
          <div className="sm:sticky sm:top-24 space-y-8">
            <div className="sm:hidden flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black">Filters</h2>
               <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><FiFilter /></button>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Browse Categories</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => { setFilters({ ...filters, category: '', page: 1 }); setShowFilters(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!filters.category ? 'bg-orange-50 text-[#fb641b] shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => { setFilters({ ...filters, category: cat.slug, page: 1 }); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filters.category === cat.slug ? 'bg-orange-50 text-[#fb641b] shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden sm:block p-6 bg-blue-50 rounded-3xl text-blue-900 border border-blue-100 relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-2">Special Offer</p>
                  <h4 className="font-black text-lg mb-2">Free Delivery</h4>
                  <p className="text-[10px] text-blue-700/70 leading-relaxed font-medium">On all orders above ₹500. Shop now and save more!</p>
               </div>
               <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl group-hover:bg-blue-200 transition-all"></div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="aspect-square bg-dark-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-dark-200 rounded mb-2 w-3/4"></div>
                  <div className="h-5 bg-dark-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => {
                let productImages = [];
                try {
                  productImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
                } catch (e) { productImages = []; }
                
                const mainImage = productImages.length > 0 ? productImages[0] : null;
                
                const handleBuyNow = async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) { window.location.href = '/login'; return; }
                  const ok = await addItem(product.id, 1);
                  if (ok) router.push('/checkout');
                };

                return (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group">
                    <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] sm:aspect-square bg-slate-50 overflow-hidden">
                      {mainImage ? (
                        <img 
                          src={getImageUrl(mainImage)} 
                          className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500" 
                          alt={product.name} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10">
                           <FiShoppingCart size={40} />
                        </div>
                      )}
                      
                      {product.compare_at_price > product.price && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                           {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                        </div>
                      )}
                    </Link>

                    <div className="p-2 sm:p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{product.category?.name}</p>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-[#fb641b] transition-colors leading-tight min-h-[2.5rem]">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
                          <span className="text-sm sm:text-lg font-black text-slate-900">₹{Math.round(product.price)}</span>
                          {product.compare_at_price > product.price && (
                            <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{Math.round(product.compare_at_price)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 mt-4">
                        <button 
                          onClick={() => handleAddToCart(product.id)} 
                          className="flex items-center justify-center py-2 sm:py-2.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-[9px] sm:text-xs hover:bg-slate-50 transition-all"
                        >
                          <FiShoppingCart className="mr-1 sm:mr-2" size={12} /> Cart
                        </button>
                        <button 
                          onClick={handleBuyNow} 
                          className="flex items-center justify-center py-2 sm:py-2.5 rounded-lg bg-[#fb641b] text-white font-bold text-[9px] sm:text-xs hover:bg-[#e65a18] transition-all shadow-sm shadow-orange-100"
                        >
                          <FiZap className="mr-1 sm:mr-2" size={12} /> Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-lg font-semibold text-dark-700">No products found</p>
                  <p className="text-dark-500">Try adjusting your filters</p>
                </div>
              )}

              {/* Pagination */}
              {total > filters.limit && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(total / filters.limit) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setFilters({ ...filters, page: p })}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${p === filters.page ? 'gradient-primary text-white shadow-lg' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="aspect-square bg-dark-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-dark-200 rounded mb-2 w-3/4"></div>
              <div className="h-5 bg-dark-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
