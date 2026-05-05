'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiTruck, FiX } from 'react-icons/fi';

const DeliveryInfoBanner = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbySellers, setNearbySellers] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Get user location from localStorage
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      setUserLocation(JSON.parse(stored));
      
      // Mock nearby sellers count (in real app, this would come from API)
      setNearbySellers(Math.floor(Math.random() * 8) + 3); // 3-10 sellers
    }
  }, []);

  if (!visible || !userLocation) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-700">
            <FiMapPin size={14} />
            <span className="font-medium">Location detected</span>
          </div>
          
          <div className="flex items-center gap-1 text-blue-700">
            <FiTruck size={14} />
            <span className="font-medium">{nearbySellers} nearby stores</span>
          </div>
          
          <div className="flex items-center gap-1 text-orange-600">
            <FiClock size={14} />
            <span className="font-medium">10-30 min delivery</span>
          </div>
        </div>
        
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

export default DeliveryInfoBanner;
