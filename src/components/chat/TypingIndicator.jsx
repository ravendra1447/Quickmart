'use client';

import { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

const TypingIndicator = ({ conversationId, currentUserId }) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    const token = localStorage.getItem('token');
    if (token) {
      newSocket.emit('authenticate', token);
    }

    newSocket.on('authenticated', (data) => {
      setSocket(newSocket);
      
      // Join conversation room
      if (conversationId) {
        newSocket.emit('join_conversation', conversationId);
      }
    });

    newSocket.on('typing_indicator', (data) => {
      if (data.conversation_id === conversationId) {
        setTypingUsers(data.typing_users || []);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  const getTypingText = () => {
    const otherTypingUsers = typingUsers.filter(id => id !== currentUserId);
    
    if (otherTypingUsers.length === 0) return null;
    if (otherTypingUsers.length === 1) return 'Someone is typing...';
    if (otherTypingUsers.length === 2) return 'Two people are typing...';
    return `${otherTypingUsers.length} people are typing...`;
  };

  const typingText = getTypingText();

  if (!typingText) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-gray-500 text-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{typingText}</span>
    </div>
  );
};

export default TypingIndicator;
