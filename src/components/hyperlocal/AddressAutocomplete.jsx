'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader } from 'lucide-react';

const AddressAutocomplete = ({ onAddressSelect, placeholder = "Enter your address..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/location/places/autocomplete?input=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    
    try {
      // Get detailed place information
      const response = await fetch(`/api/location/places/details/${suggestion.place_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const placeDetails = data.data;
        
        const addressData = {
          place_id: suggestion.place_id,
          formatted_address: placeDetails.formatted_address,
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          address_components: placeDetails.address_components
        };
        
        setSelectedAddress(addressData);
        onAddressSelect(addressData);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedAddress(null);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-600" />
        )}
        {!isLoading && selectedAddress && (
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.place_id}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.main_text}
                  </div>
                  {suggestion.secondary_text && (
                    <div className="text-sm text-gray-600 truncate">
                      {suggestion.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedAddress && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Address selected</span>
          </div>
          <p className="text-xs text-green-700 mt-1 truncate">
            {selectedAddress.formatted_address}
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
