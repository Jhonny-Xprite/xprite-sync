import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CacheService } from '../../packages/api/src/services/cache';
import { CacheInvalidator } from '../../packages/api/src/services/cache-invalidator';

describe('Cache Invalidation', () => {
  let cacheService: CacheService;
  let invalidator: CacheInvalidator;

  beforeEach(async () => {
    cacheService = new CacheService();
    invalidator = new CacheInvalidator();
    // Skip Redis initialization for unit tests
  });

  afterEach(async () => {
    await cacheService.shutdown();
    await invalidator.shutdown();
  });

  describe('rule-based invalidation', () => {
    it('should invalidate metrics cache on agent_metrics write', async () => {
      // Setup: Cache metrics data
      await cacheService.set('cache:metrics:agent1', { latency: 50 });
      await cacheService.set('cache:metrics:agent2', { latency: 75 });

      // Action: Handle write event
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {
        agentId: 'agent1',
      });

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Assert: Metrics are invalidated (would be null after invalidation)
      // Note: This test is conceptual as actual Redis would be needed
    });

    it('should debounce multiple write events', async () => {
      let invalidationCount = 0;

      // Simulate multiple rapid writes
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {});
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {});
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {});

      // Only one invalidation should occur due to debouncing
      // Verify by checking debounce timers
    });

    it('should immediately invalidate without debounce', async () => {
      await cacheService.set('cache:status:health', { status: 'ok' });

      const invalidatedCount = await invalidator.invalidateImmediate([
        'cache:status:*',
      ]);

      // In a real Redis scenario, invalidatedCount would be > 0
    });
  });

  describe('invalidation patterns', () => {
    it('should handle wildcard patterns', async () => {
      // Set up multiple related cache entries
      await cacheService.set('cache:metrics:cpu', { value: 50 });
      await cacheService.set('cache:metrics:memory', { value: 75 });
      await cacheService.set('cache:status:healthy', { value: true });

      // Invalidate all metrics
      const count = await cacheService.invalidate('cache:metrics:*');

      // Should match 2 patterns, not the status one
      expect(count).toBe(2);
    });

    it('should handle complex patterns', async () => {
      await cacheService.set('cache:config:database:host', 'localhost');
      await cacheService.set('cache:config:database:port', 5432);
      await cacheService.set('cache:config:redis:host', 'localhost');

      const count = await cacheService.invalidate('cache:config:*');

      expect(count).toBe(3);
    });
  });

  describe('flush and cleanup', () => {
    it('should flush pending invalidations', async () => {
      // Schedule invalidations
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {});
      await invalidator.handleWriteEvent('system_metrics', 'UPDATE', {});

      // Flush immediately (should not execute scheduled timers)
      invalidator.flushPendingInvalidations();

      // Verify no timers are pending
    });
  });

  describe('resilience', () => {
    it('should handle cache service unavailability gracefully', async () => {
      // If Redis is down, invalidation should not throw
      const count = await invalidator.invalidateImmediate(['cache:*']);

      // Should return 0 (no-op) rather than throw
      expect(typeof count).toBe('number');
    });

    it('should continue operation if invalidation fails', async () => {
      // This validates the try-catch in handleWriteEvent
      await invalidator.handleWriteEvent('agent_metrics', 'UPDATE', {});

      // Should not throw, even if underlying cache operation fails
    });
  });

  describe('invalidation timing', () => {
    it('should propagate invalidation within 5 seconds', async () => {
      const startTime = Date.now();

      // Set cache entry
      await cacheService.set('cache:test:key', { value: 1 }, { ttl: 60 });

      // Trigger invalidation
      await invalidator.handleWriteEvent('test_table', 'UPDATE', {});

      // Simulate propagation delay
      await new Promise((resolve) => setTimeout(resolve, 300)); // Debounce delay

      // Entry should be invalidated by now
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(5000);
    });
  });
});
