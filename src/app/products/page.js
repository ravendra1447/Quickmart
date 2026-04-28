'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiShoppingCart } from 'react-icons/fi';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 md:pt-14 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">Products</h1>
          <p className="text-dark-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden btn-secondary !py-2 !px-4 text-sm flex items-center gap-2">
            <FiFilter /> Filters
          </button>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
            className="input-field !w-auto !py-2 text-sm">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 flex-shrink-0`}>
          <div className="glass-card p-5 sticky top-24">
            <h3 className="font-bold text-dark-800 mb-4">Categories</h3>
            <div className="space-y-1">
              <button onClick={() => setFilters({ ...filters, category: '', page: 1 })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!filters.category ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-dark-600 hover:bg-dark-100'}`}>
                All Categories
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setFilters({ ...filters, category: cat.slug, page: 1 })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === cat.slug ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-dark-600 hover:bg-dark-100'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  <div key={product.id} className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300 group overflow-hidden flex flex-col h-full border border-dark-50">
                    <Link href={`/products/${product.slug}`} className="relative flex-shrink-0 block bg-dark-50/30">
                      <div className="aspect-square flex items-center justify-center relative overflow-hidden p-4">
                        {mainImage ? (
                          <img 
                            src={getImageUrl(mainImage)} 
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                            alt={product.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 opacity-10 group-hover:scale-110 transition-transform duration-700">
                             <FiShoppingCart size={60} />
                             <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg">
                              {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-2.5 py-1 bg-[#fb641b] text-white text-[10px] font-black rounded-lg shadow-lg">Featured</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex-1 mb-4">
                        <p className="text-[10px] text-[#fb641b] font-black uppercase tracking-widest mb-1">{product.category?.name}</p>
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-sm font-bold text-dark-900 line-clamp-2 hover:text-[#fb641b] transition-colors leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xl font-black text-dark-900">₹{Math.round(product.price)}</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-xs text-dark-400 line-through font-bold">₹{Math.round(product.compare_at_price)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleAddToCart(product.id)} 
                          disabled={product.stock === 0}
                          className="flex items-center justify-center py-3 rounded-xl border-2 border-dark-100 text-dark-700 font-black text-[10px] uppercase hover:bg-dark-50 hover:border-dark-200 transition-all disabled:opacity-50"
                        >
                          + Cart
                        </button>
                        <button 
                          onClick={handleBuyNow} 
                          disabled={product.stock === 0}
                          className="flex items-center justify-center py-3 rounded-xl bg-[#fb641b] text-white font-black text-[10px] uppercase shadow-lg shadow-orange-100 hover:bg-[#e65a18] hover:shadow-orange-200 transition-all disabled:opacity-50"
                        >
                          Buy Now
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
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
