// Image optimization and fallback utilities

/**
 * Get optimized image URL with fallbacks
 */
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return null;

  const {
    width = null,
    height = null,
    quality = 85,
    format = 'auto',
    fallback = true
  } = options;

  // Handle different image sources
  if (originalUrl.includes('covers.openlibrary.org')) {
    return getOpenLibraryImageUrl(originalUrl, { width, height });
  }

  if (originalUrl.includes('minio') || originalUrl.includes('s3')) {
    return getMinioImageUrl(originalUrl, { width, height, quality });
  }

  // Return original URL if no optimization available
  return originalUrl;
};

/**
 * Get OpenLibrary cover image with size optimization
 */
export const getOpenLibraryImageUrl = (originalUrl, options = {}) => {
  const { width, height } = options;
  
  // Determine best size based on dimensions
  let size = 'L'; // Large by default
  
  if (width && height) {
    const maxDimension = Math.max(width, height);
    if (maxDimension <= 100) size = 'S';
    else if (maxDimension <= 300) size = 'M';
    else size = 'L';
  }

  // Replace size in URL
  return originalUrl
    .replace(/-[SML]\.jpg$/, `-${size}.jpg`)
    .replace(/\.jpg$/, `-${size}.jpg`);
};

/**
 * Get MinIO/S3 image URL with optimization parameters
 */
export const getMinioImageUrl = (originalUrl, options = {}) => {
  const { width, height, quality } = options;
  
  // For now, return original URL
  // In the future, you could add image processing parameters
  return originalUrl;
};

/**
 * Generate comprehensive fallback URLs for an image
 */
export const generateImageFallbacks = (originalUrl) => {
  if (!originalUrl) return [];
  
  const fallbacks = [];
  
  // OpenLibrary fallbacks
  if (originalUrl.includes('covers.openlibrary.org')) {
    if (originalUrl.includes('-L.jpg')) {
      fallbacks.push(originalUrl.replace('-L.jpg', '-M.jpg'));
      fallbacks.push(originalUrl.replace('-L.jpg', '-S.jpg'));
    } else if (originalUrl.includes('-M.jpg')) {
      fallbacks.push(originalUrl.replace('-M.jpg', '-S.jpg'));
      fallbacks.push(originalUrl.replace('-M.jpg', '-L.jpg'));
    } else if (originalUrl.includes('-S.jpg')) {
      fallbacks.push(originalUrl.replace('-S.jpg', '-M.jpg'));
      fallbacks.push(originalUrl.replace('-S.jpg', '-L.jpg'));
    }
  }
  
  // Protocol fallbacks
  if (originalUrl.startsWith('http://')) {
    fallbacks.push(originalUrl.replace('http://', 'https://'));
  } else if (originalUrl.startsWith('https://')) {
    fallbacks.push(originalUrl.replace('https://', 'http://'));
  }
  
  return [...new Set(fallbacks)]; // Remove duplicates
};

/**
 * Get book cover image with intelligent fallbacks
 */
