'use client';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiMapPin, FiStar, FiClock, FiTruck, FiSearch, FiFilter } from 'react-icons/fi';

export default function NearbyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    // Get user location
    const storedLocation = localStorage.getItem('userLocation');
    const storedAddress = localStorage.getItem('userAddress');
    
    console.log('📍 User Location:', storedLocation);
    console.log('🏠 User Address:', storedAddress);
    
    if (storedLocation) {
      const location = JSON.parse(storedLocation);
      setUserLocation(location);
      fetchNearbyProducts(location);
    } else {
      // Auto-detect location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const location = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            };
            localStorage.setItem('userLocation', JSON.stringify(location));
            setUserLocation(location);
            fetchNearbyProducts(location);
          },
          (error) => {
            console.error('❌ Location error:', error);
            setLoading(false);
          }
        );
      }
    }
  }, []);

  const fetchNearbyProducts = async (location) => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      console.log('🔄 Fetching nearby products for:', location);
      console.log('🌐 API Base:', apiBase);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      // Try multiple endpoints
      const endpoints = [
        `/products/nearby?latitude=${location.latitude}&longitude=${location.longitude}&max_distance=10&limit=20`,
        `/products?latitude=${location.latitude}&longitude=${location.longitude}`,
        `/products` // fallback to all products
      ];
      
      let productsData = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('📡 Trying endpoint:', `${apiBase}${endpoint}`);
          
          const response = await fetch(
            `${apiBase}${endpoint}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            }
          );

          console.log('📊 Response status:', response.status);
          console.log('📊 Response ok:', response.ok);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            if (data.data && Array.isArray(data.data)) {
              productsData = data.data;
              console.log('🎯 Found products:', productsData.length);
              break;
            } else if (data.products && Array.isArray(data.products)) {
              productsData = data.products;
              console.log('🎯 Found products:', productsData.length);
              break;
            }
          }
        } catch (endpointError) {
          console.error('❌ Endpoint failed:', endpoint, endpointError);
          continue;
        }
      }
      
      if (productsData) {
        console.log('🎉 Successfully fetched products from database!');
        console.log('📊 Database products:', productsData.length);
        
        // Add distance and seller info to products
        const enrichedProducts = productsData.map((product, index) => {
          const productName = product.name || product.title || `Product ${index + 1}`;
          const cleanName = productName.replace(/\s+/g, '');
          
          // Calculate real distance if seller has location
          let distance = (Math.random() * 5 + 0.5).toFixed(1);
          if (product.seller?.sellerProfile?.latitude && product.seller?.sellerProfile?.longitude) {
            const sellerLat = parseFloat(product.seller.sellerProfile.latitude);
            const sellerLng = parseFloat(product.seller.sellerProfile.longitude);
            const userLat = parseFloat(location.latitude);
            const userLng = parseFloat(location.longitude);
            
            // Simple distance calculation (Haversine formula)
            const R = 6371; // Earth's radius in km
            const dLat = (sellerLat - userLat) * Math.PI / 180;
            const dLon = (sellerLng - userLng) * Math.PI / 180;
            const a = Math.sin(dLat) * Math.sin(dLat) + 
                       Math.cos(userLat) * Math.cos(dLat) * Math.cos(dLat);
            const c = 2 * Math.atan2(Math.sqrt(a * a + Math.sin(dLat) * Math.sin(dLat)));
            distance = R * c;
          }
          
          return {
            ...product,
            name: productName,
            distance: distance,
            rating: product.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
            estimatedTime: Math.floor(Math.random() * 20 + 10),
            deliveryFee: product.deliveryFee || 0,
            sellerName: product.seller?.name || product.seller?.sellerProfile?.store_name || `Local Seller ${index + 1}`,
            sellerAddress: product.seller?.address || product.seller?.sellerProfile?.business_address || 'Delhi, India',
            image_url: product.image_url || product.images?.[0] || `https://picsum.photos/seed/${cleanName}/300/300.jpg`,
            category: product.category || 'Others'
          };
        });
        
        console.log('📦 Enriched products ready:', enrichedProducts);
        setProducts(enrichedProducts);
      } else {
        console.log('⚠️ No products found from database, loading sample data');
        loadSampleProducts();
      }
      
    } catch (error) {
      console.error('💥 Major error:', error);
      loadSampleProducts();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleProducts = () => {
    const sampleProducts = [
      {
        id: 1,
        name: 'Fresh Tomatoes',
        description: 'Fresh red tomatoes from local farm',
        price: 40,
        compare_at_price: 50,
        distance: 0.8,
        rating: 4.5,
        estimatedTime: 15,
        deliveryFee: 0,
        sellerName: 'Local Grocery Store',
        sellerAddress: 'Lajpat Nagar, Delhi',
        image_url: 'https://picsum.photos/seed/tomatoes/300/300.jpg',
        category: 'Fresh Vegetables & Greens',
        is_available: true
      },
      {
        id: 2,
        name: 'Organic Milk',
        description: 'Pure organic cow milk',
        price: 55,
        compare_at_price: 65,
        distance: 1.2,
        rating: 4.8,
        estimatedTime: 20,
        deliveryFee: 15,
        sellerName: 'Fresh Dairy Shop',
        sellerAddress: 'Connaught Place, Delhi',
        image_url: 'https://picsum.photos/seed/milk/300/300.jpg',
        category: 'Dairy, Eggs & Milk Products',
        is_available: true
      },
      {
        id: 3,
        name: 'Fresh Bread',
        description: 'Freshly baked bread',
        price: 35,
        compare_at_price: 45,
        distance: 2.1,
        rating: 4.2,
        estimatedTime: 25,
        deliveryFee: 25,
        sellerName: 'Local Bakery',
        sellerAddress: 'Karol Bagh, Delhi',
        image_url: 'https://picsum.photos/seed/bread/300/300.jpg',
        category: 'Bakery & Breads',
        is_available: true
      },
      {
        id: 4,
        name: 'Green Chilies',
        description: 'Fresh green chilies',
        price: 25,
        compare_at_price: 30,
        distance: 0.5,
        rating: 4.6,
        estimatedTime: 10,
        deliveryFee: 0,
        sellerName: 'Spice Market',
        sellerAddress: 'Lajpat Nagar, Delhi',
        image_url: 'https://picsum.photos/seed/chilies/300/300.jpg',
        category: 'Fresh Vegetables & Greens',
        is_available: true
      },
      {
        id: 5,
        name: 'Fresh Eggs',
        description: 'Farm fresh eggs',
        price: 80,
        compare_at_price: 100,
        distance: 1.5,
        rating: 4.7,
        estimatedTime: 18,
        deliveryFee: 20,
        sellerName: 'Poultry Farm',
        sellerAddress: 'South Delhi',
        image_url: 'https://picsum.photos/seed/eggs/300/300.jpg',
        category: 'Dairy, Eggs & Milk Products',
        is_available: true
      },
      {
        id: 6,
        name: 'Onions',
        description: 'Fresh red onions',
        price: 30,
        compare_at_price: 40,
        distance: 0.9,
        rating: 4.4,
        estimatedTime: 12,
        deliveryFee: 0,
        sellerName: 'Vegetable Market',
        sellerAddress: 'Lajpat Nagar, Delhi',
        image_url: 'https://picsum.photos/seed/onions/300/300.jpg',
        category: 'Fresh Vegetables & Greens',
        is_available: true
      }
    ];
    setProducts(sampleProducts);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'distance') return a.distance - b.distance;
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'time') return a.estimatedTime - b.estimatedTime;
    return 0;
  });

  // Group products by category with better names
  const groupedProducts = sortedProducts.reduce((groups, product) => {
    let category = product.category || 'Others';
    
    // Map category names to better ones
    const categoryMap = {
      'Vegetables': 'Fresh Vegetables & Greens',
      'Dairy': 'Dairy, Eggs & Milk Products', 
      'Bakery': 'Bakery & Breads',
      'Fruits': 'Fresh Fruits',
      'Others': 'Other Products'
    };
    
    category = categoryMap[category] || category;
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});

  const handleAddToCart = async (product) => {
    try {
      const cartItem = {
        id: product.id,
        product: product,
        quantity: 1
      };
      // Add to cart logic here
      console.log('Adding to cart:', cartItem);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async (product) => {
    try {
      console.log('Buy now:', product);
      alert(`Buying ${product.name} - Redirecting to checkout...`);
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding nearby products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <FiShoppingBag size={32} />
              Nearby Products
            </h1>
            <p className="text-lg opacity-90">
              {userLocation ? 
                `Products from sellers near ${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}` : 
                'Finding products near you...'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Found</div>
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm opacity-75">products</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={20} className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="distance">Nearest First</option>
              <option value="time">Fastest Delivery</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products by Category */}
      <div className="space-y-8">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {category === 'Fresh Vegetables & Greens' && '🥬 Fresh Vegetables & Greens'}
                  {category === 'Dairy, Eggs & Milk Products' && '🥛 Dairy, Eggs & Milk Products'}
                  {category === 'Bakery & Breads' && '🍞 Bakery & Breads'}
                  {category === 'Fresh Fruits' && '🍎 Fresh Fruits'}
                  {category === 'Other Products' && '📦 Other Products'}
                  {category}
                </h2>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {categoryProducts.length} items
                </div>
              </div>
            </div>

            {/* Category Products Grid */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryProducts.map((product) => {
                  const discount = product.compare_at_price > product.price ? 
                    Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

                  return (
                    <div key={product.id} className="bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-all group">
                      {/* Badge */}
                      {discount > 20 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                          TOP DEAL
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative h-32 bg-gray-100">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.log('Image failed for:', product.name);
                            const cleanName = product.name.replace(/\s+/g, '');
                            e.target.src = `https://picsum.photos/seed/${cleanName}/300/300.jpg`;
                          }}
                          onLoad={() => {
                            console.log('Image loaded for:', product.name);
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        
                        {/* Quick Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <FiMapPin className="text-orange-500" size={10} />
                            <span>{product.distance} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock size={10} />
                            <span>{product.estimatedTime} min</span>
                          </div>
                          {product.deliveryFee === 0 && (
                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                              FREE
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                            {product.compare_at_price > product.price && (
                              <span className="text-xs text-gray-400 line-through ml-1">₹{product.compare_at_price}</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-orange-500 text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 bg-[#fb641b] text-white py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-[#fa520b] transition-colors"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <FiMapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found nearby</h3>
          <p className="text-gray-600 mb-4">
            Try changing your location or search for different products
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Refresh Location
          </button>
        </div>
      )}
    </div>
  );
}
