'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin } from 'react-icons/fi';
import { deliveryAuthAPI } from '@/lib/api';

export default function DeliveryBoyLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('delivery_token');
    const user = localStorage.getItem('delivery_user');
    
    if (token && user) {
      // Redirect to dashboard instead of logout
      router.push('/delivery/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await deliveryAuthAPI.login(formData);

      if (response.success) {
        // Store in localStorage (persistent across browser refresh)
        localStorage.setItem('delivery_token', response.data.token);
        localStorage.setItem('delivery_user', JSON.stringify(response.data.user));
        
        // Store in session storage as backup
        sessionStorage.setItem('delivery_token', response.data.token);
        sessionStorage.setItem('delivery_user', JSON.stringify(response.data.user));
        
        // Set cookie for server-side auth
        document.cookie = `delivery_token=${response.data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        
        // Redirect to dashboard
        router.push('/delivery/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      {/* Mobile Header */}
      {isMobile && (
        <div className="absolute top-0 left-0 right-0 bg-white shadow-sm p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QM</span>
            </div>
            <span className="ml-2 font-bold text-gray-900">QuickMart Delivery</span>
          </div>
        </div>
      )}

      {/* Login Container */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md ${isMobile ? 'mt-16' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-t-2xl text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPhone className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Delivery Boy Login</h1>
          <p className="text-orange-100 text-sm">Enter your credentials to access dashboard</p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FiEye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                defaultChecked
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Need help?</p>
              <div className="flex justify-center space-x-4">
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Forgot Password?
                </button>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <FiMapPin className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Your login session will persist even if you refresh the browser. You'll only be logged out when you click the logout button.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
