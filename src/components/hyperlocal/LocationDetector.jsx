'use client';

import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

const LocationDetector = ({ onLocationDetected, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Auto-detect location on component mount
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = () => {
    setIsLoading(true);
    
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by this browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        setLocation(locationData);
        onLocationDetected(locationData);
        setIsLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        onError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(`/api/location/reverse-geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data.formatted_address;
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Location Services</h3>
        {isLoading && <Loader className="w-5 h-5 animate-spin text-blue-600" />}
      </div>
      
      {location ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Location detected</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">Coordinates:</p>
            <p className="text-xs text-gray-600">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accuracy: ±{location.accuracy.toFixed(0)}m
            </p>
          </div>
          
          <button
            onClick={detectCurrentLocation}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Location
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Location not detected</span>
          </div>
          
          <button
            onClick={detectCurrentLocation}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Detecting...' : 'Detect My Location'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationDetector;
