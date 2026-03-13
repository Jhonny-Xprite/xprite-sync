import Redis from 'ioredis';
import { Logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // TTL em segundos
  prefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
}

export class CacheService {
  private redis: Redis | null = null;
  private logger = new Logger('CacheService');
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    hitRate: 0,
  };

  private ttlDefaults: Record<string, number> = {
    metrics: 5 * 60, // 5 minutes
    status: 10, // 10 seconds
    config: 24 * 60 * 60, // 24 hours
    user: 5 * 60, // 5 minutes
    default: 5 * 60, // 5 minutes
  };

  async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl);

      // Test connection
      await this.redis.ping();
      this.logger.info('✅ Redis connected');
    } catch (error) {
      this.logger.error('❌ Redis connection failed, continuing with DB fallback', error);
      this.redis = null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.redis) {
      this.stats.misses++;
      return null;
    }

    try {
      const data = await this.redis.get(key);
      if (data) {
        this.stats.hits++;
        this.updateHitRate();
        return JSON.parse(data);
      }
      this.stats.misses++;
      this.updateHitRate();
      return null;
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const ttl = options.ttl || this.ttlDefaults[options.prefix || 'default'];
      const serialized = JSON.stringify(value);

      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async invalidate(pattern: string): Promise<number> {
    if (!this.redis) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      this.logger.debug(`Invalidated ${keys.length} cache entries matching ${pattern}`);
      return keys.length;
    } catch (error) {
      this.stats.errors++;
      this.logger.error(`Cache invalidate error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async clear(): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      await this.redis.flushdb();
      this.logger.info('Cache cleared');
      return true;
    } catch (error) {
      this.stats.errors++;
      this.logger.error('Cache clear error:', error);
      return false;
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  async shutdown(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
        this.logger.info('Redis connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
  }

  isAvailable(): boolean {
    return this.redis !== null;
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

export async function getCacheService(): Promise<CacheService> {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
    await cacheServiceInstance.initialize();
  }
  return cacheServiceInstance;
}
