'use client';

import { useState, useEffect } from 'react';
import { Home, ShoppingCart, User, Search, Menu, X, Bell, MapPin } from 'lucide-react';

const MobileLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = tab === 'home' ? '/' : `/${tab}`;
    window.history.pushState({}, '', url);
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Search },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QM</span>
            </div>
            <span className="font-bold text-gray-900">QuickMart</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Location */}
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <MapPin className="w-5 h-5" />
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Online Status Bar */}
        <div className={`px-4 py-1 text-xs ${
          isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {isOnline ? '🟢 Connected' : '🔴 Offline - Limited functionality'}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowSidebar(false)}
        >
          <div 
            className="bg-white w-80 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <Search className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Search Products</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Change Location</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Notifications</span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
                <div className="space-y-2">
                  {['Fruits & Vegetables', 'Dairy & Breakfast', 'Snacks & Beverages', 'Instant Food', 'Pharmacy'].map((category) => (
                    <button
                      key={category}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <span className="text-gray-600">🛒</span>
                      <span className="text-gray-900">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">My Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Order History</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.id === 'cart' && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
