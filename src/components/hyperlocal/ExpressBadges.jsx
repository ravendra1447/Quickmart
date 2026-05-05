'use client';

import { Zap, Rocket, Package, Clock, Shield, Star, TrendingUp } from 'lucide-react';

const ExpressBadges = ({ 
  deliveryType, 
  distance, 
  storeRating, 
  orderCount, 
  isExpress = false 
}) => {
  const getExpressBadge = (type) => {
    const badges = {
      '10min': {
        icon: <Zap className="w-4 h-4" />,
        text: '10-min Delivery',
        subtext: 'Lightning Fast',
        color: 'bg-green-100 text-green-800 border-green-200',
        pulse: true
      },
      '20min': {
        icon: <Rocket className="w-4 h-4" />,
        text: '20-min Delivery',
        subtext: 'Super Fast',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        pulse: true
      },
      '30min': {
        icon: <Package className="w-4 h-4" />,
        text: '30-min Delivery',
        subtext: 'Quick Delivery',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        pulse: false
      },
      '1hr': {
        icon: <Clock className="w-4 h-4" />,
        text: '1-hour Delivery',
        subtext: 'Fast',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        pulse: false
      }
    };
    return badges[type] || badges['1hr'];
  };

  const badge = getExpressBadge(deliveryType);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Main Express Badge */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${badge.color} ${
        badge.pulse ? 'relative' : ''
      }`}>
        {badge.pulse && (
          <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
        )}
        {badge.icon}
        <div>
          <div className="text-xs font-semibold">{badge.text}</div>
          <div className="text-xs opacity-75">{badge.subtext}</div>
        </div>
      </div>

      {/* Distance Badge */}
      {distance && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
          <Package className="w-3 h-3" />
          <span>{distance.toFixed(1)}km</span>
        </div>
      )}

      {/* Rating Badge */}
      {storeRating && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
          <Star className="w-3 h-3 fill-current" />
          <span>{storeRating.toFixed(1)}</span>
        </div>
      )}

      {/* Popular Badge */}
      {orderCount && orderCount > 100 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>Popular</span>
        </div>
      )}

      {/* Quality Guarantee Badge */}
      <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
        <Shield className="w-3 h-3" />
        <span>Quality Assured</span>
      </div>
    </div>
  );
};

export default ExpressBadges;
