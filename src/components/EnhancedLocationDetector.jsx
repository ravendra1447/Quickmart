'use client';
import { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiLoader, FiRefreshCw, FiCrosshair } from 'react-icons/fi';

export default function EnhancedLocationDetector({ onLocationUpdate, showAddress = true }) {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to get stored location first
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      setLocation(parsedLocation);
      if (onLocationUpdate) onLocationUpdate(parsedLocation);
      if (showAddress) reverseGeocode(parsedLocation.latitude, parsedLocation.longitude);
    } else {
      detectLocation();
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const newLocation = { latitude, longitude };
      
      setLocation(newLocation);
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      
      if (onLocationUpdate) onLocationUpdate(newLocation);
      if (showAddress) reverseGeocode(latitude, longitude);
      
      // Update backend
      await updateLocationInBackend(latitude, longitude);
      
    } catch (err) {
      console.error('Location detection failed:', err);
      setError(err.message);
      
      // Fallback to IP-based location
      try {
        const ipLocation = await getLocationFromIP();
        if (ipLocation) {
          setLocation(ipLocation);
          localStorage.setItem('userLocation', JSON.stringify(ipLocation));
          if (onLocationUpdate) onLocationUpdate(ipLocation);
          if (showAddress) reverseGeocode(ipLocation.latitude, ipLocation.longitude);
        }
      } catch (ipErr) {
        console.error('IP location fallback failed:', ipErr);
      }
    } finally {
      setLoading(false);
    }
  }, [onLocationUpdate, showAddress]);

  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude)
        };
      }
    } catch (error) {
      console.error('IP location failed:', error);
    }
    return null;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'QuickMart/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const addressData = {
          fullAddress: data.display_name || 'Unknown Location',
          city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
          area: data.address?.suburb || data.address?.neighbourhood || data.address?.road || 'Unknown Area',
          pincode: data.address?.postcode || '',
          state: data.address?.state || '',
          country: data.address?.country || ''
        };
        setAddress(addressData);
        localStorage.setItem('userAddress', JSON.stringify(addressData));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const updateLocationInBackend = async (lat, lng) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
    } catch (error) {
      console.error('Failed to update location in backend:', error);
    }
  };

  if (!showAddress) {
    return null; // Silent mode
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiMapPin className="text-orange-500" />
          Your Location
        </h3>
        <button
          onClick={detectLocation}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
          title="Refresh location"
        >
          {loading ? (
            <FiLoader className="animate-spin" size={16} />
          ) : (
            <FiRefreshCw size={16} />
          )}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-600">
          <FiLoader className="animate-spin" />
          <span>Detecting your location...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {location && !loading && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <FiCrosshair size={14} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-900 mb-1">Location Detected</div>
                <div className="text-sm text-green-700">
                  <div>Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}</div>
                  {address && (
                    <div className="mt-1">
                      <div className="font-medium">{address.area}, {address.city}</div>
                      {address.pincode && <div>Pincode: {address.pincode}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
