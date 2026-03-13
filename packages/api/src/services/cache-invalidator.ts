import { getCacheService } from './cache';
import { getRealtime Service } from './realtime';
import { Logger } from '../utils/logger';

export interface InvalidationRule {
  tableName: string;
  patterns: string[];
  debounceMs?: number;
}

export class CacheInvalidator {
  private logger = new Logger('CacheInvalidator');
  private rules: Map<string, InvalidationRule> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Initialize invalidation listeners via Realtime
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const realtimeService = getRealtime Service();

      // Register invalidation rules
      this.registerRule('agent_metrics', ['cache:*metrics*'], 300); // 300ms debounce
      this.registerRule('system_metrics', ['cache:*status*'], 300);
      this.registerRule('workflow_logs', ['cache:*agents*'], 1000);
      this.registerRule('config', ['cache:*config*'], 5000); // Config changes are rare

      this.logger.info('✅ Cache invalidator initialized with rules');
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize cache invalidator:', error);
    }
  }

  /**
   * Register an invalidation rule
   */
  private registerRule(
    tableName: string,
    patterns: string[],
    debounceMs: number = 1000
  ): void {
    this.rules.set(tableName, {
      tableName,
      patterns,
      debounceMs,
    });
  }

  /**
   * Handle write event and invalidate cache patterns
   */
  async handleWriteEvent(
    tableName: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    data: any
  ): Promise<void> {
    const rule = this.rules.get(tableName);
    if (!rule) return;

    // Clear existing debounce timer for this table
    if (this.debounceTimers.has(tableName)) {
      clearTimeout(this.debounceTimers.get(tableName)!);
    }

    // Set up debounced invalidation
    const timer = setTimeout(async () => {
      try {
        const cache = await getCacheService();
        let invalidatedCount = 0;

        for (const pattern of rule.patterns) {
          const count = await cache.invalidate(pattern);
          invalidatedCount += count;
        }

        this.logger.debug(
          `Invalidated ${invalidatedCount} cache entries for ${tableName} (${event})`
        );
      } catch (error) {
        this.logger.error(`Error invalidating cache for ${tableName}:`, error);
      } finally {
        this.debounceTimers.delete(tableName);
      }
    }, rule.debounceMs);

    this.debounceTimers.set(tableName, timer);
  }

  /**
   * Invalidate specific patterns immediately (without debounce)
   */
  async invalidateImmediate(patterns: string[]): Promise<number> {
    const cache = await getCacheService();
    let totalInvalidated = 0;

    for (const pattern of patterns) {
      const count = await cache.invalidate(pattern);
      totalInvalidated += count;
    }

    this.logger.debug(`Immediately invalidated ${totalInvalidated} cache entries`);
    return totalInvalidated;
  }

  /**
   * Clear all pending debounce timers
   */
  flushPendingInvalidations(): void {
    let count = 0;
    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer);
      count++;
    }
    this.debounceTimers.clear();
    this.logger.debug(`Flushed ${count} pending invalidations`);
  }

  /**
   * Shutdown the invalidator
   */
  async shutdown(): Promise<void> {
    this.flushPendingInvalidations();
    this.isInitialized = false;
  }
}

// Singleton instance
let invalidatorInstance: CacheInvalidator | null = null;

export async function getCacheInvalidator(): Promise<CacheInvalidator> {
  if (!invalidatorInstance) {
    invalidatorInstance = new CacheInvalidator();
    await invalidatorInstance.initialize();
  }
  return invalidatorInstance;
}
