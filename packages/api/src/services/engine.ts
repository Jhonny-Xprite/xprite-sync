import { createLogger } from '../utils/logger';
import { systemMetricsCollector } from './system-metrics';

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
  private getStatusFromMetrics(cpu: number, memory: number): 'healthy' | 'degraded' | 'critical' {
    // Critical: CPU > 85% or Memory > 90%
    if (cpu > 85 || memory > 90) {
      return 'critical';
    }
    // Degraded: CPU > 70% or Memory > 75%
    if (cpu > 70 || memory > 75) {
      return 'degraded';
    }
    // Healthy: Normal operation
    return 'healthy';
  }

  /**
   * Get current engine status including worker pool and health metrics
   */
  async getStatus(): Promise<EngineStatus> {
    try {
      logger.debug('Fetching engine status...');

      // Get real system metrics
      const metrics = systemMetricsCollector.getMetrics();

      // Estimate worker pool based on system load
      const cpuCores = metrics.cpu_cores;
      const totalWorkers = Math.max(4, cpuCores * 2);
      const activeWorkers = Math.floor((metrics.cpu_percentage / 100) * totalWorkers);
      const queueSize = Math.floor(Math.random() * 20); // Simulate queue depth
      const queueEstimatedSeconds = queueSize > 0 ? queueSize * 60 : 0; // Assume 60s per task

      const status = this.getStatusFromMetrics(metrics.cpu_percentage, metrics.memory_percentage);

      const engineStatus: EngineStatus = {
        status,
        pool: {
          active_workers: Math.min(activeWorkers, totalWorkers),
          total_workers: totalWorkers,
          queue_size: queueSize,
          queue_estimated_time_seconds: queueEstimatedSeconds,
        },
        health: {
          cpu_percentage: metrics.cpu_percentage,
          memory_percentage: metrics.memory_percentage,
          uptime_hours: metrics.uptime_hours,
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
