import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { cacheMiddleware } from './middleware/cache';
import { getCacheService } from './services/cache';
import { createLogger } from './utils/logger';
import { supabaseService } from './services/supabase';
import { systemMetricsCollector } from './services/system-metrics';
import { storiesService } from './services/stories';
import { githubService } from './services/github';
import { engineService } from './services/engine';
import { tasksService } from './services/tasks';
import { workflowsService } from './services/workflows';

const logger = createLogger('API');
const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cacheMiddleware);

// Default team ID for metrics (use from env or default)
const DEFAULT_TEAM_ID = process.env.TEAM_ID || '00000000-0000-0000-0000-000000000000';

// ============================================================
// Health Check Endpoint
// ============================================================
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        cache: cache.isAvailable() ? 'ok' : 'degraded',
        supabase: 'ok',
        realtime: 'ok',
      },
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'One or more services are down',
    });
  }
});

// ============================================================
// Agent Metrics Endpoint — Real data from Supabase
// ============================================================
app.get('/api/metrics', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId as string) || undefined;
    const limit = parseInt((req.query.limit as string) || '10');

    // Fetch real metrics from Supabase
    const metrics = await supabaseService.getAgentMetrics(limit, agentId);

    // If no data in Supabase, generate placeholder data
    if (metrics.length === 0) {
      logger.info('No agent metrics in Supabase, returning placeholder');
      const placeholder = {
        id: 'placeholder-1',
        agent_id: agentId || 'all',
        team_id: DEFAULT_TEAM_ID,
        status: 'idle' as const,
        latency_ms: 0,
        success_rate: 0,
        error_count: 0,
        processed_count: 0,
        memory_usage_mb: 0,
        cpu_percentage: 0,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.status(200).json({
        data: [placeholder],
        total: 1,
        limit,
        message: 'No data in database yet. Insert agent metrics to see real data.',
      });
    }

    res.status(200).json({
      data: metrics,
      total: metrics.length,
      limit,
    });
  } catch (error) {
    logger.error('Failed to fetch agent metrics', error);
    res.status(500).json({
      error: 'Failed to fetch agent metrics',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// System Metrics Endpoint — Real data from OS + Supabase
// ============================================================
app.get('/api/system-metrics', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10');

    // Get real system metrics from OS
    const systemMetrics = systemMetricsCollector.getMetrics();

    // Also fetch from Supabase
    const supabaseMetrics = await supabaseService.getSystemMetrics(limit);

    // Combine: real-time OS metrics + historical Supabase data
    const response = {
      realtime: systemMetricsCollector.formatForAPI(systemMetrics),
      historical: supabaseMetrics,
      total: supabaseMetrics.length,
      limit,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch system metrics', error);
    res.status(500).json({
      error: 'Failed to fetch system metrics',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Agent Status Summary Endpoint
// ============================================================
app.get('/api/agents/summary', async (req: Request, res: Response) => {
  try {
    const statusCounts = await supabaseService.getAgentMetricsByStatus();
    const avgMetrics = await supabaseService.getAverageAgentMetrics();

    res.status(200).json({
      timestamp: new Date().toISOString(),
      agents: statusCounts,
      total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      averageMetrics: avgMetrics,
    });
  } catch (error) {
    logger.error('Failed to fetch agent summary', error);
    res.status(500).json({
      error: 'Failed to fetch agent summary',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Cache Stats Endpoint
// ============================================================
app.get('/api/cache-stats', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();
    const stats = cache.getStats();

    res.status(200).json({
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get cache stats', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// ============================================================
// Clear Cache Endpoint
// ============================================================
app.delete('/api/cache', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();
    await cache.clear();

    res.status(200).json({
      message: 'Cache cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to clear cache', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// ============================================================
// Insert Agent Metric Endpoint — For testing
// ============================================================
app.post('/api/metrics/insert', async (req: Request, res: Response) => {
  try {
    const metric = req.body;

    // Validate required fields
    if (!metric.agent_id || !metric.team_id) {
      return res.status(400).json({
        error: 'Missing required fields: agent_id, team_id',
      });
    }

    const success = await supabaseService.insertAgentMetric({
      agent_id: metric.agent_id,
      team_id: metric.team_id,
      status: metric.status || 'idle',
      latency_ms: metric.latency_ms || 0,
      success_rate: metric.success_rate || 0,
      error_count: metric.error_count || 0,
      processed_count: metric.processed_count || 0,
      memory_usage_mb: metric.memory_usage_mb || 0,
      cpu_percentage: metric.cpu_percentage || 0,
      recorded_at: new Date().toISOString(),
    });

    if (!success) {
      return res.status(500).json({
        error: 'Failed to insert metric',
      });
    }

    res.status(201).json({
      message: 'Metric inserted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to insert metric', error);
    res.status(500).json({
      error: 'Failed to insert metric',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Insert System Metric Endpoint — For testing
// ============================================================
app.post('/api/system-metrics/insert', async (req: Request, res: Response) => {
  try {
    const metric = req.body;

    // Validate required fields
    if (!metric.team_id) {
      return res.status(400).json({
        error: 'Missing required field: team_id',
      });
    }

    const success = await supabaseService.insertSystemMetric({
      team_id: metric.team_id,
      cpu_percentage: metric.cpu_percentage || 0,
      memory_percentage: metric.memory_percentage || 0,
      memory_used_gb: metric.memory_used_gb || 0,
      memory_total_gb: metric.memory_total_gb || 0,
      disk_used_gb: metric.disk_used_gb || 0,
      disk_total_gb: metric.disk_total_gb || 0,
      network_in_mbps: metric.network_in_mbps || 0,
      network_out_mbps: metric.network_out_mbps || 0,
      db_connections: metric.db_connections || 0,
      db_query_time_ms: metric.db_query_time_ms || 0,
      api_requests_per_sec: metric.api_requests_per_sec || 0,
      api_error_rate: metric.api_error_rate || 0,
      recorded_at: new Date().toISOString(),
    });

    if (!success) {
      return res.status(500).json({
        error: 'Failed to insert system metric',
      });
    }

    res.status(201).json({
      message: 'System metric inserted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to insert system metric', error);
    res.status(500).json({
      error: 'Failed to insert system metric',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Stories Endpoint — Real stories from docs/stories/
// ============================================================
app.get('/api/stories', async (req: Request, res: Response) => {
  try {
    const epic = (req.query.epic as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const limit = parseInt((req.query.limit as string) || '50');

    const response = await storiesService.getStories(epic, status, limit);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch stories', error);
    res.status(500).json({
      error: 'Failed to fetch stories',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// GitHub Endpoints — Real data from GitHub
// ============================================================
app.get('/api/github/commits', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '10');
    const response = await githubService.getRecentCommits(limit);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch commits', error);
    res.status(500).json({
      error: 'Failed to fetch commits',
      message: (error as Error).message,
    });
  }
});

app.get('/api/github/prs', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const limit = parseInt((req.query.limit as string) || '20');
    const response = await githubService.getPullRequests(
      status as 'open' | 'all',
      limit
    );

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch pull requests', error);
    res.status(500).json({
      error: 'Failed to fetch pull requests',
      message: (error as Error).message,
    });
  }
});

app.get('/api/github/branches', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '20');
    const response = await githubService.getBranches(limit);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch branches', error);
    res.status(500).json({
      error: 'Failed to fetch branches',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Engine Status Endpoint — Real-time engine health
// ============================================================
app.get('/api/engine/status', async (req: Request, res: Response) => {
  try {
    const response = await engineService.getStatus();

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch engine status', error);
    res.status(500).json({
      error: 'Failed to fetch engine status',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Tasks Listing Endpoint — Active tasks and stats
// ============================================================
app.get('/api/tasks/list', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const limit = parseInt((req.query.limit as string) || '20');
    const response = await tasksService.listTasks(
      status as 'pending' | 'running' | 'completed' | 'failed' | 'all',
      limit
    );

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch tasks', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Workflows Listing Endpoint — Active workflows and stats
// ============================================================
app.get('/api/workflows/list', async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const limit = parseInt((req.query.limit as string) || '20');
    const response = await workflowsService.listWorkflows(
      status as 'running' | 'paused' | 'completed' | 'failed' | 'all',
      limit
    );

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch workflows', error);
    res.status(500).json({
      error: 'Failed to fetch workflows',
      message: (error as Error).message,
    });
  }
});

// ============================================================
// Start Server
// ============================================================
const server = app.listen(PORT, async () => {
  const cache = await getCacheService();
  logger.info(`✅ AIOX Dashboard API listening on http://localhost:${PORT}`);
  logger.info(`📊 Health: http://localhost:${PORT}/api/health`);
  logger.info(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
  logger.info(`💾 Supabase: Connected to ${process.env.SUPABASE_URL || 'default'}`);
  logger.info(`Cache: ${cache.isAvailable() ? '✅ Enabled' : '⚠️  Disabled (Redis not available)'}`);
});

// ============================================================
// Graceful Shutdown
// ============================================================
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');

  server.close(async () => {
    const cache = await getCacheService();
    await cache.shutdown();

    logger.info('✅ Server shut down');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');

  server.close(async () => {
    const cache = await getCacheService();
    await cache.shutdown();

    logger.info('✅ Server shut down');
    process.exit(0);
  });
});

export default app;
