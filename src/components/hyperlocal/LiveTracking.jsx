'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, User, Package } from 'lucide-react';

const LiveTracking = ({ orderId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchTrackingData();
      // Set up polling for live updates
      const interval = setInterval(fetchTrackingData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/tracking/orders/${orderId}/live-tracking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingData(data.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error('Failed to fetch tracking data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Calculating...';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getRemainingTime = (eta) => {
    if (!eta) return null;
    const now = new Date();
    const etaTime = new Date(eta);
    const diff = etaTime - now;
    
    if (diff <= 0) return 'Arrived';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchTrackingData}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!trackingData || !trackingData.live_tracking_enabled) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Live tracking is not available for this order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Tracking</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Delivery Partner Info */}
        {trackingData.delivery_partner && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {trackingData.delivery_partner.name}
                </h4>
                <p className="text-sm text-gray-600">Delivery Partner</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {trackingData.delivery_partner.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{trackingData.delivery_partner.phone}</span>
                </div>
              )}
              {trackingData.delivery_partner.vehicle_type && (
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 capitalize">
                    {trackingData.delivery_partner.vehicle_type.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETA Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Estimated Arrival</h4>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-900">
              {formatTime(trackingData.estimated_arrival)}
            </p>
            <p className="text-sm text-blue-700">
              {getRemainingTime(trackingData.estimated_arrival)}
            </p>
          </div>

          {trackingData.live_eta && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Distance:</span>
                <span className="font-medium text-blue-900">
                  {trackingData.live_eta.distance?.text || 'Calculating...'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-blue-700">Duration:</span>
                <span className="font-medium text-blue-900">
                  {trackingData.live_eta.duration_in_traffic?.text || 'Calculating...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Order Status</h4>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              trackingData.status === 'delivered' 
                ? 'bg-green-100 text-green-800'
                : trackingData.status === 'out_for_delivery'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {trackingData.status.replace('_', ' ').toUpperCase()}
            </span>
            
            {trackingData.current_location && (
              <span className="text-sm text-gray-600">
                Partner is on the way
              </span>
            )}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">
            Interactive map will be available here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Integration with Google Maps API required
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
