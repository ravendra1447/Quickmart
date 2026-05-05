'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronUp } from 'lucide-react';

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  snapPoints = [0.5, 0.8, 1], 
  defaultSnap = 0.8 
}) => {
  const [snapPoint, setSnapPoint] = useState(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  const sheetRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSnapPoint(defaultSnap);
    }
  }, [isOpen, defaultSnap]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setSnapPoint(0); // Go to full height when dragging
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY;
    const viewportHeight = window.innerHeight;
    const newSnapPoint = Math.max(0, Math.min(1, deltaY / viewportHeight));
    
    setCurrentY(newSnapPoint);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap to nearest point
    const nearestSnap = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
    );
    
    setSnapPoint(nearestSnap);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.touches[0].clientY;
    const viewportHeight = window.innerHeight;
    const newSnapPoint = Math.max(0, Math.min(1, deltaY / viewportHeight));
    
    setCurrentY(newSnapPoint);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap to nearest point
    const nearestSnap = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev
    );
    
    setSnapPoint(nearestSnap);
  };

  const handleClose = () => {
    setSnapPoint(0);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getSheetHeight = () => {
    if (isDragging) {
      return `${currentY * 100}%`;
    }
    return `${snapPoint * 100}%`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform"
        style={{
          height: getSheetHeight(),
          transform: isDragging ? `translateY(${(1 - currentY) * 100}%)` : `translateY(${(1 - snapPoint) * 100}%)`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center py-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" ref={contentRef}>
          {children}
        </div>

        {/* Snap Indicator */}
        <div className="absolute top-2 right-4">
          <button
            onClick={() => setSnapPoint(snapPoint === 1 ? 0.8 : 1)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ChevronUp 
              className={`w-4 h-4 transition-transform ${
                snapPoint === 1 ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
