'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const LocationDetector = ({ onLocationUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Auto-detect location on component mount
    detectUserLocation();
  }, [onLocationUpdate, detectUserLocation]);

  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Update user location in backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/update-location`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ latitude, longitude })
          });

          if (response.ok) {
            // Store location in localStorage for immediate use
            localStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
            
            // Notify parent component
            if (onLocationUpdate) {
              onLocationUpdate({ latitude, longitude });
            }

            // Get hyperlocal notifications
            fetchHyperlocalNotifications(latitude, longitude);
          }
        } catch (error) {
          console.error('Failed to update location:', error);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Location detection failed:', error);
        setIsLoading(false);
        
        // Fallback: try to get location from IP
        getLocationFromIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [onLocationUpdate, getLocationFromIP, fetchHyperlocalNotifications]);

  const getLocationFromIP = useCallback(async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const location = { latitude: data.latitude, longitude: data.longitude };
        localStorage.setItem('userLocation', JSON.stringify(location));
        
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
        
        fetchHyperlocalNotifications(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('IP location failed:', error);
    }
  }, [onLocationUpdate, fetchHyperlocalNotifications]);

  const fetchHyperlocalNotifications = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hyperlocal/notifications?latitude=${lat}&longitude=${lng}`);
      const data = await response.json();
      
      if (data.notifications && data.notifications.length > 0) {
        // Show notifications silently
        data.notifications.forEach(notification => {
          if (notification.priority === 'high') {
            // Show high priority notifications
            console.log('🚀 Hyperlocal:', notification.message);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Silent component - no UI needed
  return null;
};

export default LocationDetector;
