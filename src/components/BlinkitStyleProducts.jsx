'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiStar, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { productAPI, getImageUrl } from '@/lib/api';
import useCartStore from '@/store/cartStore';

export default function BlinkitStyleProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerLocation, setCustomerLocation] = useState(null);
  const { addItem, items } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Get customer location
        const locationData = localStorage.getItem('userLocation');
        if (locationData) {
          const location = JSON.parse(locationData);
          setCustomerLocation(location);
          
          // Fetch products with location
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${apiBase}/products?latitude=${location.latitude}&longitude=${location.longitude}&max_distance=10&limit=50`);
          
          if (response.ok) {
            const data = await response.json();
            const productsData = data.data || [];
            
            // Add distance and format for Blinkit style
            const formattedProducts = productsData.map(product => {
              let distance = 0;
              if (product.seller && product.seller.latitude && product.seller.longitude) {
                distance = calculateDistance(
                  location.latitude,
                  location.longitude,
                  product.seller.latitude,
                  product.seller.longitude
                );
              }
              
              return {
                ...product,
                distance: distance.toFixed(1),
                sellerName: product.seller?.store_name || 'Local Store',
                deliveryTime: `${Math.max(10, Math.floor(distance * 10))}-${Math.max(15, Math.floor(distance * 15))} mins`,
                rating: product.seller?.rating || 4.0,
                inStock: Math.random() > 0.1, // 90% in stock
                quantity: 1
              };
            });
            
            setProducts(formattedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array is fine for initial load

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleAddToCart = async (product) => {
    try {
      const ok = await addItem(product.id, product.quantity || 1);
      if (ok) {
        console.log(`✅ ${product.name} added to cart!`);
      } else {
        console.log('❌ Failed to add to cart');
      }
    } catch (error) {
      console.log('❌ Error adding to cart');
    }
  };

  const updateQuantity = (productId, delta) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newQuantity = Math.max(1, Math.min(10, (product.quantity || 1) + delta));
        return { ...product, quantity: newQuantity };
      }
      return product;
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4">
                  <div className="h-32 bg-slate-200 rounded mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">NearbyDukan</h2>
            <p className="text-sm text-slate-600">Get your items in minutes</p>
          </div>
          {customerLocation && (
            <div className="text-right">
              <p className="text-sm text-slate-500">Delivering to</p>
              <p className="text-sm font-bold text-slate-900">
                {customerLocation.city || 'Your Location'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          let imgs = [];
          try {
            imgs = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
          } catch (e) { imgs = []; }
          const displayImg = product.image_url || (imgs.length > 0 ? imgs[0] : null);

          return (
            <div key={product.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square bg-slate-50">
                  {displayImg ? (
                    <img 
                      src={getImageUrl(displayImg)} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-slate-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {product.deliveryTime}
                  </span>
                </div>
                
                {/* Stock Badge */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                {/* Product Name */}
                <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Seller Info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500">{product.sellerName}</span>
                  <div className="flex items-center gap-1 text-xs text-orange-500">
                    <FiMapPin size={10} />
                    {product.distance} km
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <FiStar className="text-yellow-500 fill-current" size={12} />
                  <span className="text-xs text-slate-600">{product.rating}</span>
                </div>
                
                {/* Price */}
                <div className="mb-3">
                  <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                  {product.compare_at_price > product.price && (
                    <span className="text-sm text-slate-400 line-through ml-2">
                      ₹{product.compare_at_price}
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                {product.inStock ? (
                  <div className="flex items-center gap-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1 hover:bg-slate-100 transition-colors"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">
                        {product.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1 hover:bg-slate-100 transition-colors"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    
                    {/* Add to Cart */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <FiShoppingCart size={14} />
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-200 text-slate-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
          <p className="text-sm text-slate-600">Try adjusting your location or check back later</p>
        </div>
      )}
    </div>
  );
}
