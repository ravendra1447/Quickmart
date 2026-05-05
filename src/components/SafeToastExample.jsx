'use client';

import { useState } from 'react';
import safeToast from '@/utils/safeToast';

export default function SafeToastExample() {
  const [count, setCount] = useState(0);

  const handleSuccess = () => {
    safeToast.success('Operation completed successfully!');
    setCount(count + 1);
  };

  const handleError = () => {
    safeToast.error('Something went wrong!');
    setCount(count + 1);
  };

  const handleInfo = () => {
    safeToast.info('Here is some information');
    setCount(count + 1);
  };

  const handleWarning = () => {
    safeToast.warning('Please be careful!');
    setCount(count + 1);
  };

  const handleLoading = () => {
    safeToast.loading('Processing...');
    setCount(count + 1);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Safe Toast Example</h2>
      <p className="text-gray-600 mb-6">This demonstrates how to use safeToast without destroy errors</p>
      
      <div className="space-y-3">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Success Toast
        </button>
        
        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Toast
        </button>
        
        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Info Toast
        </button>
        
        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Warning Toast
        </button>
        
        <button
          onClick={handleLoading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Loading Toast
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Toast count: <span className="font-bold">{count}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Check console for emoji logs and look for notifications in the top-right corner.
        </p>
      </div>
    </div>
  );
}
