'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, AlertCircle, Zap, Package, Clock } from 'lucide-react';

const PushNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) {
        return; // Don't show prompt if dismissed within 7 days
      }
    }

    // Show prompt after 3 seconds if permission is default
    const timer = setTimeout(() => {
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });

      setSubscription(subscription);
      
      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscription)
      });

      console.log('Successfully subscribed to notifications');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notificationPromptDismissed', new Date().toISOString());
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('QuickMart', {
        body: 'Test notification - You\'re all set!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        actions: [
          {
            action: 'open',
            title: 'Open App',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/icon-96x96.png'
          }
        ]
      });
    }
  };

  const notificationTypes = [
    {
      icon: Zap,
      title: 'Order Updates',
      description: 'Get notified when your order status changes'
    },
    {
      icon: Package,
      title: 'Delivery Alerts',
      description: 'Real-time delivery tracking notifications'
    },
    {
      icon: Clock,
      title: 'Flash Deals',
      description: 'Never miss limited-time offers and discounts'
    }
  ];

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Enable Notifications</h3>
              <p className="text-xs text-gray-600">Stay updated with your orders</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Types */}
        <div className="space-y-3 mb-4">
          {notificationTypes.map((type, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <type.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{type.title}</p>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
              <Check className="w-4 h-4 text-green-600" />
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Why enable notifications?</h4>
          </div>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Real-time order status updates</li>
            <li>• Delivery tracking alerts</li>
            <li>• Exclusive deals and offers</li>
            <li>• Important account notifications</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enabling...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Enable Notifications</span>
              </div>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Trust Info */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">No Spam</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Easy Unsubscribe</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Privacy First</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotifications;
