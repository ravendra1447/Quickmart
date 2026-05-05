'use client';

import { useState, useEffect } from 'react';
import { User, ShoppingBag, Package, Clock, Star, Settings, LogOut, MapPin, Bell, CreditCard, Heart, HelpCircle, ChevronRight } from 'lucide-react';
import BottomSheet from '@/components/mobile/BottomSheet';

const MobileProfile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    avatar: '👤',
    memberSince: 'January 2024',
    totalOrders: 47,
    totalSpent: 12580
  });

  const [showOrders, setShowOrders] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const menuItems = [
    {
      icon: ShoppingBag,
      label: 'Order History',
      badge: user.totalOrders,
      onClick: () => setShowOrders(true)
    },
    {
      icon: Package,
      label: 'Delivery Addresses',
      onClick: () => console.log('Navigate to addresses')
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      onClick: () => console.log('Navigate to payment')
    },
    {
      icon: Bell,
      label: 'Notifications',
      badge: 3,
      onClick: () => setNotifications(!notifications)
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => setShowSettings(true)
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => setShowHelp(true)
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: () => console.log('Logout')
    }
  ];

  const orderHistory = [
    {
      id: 1,
      orderNumber: 'QM2024001',
      date: '2024-04-01',
      items: 5,
      total: 234,
      status: 'delivered',
      seller: 'Fresh Fruits'
    },
    {
      id: 2,
      orderNumber: 'QM2024002',
      date: '2024-03-28',
      items: 3,
      total: 156,
      status: 'delivered',
      seller: 'Dairy Farm'
    },
    {
      id: 3,
      orderNumber: 'QM2024003',
      date: '2024-03-25',
      items: 8,
      total: 412,
      status: 'out_for_delivery',
      seller: 'Bakery'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'out_for_delivery': return '🚚';
      case 'confirmed': return '⏳';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white m-4 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
            <p className="text-sm text-gray-500">Member since {user.memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-900">{user.totalOrders}</p>
            <p className="text-sm text-blue-700">Total Orders</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-900">₹{user.totalSpent}</p>
            <p className="text-sm text-green-700">Total Spent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Delivery Addresses</p>
                <p className="text-sm text-gray-600">Manage your addresses</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Payment Methods</p>
                <p className="text-sm text-gray-600">Add or remove cards</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-600">
                  {notifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full ${notifications ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-600">Get help with your orders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{item.label}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => console.log('Logout')}
          className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Order History Bottom Sheet */}
      <BottomSheet
        isOpen={showOrders}
        onClose={() => setShowOrders(false)}
        title="Order History"
        snapPoints={[0.5, 0.8, 1]}
        defaultSnap={0.8}
      >
        <div className="space-y-3">
          {orderHistory.map((order) => (
            <div key={order.id} className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{order.items} items</span>
                <span>₹{order.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Seller: {order.seller}</span>
                <button className="text-blue-600 text-sm font-medium">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        snapPoints={[0.5, 0.8, 1]}
        defaultSnap={0.8}
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Account Settings</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Edit Profile</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Change Password</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Privacy Settings</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">App Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Dark Mode</span>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-6 h-6 bg-blue-600 rounded-full transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Push Notifications</span>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-6 h-6 bg-gray-200 rounded-full transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Language</span>
                <span className="text-gray-600">English</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Support</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-blue-900">Call Support</p>
                  <p className="text-sm text-blue-700">1800-123-4567</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-green-900">Chat Support</p>
                  <p className="text-sm text-green-700">Chat with our team</p>
                </div>
                <ChevronRight className="w-5 h-5 text-green-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-purple-900">Email Support</p>
                  <p className="text-sm text-purple-700">support@quickmart.com</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Help Bottom Sheet */}
      <BottomSheet
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Help & Support"
        snapPoints={[0.5, 0.8, 1]}
        defaultSnap={0.8}
      >
        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Common Issues</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-gray-900">How to place an order?</p>
                  <p className="text-sm text-gray-600">Step-by-step guide</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Payment issues</p>
                  <p className="text-sm text-gray-600">Troubleshooting guide</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Delivery problems</p>
                  <p className="text-sm text-gray-600">Track your order</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-gray-900">Returns & Refunds</p>
                  <p className="text-sm text-gray-600">Return policy</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Contact Support</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-blue-900">Call Support</p>
                  <p className="text-sm text-blue-700">1800-123-4567</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-green-900">Chat Support</p>
                  <p className="text-sm text-green-700">Chat with our team</p>
                </div>
                <ChevronRight className="w-5 h-5 text-green-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="text-left">
                  <p className="font-medium text-purple-900">Email Support</p>
                  <p className="text-sm text-purple-700">support@quickmart.com</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default MobileProfile;
