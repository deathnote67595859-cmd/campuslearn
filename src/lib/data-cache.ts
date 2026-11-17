/**
 * In-Memory Client Data Cache & Request Deduplication
 * Prevents redundant database network queries when switching between Dashboard,
 * Notes Library, and Video Library.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Global in-memory cache store
const cacheStore: {
  resources?: CacheEntry<any>;
  videos?: CacheEntry<any>;
} = {};

// In-flight request deduplication map
const pendingRequests: {
  resources?: Promise<any>;
  videos?: Promise<any>;
} = {};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh cache

/**
 * Fetch resources with memory caching and deduplication.
 * If data was fetched within CACHE_TTL_MS, returns immediately with 0ms network latency.
 */
export async function getCachedOrFetchResources(forceRefresh: boolean = false) {
  const now = Date.now();

  if (!forceRefresh && cacheStore.resources && (now - cacheStore.resources.timestamp) < CACHE_TTL_MS) {
    return cacheStore.resources.data;
  }

  // Deduplicate concurrent requests
  if (pendingRequests.resources && !forceRefresh) {
    return pendingRequests.resources;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch('/api/resources', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch resources (${res.status})`);
      }
      const data = await res.json();
      cacheStore.resources = {
        data,
        timestamp: Date.now(),
      };
      return data;
    } finally {
      delete pendingRequests.resources;
    }
  })();

  pendingRequests.resources = fetchPromise;
  return fetchPromise;
}

/**
 * Fetch video library with memory caching and deduplication.
 */
export async function getCachedOrFetchVideos(forceRefresh: boolean = false) {
  const now = Date.now();

  if (!forceRefresh && cacheStore.videos && (now - cacheStore.videos.timestamp) < CACHE_TTL_MS) {
    return cacheStore.videos.data;
  }

  if (pendingRequests.videos && !forceRefresh) {
    return pendingRequests.videos;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch('/api/videos', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch videos (${res.status})`);
      }
      const data = await res.json();
      cacheStore.videos = {
        data,
        timestamp: Date.now(),
      };
      return data;
    } finally {
      delete pendingRequests.videos;
    }
  })();

  pendingRequests.videos = fetchPromise;
  return fetchPromise;
}

/**
 * Invalidate resource cache when a new note or resource is uploaded
 */
export function invalidateResourceCache() {
  delete cacheStore.resources;
}

/**
 * Invalidate video cache when a new video is added
 */
export function invalidateVideoCache() {
  delete cacheStore.videos;
}

