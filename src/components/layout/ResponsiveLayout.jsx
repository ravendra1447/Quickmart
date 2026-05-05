'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MobileLayout from './MobileLayout';
import { Menu, X, Bell, User, ShoppingCart, Search } from 'lucide-react';

const ResponsiveLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile view - use mobile layout
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Desktop view - use responsive layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">QM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QuickMart</h1>
                <p className="text-sm text-gray-600">Quick Commerce Delivery</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Location */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Deliver to: Home</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600">🛒</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Order delivered!</p>
                          <p className="text-xs text-gray-600">Your order has been delivered successfully</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">🎉</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Special offer!</p>
                          <p className="text-xs text-gray-600">20% off on all dairy products</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">U</span>
                  </div>
                  <span className="text-sm font-medium">John Doe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-4">
            <a
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </a>
            <a
              href="/products"
              className={`text-sm font-medium transition-colors ${
                pathname === '/products' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Products
            </a>
            <a
              href="/hyperlocal"
              className={`text-sm font-medium transition-colors ${
                pathname === '/hyperlocal' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hyperlocal
            </a>
            <a
              href="/cart"
              className={`text-sm font-medium transition-colors ${
                pathname === '/cart' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cart
            </a>
            <a
              href="/orders"
              className={`text-sm font-medium transition-colors ${
                pathname === '/orders' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </a>
            <a
              href="/chat"
              className={`text-sm font-medium transition-colors ${
                pathname === '/chat' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Support
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About QuickMart</h3>
              <p className="text-sm text-gray-600">
                Your trusted quick commerce partner for groceries and essentials delivered in minutes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900">About Us</a></li>
                <li><a href="/contact" className="hover:text-gray-900">Contact</a></li>
                <li><a href="/careers" className="hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/help" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="/returns" className="hover:text-gray-900">Returns</a></li>
                <li><a href="/faq" className="hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Facebook</a></li>
                <li><a href="#" className="hover:text-gray-900">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-900">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>&copy; 2024 QuickMart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveLayout;
