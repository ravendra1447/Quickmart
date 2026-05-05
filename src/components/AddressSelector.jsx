'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiChevronDown, FiEdit2, FiLoader } from 'react-icons/fi';

export default function AddressSelector() {
  const [currentAddress, setCurrentAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    // Get current address from localStorage
    const storedAddress = localStorage.getItem('currentDeliveryAddress');
    if (storedAddress) {
      setCurrentAddress(JSON.parse(storedAddress));
    } else {
      // Auto-detect address on first load
      detectCurrentLocation();
    }

    // Load saved addresses
    const addresses = localStorage.getItem('userAddresses');
    if (addresses) {
      setSavedAddresses(JSON.parse(addresses));
    }
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
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
          state: data.address?.state || '',
          latitude: latitude,
          longitude: longitude,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
    return null;
  };

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Getting address for:', latitude, longitude);
        
        const addressData = await reverseGeocode(latitude, longitude);
        
        if (addressData) {
          setCurrentAddress(addressData);
          localStorage.setItem('currentDeliveryAddress', JSON.stringify(addressData));
          localStorage.setItem('userLocation', JSON.stringify({
            latitude,
            longitude,
            timestamp: Date.now()
          }));
          console.log('✅ Location detected! 📍');
        } else {
          // Fallback to coordinates
          const fallbackAddress = {
            fullAddress: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: 'Unknown City',
            area: 'Unknown Area',
            pincode: '',
            state: '',
            latitude,
            longitude,
            timestamp: Date.now()
          };
          setCurrentAddress(fallbackAddress);
          localStorage.setItem('currentDeliveryAddress', JSON.stringify(fallbackAddress));
          console.log('✅ Location captured! 📍');
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Location detection failed:', error);
        setLoading(false);
        console.log('❌ Failed to detect location. Please select manually.');
        
        // Set default location
        const defaultAddress = {
          fullAddress: 'Default Location, Delhi NCR',
          city: 'Delhi NCR',
          area: 'Default Area',
          pincode: '110001',
          state: 'Delhi',
          latitude: 28.6139,
          longitude: 77.2090,
          timestamp: Date.now()
        };
        setCurrentAddress(defaultAddress);
        localStorage.setItem('currentDeliveryAddress', JSON.stringify(defaultAddress));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleAddressSelect = (address) => {
    setCurrentAddress(address);
    localStorage.setItem('currentDeliveryAddress', JSON.stringify(address));
    setShowDropdown(false);
    console.log('✅ Delivery address updated! 📍');
    
    // Update location for product filtering
    localStorage.setItem('userLocation', JSON.stringify({
      latitude: address.latitude,
      longitude: address.longitude,
      timestamp: Date.now()
    }));
    
    // Refresh page to show new location-based results
    window.location.reload();
  };

  const formatAddressDisplay = (address) => {
    if (!address) return 'Select delivery location';
    
    if (address.area && address.area !== 'Unknown Area' && address.city && address.city !== 'Unknown City') {
      return `${address.area}, ${address.city}`;
    } else if (address.city && address.city !== 'Unknown City') {
      return address.city;
    } else {
      return address.fullAddress?.split(',')[0] || 'Current Location';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
           onClick={() => setShowDropdown(!showDropdown)}>
        <FiMapPin className="text-orange-500" size={16} />
        <span className="text-sm font-medium text-slate-700">Deliver to</span>
        
        {loading ? (
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin text-slate-400" size={14} />
            <span className="text-sm text-slate-500">Detecting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-slate-900">
              {formatAddressDisplay(currentAddress)}
            </span>
            <FiChevronDown className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                         size={14} />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={() => {
                detectCurrentLocation();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <FiMapPin className="text-orange-500" size={16} />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Use current location</p>
                <p className="text-xs text-slate-500">Detect your current address</p>
              </div>
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Saved Addresses</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedAddresses.length > 0 ? (
                savedAddresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddressSelect(address)}
                    className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {address.label || 'Address'} - {address.city}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {address.address_line}, {address.city}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No saved addresses</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => {
                window.location.href = '/addresses';
                setShowDropdown(false);
              }}
              className="w-full py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage Addresses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
