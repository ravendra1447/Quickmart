'use client';
import { useState, useEffect } from 'react';
import { FiMessageCircle, FiUsers, FiClock, FiAlertCircle, FiSearch, FiFilter, FiShoppingBag, FiPhone, FiMapPin } from 'react-icons/fi';
import RoleBasedChat from '@/components/RoleBasedChat';

export default function SellerChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalChats: 0,
    activeChats: 0,
    responseTime: '2 mins',
    customerSatisfaction: '4.8'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate loading seller conversations
    setTimeout(() => {
      setConversations([
        {
          id: 1,
          orderId: 'ORD-001',
          customerName: 'Rahul Sharma',
          customerPhone: '+91 98765 43210',
          lastMessage: 'When will my order arrive?',
          lastMessageTime: '2 mins ago',
          status: 'active',
          priority: 'high',
          customerLocation: 'Delhi, India'
        },
        {
          id: 2,
          orderId: 'ORD-002',
          customerName: 'Priya Patel',
          customerPhone: '+91 98765 43211',
          lastMessage: 'Thank you for quick delivery!',
          lastMessageTime: '15 mins ago',
          status: 'resolved',
          priority: 'normal',
          customerLocation: 'Mumbai, India'
        },
        {
          id: 3,
          orderId: 'ORD-003',
          customerName: 'Amit Kumar',
          customerPhone: '+91 98765 43212',
          lastMessage: 'Is this product available?',
          lastMessageTime: '1 hour ago',
          status: 'pending',
          priority: 'normal',
          customerLocation: 'Bangalore, India'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiShoppingBag className="text-orange-500 mr-3" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">Customer Support</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{analytics.activeChats}</span> active chats
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiMessageCircle className="text-orange-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-xl font-semibold">{analytics.totalChats}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiUsers className="text-green-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-xl font-semibold">{analytics.activeChats}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiClock className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-xl font-semibold">{analytics.responseTime}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiAlertCircle className="text-purple-500 mr-3" size={20} />
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-xl font-semibold">{analytics.customerSatisfaction}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
          </div>
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{conversation.customerName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{conversation.orderId}</span>
                      <div className="flex items-center gap-1">
                        <FiMapPin size={12} />
                        <span>{conversation.customerLocation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiPhone size={12} />
                        <span>{conversation.customerPhone}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900">{conversation.lastMessage}</p>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {conversation.lastMessageTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Conversation Chat */}
        {selectedConversation && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.customerName} - {selectedConversation.orderId}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <RoleBasedChat
                  orderId={selectedConversation.orderId}
                  sellerId="seller-123"
                  customerId={selectedConversation.customerName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
