'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiStar, FiClock, FiTruck, FiFilter, FiSearch } from 'react-icons/fi';
import { hyperlocalAPI } from '@/lib/api';

export default function LocationBasedSellers({ userLocation, radius = 5 }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState(radius);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    if (userLocation) {
      fetchNearbySellers();
    }
  }, [userLocation, selectedRadius, fetchNearbySellers]);

  const fetchNearbySellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await hyperlocalAPI.getNearbySellers(
        userLocation.latitude,
        userLocation.longitude,
        selectedRadius
      );
      
      if (response.success) {
        setSellers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching nearby sellers:', error);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation, selectedRadius]);

  const filteredSellers = sellers
    .filter(seller => 
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryTime':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        default:
          return 0;
      }
    });

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <FiMapPin className="mx-auto text-gray-400 mb-3" size={32} />
        <h3 className="font-semibold text-gray-900 mb-2">Enable Location</h3>
        <p className="text-gray-600 text-sm">Please enable location to see nearby stores</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Nearby Stores</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMapPin size={16} />
            <span>{selectedRadius} km radius</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Radius Selector */}
          <div className="flex gap-2">
            {[2, 5, 10].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedRadius === r
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search stores or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="distance">Nearest First</option>
            <option value="rating">Highest Rated</option>
            <option value="deliveryTime">Fastest Delivery</option>
          </select>
        </div>
      </div>

      {/* Sellers List */}
      <div className="divide-y">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredSellers.length === 0 ? (
          <div className="p-8 text-center">
            <FiMapPin className="mx-auto text-gray-400 mb-3" size={32} />
            <h3 className="font-semibold text-gray-900 mb-2">No stores found</h3>
            <p className="text-gray-600 text-sm">Try increasing the search radius</p>
          </div>
        ) : (
          filteredSellers.map(seller => (
            <div key={seller.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Store Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={seller.image}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1564902230983-3a9b5c1c7d6c?w=100';
                    }}
                  />
                </div>

                {/* Store Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{seller.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-500 fill-current" size={12} />
                          <span>{seller.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMapPin size={12} />
                          <span>{seller.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span>{seller.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      seller.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {seller.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {seller.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FiTruck size={12} />
                        <span>₹{seller.deliveryFee} delivery</span>
                      </div>
                      <span>Min order ₹{seller.minOrder}</span>
                    </div>
                    <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
