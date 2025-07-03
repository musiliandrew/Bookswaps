// Advanced image caching system for better performance

class ImageCache {
  constructor() {
    this.memoryCache = new Map();
    this.diskCache = null;
    this.preloadQueue = new Set();
    this.loadingPromises = new Map();
    this.maxMemorySize = 50; // Maximum number of images in memory
    this.maxDiskSize = 100; // Maximum number of images in disk cache
    
    // Initialize IndexedDB for persistent caching
    this.initDiskCache();
  }

  async initDiskCache() {
    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, using memory cache only');
        return;
      }

      const request = indexedDB.open('BookSwapsImageCache', 1);
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB, using memory cache only');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.diskCache = event.target.result;
        console.log('✅ Image disk cache initialized');
        
        // Clean old entries on startup
        this.cleanDiskCache();
      };
    } catch (error) {
      console.warn('Failed to initialize disk cache:', error);
    }
  }

  // Generate cache key from URL
  getCacheKey(url) {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // Check if image is in memory cache
  getFromMemory(url) {
    const cached = this.memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 minutes
      return cached.blob;
    }
    return null;
  }

  // Store image in memory cache
  setInMemory(url, blob) {
    // Remove oldest entries if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(url, {
      blob,
      timestamp: Date.now()
    });
  }

  // Get image from disk cache (IndexedDB)
  async getFromDisk(url) {
    if (!this.diskCache) return null;

    try {
      const transaction = this.diskCache.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(url);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && Date.now() - result.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
            resolve(result.blob);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Failed to get from disk cache:', error);
      return null;
    }
  }

  // Store image in disk cache
  async setInDisk(url, blob) {
    if (!this.diskCache) return;

    try {
      const transaction = this.diskCache.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      await store.put({
        url,
        blob,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Failed to store in disk cache:', error);
    }
  }

  // Clean old entries from disk cache
  async cleanDiskCache() {
    if (!this.diskCache) return;

    try {
      const transaction = this.diskCache.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('timestamp');
      
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
      const range = IDBKeyRange.upperBound(cutoff);
      
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Failed to clean disk cache:', error);
    }
  }

  // Main method to get cached image or fetch it
  async getImage(url) {
    if (!url) return null;

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Check memory cache first
    const memoryBlob = this.getFromMemory(url);
    if (memoryBlob) {
      return { blob: memoryBlob, source: 'memory' };
    }

    // Check disk cache
    const diskBlob = await this.getFromDisk(url);
    if (diskBlob) {
      // Store in memory for faster access
      this.setInMemory(url, diskBlob);
      return { blob: diskBlob, source: 'disk' };
    }

    // Fetch from network
    const loadingPromise = this.fetchImage(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  // Fetch image from network with caching
  async fetchImage(url) {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'force-cache', // Use browser cache
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      // Store in both caches
      this.setInMemory(url, blob);
      await this.setInDisk(url, blob);

      return { blob, source: 'network' };
    } catch (error) {
      console.warn('Failed to fetch image:', url, error);
      throw error;
    }
  }

  // Preload images for better performance
  async preloadImages(urls) {
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    
    for (const url of uniqueUrls) {
      if (!this.preloadQueue.has(url) && !this.memoryCache.has(url)) {
        this.preloadQueue.add(url);
        
        // Preload in background without blocking
        this.getImage(url)
          .then(() => {
            this.preloadQueue.delete(url);
          })
          .catch(() => {
            this.preloadQueue.delete(url);
          });
      }
    }
  }

  // Create object URL from cached blob
  createObjectURL(blob) {
    return URL.createObjectURL(blob);
  }

  // Revoke object URL to free memory
  revokeObjectURL(url) {
    URL.revokeObjectURL(url);
  }

  // Clear all caches
  async clearCache() {
    this.memoryCache.clear();
    this.preloadQueue.clear();
    this.loadingPromises.clear();

    if (this.diskCache) {
      try {
        const transaction = this.diskCache.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        await store.clear();
      } catch (error) {
        console.warn('Failed to clear disk cache:', error);
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      memorySize: this.memoryCache.size,
      preloadQueueSize: this.preloadQueue.size,
      loadingCount: this.loadingPromises.size,
      diskCacheAvailable: !!this.diskCache
    };
  }
}

// Global cache instance
export const imageCache = new ImageCache();

// Hook for using image cache
export const useImageCache = () => {
  return {
    getImage: imageCache.getImage.bind(imageCache),
    preloadImages: imageCache.preloadImages.bind(imageCache),
    clearCache: imageCache.clearCache.bind(imageCache),
    getCacheStats: imageCache.getCacheStats.bind(imageCache)
  };
};

// Preload critical images on app start
export const preloadCriticalImages = async () => {
  const criticalImages = [
    // Add any critical images that should be preloaded
    '/images/book-placeholder.jpg',
    '/images/user-placeholder.jpg'
  ];
  
  await imageCache.preloadImages(criticalImages);
};
