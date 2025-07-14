import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface StyledAlertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number; // Auto-close duration in ms
}

export default function StyledAlert({ 
  isOpen, 
  onClose, 
  message, 
  type = 'success',
  duration = 5000 
}: StyledAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto-close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match transition duration
  };

  if (!isOpen && !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'error':
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center items-start z-50 p-4 pointer-events-none">
      <div 
        className={`${getBgColor()} rounded-lg shadow-2xl p-4 md:p-5 flex items-center max-w-md w-full pointer-events-auto transform transition-all duration-300 ${
          isVisible && !isLeaving 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-8 opacity-0'
        }`}
      >
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 mr-2">
          <p className="text-white font-medium">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}