import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

/**
 * NetworkStatus component - Shows network connectivity status
 */
const NetworkStatus = ({ showWhenOnline = false, className = '' }) => {
  const { isOnline, networkChanged, connectionType } = useNetworkStatus();

  // Only show when offline or when network changed (or when explicitly requested to show when online)
  const shouldShow = !isOnline || networkChanged || showWhenOnline;

  if (!shouldShow) return null;

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: ExclamationTriangleIcon,
        message: 'No internet connection',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        iconColor: 'text-white'
      };
    }
    
    if (networkChanged) {
      return {
        icon: WifiIcon,
        message: 'Network connection changed',
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        iconColor: 'text-white'
      };
    }
    
    return {
      icon: CheckCircleIcon,
      message: `Connected (${connectionType})`,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-white'
    };
  };

  const { icon: Icon, message, bgColor, textColor, iconColor } = getStatusConfig();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      >
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className={`text-sm font-medium ${textColor}`}>
            {message}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkStatus;
