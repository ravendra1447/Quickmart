'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Star, Navigation } from 'lucide-react';

const NearbySellers = ({ userLocation, onSellerSelect }) => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySellers();
    }
  }, [userLocation]);

  const fetchNearbySellers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/location/nearby-sellers?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data.data);
      } else {
        throw new Error('Failed to fetch nearby sellers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Please enable location services to see nearby sellers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Nearby Sellers</h3>
        <p className="text-sm text-gray-600 mt-1">Stores near your location</p>
      </div>

      <div className="divide-y">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Finding nearby sellers...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchNearbySellers}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No sellers found near your location</p>
          </div>
        ) : (
          sellers.map((seller) => (
            <div key={seller.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{seller.store_name}</h4>
                    {seller.is_open && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Open
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatDistance(seller.distance_km)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(seller.estimated_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Navigation className="w-4 h-4" />
                        <span className="font-medium text-green-600">
                          ₹{seller.delivery_fee}
                        </span>
                      </div>
                    </div>
                    
                    {seller.user?.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{seller.user.phone}</span>
                      </div>
                    )}
                    
                    {seller.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{seller.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => onSellerSelect(seller)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Store
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearbySellers;
