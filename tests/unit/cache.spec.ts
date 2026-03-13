import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../../packages/api/src/services/cache';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    cacheService = new CacheService();
    // Skip actual Redis initialization for unit tests
  });

  afterEach(async () => {
    await cacheService.shutdown();
  });

  describe('get/set operations', () => {
    it('should set and get a value', async () => {
      const testData = { id: 1, name: 'test' };
      const result = await cacheService.set('test-key', testData);
      expect(result).toBe(true);

      const retrieved = await cacheService.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle JSON serialization correctly', async () => {
      const complexData = {
        nested: { array: [1, 2, 3], date: new Date().toISOString() },
        boolean: true,
      };

      await cacheService.set('complex-key', complexData);
      const retrieved = await cacheService.get('complex-key');

      expect(retrieved).toEqual(complexData);
    });

    it('should respect TTL configuration', async () => {
      const testData = { value: 'short-lived' };
      await cacheService.set('ttl-key', testData, { ttl: 1 });

      // Immediate retrieval should work
      let retrieved = await cacheService.get('ttl-key');
      expect(retrieved).toEqual(testData);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));
      retrieved = await cacheService.get('ttl-key');
      expect(retrieved).toBeNull();
    });
  });

  describe('invalidation', () => {
    it('should invalidate matching patterns', async () => {
      await cacheService.set('cache:metrics:agent1', { value: 1 });
      await cacheService.set('cache:metrics:agent2', { value: 2 });
      await cacheService.set('cache:status:health', { status: 'ok' });

      const invalidatedCount = await cacheService.invalidate('cache:metrics:*');

      expect(invalidatedCount).toBe(2);
      expect(await cacheService.get('cache:metrics:agent1')).toBeNull();
      expect(await cacheService.get('cache:status:health')).not.toBeNull();
    });

    it('should return 0 when no matches found', async () => {
      const invalidatedCount = await cacheService.invalidate('non-existent:*');
      expect(invalidatedCount).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', async () => {
      await cacheService.set('test-key', { value: 1 });

      // Hit
      await cacheService.get('test-key');
      // Miss
      await cacheService.get('non-existent');

      const stats = cacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it('should calculate hit rate correctly', async () => {
      await cacheService.set('key1', { value: 1 });

      // 3 hits
      await cacheService.get('key1');
      await cacheService.get('key1');
      await cacheService.get('key1');

      // 1 miss
      await cacheService.get('non-existent');

      const stats = cacheService.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(75);
    });
  });

  describe('clear operation', () => {
    it('should clear all cache entries', async () => {
      await cacheService.set('key1', { value: 1 });
      await cacheService.set('key2', { value: 2 });

      const result = await cacheService.clear();
      expect(result).toBe(true);

      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
    });
  });

  describe('availability check', () => {
    it('should report availability status', () => {
      // When Redis is not initialized, service should report unavailable
      const isAvailable = cacheService.isAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });
});
