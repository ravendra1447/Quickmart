'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Clock, Package } from 'lucide-react';

const AppInstallation = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    
    try {
      const result = await deferredPrompt.prompt();
      console.log(`Install prompt result: ${result}`);
      
      if (result === 'accepted') {
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for 7 days
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
  };

  // Check if prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QM</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Install QuickMart</h3>
              <p className="text-xs text-gray-600">Get the app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">10-min Delivery</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Easy Shopping</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Track Orders</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Why install?</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              <span>Works offline - shop even without internet</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              <span>Faster loading and smoother experience</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              <span>Push notifications for order updates</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              <span>Home screen access like a native app</span>
            </li>
          </ul>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {installing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Installing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Install App</span>
            </div>
          )}
        </button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">100% Free</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">No Ads</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInstallation;
