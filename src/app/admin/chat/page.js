'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Users, TrendingUp, Clock, AlertCircle, Search, Filter, Download } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';

export default function AdminChatDashboard() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    loadConversations();
    loadAnalytics();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/admin/all-conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/chat/admin/chat-analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleAssignConversation = async (conversationId, assignedTo) => {
    try {
      const response = await fetch(`/api/chat/admin/assign-conversation/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assigned_to: assignedTo })
      });
      
      if (response.ok) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  };

  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(conv => conv.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(conv => conv.type === filterType);
    }

    return filtered;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'customer_seller': return 'bg-blue-100 text-blue-800';
      case 'customer_admin': return 'bg-purple-100 text-purple-800';
      case 'seller_admin': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Admin Chat Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all conversations</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">
                    {analytics.total_conversations}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Total Conversations</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">
                    {analytics.total_messages}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">Total Messages</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="customer_seller">Customer-Seller</option>
              <option value="customer_admin">Customer-Admin</option>
              <option value="seller_admin">Seller-Admin</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {getFilteredConversations().map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {conversation.title || 'Untitled Conversation'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(conversation.type)}`}>
                        {conversation.type.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      {conversation.customer && (
                        <span>Customer: {conversation.customer.name}</span>
                      )}
                      {conversation.seller && (
                        <span>Seller: {conversation.seller.name}</span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {conversation.lastMessageAt ? 
                        new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                        'No messages'
                      }
                    </div>
                    
                    {conversation.assigned_to && (
                      <div className="text-xs text-blue-600 mt-1">
                        Assigned
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle assign action
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Assign
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle priority action
                    }}
                    className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Priority
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation.id}
            user={user}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-md">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Chat Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Select a conversation to view and manage customer, seller, and support chats
              </p>
              
              {/* Quick Stats */}
              {analytics && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {analytics.total_conversations}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Active Conversations</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {analytics.total_messages}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Total Messages</p>
                  </div>
                </div>
              )}
              
              {/* Conversation Types Breakdown */}
              {analytics?.conversations_by_type && (
                <div className="mt-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">Conversation Types</h4>
                  <div className="space-y-2">
                    {analytics.conversations_by_type.map((type) => (
                      <div key={type.type} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm capitalize">{type.type.replace('_', ' ')}</span>
                        <span className="text-sm font-semibold">{type.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
