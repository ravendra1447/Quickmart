'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiChevronDown, FiEdit2, FiCheck } from 'react-icons/fi';

export default function AddressHeader() {
  const [userAddress, setUserAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Get address from localStorage
    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      setUserAddress(JSON.parse(storedAddress));
    }

    // Get location from localStorage
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation && !storedAddress) {
      // If we have location but no address, try to get address
      reverseGeocode(JSON.parse(storedLocation).latitude, JSON.parse(storedLocation).longitude);
    }
  }, []);

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
        setUserAddress(addressData);
        localStorage.setItem('userAddress', JSON.stringify(addressData));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleEditAddress = () => {
    setIsEditing(true);
    setShowAddressDropdown(false);
  };

  const handleSaveAddress = (newAddress) => {
    setUserAddress(newAddress);
    localStorage.setItem('userAddress', JSON.stringify(newAddress));
    setIsEditing(false);
  };

  const handleDetectLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
      
      // Get address for new location
      await reverseGeocode(latitude, longitude);
      
    } catch (error) {
      console.error('Location detection failed:', error);
      alert('Failed to detect location. Please check your browser settings.');
    }
  };

  if (isEditing) {
    return <AddressEditForm address={userAddress} onSave={handleSaveAddress} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="relative">
      {/* Address Display Button */}
      <button
        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
        className="flex items-center gap-2 text-white font-medium text-sm hover:text-fk-yellow transition-colors bg-fk-blue/10 px-3 py-2 rounded-lg"
      >
        <FiMapPin className="text-orange-400" size={16} />
        <span className="hidden sm:inline">
          {userAddress ? (
            `${userAddress.area}, ${userAddress.city}`
          ) : (
            'Set Location'
          )}
        </span>
        <span className="sm:hidden">
          {userAddress ? userAddress.area : 'Location'}
        </span>
        <FiChevronDown className={`transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} size={14} />
      </button>

      {/* Address Dropdown */}
      {showAddressDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="text-orange-500" />
                Delivery Address
              </h3>
              <button
                onClick={() => setShowAddressDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {userAddress ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-900 mb-1">Current Location</div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div className="font-medium">{userAddress.area}, {userAddress.city}</div>
                    <div>{userAddress.fullAddress}</div>
                    {userAddress.pincode && <div>Pincode: {userAddress.pincode}</div>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEditAddress}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiEdit2 size={14} />
                    Edit Address
                  </button>
                  <button
                    onClick={handleDetectLocation}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiMapPin size={14} />
                    Detect Location
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <FiMapPin className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 mb-3">No location set</p>
                  <button
                    onClick={handleDetectLocation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiMapPin size={16} />
                    Detect My Location
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Address Edit Form Component
function AddressEditForm({ address, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    area: address?.area || '',
    city: address?.city || '',
    pincode: address?.pincode || '',
    state: address?.state || '',
    fullAddress: address?.fullAddress || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FiEdit2 className="text-orange-500" />
        Edit Delivery Address
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area/Locality</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            pattern="[0-9]{6}"
            maxLength="6"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            <FiCheck size={16} />
            Save Address
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
