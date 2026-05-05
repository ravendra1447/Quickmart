'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Headphones, Users, Settings } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import io from 'socket.io-client';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  useEffect(() => {
    // Get user from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/conversations', {
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

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCreateConversation = () => {
    setShowNewConversationModal(true);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const createNewConversation = async (type, participants) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          participants,
          options: {}
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newConversation = data.data;
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setShowNewConversationModal(false);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
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
      {/* Mobile: Show full screen when conversation selected */}
      <div className="hidden lg:flex lg:flex-col w-full lg:w-80">
        <ChatSidebar
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
          user={user}
          onCreateConversation={handleCreateConversation}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation.id}
            user={user}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Show sidebar when no conversation selected */}
      {!selectedConversation && (
        <div className="lg:hidden flex flex-col w-full">
          <ChatSidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?.id}
            user={user}
            onCreateConversation={handleCreateConversation}
          />
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => createNewConversation('customer_admin', [])}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Customer Support</p>
                    <p className="text-sm text-gray-600">Chat with our support team</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createNewConversation('customer_seller', [])}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Seller Support</p>
                    <p className="text-sm text-gray-600">Chat with sellers</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createNewConversation('support', [])}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">General Support</p>
                    <p className="text-sm text-gray-600">Get help with any issues</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
