'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const HyperlocalBanner = ({ userLocation }) => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userLocation) {
      fetchNotifications();
    }
  }, [userLocation, fetchNotifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hyperlocal/notifications?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
      );
      const data = await response.json();
      
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications);
        setVisible(true);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisible(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [userLocation]);

  const handleAction = (notification) => {
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    setVisible(false);
  };

  if (!visible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          {notifications.map((notification, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{notification.message}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {notifications.map((notification, index) => (
            <button
              key={index}
              onClick={() => handleAction(notification)}
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              {notification.action_text}
            </button>
          ))}
          <button
            onClick={() => setVisible(false)}
            className="text-white hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default HyperlocalBanner;
