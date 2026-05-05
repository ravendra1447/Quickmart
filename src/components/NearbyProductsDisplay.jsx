'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiShoppingBag, FiMapPin, FiStar, FiClock, FiTruck, FiHeart, FiSearch, FiFilter, FiShoppingCart, FiZap } from 'react-icons/fi';
import { getImageUrl } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function NearbyProductsDisplay({ userLocation, maxDistance = 10, limit = 12 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const fetchNearbyProducts = useCallback(async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(
        `${apiBase}/products/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&max_distance=${maxDistance}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        console.error('Failed to fetch nearby products:', response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching nearby products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation, maxDistance, limit]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyProducts();
    }
  }, [userLocation, maxDistance, limit, fetchNearbyProducts]);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      window.location.href = '/login';
      return false;
    }
    
    try {
      const ok = await addItem(productId);
      if (ok) {
        toast.success('Added to cart!');
      } else {
        toast.error('Failed to add to cart');
      }
      return ok;
    } catch (error) {
      toast.error('Error adding to cart');
      return false;
    }
  };

  const handleBuyNow = async (productId) => {
    if (!user) {
      toast.error('Please login to buy');
      window.location.href = '/login';
      return;
    }
    
    const ok = await handleAddToCart(productId);
    if (ok) {
      window.location.href = '/checkout';
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.category && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || 
                              (product.category && product.category.slug === selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <FiMapPin className="mx-auto text-gray-400 mb-3" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600">Please enable location to see nearby products</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiShoppingBag className="text-orange-500" />
            Top Deals on NearbyDukan
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {filteredAndSortedProducts.length} products found
            </div>
            <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
              View All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="distance">Nearest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No nearby products found</h3>
            <p className="text-gray-600">Try increasing the search radius or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedProducts.map((product) => {
              let images = [];
              try {
                images = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
              } catch (e) { images = []; }
              
              const displayImage = getImageUrl(product.image_url) || (images.length > 0 ? getImageUrl(images[0]) : null);
              const isFavorite = favorites.has(product.id);

              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200/f0f0f0/666666?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiShoppingBag className="text-gray-400" size={48} />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                      <FiHeart
                        className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}
                        size={16}
                      />
                    </button>

                    {/* Distance Badge */}
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {product.distance || 0} km
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    
                    {/* Product Rating and Delivery Time Only */}
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-500 fill-current" size={12} />
                          <span>{product.rating || 4.0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span>{product.estimatedTime || 20} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                        {product.compare_at_price > product.price && (
                          <span className="text-sm text-gray-400 line-through ml-2">₹{product.compare_at_price}</span>
                        )}
                      </div>
                      {product.deliveryFee !== undefined && (
                        <div className="text-xs text-gray-600">
                          {product.deliveryFee === 0 ? (
                            <span className="text-green-600 font-medium">Free delivery</span>
                          ) : (
                            <span>₹{product.deliveryFee} delivery</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <FiShoppingCart size={14} />
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => handleBuyNow(product.id)}
                        className="flex-1 bg-[#fb641b] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#e65a18] transition-colors flex items-center justify-center gap-1"
                      >
                        <FiZap size={14} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