export const getBookCoverUrl = (book, size = 'M') => {
  // Priority order for book cover sources
  const sources = [
    book.cover_image_url,
    book.book_image_url,
    book.image_url
  ].filter(Boolean);

  if (sources.length === 0) {
    // Generate from ISBN if available
    if (book.isbn) {
      const cleanIsbn = book.isbn.replace(/[^0-9]/g, '');
      if (cleanIsbn.length >= 10) {
        return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-${size}.jpg`;
      }
    }
    
    // Generate from OpenLibrary key if available
    if (book.open_library_key) {
      const olKey = book.open_library_key.replace('/works/', '').replace('/books/', '');
      return `https://covers.openlibrary.org/b/olid/${olKey}-${size}.jpg`;
    }
    
    return null;
  }

  // Return the first available source, optimized
  return getOptimizedImageUrl(sources[0], { 
    width: size === 'S' ? 100 : size === 'M' ? 300 : 600,
    height: size === 'S' ? 150 : size === 'M' ? 450 : 900
  });
};

/**
 * Get user profile picture with fallbacks
 */
export const getProfilePictureUrl = (user, size = 'M') => {
  if (!user) return null;
  
  const sources = [
    user.profile_picture,
    user.avatar,
    user.image
  ].filter(Boolean);

  if (sources.length === 0) {
    return null; // Will show initials fallback
  }

  return getOptimizedImageUrl(sources[0], {
    width: size === 'S' ? 50 : size === 'M' ? 150 : 300,
    height: size === 'S' ? 50 : size === 'M' ? 150 : 300
  });
};

/**
 * Preload critical images
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (urls) => {
  const promises = urls.filter(Boolean).map(url => 
    preloadImage(url).catch(() => null) // Don't fail if one image fails
  );
  
  return Promise.allSettled(promises);
};

/**
 * Check if image URL is accessible
 */
export const checkImageAccessibility = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get placeholder image based on type
 */
export const getPlaceholderImage = (type = 'book') => {
  const placeholders = {
    book: '/images/book-placeholder.jpg',
    user: '/images/user-placeholder.jpg',
    photo: '/images/photo-placeholder.jpg'
  };
  
  return placeholders[type] || placeholders.book;
};

/**
 * Convert image to WebP if supported
 */
export const getWebPUrl = (originalUrl) => {
  // Check if browser supports WebP
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  if (!supportsWebP || !originalUrl) return originalUrl;
  
  // For now, return original URL
  // In the future, you could implement WebP conversion
  return originalUrl;
};

/**
 * Enhanced Image loading with aggressive caching
 */
export class ImageLoader {
  constructor(maxRetries = 3, cacheSize = 500) {
    this.maxRetries = maxRetries;
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.preloadQueue = new Set();

    // Browser cache optimization
    this.setupServiceWorkerCache();
  }

  async setupServiceWorkerCache() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        this.imageCache = await caches.open('bookswaps-images-v1');
      } catch (error) {
        console.warn('Service Worker cache not available:', error);
      }
    }
  }

  async load(url, retryCount = 0) {
    if (!url) return { success: false, error: 'No URL provided' };

    // Check memory cache first
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      if (cached.success) {
        return cached;
      }
    }

    // Check browser cache
    if (this.imageCache) {
      try {
        const cachedResponse = await this.imageCache.match(url);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const img = await this.createImageFromBlob(blob);
          const result = { success: true, img, cached: true };
          this.addToMemoryCache(url, result);
          return result;
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }

    try {
      const img = await preloadImage(url);
      const result = { success: true, img };

      // Cache in memory
      this.addToMemoryCache(url, result);

      // Cache in browser
      this.cacheInBrowser(url);

      return result;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        // Try fallbacks
        const fallbacks = generateImageFallbacks(url);
        if (fallbacks.length > retryCount) {
          return this.load(fallbacks[retryCount], retryCount + 1);
        }
      }

      const result = { success: false, error };
      this.addToMemoryCache(url, result);
      return result;
    }
  }

  addToMemoryCache(url, result) {
    // LRU cache implementation
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, result);
  }

  async cacheInBrowser(url) {
    if (!this.imageCache) return;

    try {
      await this.imageCache.add(url);
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  createImageFromBlob(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  // Preload critical images
  preloadCritical(urls) {
    urls.forEach(url => {
      if (!this.preloadQueue.has(url)) {
        this.preloadQueue.add(url);
        this.load(url).finally(() => this.preloadQueue.delete(url));
      }
    });
  }

  clearCache() {
    this.cache.clear();
    if (this.imageCache) {
      this.imageCache.keys().then(keys => {
        keys.forEach(key => this.imageCache.delete(key));
      });
    }
  }

  getCacheStats() {
    return {
      memorySize: this.cache.size,
      preloadQueue: this.preloadQueue.size,
      hasServiceWorker: !!this.imageCache
    };
  }
}

// Global image loader instance
export const globalImageLoader = new ImageLoader();

/**
 * Hook for image loading with caching
 */
export const useImageLoader = () => {
  return {
    loadImage: globalImageLoader.load.bind(globalImageLoader),
    clearCache: globalImageLoader.clearCache.bind(globalImageLoader)
  };
};
