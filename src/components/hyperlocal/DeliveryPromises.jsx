'use client';

import { CheckCircle, Clock, Shield, Truck, RefreshC, Award } from 'lucide-react';

const DeliveryPromises = ({ deliveryType, isExpress = false }) => {
  const getPromises = (type) => {
    const basePromises = [
      {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        title: 'On-Time Guarantee',
        description: 'Delivery on time or fee refunded',
        color: 'bg-green-50 border-green-200'
      },
      {
        icon: <Shield className="w-5 h-5 text-blue-600" />,
        title: 'Quality Assured',
        description: 'Fresh products, quality checked',
        color: 'bg-blue-50 border-blue-200'
      },
      {
        icon: <Truck className="w-5 h-5 text-purple-600" />,
        title: 'Contactless Delivery',
        description: 'Safe and hygienic delivery',
        color: 'bg-purple-50 border-purple-200'
      },
      {
        icon: <RefreshC className="w-5 h-5 text-orange-600" />,
        title: 'Easy Returns',
        description: '7-day return policy',
        color: 'bg-orange-50 border-orange-200'
      }
    ];

    const expressPromises = [
      ...basePromises,
      {
        icon: <Clock className="w-5 h-5 text-red-600" />,
        title: 'Express Processing',
        description: 'Priority order processing',
        color: 'bg-red-50 border-red-200'
      },
      {
        icon: <Award className="w-5 h-5 text-indigo-600" />,
        title: 'Premium Service',
        description: 'Dedicated delivery partner',
        color: 'bg-indigo-50 border-indigo-200'
      }
    ];

    return isExpress ? expressPromises : basePromises;
  };

  const getTimeSpecificPromises = (type) => {
    const timePromises = {
      '10min': [
        'Lightning fast delivery',
        'Priority processing',
        'Real-time tracking',
        'Dedicated delivery partner'
      ],
      '20min': [
        'Super fast delivery',
        'Quick processing',
        'Live tracking',
        'Express delivery partner'
      ],
      '30min': [
        'Quick delivery',
        'Fast processing',
        'Order tracking',
        'Regular delivery partner'
      ],
      '1hr': [
        'Fast delivery',
        'Standard processing',
        'Order updates',
        'Regular delivery'
      ]
    };
    return timePromises[type] || timePromises['1hr'];
  };

  const promises = getPromises(deliveryType);
  const timePromises = getTimeSpecificPromises(deliveryType);

  return (
    <div className="space-y-4">
      {/* Main Promises Grid */}
      <div className="grid grid-cols-2 gap-3">
        {promises.slice(0, 4).map((promise, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${promise.color}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {promise.icon}
              <h4 className="text-sm font-semibold text-gray-900">
                {promise.title}
              </h4>
            </div>
            <p className="text-xs text-gray-600">{promise.description}</p>
          </div>
        ))}
      </div>

      {/* Time-Specific Promises */}
      {isExpress && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {deliveryType === '10min' ? '10-Min' : deliveryType === '20min' ? '20-Min' : '30-Min'} Delivery Features
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {timePromises.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Badge */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              100% Satisfaction Guarantee
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              We're committed to your satisfaction with every order
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPromises;
