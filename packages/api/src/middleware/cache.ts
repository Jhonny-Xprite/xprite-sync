import { Request, Response, NextFunction } from 'express';
import { getCacheService } from '../services/cache';

interface CacheableRequest extends Request {
  cacheKey?: string;
}

function generateCacheKey(req: CacheableRequest): string {
  const query = Object.keys(req.query)
    .sort()
    .map((key) => `${key}=${req.query[key]}`)
    .join('&');

  const keyParts = [req.method, req.path, query].filter(Boolean);
  return `cache:${keyParts.join(':').replace(/[^a-zA-Z0-9:_-]/g, '_')}`;
}

function isCacheable(req: CacheableRequest): boolean {
  if (req.method !== 'GET') return false;
  if (req.headers['cache-control']?.includes('no-cache')) return false;

  const cacheableRoutes = [/^\/api\/metrics/, /^\/api\/system-metrics/, /^\/api\/cache-stats/];
  return cacheableRoutes.some((route) => route.test(req.path));
}

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
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');

    // Wrap original json() method to cache response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, 300).catch((error) => {
          console.error(`Failed to cache response for ${cacheKey}:`, error);
        });
      }

      return originalJson(data);
    };

    next();
  } catch (error) {
    console.error(`Cache middleware error for ${cacheKey}:`, error);
    next();
  }
}
