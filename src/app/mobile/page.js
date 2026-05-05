'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, User, Clock, Zap, Package, Coffee, Pizza, Apple, Medicine, ChevronRight, Star, TrendingUp } from 'lucide-react';
import MobileGestures from '@/components/mobile/MobileGestures';
import BottomSheet from '@/components/mobile/BottomSheet';

export default function MobileApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [cartCount, setCartCount] = useState(3);
  const [refreshing, setRefreshing] = useState(false);

  // BigBasket/Zepto style categories
  const categories = [
    { id: 'all', name: 'All', icon: '🛒', color: 'bg-gray-100' },
    { id: 'fruits', name: 'Fruits & Veg', icon: '🍎', color: 'bg-green-100' },
    { id: 'dairy', name: 'Dairy & Breakfast', icon: '🥛', color: 'bg-blue-100' },
    { id: 'snacks', name: 'Snacks & Beverages', icon: '🥤', color: 'bg-orange-100' },
    { id: 'instant', name: 'Instant Food', icon: '🍜', color: 'bg-yellow-100' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊', color: 'bg-red-100' },
    { id: 'pizza', name: 'Pizza', icon: '🍕', color: 'bg-purple-100' },
    { id: 'meat', name: 'Meat & Fish', icon: '🥩', color: 'bg-pink-100' }
  ];

  // Featured products like Zepto
  const featuredProducts = [
    { id: 1, name: 'Fresh Milk 1L', price: 56, originalPrice: 65, discount: 14, category: 'dairy', image: '🥛', rating: 4.5, fastMoving: true },
    { id: 2, name: 'Banana 1kg', price: 40, originalPrice: 50, discount: 20, category: 'fruits', image: '🍎', rating: 4.3, fastMoving: true },
    { id: 3, name: 'Bread 400g', price: 25, originalPrice: 30, discount: 17, category: 'dairy', image: '🍞', rating: 4.2, fastMoving: true },
    { id: 4, name: 'Eggs 12pcs', price: 85, originalPrice: 95, discount: 11, category: 'dairy', image: '🥚', rating: 4.6, fastMoving: true },
    { id: 5, name: 'Coca Cola 750ml', price: 45, originalPrice: 55, discount: 18, category: 'beverages', image: '🥤', rating: 4.4 },
    { id: 6, name: 'Amul Butter 500g', price: 180, originalPrice: 200, discount: 10, category: 'dairy', image: '🧈', rating: 4.7, fastMoving: true }
  ];

  // Express delivery promises
  const deliveryPromises = [
    { time: '10 min', promise: 'Lightning Fast', icon: '⚡', color: 'bg-green-100 text-green-800' },
    { time: '20 min', promise: 'Super Fast', icon: '🚀', color: 'bg-blue-100 text-blue-800' },
    { time: '30 min', promise: 'Quick', icon: '🛵', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1);
    // Add to cart logic here
  };

  return (
    <MobileGestures
      onPullToRefresh={handleRefresh}
      onSwipeLeft={() => console.log('Swipe left')}
      onSwipeRight={() => console.log('Swipe right')}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          {/* Location Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-green-50 border-b">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {userLocation ? 'Deliver to: Home' : 'Set Location'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">10-min</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20">
          {/* Express Delivery Banner */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 m-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Express Delivery</h2>
                <p className="text-sm opacity-90">Get everything in minutes!</p>
              </div>
              <div className="flex space-x-3">
                {deliveryPromises.map((promise) => (
                  <div key={promise.time} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${promise.color}`}>
                      {promise.icon}
                    </div>
                    <p className="text-xs font-bold mt-1">{promise.time}</p>
                    <p className="text-xs opacity-75">{promise.promise}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Shop by Category</h3>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                      : category.color
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-medium text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Popular Products</h3>
              <button className="text-sm text-blue-600">See all</button>
            </div>
            
            <div className="space-y-3">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-2 my-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      {product.fastMoving && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                          🔥 Popular
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Offers */}
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">🎉 Special Offer!</h3>
                  <p className="text-sm opacity-90">Get 20% off on selected items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">20%</p>
                  <p className="text-xs">OFF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium">Track Order</span>
              </button>
              <button className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                <Clock className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium">Order History</span>
              </button>
              <button className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                <User className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium">Support</span>
              </button>
              <button className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center space-y-2 hover:bg-gray-50">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-sm font-medium">Offers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
          <div className="flex items-center justify-around py-2">
            <button className="flex flex-col items-center space-y-1 px-3 py-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">QM</span>
              </div>
              <span className="text-xs text-gray-600">Home</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 px-3 py-2">
              <Search className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Search</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1 px-3 py-2 relative">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button className="flex flex-col items-center space-y-1 px-3 py-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-xs text-gray-600">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-3 z-50">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </MobileGestures>
  );
}
