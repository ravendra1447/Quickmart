'use client';

import { useState, useEffect } from 'react';
import { FiPackage, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiPhone, FiUser } from 'react-icons/fi';
import { deliveryAPI } from '@/lib/api';

export default function DeliveryDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await deliveryAPI.getAssignments();
      setAssignments(response.data || []);
      if (response.data?.length > 0) {
        setActiveAssignment(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const markPickedUp = async (id) => {
    try {
      await deliveryAPI.markPickedUp(id);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to mark as picked up:', error);
    }
  };

  const markReachedHub = async (id) => {
    try {
      await deliveryAPI.markReachedHub(id);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to mark as reached hub:', error);
    }
  };

  const submitOtpDelivery = async () => {
    try {
      await deliveryAPI.verifyOtp(activeAssignment.id, otp);
      setShowOtpModal(false);
      setOtp('');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiPackage className="text-white" size={32} />
          </div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Dashboard</h1>
          <p className="text-gray-600">Manage your delivery assignments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Assignments</h2>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FiPackage className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-500">No assignments available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        activeAssignment?.id === assignment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveAssignment(assignment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assignment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : assignment.status === 'picked_up'
                                ? 'bg-blue-100 text-blue-800'
                                : assignment.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              Order #{assignment.order?.id}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMapPin size={14} />
                              <span>{assignment.order?.delivery_address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiUser size={14} />
                              <span>{assignment.order?.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiPhone size={14} />
                              <span>{assignment.order?.customer_phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{assignment.order?.total}
                          </p>
                          <p className="text-xs text-gray-500">
                            {assignment.order?.payment_method?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {activeAssignment && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Order ID</p>
                    <p className="text-lg font-bold text-gray-900">#{activeAssignment.order?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Customer</p>
                    <p className="text-gray-900">{activeAssignment.order?.customer_name}</p>
                    <p className="text-sm text-gray-600">{activeAssignment.order?.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                    <p className="text-gray-900">{activeAssignment.order?.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment</p>
                    <p className="text-gray-900">{activeAssignment.order?.payment_method?.toUpperCase()}</p>
                    <p className="text-lg font-bold text-gray-900">₹{activeAssignment.order?.total}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {activeAssignment.status === 'pending' && (
                    <button
                      onClick={() => markPickedUp(activeAssignment.id)}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  {activeAssignment.status === 'picked_up' && (
                    <button
                      onClick={() => markReachedHub(activeAssignment.id)}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Mark as Reached Hub
                    </button>
                  )}
                  {activeAssignment.status === 'reached_hub' && (
                    <button
                      onClick={() => setShowOtpModal(true)}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Verify Delivery
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verify Delivery</h3>
            <p className="text-gray-600 mb-4">Enter the 4-digit OTP provided by the customer</p>
            
            <input 
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,4))}
              className="w-full text-center text-2xl font-black tracking-[0.3em] py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none mb-3"
            />
            
            <button 
              onClick={submitOtpDelivery}
              disabled={otp.length !== 4}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm rounded-lg transition-all"
            >
              Verify Delivery
            </button>
            
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtp('');
              }}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
