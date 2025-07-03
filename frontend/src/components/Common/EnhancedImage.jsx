import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  UserIcon, 
  BookOpenIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const EnhancedImage = ({
  src,
  alt = '',
  fallbackSrc = null,
  placeholder = 'book', // 'book', 'user', 'photo'
  className = '',
  containerClassName = '',
  showLoadingSpinner = true,
  showErrorState = true,
  retryOnError = true,
  maxRetries = 2,
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef(null);

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, currentSrc]);

  // Generate fallback URLs for different image types
  const generateFallbackUrls = (originalSrc) => {
    if (!originalSrc) return [];
    
    const fallbacks = [];
    
    // If it's an OpenLibrary cover, try different sizes
    if (originalSrc.includes('covers.openlibrary.org')) {
      if (originalSrc.includes('-L.jpg')) {
        fallbacks.push(originalSrc.replace('-L.jpg', '-M.jpg'));
        fallbacks.push(originalSrc.replace('-L.jpg', '-S.jpg'));
      } else if (originalSrc.includes('-M.jpg')) {
        fallbacks.push(originalSrc.replace('-M.jpg', '-S.jpg'));
      }
    }
    
    // Add custom fallback if provided
    if (fallbackSrc) {
      fallbacks.push(fallbackSrc);
    }
    
    return fallbacks;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad();
  };

  const handleImageError = () => {
    setIsLoading(false);
    
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

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {isLoading && showLoadingSpinner && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm z-10"
          >
            <motion.div
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}

        {/* Error State */}
        {hasError && showErrorState ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${getPlaceholderGradient()} z-10`}
          >
            {retryOnError && retryCount < maxRetries ? (
              <motion.button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  setCurrentSrc(src);
                  setRetryCount(0);
                }}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                <span className="text-xs text-primary/60 font-medium">Retry</span>
              </motion.button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {getPlaceholderIcon()}
                <span className="text-xs text-primary/40 font-medium">
                  {placeholder === 'user' ? 'No Photo' : placeholder === 'book' ? 'No Cover' : 'No Image'}
                </span>
              </div>
            )}
          </motion.div>
        ) : (
          /* Image */
          currentSrc && (
            <motion.img
              key={currentSrc}
              ref={imgRef}
              src={currentSrc}
              alt={alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
              style={{ opacity: isLoading ? 0 : 1 }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoading ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              {...props}
            />
          )
        )}
      </AnimatePresence>

      {/* Fallback placeholder when no src provided */}
      {!currentSrc && (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getPlaceholderGradient()}`}>
          <div className="flex flex-col items-center gap-2">
            {getPlaceholderIcon()}
            <span className="text-xs text-primary/40 font-medium">
              {placeholder === 'user' ? 'No Photo' : placeholder === 'book' ? 'No Cover' : 'No Image'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImage;
