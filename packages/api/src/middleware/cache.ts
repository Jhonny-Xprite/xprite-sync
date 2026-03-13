import { Request, Response, NextFunction } from 'express';
import { getCacheService } from '../services/cache';
import { Logger } from '../utils/logger';

const logger = new Logger('CacheMiddleware');

interface CacheableRequest extends Request {
  cacheKey?: string;
  isCached?: boolean;
}

/**
 * Generate cache key based on method, URL, and query parameters
 */
function generateCacheKey(req: CacheableRequest): string {
  const query = Object.keys(req.query)
    .sort()
    .map((key) => `${key}=${req.query[key]}`)
    .join('&');

  const keyParts = [req.method, req.path, query].filter(Boolean);
  return `cache:${keyParts.join(':').replace(/[^a-zA-Z0-9:_-]/g, '_')}`;
}

/**
 * Determine if a route is cacheable
 */
function isCacheable(req: CacheableRequest): boolean {
  // Only cache GET requests
  if (req.method !== 'GET') return false;

  // Don't cache if explicitly disabled
  if (req.headers['cache-control']?.includes('no-cache')) return false;

  // Cacheable routes (extensible list)
  const cacheableRoutes = [
    /^\/api\/metrics/,
    /^\/api\/status/,
    /^\/api\/config/,
    /^\/api\/agents/,
  ];

  return cacheableRoutes.some((route) => route.test(req.path));
}

/**
 * Cache middleware for GET requests
 */
export async function cacheMiddleware(
  req: CacheableRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isCacheable(req)) {
    return next();
  }

  const cache = await getCacheService();
  if (!cache.isAvailable()) {
    return next();
  }

  const cacheKey = generateCacheKey(req);
  req.cacheKey = cacheKey;

  try {
    // Try to get from cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      req.isCached = true;
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Wrap original json() method to cache response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, {
          prefix: extractCategoryFromPath(req.path),
        }).catch((error) => {
          logger.error(`Failed to cache response for ${cacheKey}:`, error);
        });
      }

      return originalJson(data);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error for ${cacheKey}:`, error);
    next();
  }
}

/**
 * Extract cache category from request path for TTL determination
 */
function extractCategoryFromPath(path: string): string {
  if (path.includes('metrics')) return 'metrics';
  if (path.includes('status')) return 'status';
  if (path.includes('config')) return 'config';
  if (path.includes('agents')) return 'user';
  return 'default';
}

/**
 * Manual cache invalidation handler
 */
export async function invalidateCache(pattern: string): Promise<number> {
  const cache = await getCacheService();
  return cache.invalidate(pattern);
}

/**
 * Get current cache statistics
 */
export async function getCacheStats() {
  const cache = await getCacheService();
  return cache.getStats();
}
