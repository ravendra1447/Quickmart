'use client';

import { useState, useEffect } from 'react';
import { Crown, Check, Star, Zap, Gift, TrendingUp } from 'lucide-react';

const SubscriptionBanner = ({ userId, onSubscribe }) => {
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    fetchUserSubscription();
  }, [userId]);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan_type: planType })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.data);
        setShowPlans(false);
        if (onSubscribe) onSubscribe(data.data);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // User has active subscription
  if (userSubscription?.has_subscription) {
    const subscription = userSubscription.subscription;
    
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{subscription.plan_name}</h3>
              <p className="text-sm opacity-90">
                {subscription.remaining_days} days remaining
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm">
              <Zap className="w-4 h-4" />
              <span>FREE Delivery</span>
            </div>
            <p className="text-xs opacity-75 mt-1">
              Saved ₹{subscription.total_savings || 0}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span>Member Benefits Active</span>
            </div>
            <button className="text-white/80 hover:text-white text-sm underline">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User doesn't have subscription - show upgrade banner
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Upgrade to QuickMart One</h3>
              <p className="text-sm opacity-90">Get FREE delivery on all orders</p>
            </div>
          </div>
          <button
            onClick={() => setShowPlans(!showPlans)}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>

      {/* Subscription Benefits */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">FREE delivery</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Express delivery</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Priority support</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Exclusive deals</span>
          </div>
        </div>

        {/* Savings Highlight */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Save up to ₹500/month on delivery fees
              </p>
              <p className="text-xs text-green-700">
                Unlimited FREE delivery with subscription
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      {showPlans && (
        <div className="border-t bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Choose Your Plan</h4>
          <div className="space-y-3">
            {/* Monthly Plan */}
            <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900">QuickMart One</h5>
                  <p className="text-sm text-gray-600">Monthly</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">₹99</div>
                  <div className="text-xs text-gray-500 line-through">₹149</div>
                </div>
              </div>
              <div className="text-xs text-purple-700 font-medium mb-2">MOST POPULAR</div>
              <button
                onClick={() => handleSubscribe('monthly')}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Subscribe Now
              </button>
            </div>

            {/* Quarterly Plan */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900">QuickMart Plus</h5>
                  <p className="text-sm text-gray-600">Quarterly</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹249</div>
                  <div className="text-xs text-gray-500 line-through">₹447</div>
                </div>
              </div>
              <div className="text-xs text-green-700 font-medium mb-2">BEST VALUE</div>
              <button
                onClick={() => handleSubscribe('quarterly')}
                className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Subscribe Now
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-semibold text-gray-900">QuickMart Premium</h5>
                  <p className="text-sm text-gray-600">Yearly</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹899</div>
                  <div className="text-xs text-gray-500 line-through">₹1788</div>
                </div>
              </div>
              <div className="text-xs text-blue-700 font-medium mb-2">MAXIMUM SAVINGS</div>
              <button
                onClick={() => handleSubscribe('yearly')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowPlans(false)}
            className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBanner;
