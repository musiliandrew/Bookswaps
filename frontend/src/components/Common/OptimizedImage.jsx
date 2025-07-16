import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  UserIcon, 
  PhotoIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const OptimizedImage = ({
  src,
  alt = '',
  fallbackSrc = null,
  placeholder = 'book', // 'book', 'user', 'photo'
  className = '',
  containerClassName = '',
  showLoadingSpinner = true,
  showErrorState = true,
  retryOnError = true,
  maxRetries = 3,
  onLoad = () => {},
  onError = () => {},
  lazy = false,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [lazy, isInView]);

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, currentSrc]);

  // Generate comprehensive fallback URLs
  const generateFallbackUrls = (originalSrc) => {
    if (!originalSrc) return [];
    
    const fallbacks = [];
    
    // OpenLibrary cover fallbacks
    if (originalSrc.includes('covers.openlibrary.org')) {
      if (originalSrc.includes('-L.jpg')) {
        fallbacks.push(originalSrc.replace('-L.jpg', '-M.jpg'));
        fallbacks.push(originalSrc.replace('-L.jpg', '-S.jpg'));
      } else if (originalSrc.includes('-M.jpg')) {
        fallbacks.push(originalSrc.replace('-M.jpg', '-S.jpg'));
        fallbacks.push(originalSrc.replace('-M.jpg', '-L.jpg'));
      } else if (originalSrc.includes('-S.jpg')) {
        fallbacks.push(originalSrc.replace('-S.jpg', '-M.jpg'));
        fallbacks.push(originalSrc.replace('-S.jpg', '-L.jpg'));
      }
    }
    
    // Try HTTPS if HTTP fails
    if (originalSrc.startsWith('http://')) {
      fallbacks.push(originalSrc.replace('http://', 'https://'));
    }
    
    // Try HTTP if HTTPS fails (for local development)
    if (originalSrc.startsWith('https://')) {
      fallbacks.push(originalSrc.replace('https://', 'http://'));
    }
    
    // Add custom fallback if provided
    if (fallbackSrc && !fallbacks.includes(fallbackSrc)) {
      fallbacks.push(fallbackSrc);
    }
    
    return fallbacks;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad();
  };

  const handleImageError = (event) => {
    setIsLoading(false);

    if (!retryOnError) {
      setHasError(true);
      onError();
      return;
    }

    // Try fallback URLs
    const fallbacks = generateFallbackUrls(currentSrc);

    if (retryCount < maxRetries && fallbacks.length > retryCount) {
      const nextSrc = fallbacks[retryCount];
      setCurrentSrc(nextSrc);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      return;
    }

    // All fallbacks failed
    setHasError(true);
    onError();
  };

  const getPlaceholderIcon = () => {
    const iconClass = "w-8 h-8 text-primary/40";
    
    switch (placeholder) {
      case 'user':
        return <UserIcon className={iconClass} />;
      case 'photo':
        return <PhotoIcon className={iconClass} />;
      case 'book':
      default:
        return <BookOpenIcon className={iconClass} />;
    }
  };

  const getPlaceholderGradient = () => {
    switch (placeholder) {
      case 'user':
        return 'from-blue-100 to-blue-200';
      case 'photo':
        return 'from-gray-100 to-gray-200';
      case 'book':
      default:
        return 'from-primary/10 to-accent/10';
    }
  };

  const getPlaceholderText = () => {
    switch (placeholder) {
      case 'user':
        return 'No Photo';
      case 'photo':
        return 'No Image';
      case 'book':
      default:
        return 'No Cover';
    }
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <AnimatePresence mode="wait">
        {(() => {
          // Single conditional render to avoid multiple children in AnimatePresence
          if (isLoading && showLoadingSpinner && isInView) {
            return (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5"
              >
                <motion.div
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            );
          }

          if (hasError && showErrorState) {
            return (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${getPlaceholderGradient()}`}
              >
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mb-2" />
                <span className="text-xs text-red-500 font-medium">Failed to load</span>
                {retryOnError && retryCount < maxRetries && (
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      setRetryCount(0);
                      setCurrentSrc(src);
                    }}
                    className="mt-2 text-xs text-primary hover:text-accent transition-colors"
                  >
                    Retry
                  </button>
                )}
              </motion.div>
            );
          }

          if (isInView && currentSrc && !hasError) {
            return (
              <motion.img
                key={currentSrc}
                src={currentSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
                style={{ opacity: isLoading ? 0 : 1 }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                loading={lazy ? "lazy" : "eager"}
                {...props}
              />
            );
          }

          if (!currentSrc) {
            return (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getPlaceholderGradient()}`}
              >
                {getPlaceholderIcon()}
                <span className="text-xs text-primary/40 font-medium mt-2">
                  {getPlaceholderText()}
                </span>
              </motion.div>
            );
          }

          return null;
        })()}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedImage;
