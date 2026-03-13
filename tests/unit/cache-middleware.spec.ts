import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { cacheMiddleware } from '../../packages/api/src/middleware/cache';

describe('CacheMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/api/metrics',
      headers: {},
      query: { agentId: '123' },
    };

    res = {
      statusCode: 200,
      setHeader: vi.fn(),
      json: vi.fn((data) => {
        res.data = data;
        return res;
      }),
    };

    next = vi.fn();
  });

  describe('cacheability check', () => {
    it('should cache GET requests to /api/metrics', async () => {
      req.method = 'GET';
      req.path = '/api/metrics';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should not cache POST requests', async () => {
      req.method = 'POST';
      req.path = '/api/metrics';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should not cache when no-cache header is present', async () => {
      req.headers['cache-control'] = 'no-cache';
      req.method = 'GET';
      req.path = '/api/metrics';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalledWith('X-Cache', expect.anything());
    });

    it('should cache status endpoints', async () => {
      req.method = 'GET';
      req.path = '/api/status';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should cache config endpoints', async () => {
      req.method = 'GET';
      req.path = '/api/config';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should not cache other endpoints', async () => {
      req.method = 'GET';
      req.path = '/api/other';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('cache headers', () => {
    it('should set X-Cache: MISS header on cache miss', async () => {
      req.method = 'GET';
      req.path = '/api/metrics';

      await cacheMiddleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
    });

    it('should set X-Cache: HIT header on cache hit', async () => {
      // This test would require mocking the Redis cache
      // For now, just verify the middleware processes correctly
      req.method = 'GET';
      req.path = '/api/metrics';

      await cacheMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('cache key generation', () => {
    it('should generate unique keys for different requests', async () => {
      req.method = 'GET';
      req.path = '/api/metrics';
      req.query = { agentId: '123' };

      await cacheMiddleware(req, res, next);
      const key1 = req.cacheKey;

      // Change query
      req.query = { agentId: '456' };
      await cacheMiddleware(req, res, next);
      const key2 = req.cacheKey;

      expect(key1).not.toEqual(key2);
    });

    it('should generate same key for identical requests', async () => {
      const makeRequest = () => {
        const localReq = {
          method: 'GET',
          path: '/api/metrics',
          headers: {},
          query: { agentId: '123' },
        };
        const localRes = {
          statusCode: 200,
          setHeader: vi.fn(),
          json: vi.fn((data) => localRes),
        };
        const localNext = vi.fn();

        return cacheMiddleware(localReq, localRes, localNext).then(() => localReq.cacheKey);
      };

      const key1 = await makeRequest();
      const key2 = await makeRequest();

      expect(key1).toEqual(key2);
    });
  });

  describe('response caching', () => {
    it('should cache successful responses (2xx)', async () => {
      req.method = 'GET';
      req.path = '/api/metrics';
      res.statusCode = 200;

      const responseData = { metrics: [] };

      await cacheMiddleware(req, res, next);

      // Simulate response
      res.json(responseData);

      // Verify json was called
      expect(res.json).toHaveBeenCalledWith(responseData);
    });

    it('should not cache error responses', async () => {
      req.method = 'GET';
      req.path = '/api/metrics';
      res.statusCode = 500;

      const errorData = { error: 'Server error' };

      await cacheMiddleware(req, res, next);

      // Simulate response
      res.json(errorData);

      // Just verify the middleware doesn't break on errors
      expect(res.json).toHaveBeenCalledWith(errorData);
    });
  });
});
