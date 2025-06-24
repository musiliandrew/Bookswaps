// Simple request cache to prevent duplicate API calls
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.defaultTTL = 30000; // 30 seconds default TTL
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}${sortedParams ? '?' + sortedParams : ''}`;
  }

  // Check if request is cached and not expired
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp, ttl } = cached;
    const now = Date.now();
    
    if (now - timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  // Set cache entry
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Check if request is currently pending
  isPending(key) {
    return this.pendingRequests.has(key);
  }

  // Set request as pending
  setPending(key, promise) {
    this.pendingRequests.set(key, promise);
    
    // Clean up when promise resolves/rejects
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
    
    return promise;
  }

  // Get pending request
  getPending(key) {
    return this.pendingRequests.get(key);
  }

  // Clear cache entry
  delete(key) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, { timestamp, ttl }] of this.cache.entries()) {
      if (now - timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Create singleton instance
export const requestCache = new RequestCache();

// Wrapper function for cached API calls
export const cachedApiCall = async (apiFunction, cacheKey, ttl) => {
  // Check cache first
  const cached = requestCache.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for: ${cacheKey}`);
    return cached;
  }

  // Check if request is pending
  const pending = requestCache.getPending(cacheKey);
  if (pending) {
    console.log(`Request pending for: ${cacheKey}`);
    return pending;
  }

  // Make new request
  console.log(`Cache miss for: ${cacheKey}`);
  const promise = apiFunction();
  
  // Set as pending
  requestCache.setPending(cacheKey, promise);

  try {
    const result = await promise;
    // Cache successful result
    if (result) {
      requestCache.set(cacheKey, result, ttl);
    }
    return result;
  } catch (error) {
    // Don't cache errors, just throw
    throw error;
  }
};

// Helper to invalidate cache entries by pattern
export const invalidateCache = (pattern) => {
  const keys = Array.from(requestCache.cache.keys());
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      requestCache.delete(key);
    }
  });
};

// Auto cleanup every 5 minutes
setInterval(() => {
  requestCache.cleanup();
}, 5 * 60 * 1000);
