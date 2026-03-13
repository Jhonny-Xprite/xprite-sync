import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { withSpan, getCorrelationId } from '../tracing';
import { getRealtimeService } from '../services/realtime';
import { getCacheService } from '../services/cache';

const logger = new Logger('MetricsController');

/**
 * Example instrumented controller with distributed tracing
 * Shows best practices for integrating tracing and logging
 */

export async function getAgentMetrics(req: Request, res: Response): Promise<void> {
  const correlationId = getCorrelationId();
  const logContext = logger.withContext({ correlationId });

  await withSpan('getAgentMetrics', async (span) => {
    try {
      const { agentId } = req.query;
      logContext.debug('Fetching agent metrics', { agentId });

      span.addEvent('cache_lookup_start');

      // Try cache first
      const cache = await getCacheService();
      const cacheKey = `cache:metrics:${agentId}`;
      const cachedMetrics = await cache.get(cacheKey);

      if (cachedMetrics) {
        span.addEvent('cache_hit');
        logContext.debug('Cache hit for agent metrics', { agentId });

        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedMetrics);
      }

      span.addEvent('cache_miss');
      logContext.debug('Cache miss, fetching from database', { agentId });

      // Fetch from Realtime/Database
      const realtime = getRealtimeService();
      const metrics = await withSpan(
        'fetch_from_realtime',
        async (innerSpan) => {
          innerSpan.setAttribute('agent_id', String(agentId));

          // Simulate fetch (would call actual Realtime service)
          const data = {
            agentId,
            metrics: [
              { timestamp: new Date(), latency_ms: 45, success_rate: 98.5 },
              { timestamp: new Date(), latency_ms: 52, success_rate: 99.1 },
            ],
          };

          logContext.debug('Fetched metrics from Realtime', {
            agentId,
            count: data.metrics.length,
          });

          return data;
        }
      );

      // Cache the result
      await cache.set(cacheKey, metrics, { prefix: 'metrics' });
      logContext.debug('Cached metrics', { agentId });

      res.setHeader('X-Cache', 'MISS');
      res.status(200).json(metrics);
    } catch (error) {
      logContext.error('Failed to fetch metrics', error, { agentId: req.query.agentId });
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });
}

export async function getSystemMetrics(req: Request, res: Response): Promise<void> {
  const correlationId = getCorrelationId();
  const logContext = logger.withContext({ correlationId });

  await withSpan('getSystemMetrics', async (span) => {
    try {
      logContext.info('Fetching system metrics');

      span.addEvent('system_metrics_collection_start');

      // Simulate collecting system metrics
      const systemMetrics = {
        timestamp: new Date(),
        cpu_percentage: 45.2,
        memory_percentage: 62.8,
        disk_used_gb: 250,
        network_in_mbps: 125,
        network_out_mbps: 98,
      };

      logContext.debug('System metrics collected', {
        cpu: systemMetrics.cpu_percentage,
        memory: systemMetrics.memory_percentage,
      });

      span.addEvent('system_metrics_collection_complete');
      res.status(200).json(systemMetrics);
    } catch (error) {
      logContext.error('Failed to collect system metrics', error);
      res.status(500).json({ error: 'Failed to collect system metrics' });
    }
  });
}

export async function submitAgentMetrics(req: Request, res: Response): Promise<void> {
  const correlationId = getCorrelationId();
  const logContext = logger.withContext({ correlationId });

  await withSpan('submitAgentMetrics', async (span) => {
    try {
      const { agentId, status, latency_ms } = req.body;

      logContext.info('Agent metrics submitted', {
        agentId,
        status,
        latency_ms,
      });

      span.setAttributes({
        'agent.id': agentId,
        'agent.status': status,
        'agent.latency_ms': latency_ms,
      });

      // Store metrics
      const realtime = getRealtimeService();
      await realtime.broadcastAgentMetric({
        agentId,
        teamId: 'default',
        status,
        latency_ms,
        success_rate: 98.5,
        error_count: 0,
        processed_count: 1000,
        memory_usage_mb: 128,
        cpu_percentage: 25.5,
      });

      logContext.debug('Agent metrics stored', { agentId });

      res.status(202).json({
        message: 'Metrics accepted for processing',
        correlationId,
      });
    } catch (error) {
      logContext.error('Failed to submit metrics', error, { body: req.body });
      res.status(500).json({ error: 'Failed to submit metrics' });
    }
  });
}

/**
 * Health check with trace context
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  await withSpan('healthCheck', async (span) => {
    const cache = await getCacheService();
    const realtime = getRealtimeService();

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        cache: cache.isAvailable() ? 'ok' : 'degraded',
        realtime: true,
        database: true,
      },
      correlationId: getCorrelationId(),
    };

    res.status(200).json(health);
  });
}
