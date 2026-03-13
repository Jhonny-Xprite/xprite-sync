/**
 * MetricsManager Service
 *
 * Handles batching and persistence of agent metrics.
 * Implements 5-second flush cycle to optimize database writes.
 *
 * Story: 3.4 - Agent Metrics & Observability
 */

import { createClient } from '@supabase/supabase-js';
import type { AgentExecutionMetrics } from '@packages/core/src/agents/interceptor';

export interface MetricsManagerConfig {
  flushIntervalMs?: number; // Default: 5000ms
  batchSize?: number; // Default: 100
  maxQueueSize?: number; // Default: 10000
}

/**
 * MetricsManager - Buffering and persistence service
 */
export class MetricsManager {
  private supabaseUrl: string;
  private supabaseServiceKey: string;
  private supabase: any;

  private metricsQueue: AgentExecutionMetrics[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  // Configuration
  private flushIntervalMs: number = 5000; // 5 seconds
  private batchSize: number = 100;
  private maxQueueSize: number = 10000;

  // Statistics
  private stats = {
    queued: 0,
    flushed: 0,
    failed: 0,
    totalLatency: 0,
    flushCount: 0,
  };

  constructor(config?: MetricsManagerConfig) {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);

    // Apply config
    if (config?.flushIntervalMs) this.flushIntervalMs = config.flushIntervalMs;
    if (config?.batchSize) this.batchSize = config.batchSize;
    if (config?.maxQueueSize) this.maxQueueSize = config.maxQueueSize;

    this.isInitialized = true;
  }

  /**
   * Queue metrics for batch processing
   */
  enqueue(metrics: AgentExecutionMetrics | AgentExecutionMetrics[]): void {
    if (!Array.isArray(metrics)) {
      metrics = [metrics];
    }

    // Check queue size limit
    if (this.metricsQueue.length + metrics.length > this.maxQueueSize) {
      console.warn(
        `⚠️ Metrics queue exceeds max size (${this.metricsQueue.length} + ${metrics.length} > ${this.maxQueueSize})`
      );
      // Drop oldest metrics to make room
      const overflow = this.metricsQueue.length + metrics.length - this.maxQueueSize;
      this.metricsQueue = this.metricsQueue.slice(overflow);
    }

    this.metricsQueue.push(...metrics);
    this.stats.queued += metrics.length;

    // Trigger flush if batch size reached
    if (this.metricsQueue.length >= this.batchSize) {
      this.flushImmediate();
    } else if (!this.flushTimer) {
      // Schedule flush
      this.scheduleFlush();
    }
  }

  /**
   * Flush metrics immediately
   */
  async flushImmediate(): Promise<void> {
    // Cancel scheduled flush
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();
  }

  /**
   * Schedule a flush after the interval
   */
  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(async () => {
      this.flushTimer = null;
      await this.flush();
    }, this.flushIntervalMs);
  }

  /**
   * Flush queued metrics to database
   */
  private async flush(): Promise<void> {
    if (this.metricsQueue.length === 0) {
      return;
    }

    const batch = this.metricsQueue.splice(0, this.batchSize);
    this.stats.flushCount++;

    try {
      // Transform metrics to database schema
      const records = batch.map((m) => ({
        agent_id: m.agentId,
        agent_name: m.agentName,
        team_id: m.teamId,
        status: m.status,
        latency_ms: m.latency_ms || 0,
        success_rate: m.success_rate || 0,
        error_count: m.error_count || 0,
        processed_count: m.processed_count || 0,
        memory_usage_mb: m.memory_used_mb || 0,
        cpu_percentage: m.cpu_percentage || 0,
        recorded_at: new Date(m.startTime).toISOString(),
      }));

      // Insert into Supabase
      const { error } = await this.supabase.from('agent_metrics').insert(records);

      if (error) {
        console.error('❌ Failed to flush metrics:', error);
        this.stats.failed += batch.length;
        // Re-queue failed metrics
        this.metricsQueue.unshift(...batch);
        throw error;
      }

      this.stats.flushed += batch.length;
      this.stats.totalLatency += batch.reduce((sum, m) => sum + (m.latency_ms || 0), 0);

      console.log(`✅ Flushed ${batch.length} metrics (${this.stats.flushed} total)`);

      // Schedule next flush if there are more metrics
      if (this.metricsQueue.length > 0) {
        this.scheduleFlush();
      }
    } catch (error) {
      console.error('Error in MetricsManager.flush():', error);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.metricsQueue.length;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      averageLatency: this.stats.flushed > 0 ? this.stats.totalLatency / this.stats.flushed : 0,
      queueSize: this.metricsQueue.length,
    };
  }

  /**
   * Wait for queue to drain
   */
  async drain(): Promise<void> {
    while (this.metricsQueue.length > 0) {
      await this.flushImmediate();
      // Small delay to allow for new metrics
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Shutdown gracefully
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    await this.drain();
    console.log('✅ MetricsManager shutdown complete');
  }
}

// Singleton instance
let metricsManagerInstance: MetricsManager | null = null;

export function getMetricsManager(config?: MetricsManagerConfig): MetricsManager {
  if (!metricsManagerInstance) {
    metricsManagerInstance = new MetricsManager(config);
  }
  return metricsManagerInstance;
}

// Auto-shutdown on process exit
if (typeof process !== 'undefined') {
  process.on('exit', async () => {
    if (metricsManagerInstance) {
      await metricsManagerInstance.shutdown();
    }
  });
}
