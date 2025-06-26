// Performance optimization utilities
import { debounce, throttle } from 'lodash';

// Prevent memory leaks from event listeners
export const createSafeEventListener = (element, event, handler, options = {}) => {
  const safeHandler = (...args) => {
    try {
      handler(...args);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };

  element.addEventListener(event, safeHandler, options);
  
  return () => {
    element.removeEventListener(event, safeHandler, options);
  };
};

// Debounced API calls to prevent excessive requests
export const createDebouncedApiCall = (apiFunction, delay = 300) => {
  return debounce(async (...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }, delay);
};

// Throttled scroll handlers
export const createThrottledScrollHandler = (handler, delay = 16) => {
  return throttle(handler, delay);
};

// Image loading optimization
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Local storage with error handling
export const safeLocalStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };

  if (!window.IntersectionObserver) {
    // Fallback for browsers without IntersectionObserver
    return {
      observe: () => callback([{ isIntersecting: true }]),
      unobserve: () => {},
      disconnect: () => {}
    };
  }

  return new IntersectionObserver(callback, defaultOptions);
};

// Request Animation Frame wrapper
export const createAnimationFrame = (callback) => {
  let rafId = null;
  
  const start = () => {
    if (rafId) return;
    
    const animate = () => {
      callback();
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
  };
  
  const stop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return { start, stop };
};

// Memory usage monitor
export const memoryMonitor = {
  check: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  },
  
  log: () => {
    const memory = memoryMonitor.check();
    if (memory) {
      console.log(`Memory: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
    }
  }
};

// Component render tracker
export const renderTracker = {
  renders: new Map(),
  
  track: (componentName) => {
    const count = renderTracker.renders.get(componentName) || 0;
    renderTracker.renders.set(componentName, count + 1);
  },
  
  getStats: () => {
    return Array.from(renderTracker.renders.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  },
  
  log: () => {
    console.table(renderTracker.getStats());
  }
};

// Network status monitor
export const networkMonitor = {
  isOnline: () => navigator.onLine,
  
  getConnection: () => {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  },
  
  onStatusChange: (callback) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

// Error boundary helper
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
      console.error('Error boundary caught error:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        return fallbackComponent ? fallbackComponent(this.state.error) : null;
      }
      
      return this.props.children;
    }
  };
};

// Performance measurement
export const performanceMeasure = {
  start: (name) => {
    performance.mark(`${name}-start`);
  },
  
  end: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    return measure ? measure.duration : 0;
  },
  
  clear: (name) => {
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
  }
};

// Bundle size analyzer
export const bundleAnalyzer = {
  logChunkSizes: () => {
    if (process.env.NODE_ENV === 'development') {
      const chunks = document.querySelectorAll('script[src]');
      chunks.forEach(chunk => {
        fetch(chunk.src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            if (size) {
              console.log(`Chunk ${chunk.src}: ${(size / 1024).toFixed(2)}KB`);
            }
          })
          .catch(() => {});
      });
    }
  }
};

export default {
  createSafeEventListener,
  createDebouncedApiCall,
  createThrottledScrollHandler,
  preloadImage,
  safeLocalStorage,
  createIntersectionObserver,
  createAnimationFrame,
  memoryMonitor,
  renderTracker,
  networkMonitor,
  createErrorBoundary,
  performanceMeasure,
  bundleAnalyzer
};
