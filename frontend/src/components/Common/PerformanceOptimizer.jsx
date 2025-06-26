import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

// Higher-order component for performance optimization
export const withPerformanceOptimization = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    // Custom comparison logic
    const keys = Object.keys(nextProps);
    for (const key of keys) {
      if (prevProps[key] !== nextProps[key]) {
        // Special handling for functions
        if (typeof nextProps[key] === 'function' && typeof prevProps[key] === 'function') {
          continue; // Skip function comparison
        }
        // Special handling for arrays and objects
        if (Array.isArray(nextProps[key]) && Array.isArray(prevProps[key])) {
          if (nextProps[key].length !== prevProps[key].length) return false;
          continue;
        }
        if (typeof nextProps[key] === 'object' && nextProps[key] !== null) {
          continue; // Skip deep object comparison for performance
        }
        return false;
      }
    }
    return true;
  });
};

// Debounced input component
export const DebouncedInput = memo(({ 
  value, 
  onChange, 
  delay = 300, 
  ...props 
}) => {
  const debouncedOnChange = useMemo(
    () => debounce(onChange, delay),
    [onChange, delay]
  );

  const handleChange = useCallback((e) => {
    debouncedOnChange(e.target.value);
  }, [debouncedOnChange]);

  return (
    <input
      {...props}
      defaultValue={value}
      onChange={handleChange}
    />
  );
});

DebouncedInput.displayName = 'DebouncedInput';

// Virtualized list component for large datasets
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5 
}) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const [startIndex, setStartIndex] = useState(0);

  const handleScroll = useCallback(
    debounce((e) => {
      const scrollTop = e.target.scrollTop;
      const newStartIndex = Math.floor(scrollTop / itemHeight);
      setStartIndex(Math.max(0, newStartIndex - overscan));
    }, 16), // 60fps
    [itemHeight, overscan]
  );

  const visibleItems = useMemo(() => {
    const endIndex = Math.min(
      startIndex + visibleCount + overscan * 2,
      items.length
    );
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, visibleCount, overscan]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isIntersecting];
};

// Lazy loading image component
export const LazyImage = memo(({ 
  src, 
  alt, 
  placeholder = '/placeholder.jpg',
  className = '',
  ...props 
}) => {
  const [setRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  return (
    <div ref={setRef} className={className}>
      {isIntersecting && (
        <img
          {...props}
          src={error ? placeholder : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

// Memory leak prevention hook
export const useMemoryLeakPrevention = () => {
  const timeouts = useRef(new Set());
  const intervals = useRef(new Set());
  const listeners = useRef(new Set());

  const addTimeout = useCallback((id) => {
    timeouts.current.add(id);
    return id;
  }, []);

  const addInterval = useCallback((id) => {
    intervals.current.add(id);
    return id;
  }, []);

  const addListener = useCallback((element, event, handler) => {
    const listener = { element, event, handler };
    listeners.current.add(listener);
    element.addEventListener(event, handler);
    return () => {
      element.removeEventListener(event, handler);
      listeners.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeouts.current.forEach(clearTimeout);
      timeouts.current.clear();

      // Clear all intervals
      intervals.current.forEach(clearInterval);
      intervals.current.clear();

      // Remove all event listeners
      listeners.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listeners.current.clear();
    };
  }, []);

  return { addTimeout, addInterval, addListener };
};

export default {
  withPerformanceOptimization,
  DebouncedInput,
  VirtualizedList,
  useIntersectionObserver,
  LazyImage,
  useMemoryLeakPrevention
};
