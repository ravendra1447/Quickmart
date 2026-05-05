'use client';

import { useState } from 'react';
import { Clock, Zap, Rocket, Package, Truck } from 'lucide-react';

const ExpressDeliverySlots = ({ slots, onSlotSelect, selectedSlot, distance }) => {
  const getSlotIcon = (slotId) => {
    const icons = {
      '10min': <Zap className="w-5 h-5" />,
      '20min': <Rocket className="w-5 h-5" />,
      '30min': <Package className="w-5 h-5" />,
      '1hr': <Truck className="w-5 h-5" />,
      '2hr': <Truck className="w-5 h-5" />
    };
    return icons[slotId] || <Clock className="w-5 h-5" />;
  };

  const getSlotColor = (slotId) => {
    const colors = {
      '10min': 'bg-green-100 text-green-800 border-green-200',
      '20min': 'bg-blue-100 text-blue-800 border-blue-200',
      '30min': 'bg-purple-100 text-purple-800 border-purple-200',
      '1hr': 'bg-orange-100 text-orange-800 border-orange-200',
      '2hr': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[slotId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (timeString) => {
    if (timeString.includes('minute')) {
      return timeString;
    }
    return timeString;
  };

  if (!slots || slots.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No delivery slots available</p>
          <p className="text-sm text-gray-400 mt-1">Try a different location or time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Delivery Options</h3>
          {distance && (
            <span className="text-sm text-gray-600">
              {distance.toFixed(1)}km away
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {slots.map((slot) => (
          <div
            key={slot.id}
            onClick={() => onSlotSelect(slot)}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedSlot?.id === slot.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {slot.popular && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                POPULAR
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getSlotColor(slot.id)}`}>
                  {getSlotIcon(slot.id)}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{slot.label}</h4>
                    {slot.badge && (
                      <span className="text-xs text-gray-500">{slot.badge}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600">
                      {formatTime(slot.time)}
                    </span>
                    
                    {slot.estimated_arrival && (
                      <span className="text-xs text-gray-500">
                        by {new Date(slot.estimated_arrival).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {slot.fee === 0 ? (
                  <div className="text-green-600 font-semibold">FREE</div>
                ) : (
                  <div className="text-gray-900 font-semibold">₹{slot.fee}</div>
                )}
                
                {slot.promise && (
                  <div className="text-xs text-gray-500 mt-1">
                    {slot.promise}
                  </div>
                )}
              </div>
            </div>

            {/* Additional features for express slots */}
            {slot.id.includes('min') && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Express Delivery</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-3 h-3" />
                    <span>Quick Packing</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="w-3 h-3" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Delivery Promise */}
        <div className="bg-blue-50 rounded-lg p-3 mt-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              Delivery Promise
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            On-time delivery guaranteed or your delivery fee is refunded
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpressDeliverySlots;
