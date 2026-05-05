'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, MapPin, ShoppingCart, Zap, Package, Coffee, Pizza, Medicine, Apple } from 'lucide-react';
import LocationDetector from './LocationDetector';
import NearbySellers from './NearbySellers';
import ExpressDeliverySlots from './ExpressDeliverySlots';
import AddressAutocomplete from './AddressAutocomplete';

const QuickCommerceInterface = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Quick commerce categories like Zepto/BigBasket
  const categories = [
    { id: 'all', name: 'All', icon: <Package className="w-5 h-5" /> },
    { id: 'fruits', name: 'Fruits & Vegetables', icon: <Apple className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
    { id: 'dairy', name: 'Dairy & Breakfast', icon: <Coffee className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { id: 'snacks', name: 'Snacks & Beverages', icon: <Package className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
    { id: 'instant', name: 'Instant Food', icon: <Zap className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'pharmacy', name: 'Pharmacy', icon: <Medicine className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
    { id: 'pizza', name: 'Pizza', icon: <Pizza className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  ];

  // Express delivery promises
  const deliveryPromises = [
    { time: '10 min', promise: 'Lightning Fast', icon: <Zap className="w-4 h-4" />, color: 'text-green-600' },
    { time: '20 min', promise: 'Super Fast', icon: <Clock className="w-4 h-4" />, color: 'text-blue-600' },
    { time: '30 min', promise: 'Quick', icon: <Package className="w-4 h-4" />, color: 'text-purple-600' },
  ];

  const handleLocationDetected = (location) => {
    setUserLocation(location);
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setSelectedSlot(null); // Reset slot when store changes
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleAddressSelect = (address) => {
    setDeliveryAddress(address);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Quick Commerce Style */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">QuickMart</h1>
                <p className="text-xs text-gray-600">Delivery in minutes</p>
              </div>
            </div>
            
            {userLocation && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">
                  {selectedStore ? `${selectedStore.distance_km}km away` : 'Location on'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Detection */}
      {!userLocation && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <LocationDetector 
            onLocationDetected={handleLocationDetected}
            onError={(error) => console.error(error)}
          />
        </div>
      )}

      {userLocation && (
        <>
          {/* Search Bar */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : category.color
                      ? category.color
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Promises Banner */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Express Delivery</h2>
                  <p className="text-sm opacity-90">Get your order in minutes</p>
                </div>
                <div className="flex space-x-4">
                  {deliveryPromises.map((promise) => (
                    <div key={promise.time} className="text-center">
                      <div className={`${promise.color} font-bold text-lg`}>{promise.time}</div>
                      <div className="text-xs opacity-75">{promise.promise}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Address & Delivery */}
            <div className="lg:col-span-1 space-y-4">
              {/* Address Input */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <AddressAutocomplete 
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter delivery address..."
                />
              </div>

              {/* Delivery Slots */}
              {selectedStore && (
                <ExpressDeliverySlots
                  slots={selectedStore.delivery_slots}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  distance={selectedStore.distance_km}
                />
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">View Cart</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Order History</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Column - Nearby Stores */}
            <div className="lg:col-span-2">
              <NearbySellers 
                userLocation={userLocation}
                onSellerSelect={handleStoreSelect}
              />
            </div>
          </div>

          {/* Order Summary Bar */}
          {selectedStore && selectedSlot && deliveryAddress && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-600">Delivery to</p>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {deliveryAddress.formatted_address}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Delivery time</p>
                    <p className="font-medium text-gray-900">{selectedSlot.time}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Delivery fee</p>
                    <p className="font-medium text-green-600">
                      {selectedSlot.fee === 0 ? 'FREE' : `₹${selectedSlot.fee}`}
                    </p>
                  </div>
                </div>
                
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Start Shopping
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuickCommerceInterface;
