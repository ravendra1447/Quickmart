'use client';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiShoppingCart, FiZap, FiGrid, FiList, FiChevronDown, FiX } from 'react-icons/fi';
import { productAPI, getImageUrl } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';
import './globals.css';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [filters, setFilters] = useState({
    category: searchParams?.get('category') || '',
    subcategory: searchParams?.get('subcategory') || '',
    search: searchParams?.get('search') || '',
    sort: 'newest', page: 1, limit: 12,
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    productAPI.getCategories().then((r) => {
      const cats = r.data || [];
      setCategories(cats);
      
      // Set selected category if exists in URL
      if (filters.category) {
        const selected = cats.find(cat => cat.slug === filters.category);
        setSelectedCategory(selected);
        if (selected) {
          // Fetch subcategories for the selected category
          fetchSubcategories(selected.id);
        }
      }
    }).catch(() => {});
  }, []);

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/categories/${categoryId}/subcategories`);
      const data = await response.json();
      setSubcategories(data.data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory?.id === category.id ? null : category;
    setSelectedCategory(newCategory);
    
    if (newCategory) {
      setFilters({ ...filters, category: category.slug, subcategory: '', page: 1 });
      fetchSubcategories(category.id);
    } else {
      setFilters({ ...filters, category: '', subcategory: '', page: 1 });
      setSubcategories([]);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    setFilters({ ...filters, subcategory: subcategory.slug, page: 1 });
  };

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
              <div className="hidden sm:flex items-center bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'text-[#fb641b]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'text-[#fb641b]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiList size={14} />
                </button>
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
        {/* Category Pills - Horizontal Scroll */}
        <div className="mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => { 
                setSelectedCategory(null);
                setSubcategories([]);
                setFilters({ ...filters, category: '', subcategory: '', page: 1 }); 
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                !filters.category 
                  ? 'bg-gradient-to-r from-[#fb641b] to-[#ff8c42] text-white shadow-lg shadow-orange-200 scale-105' 
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#fb641b] hover:text-[#fb641b]'
              }`}
            >
              <FiGrid size={14} />
              All Products
            </button>
            {categories.map((cat) => {
              const icons = {
                'electronics': '📱',
                'clothing': '👕',
                'food': '🍔',
                'books': '📚',
                'home': '🏠',
                'sports': '⚽',
                'toys': '🎮',
                'beauty': '💄',
                'health': '💊',
                'automotive': '🚗',
                'garden': '🌱',
                'pets': '🐕'
              };
              const icon = icons[cat.slug?.toLowerCase()] || '📦';
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    filters.category === cat.slug 
                      ? 'bg-gradient-to-r from-[#fb641b] to-[#ff8c42] text-white shadow-lg shadow-orange-200 scale-105' 
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-[#fb641b] hover:text-[#fb641b] hover:scale-105'
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
          
          {/* Subcategories */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {selectedCategory.name} Subcategories
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {subcategories.map((subcat) => (
                  <button
                    key={subcat.id}
                    onClick={() => handleSubcategoryClick(subcat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      filters.subcategory === subcat.slug 
                        ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border border-orange-300 shadow-sm scale-105' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <span className="text-xs">•</span>
                    {subcat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
                  onClick={() => { 
                    setSelectedCategory(null);
                    setSubcategories([]);
                    setFilters({ ...filters, category: '', subcategory: '', page: 1 }); 
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!filters.category ? 'bg-orange-50 text-[#fb641b] shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <button 
                      onClick={() => { 
                        handleCategoryClick(cat);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filters.category === cat.slug ? 'bg-orange-50 text-[#fb641b] shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat.name}
                    </button>
                    {/* Subcategories in sidebar */}
                    {selectedCategory?.id === cat.id && subcategories.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-left-2 duration-300">
                        {subcategories.map((subcat) => (
                          <button
                            key={subcat.id}
                            onClick={() => {
                              handleSubcategoryClick(subcat);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              filters.subcategory === subcat.slug 
                                ? 'bg-orange-100 text-orange-700 border-l-2 border-orange-400' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            • {subcat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5' : 'space-y-4'} gap-x-3 gap-y-4`}>
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
                  <div key={product.id} className={`product-card group relative bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-orange-200 ${viewMode === 'list' ? 'flex gap-3 p-3' : 'flex flex-col h-full overflow-hidden'}`}>
                    {/* Product Image Container */}
                    <div className="relative">
                      <Link href={`/products/${product.slug}`} className={`block ${viewMode === 'list' ? 'w-16 h-16 flex-shrink-0' : 'aspect-[5/4]'} w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden rounded-t-xl ${viewMode === 'list' ? 'rounded-xl' : ''}`}>
                        {mainImage ? (
                          <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-2">
                            <img 
                              src={getImageUrl(mainImage)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              alt={product.name} 
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                             <div className="text-center">
                               <FiShoppingCart size={32} className="mx-auto mb-2 text-slate-400" />
                               <p className="text-xs text-slate-400">No Image</p>
                             </div>
                          </div>
                        )}
                      
                        {/* Discount Badge */}
                        {product.compare_at_price > product.price && (
                          <div className="discount-badge absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1">
                            <span className="text-xs">🔥</span>
                            {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                          </div>
                        )}
                        
                        {/* Quick Actions Overlay */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
                          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-orange-500 hover:bg-white transition-all hover:scale-110">
                            <FiShoppingCart size={16} />
                          </button>
                        </div>
                      </Link>
                    </div>

                    {/* Product Content */}
                    <div className={`p-2 sm:p-2.5 flex flex-col ${viewMode === 'list' ? 'flex-1 justify-center' : 'flex-1'}`}>
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="category-badge inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold">
                          {product.category?.name}
                        </span>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-[10px] text-slate-600 font-medium">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Title */}
                      <Link href={`/products/${product.slug}`} className="block mb-1.5">
                        <h3 className={`font-bold text-slate-800 line-clamp-1 hover:text-orange-600 transition-colors leading-tight ${viewMode === 'list' ? 'text-xs mb-1' : 'text-xs min-h-[1rem]'}`}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Price Section */}
                      <div className="flex items-end gap-1 mb-1.5">
                        <span className={`font-black text-slate-900 ${viewMode === 'list' ? 'text-sm' : 'text-xs sm:text-sm'}`}>
                          ₹{Math.round(product.price)}
                        </span>
                        {product.compare_at_price > product.price && (
                          <span className="text-xs text-slate-400 line-through mb-0.5">
                            ₹{Math.round(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className={`${viewMode === 'list' ? 'flex items-center gap-2' : 'grid grid-cols-2 gap-1.5'} mt-auto`}>
                        <button 
                          onClick={() => handleAddToCart(product.id)} 
                          className={`btn-secondary flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-slate-700 font-bold text-[9px] group ${viewMode === 'list' ? 'flex-1' : ''}`}
                        >
                          <FiShoppingCart className="group-hover:scale-110 transition-transform" size={10} /> 
                          <span className="hidden sm:inline text-[9px]">Cart</span>
                        </button>
                        <button 
                          onClick={handleBuyNow} 
                          className={`btn-primary flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-white font-bold text-[9px] shadow-md ${viewMode === 'list' ? 'flex-1' : ''}`}
                        >
                          <FiZap className="group-hover:scale-110 transition-transform" size={10} /> 
                          <span className="hidden sm:inline text-[9px]">Buy</span>
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
