'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Download, Check, X } from 'lucide-react';

const OfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from IndexedDB
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingActions, syncPendingActions]);

  const loadPendingActions = useCallback(async () => {
    try {
      // Load from IndexedDB
      const actions = await getPendingActionsFromDB();
      setPendingActions(actions);
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  }, []);

  const getPendingActionsFromDB = async () => {
    // IndexedDB implementation
    return new Promise((resolve) => {
      const request = indexedDB.open('QuickMartOffline', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pendingActions'], 'readonly');
        const store = transaction.objectStore('pendingActions');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
      };
      
      request.onerror = () => {
        resolve([]);
      };
    });
  };

  const savePendingActionToDB = async (action) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QuickMartOffline', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');
        const addRequest = store.add(action);
        
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  };

  const syncPendingActions = useCallback(async () => {
    if (pendingActions.length === 0) return;
    
    setSyncing(true);
    
    try {
      const syncedActions = [];
      const failedActions = [];
      
      for (const action of pendingActions) {
        try {
          await syncAction(action);
          syncedActions.push(action);
        } catch (error) {
          failedActions.push(action);
        }
      }
      
      // Update pending actions
      const newPendingActions = pendingActions.filter(
        action => !syncedActions.includes(action)
      );
      
      setPendingActions(newPendingActions);
      
      // Show success notification
      if (syncedActions.length > 0) {
        showNotification(`Synced ${syncedActions.length} actions successfully`);
      }
      
      if (failedActions.length > 0) {
        showNotification(`Failed to sync ${failedActions.length} actions`);
      }
    } catch (error) {
      console.error('Error syncing actions:', error);
      showNotification('Error syncing actions');
    } finally {
      setSyncing(false);
    }
  }, [pendingActions]);

  const syncAction = async (action) => {
    const { type, data, url } = action;
    
    switch (type) {
      case 'ADD_TO_CART':
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        break;
        
      case 'PLACE_ORDER':
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        break;
        
      case 'UPDATE_PROFILE':
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        });
        break;
        
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  };

  const showNotification = (message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('QuickMart', {
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    }
  };

  const handleOfflineAction = async (type, data) => {
    const action = {
      id: Date.now(),
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Save to IndexedDB
    await savePendingActionToDB(action);
    
    // Update local state
    setPendingActions(prev => [...prev, action]);
    
    // Show notification
    showNotification('Action saved. Will sync when online.');
  };

  const clearPendingActions = async () => {
    try {
      const request = indexedDB.open('QuickMartOffline', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          setPendingActions([]);
          showNotification('Pending actions cleared');
        };
      };
    } catch (error) {
      console.error('Error clearing pending actions:', error);
    }
  };

  return (
    <>
      {/* Online/Offline Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isOnline ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className={`px-4 py-2 text-center text-xs font-medium ${
          isOnline ? 'text-green-700' : 'text-red-700'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Connected - All features available</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Offline - Limited functionality</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Offline Alert */}
      {showOfflineAlert && !isOnline && (
        <div className="fixed top-12 left-4 right-4 z-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">You're offline</h4>
                <p className="text-sm text-red-700 mt-1">
                  Some features may not be available. Your actions will be saved and synced when you're back online.
                </p>
              </div>
              <button
                onClick={() => setShowOfflineAlert(false)}
                className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Actions Sync */}
      {pendingActions.length > 0 && isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RefreshCw className={`w-5 h-5 text-blue-600 mt-0.5 ${syncing ? 'animate-spin' : ''}`} />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Pending actions</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {pendingActions.length} actions will be synced automatically
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={syncPendingActions}
                    disabled={syncing}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={clearPendingActions}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Features */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Available Offline</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Browse cached products</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Add items to cart</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">View order history</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Edit profile</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <Download className="w-3 h-3 inline mr-1" />
                Actions will be saved and synced when you're back online
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineSupport;
