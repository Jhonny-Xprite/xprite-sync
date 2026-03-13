import * as redis from 'ioredis';

export interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
}

class CacheService {
  private client: redis.Redis | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    hitRate: 0,
  };

  async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = new redis.Redis(redisUrl);

      // Test connection
      await this.client.ping();
      console.log('✅ Redis connected');
    } catch (error) {
      console.error('⚠️  Redis connection failed, caching disabled:', error);
      this.client = null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client) {
      this.stats.misses++;
      return null;
    }

    try {
      const data = await this.client.get(key);
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
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl: number = 300): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async invalidate(pattern: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      console.log(`Invalidated ${keys.length} cache entries matching ${pattern}`);
      return keys.length;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache invalidate error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async clear(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.flushdb();
      console.log('Cache cleared');
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache clear error:', error);
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
    if (this.client) {
      try {
        await this.client.quit();
        console.log('Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
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
