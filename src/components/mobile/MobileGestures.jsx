'use client';

import { useState, useEffect, useRef } from 'react';

const MobileGestures = ({ children, onSwipeLeft, onSwipeRight, onPullToRefresh }) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0, time: 0 });
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setPullDistance(0);
    setIsPulling(false);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const currentY = touch.clientY;
    
    // Pull to refresh logic
    if (containerRef.current && touchStart.y < 100) { // Only allow pull from top
      const distance = currentY - touchStart.y;
      if (distance > 0) {
        setPullDistance(distance);
        setIsPulling(true);
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });

    // Calculate swipe gestures
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;

    // Pull to refresh
    if (isPulling && pullDistance > 100) {
      onPullToRefresh && onPullToRefresh();
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    // Swipe gestures (minimum distance and time)
    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 bg-blue-50 flex items-center justify-center z-50"
          style={{ height: `${Math.min(pullDistance, 120)}px` }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-blue-600 font-medium">
              {pullDistance > 100 ? 'Release to refresh' : 'Pull to refresh'}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`transition-transform ${isPulling ? 'translate-y-0' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileGestures;
