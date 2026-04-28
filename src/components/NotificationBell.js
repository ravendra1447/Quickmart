'use client';
import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { notificationAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user && (user.role === 'seller' || user.role === 'super_admin')) {
      fetchNotifications();
      
      // Initialize FCM and request permission
      import('@/lib/firebase').then(async ({ requestFCMToken, onMessageListener }) => {
        try {
          const token = await requestFCMToken();
          if (token) {
            await notificationAPI.saveFCMToken(token);
          }
          
          // Listen for foreground messages
          const listenForMessage = async () => {
            const payload = await onMessageListener();
            import('react-hot-toast').then(({ toast }) => {
              toast.success(payload?.notification?.title || 'New Notification Received!');
            });
            fetchNotifications(); // Refresh notifications list
            listenForMessage(); // Setup listener again
          };
          listenForMessage();
        } catch (err) {
          console.error('FCM Setup failed:', err);
        }
      });

      // Poll every 30 seconds for fallback
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  if (!user || (user.role !== 'seller' && user.role !== 'super_admin')) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-fk-yellow transition-colors"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden transform origin-top-right animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-black text-dark-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-fk-blue hover:underline flex items-center gap-1"
              >
                <FiCheckCircle /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-dark-400">
                <FiBell className="mx-auto mb-3 opacity-20" size={40} />
                <p className="text-sm font-semibold">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 transition-colors ${!notif.is_read ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-[#fb641b]' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-dark-900">{notif.title}</h4>
                          <span className="text-[10px] text-dark-400 font-medium whitespace-nowrap ml-2">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-dark-600 leading-relaxed">{notif.message}</p>
                        
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => handleMarkRead(e, notif.id)}
                            className="text-[10px] font-bold text-fk-blue mt-2 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
