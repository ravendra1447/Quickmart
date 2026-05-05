'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, Clock, Package, Zap, ChevronRight } from 'lucide-react';

const MobileCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Fresh Milk 1L',
      price: 56,
      quantity: 2,
      image: '🥛',
      seller: 'Dairy Farm'
    },
    {
      id: 2,
      name: 'Banana 1kg',
      price: 40,
      quantity: 1,
      image: '🍎',
      seller: 'Fresh Fruits'
    },
    {
      id: 3,
      name: 'Bread 400g',
      price: 25,
      quantity: 3,
      image: '🍞',
      seller: 'Bakery'
    }
  ]);

  const [selectedSlot, setSelectedSlot] = useState('20min');
  const [showCheckout, setShowCheckout] = useState(false);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const deliverySlots = [
    { id: '10min', label: '10-min Delivery', fee: 0, promise: 'Lightning Fast', icon: '⚡' },
    { id: '20min', label: '20-min Delivery', fee: 10, promise: 'Super Fast', icon: '🚀' },
    { id: '30min', label: '30-min Delivery', fee: 20, promise: 'Quick', icon: '🛵' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Cart</h1>
              <p className="text-sm text-gray-600">{getTotalItems()} items</p>
            </div>
          </div>
          <button className="text-blue-600 text-sm font-medium">Clear All</button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600">Add some items to get started!</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {item.image}
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.seller}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{item.price}</p>
                      <p className="text-sm text-gray-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delivery Options */}
      {cartItems.length > 0 && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Options</h3>
            
            <div className="space-y-3">
              {deliverySlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    selectedSlot === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        slot.id === '10min' ? 'bg-green-100' :
                        slot.id === '20min' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <span className="text-lg">{slot.icon}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{slot.label}</p>
                        <p className="text-sm text-gray-600">{slot.promise}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {slot.fee === 0 ? 'FREE' : `₹${slot.fee}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Summary */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Total ({getTotalItems()} items)</p>
                <p className="text-2xl font-bold text-gray-900">₹{getTotalPrice()}</p>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
              >
                Checkout
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Delivery Info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>{selectedSlot} delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>10-min delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery ({selectedSlot})</span>
                    <span>
                      {deliverySlots.find(s => s.id === selectedSlot)?.fee === 0 ? 'FREE' : `₹${deliverySlots.find(s => s.id === selectedSlot)?.fee}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{getTotalPrice() + (deliverySlots.find(s => s.id === selectedSlot)?.fee || 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">Home</p>
                  <p className="text-xs text-gray-600">123 Main Street, Apartment 4B, Mumbai 400001</p>
                </div>
              </div>
              
              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                <div className="space-y-2">
                  <button className="w-full p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-600 rounded"></div>
                      <div className="text-left">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-gray-600">Pay when you receive</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      <div className="text-left">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-gray-600">Visa, Mastercard, etc.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={() => {
                  // Handle checkout logic here
                  alert('Order placed successfully!');
                  setShowCheckout(false);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Place Order • ₹{getTotalPrice() + (deliverySlots.find(s => s.id === selectedSlot)?.fee || 0)}
              </button>
              
              {/* Cancel Button */}
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCart;
