'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, CreditCard, User, Plus, Edit2, Trash2, Check } from 'lucide-react';

const QuickCheckout = ({ 
  selectedStore, 
  selectedSlot, 
  deliveryAddress, 
  cartItems, 
  onCheckoutComplete 
}) => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    type: 'home'
  });

  useEffect(() => {
    fetchSavedAddresses();
    fetchPaymentMethods();
  }, [fetchSavedAddresses, fetchPaymentMethods]);

  const fetchSavedAddresses = useCallback(async () => {
    try {
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.data || []);
        
        // Auto-select first address if none selected
        if (data.data?.length > 0 && !selectedAddressId) {
          setSelectedAddressId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  }, [selectedAddressId]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data || []);
        
        // Auto-select first payment method if none selected
        if (data.data?.length > 0 && !selectedPaymentId) {
          setSelectedPaymentId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  }, [selectedPaymentId]);

  const handleAddAddress = async () => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAddress)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses([...savedAddresses, data.data]);
        setSelectedAddressId(data.data.id);
        setShowAddAddress(false);
        setNewAddress({ name: '', phone: '', address: '', landmark: '', type: 'home' });
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSavedAddresses(savedAddresses.filter(addr => addr.id !== addressId));
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId || !selectedPaymentId) {
      alert('Please select delivery address and payment method');
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        store_id: selectedStore.id,
        delivery_slot_id: selectedSlot.id,
        address_id: selectedAddressId,
        payment_method_id: selectedPaymentId,
        items: cartItems,
        express_delivery: selectedSlot.id.includes('min')
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const data = await response.json();
        onCheckoutComplete(data.data);
      } else {
        throw new Error('Checkout failed');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = selectedSlot?.fee || 0;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total };
  };

  const { subtotal, deliveryFee, total } = calculateTotals();

  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
  const selectedPayment = paymentMethods.find(method => method.id === selectedPaymentId);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Quick Checkout</h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Delivery Address */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Delivery Address</h4>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add New
            </button>
          </div>

          {showAddAddress && (
            <div className="bg-gray-50 rounded-lg p-4 mb-3 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newAddress.name}
                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Full Address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <input
                type="text"
                placeholder="Landmark (optional)"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddAddress(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddressId === address.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAddressId === address.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{address.name}</span>
                        <span className="text-sm text-gray-600">{address.phone}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {address.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      {address.landmark && (
                        <p className="text-xs text-gray-500 mt-1">📍 {address.landmark}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Time */}
        {selectedSlot && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Delivery Time</h4>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{selectedSlot.label}</p>
                  <p className="text-sm text-blue-700">{selectedSlot.promise}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-900">
                    {selectedSlot.fee === 0 ? 'FREE' : `₹${selectedSlot.fee}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Payment Method</h4>
          </div>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedPaymentId === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentId(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentId === method.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentId === method.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {method.type}
                      </p>
                      {method.last4 && (
                        <p className="text-sm text-gray-600">•••• {method.last4}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium text-green-600">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || !selectedAddressId || !selectedPaymentId}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Place Order • ₹${total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickCheckout;
