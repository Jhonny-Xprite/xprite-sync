import { createLogger } from '../utils/logger';

const logger = createLogger('EngineService');

export interface PoolStatus {
  active_workers: number;
  total_workers: number;
  queue_size: number;
  queue_estimated_time_seconds: number;
}

export interface HealthMetrics {
  cpu_percentage: number;
  memory_percentage: number;
  uptime_hours: number;
}

export interface EngineStatus {
  status: 'healthy' | 'degraded' | 'critical';
  pool: PoolStatus;
  health: HealthMetrics;
  last_check: string;
}

class EngineService {
  /**
   * Get current engine status including worker pool and health metrics
   */
  async getStatus(): Promise<EngineStatus> {
    try {
      logger.debug('Fetching engine status...');

      // TODO: Connect to actual engine monitoring service
      // For now, return realistic mock data structure
      const engineStatus: EngineStatus = {
        status: 'healthy',
        pool: {
          active_workers: 4,
          total_workers: 8,
          queue_size: 12,
          queue_estimated_time_seconds: 450,
        },
        health: {
          cpu_percentage: 45.2,
          memory_percentage: 62.8,
          uptime_hours: 72.5,
        },
        last_check: new Date().toISOString(),
      };

      logger.debug('Engine status retrieved', engineStatus);
      return engineStatus;
    } catch (error) {
      logger.error('Failed to fetch engine status', error);
      throw new Error('Failed to fetch engine status');
    }
  }

  /**
   * Get worker pool status
   */
  async getWorkerPool(): Promise<PoolStatus> {
    const status = await this.getStatus();
    return status.pool;
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    const status = await this.getStatus();
    return status.health;
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const status = await this.getStatus();
    return status.pool.queue_size;
  }
}

export const engineService = new EngineService();
