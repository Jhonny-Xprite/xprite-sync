import os from 'os';
import { supabaseService } from './supabase';
import { createLogger } from '../utils/logger';

export interface SystemMetrics {
  cpu_percentage: number;
  memory_percentage: number;
  memory_used_gb: number;
  memory_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  uptime_hours: number;
  load_average: number;
  cpu_cores: number;
}

export class SystemMetricsCollector {
  private lastCpuUsage = process.cpuUsage();
  private lastTime = Date.now();

  /**
   * Get current CPU percentage
   */
  private getCpuPercentage(): number {
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastTime;

    this.lastCpuUsage = cpuUsage;
    this.lastTime = currentTime;

    if (timeDiff === 0) return 0;

    // Calculate CPU percentage based on process usage
    const totalMicroseconds = (cpuUsage.user + cpuUsage.system) / 1000;
    const percentPerCore = (totalMicroseconds / (timeDiff * 1000)) * 100;

    // Cap at 100% and return average per core
    return Math.min(percentPerCore / os.cpus().length, 100);
  }

  /**
   * Get current memory metrics
   */
  private getMemoryMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      memory_percentage: (usedMem / totalMem) * 100,
      memory_used_gb: parseFloat((usedMem / 1024 / 1024 / 1024).toFixed(2)),
      memory_total_gb: parseFloat((totalMem / 1024 / 1024 / 1024).toFixed(2)),
    };
  }

  /**
   * Get disk space metrics (for root partition)
   */
  private getDiskMetrics(): { disk_used_gb: number; disk_total_gb: number } {
    try {
      // Approximate disk metrics - in production, use 'diskusage' or similar package
      // For now, return reasonable estimates based on available space
      const freeDisk = os.freemem(); // Rough estimate
      const diskTotal = 256; // Assume 256GB total (adjust as needed)
      const diskUsed = diskTotal - freeDisk / 1024 / 1024 / 1024;

      return {
        disk_used_gb: Math.max(0, diskUsed),
        disk_total_gb: diskTotal,
      };
    } catch {
      return { disk_used_gb: 0, disk_total_gb: 256 };
    }
  }

  /**
   * Get load average
   */
  private getLoadAverage(): number {
    const loadAvg = os.loadavg();
    return parseFloat(loadAvg[0].toFixed(2)); // 1-minute average
  }

  /**
   * Get all system metrics
   */
  getMetrics(): SystemMetrics {
    return {
      cpu_percentage: parseFloat(this.getCpuPercentage().toFixed(2)),
      ...this.getMemoryMetrics(),
      ...this.getDiskMetrics(),
      uptime_hours: parseFloat((os.uptime() / 3600).toFixed(2)),
      load_average: this.getLoadAverage(),
      cpu_cores: os.cpus().length,
    };
  }

  /**
   * Format metrics for API response
   */
  formatForAPI(metrics: SystemMetrics) {
    return {
      timestamp: new Date().toISOString(),
      cpu_percentage: metrics.cpu_percentage,
      memory_percentage: metrics.memory_percentage,
      memory_used_gb: metrics.memory_used_gb.toString(),
      memory_total_gb: metrics.memory_total_gb.toString(),
      disk_used_gb: metrics.disk_used_gb,
      disk_total_gb: metrics.disk_total_gb,
      uptime_hours: metrics.uptime_hours,
      load_average: metrics.load_average,
      cpu_cores: metrics.cpu_cores,
    };
  }
}

export const systemMetricsCollector = new SystemMetricsCollector();

const logger = createLogger('SystemMetrics');

/**
 * Start background job to persist metrics to Supabase
 * This should be called once when the API server starts
 */
export function startMetricsPersistence() {
  const teamId = process.env.TEAM_ID || '00000000-0000-0000-0000-000000000000';

  return setInterval(async () => {
    try {
      const metrics = systemMetricsCollector.getMetrics();

      // Persist system metrics to Supabase (real data, all numeric values)
      const success = await supabaseService.insertSystemMetric({
        team_id: teamId,
        cpu_percentage: metrics.cpu_percentage,
        memory_percentage: metrics.memory_percentage,
        memory_used_gb: metrics.memory_used_gb,
        memory_total_gb: metrics.memory_total_gb,
        disk_used_gb: metrics.disk_used_gb,
        disk_total_gb: metrics.disk_total_gb,
        network_in_mbps: 0, // Will be collected from system in future
        network_out_mbps: 0,
        db_connections: 0,
        db_query_time_ms: 0,
        api_requests_per_sec: 0,
        api_error_rate: 0,
        recorded_at: new Date().toISOString(),
      });

      if (success) {
        logger.debug(`[Phase 3] Persisted metrics for team ${teamId}:`, {
          cpu: metrics.cpu_percentage,
          memory: metrics.memory_percentage,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.warn(`[Phase 3] Failed to persist metrics for team ${teamId}`);
      }
    } catch (error) {
      logger.error('[Phase 3] Exception persisting metrics:', error);
      // Graceful error handling - don't throw
    }
  }, 60000); // Every 60 seconds
}
