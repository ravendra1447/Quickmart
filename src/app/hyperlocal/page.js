'use client';

import { useState } from 'react';
import { MapPin, Store, Navigation, Search } from 'lucide-react';
import LocationDetector from '@/components/hyperlocal/LocationDetector';
import NearbySellers from '@/components/hyperlocal/NearbySellers';
import AddressAutocomplete from '@/components/hyperlocal/AddressAutocomplete';
import LiveTracking from '@/components/hyperlocal/LiveTracking';

export default function HyperlocalPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [error, setError] = useState(null);

  const handleLocationDetected = (location) => {
    setUserLocation(location);
    setError(null);
  };

  const handleLocationError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleTrackOrder = (orderId) => {
    setTrackingOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hyperlocal Services</h1>
                <p className="text-sm text-gray-600">Find stores near you</p>
              </div>
            </div>
            
            {userLocation && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Location enabled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Location Services */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Detector */}
            <LocationDetector 
              onLocationDetected={handleLocationDetected}
              onError={handleLocationError}
            />

            {/* Address Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Search Address</h3>
              </div>
              <AddressAutocomplete 
                onAddressSelect={handleAddressSelect}
                placeholder="Search for a location..."
              />
            </div>

            {/* Order Tracking */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Navigation className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Track Order</h3>
              </div>
              <input
                type="text"
                placeholder="Enter order ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />
              <button
                onClick={() => handleTrackOrder('123')} // Demo order ID
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Track Order
              </button>
            </div>
          </div>

          {/* Middle Column - Nearby Sellers */}
          <div className="lg:col-span-2">
            <NearbySellers 
              userLocation={userLocation}
              onSellerSelect={handleSellerSelect}
            />
          </div>
        </div>

        {/* Selected Seller Details */}
        {selectedSeller && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Store Details</h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSeller.store_name}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedSeller.distance_km.toFixed(1)}km away</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4" />
                    <span>Delivery: ₹{selectedSeller.delivery_fee}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">⏱️</span>
                    <span>{selectedSeller.estimated_time} min delivery</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View Products
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Call Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Section */}
        {trackingOrderId && (
          <div className="mt-8">
            <LiveTracking orderId={trackingOrderId} />
          </div>
        )}

        {/* Selected Address Details */}
        {selectedAddress && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Selected Address</h3>
              <button
                onClick={() => setSelectedAddress(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                <p className="text-gray-900">{selectedAddress.formatted_address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Latitude:</span>
                  <p className="font-medium">{selectedAddress.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Longitude:</span>
                  <p className="font-medium">{selectedAddress.longitude.toFixed(6)}</p>
                </div>
              </div>
              
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Confirm Delivery Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
