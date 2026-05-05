'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiUser, FiPhone, FiMail, FiGlobe } from 'react-icons/fi';

export default function CustomerLocationDisplay() {
  const [customerLocation, setCustomerLocation] = useState(null);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Get customer location from localStorage
        const locationData = localStorage.getItem('userLocation');
        if (locationData) {
          const location = JSON.parse(locationData);
          setCustomerLocation(location);
          
          // Fetch nearby products based on location
          await fetchNearbyProducts(location);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const fetchNearbyProducts = async (location) => {
    try {
      // Fetch real products from database based on location
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiBase}/products?latitude=${location.latitude}&longitude=${location.longitude}&max_distance=10&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const products = data.data || [];
        
        // Add distance information to each product
        const productsWithDistance = products.map(product => {
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
            sellerName: product.seller?.store_name || product.seller?.name || 'Local Store',
            sellerRating: product.seller?.rating || 4.0
          };
        });
        
        // Sort by distance and filter within 10km
        const filteredProducts = productsWithDistance
          .filter(product => parseFloat(product.distance) <= 10)
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 12); // Show top 12 nearest products
        
        setNearbyProducts(filteredProducts);
      } else {
        console.error('Failed to fetch products:', response.statusText);
        setNearbyProducts([]);
      }
    } catch (error) {
      console.error('Error fetching nearby products:', error);
      setNearbyProducts([]);
    }
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NearbyDukan/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          fullAddress: data.display_name || 'Unknown Location',
          city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
          area: data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Unknown Area',
          pincode: data.address?.postcode || '',
          state: data.address?.state || ''
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 w-full">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FiMapPin className="text-orange-500 flex-shrink-0" />
          Your Current Location
        </h2>
        
        {customerLocation ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <FiMapPin size={16} className="sm:size-20" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Customer Location Details</h3>
                <div className="space-y-1 text-xs sm:text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <FiGlobe size={12} className="sm:size-14" />
                    <span className="truncate">Coordinates: {customerLocation.latitude.toFixed(6)}, {customerLocation.longitude.toFixed(6)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FiMapPin size={12} className="sm:size-14" />
                    <span className="truncate">Area: {customerLocation.area || 'Detecting...'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FiMapPin size={12} className="sm:size-14" />
                    <span className="truncate">City: {customerLocation.city || 'Detecting...'}</span>
                  </p>
                  {customerLocation.pincode && (
                    <p className="flex items-center gap-2">
                      <FiMapPin size={12} className="sm:size-14" />
                      <span className="truncate">Pincode: {customerLocation.pincode}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
            <p className="text-slate-500 text-center text-sm sm:text-base">Location not detected</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FiUser className="text-blue-500 flex-shrink-0" />
          Nearby Products
        </h2>
        
        {nearbyProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {nearbyProducts.map((product) => {
              let imgs = [];
              try {
                imgs = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
              } catch (e) { imgs = []; }
              const displayImg = product.image_url || (imgs.length > 0 ? imgs[0] : null);

              return (
                <div key={product.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg border border-blue-200 p-2 flex-shrink-0">
                      {displayImg ? (
                        <img 
                          src={displayImg} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center">
                          <span className="text-xs text-slate-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate mb-1">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mb-2 truncate">{product.sellerName}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-xs sm:text-sm">
                          <FiMapPin size={12} className="sm:size-14" />
                          {product.distance} km
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs sm:text-sm">
                          ⭐ {product.sellerRating}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-600 text-sm sm:text-lg font-bold">₹{product.price}</span>
                        {product.compare_at_price > product.price && (
                          <span className="text-xs sm:text-sm text-slate-400 line-through">₹{product.compare_at_price}</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-orange-600 transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
            <p className="text-slate-500 text-center text-sm sm:text-base">No nearby products found. Try adjusting your location.</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">Location-Based Benefits</h3>
          <ul className="space-y-1 text-xs sm:text-sm text-green-700">
            <li>• Fast delivery (10-30 minutes)</li>
            <li>• Lower shipping costs</li>
            <li>• Support local businesses</li>
            <li>• Fresh products from nearby stores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
