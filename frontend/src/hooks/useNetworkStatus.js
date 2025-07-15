import { useState, useEffect } from 'react';

/**
 * Hook to monitor network status and connectivity
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkChanged, setNetworkChanged] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkChanged(true);
      // Reset network changed flag after a short delay
      setTimeout(() => setNetworkChanged(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkChanged(true);
      setTimeout(() => setNetworkChanged(false), 3000);
    };

    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for network change events (when switching networks)
    const handleNetworkChange = () => {
      setNetworkChanged(true);
      setTimeout(() => setNetworkChanged(false), 3000);
    };

    // Monitor connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleNetworkChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleNetworkChange);
      }
    };
  }, []);

  return {
    isOnline,
    networkChanged,
    connectionType: navigator.connection?.effectiveType || 'unknown'
  };
};

export default useNetworkStatus;
