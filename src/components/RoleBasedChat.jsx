'use client';

import { useState, useEffect } from 'react';
import { FiMessageCircle, FiUsers, FiClock, FiSearch, FiPhone, FiMapPin } from 'react-icons/fi';

const RoleBasedChat = ({ userRole = 'seller' }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const mockConversations = [
      {
        id: 1,
        participant: { name: 'Raj Kumar', phone: '+91 98765 43210' },
        lastMessage: 'When will my order be delivered?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2,
        status: 'active'
      }
    ];
    setConversations(mockConversations);
  }, []);

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {userRole === 'seller' ? 'Customer Chats' : 'Seller Chats'}
          </h2>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUsers size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{conversation.participant.name}</p>
                  <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FiUsers size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedConversation.participant.name}</p>
                  <p className="text-sm text-gray-500">{selectedConversation.participant.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-gray-900">Hello! I have a question about my order</p>
                    <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hi! I would be happy to help you with your order.</p>
                    <p className="text-xs text-blue-100 mt-1">10:32 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedChat;
