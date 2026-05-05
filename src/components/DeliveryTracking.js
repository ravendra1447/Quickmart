'use client';
import { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiTruck, FiPhone, FiMessageCircle } from 'react-icons/fi';

export default function DeliveryTracking({ orderId }) {
  const [trackingData, setTrackingData] = useState({
    status: 'preparing',
    estimatedTime: '25 mins',
    partnerName: 'Raj Kumar',
    partnerPhone: '+91 98765 43210',
    partnerLocation: { lat: 28.6139, lng: 77.2090 },
    currentLocation: { lat: 28.6139, lng: 77.2090 },
    orderLocation: { lat: 28.6139, lng: 77.2090 }
  });

  const [messages, setMessages] = useState([
    { id: 1, sender: 'partner', text: 'Your order is being prepared', time: '2:30 PM' },
    { id: 2, sender: 'partner', text: 'I\'m on my way to the store', time: '2:35 PM' }
  ]);

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Simulate real-time tracking
    const interval = setInterval(() => {
      setTrackingData(prev => ({
        ...prev,
        estimatedTime: Math.max(5, parseInt(prev.estimatedTime) - 1) + ' mins',
        partnerLocation: {
          lat: prev.partnerLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.partnerLocation.lng + (Math.random() - 0.5) * 0.001
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'customer',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const statusSteps = [
    { key: 'preparing', label: 'Order Confirmed', icon: '📝', completed: true },
    { key: 'picking', label: 'Picking Items', icon: '🛒', completed: trackingData.status === 'picking' || trackingData.status === 'delivering' },
    { key: 'delivering', label: 'On the way', icon: '🚚', completed: trackingData.status === 'delivering' },
    { key: 'delivered', label: 'Delivered', icon: '✅', completed: false }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
      {/* Delivery Timer */}
      <div className="bg-orange-500 text-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Estimated Delivery</h3>
            <p className="text-2xl font-bold">{trackingData.estimatedTime}</p>
          </div>
          <div className="text-4xl">⏱️</div>
        </div>
      </div>

      {/* Delivery Partner Info */}
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <FiTruck className="text-orange-500" size={20} />
            </div>
            <div>
              <h4 className="font-semibold">{trackingData.partnerName}</h4>
              <p className="text-sm text-gray-600">Delivery Partner</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-green-500 text-white rounded-full">
              <FiPhone size={16} />
            </button>
            <button className="p-2 bg-blue-500 text-white rounded-full">
              <FiMessageCircle size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Tracking */}
      <div className="mb-4">
        <h3 className="font-semibold mb-3">Order Status</h3>
        <div className="space-y-2">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Map Placeholder */}
      <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FiMapPin size={32} className="mx-auto mb-2" />
          <p>Live tracking map</p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="border rounded-lg">
        <div className="p-3 border-b bg-gray-50">
          <h3 className="font-semibold">Chat with Delivery Partner</h3>
        </div>
        <div className="h-40 overflow-y-auto p-3 space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.sender === 'customer' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
