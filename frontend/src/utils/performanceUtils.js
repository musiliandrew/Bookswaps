// Performance optimization utilities

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const createTimeoutManager = () => {
  const timeouts = new Set();
  
  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeouts.delete(timeoutId);
      callback();
    }, delay);
    timeouts.add(timeoutId);
    return timeoutId;
  };
  
  const clearAllTimeouts = () => {
    timeouts.forEach(clearTimeout);
    timeouts.clear();
  };
  
  return { addTimeout, clearAllTimeouts };
};

export const createIntervalManager = () => {
  const intervals = new Set();
  
  const addInterval = (callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervals.add(intervalId);
    return intervalId;
  };
  
  const clearAllIntervals = () => {
    intervals.forEach(clearInterval);
    intervals.clear();
  };
  
  return { addInterval, clearAllIntervals };
};

export const createEventListenerManager = () => {
  const listeners = new Map();
  
  const addEventListener = (element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    
    if (!listeners.has(element)) {
      listeners.set(element, []);
    }
    listeners.get(element).push({ event, handler, options });
  };
  
  const removeAllEventListeners = () => {
    listeners.forEach((elementListeners, element) => {
      elementListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    listeners.clear();
  };
  
  return { addEventListener, removeAllEventListeners };
};
