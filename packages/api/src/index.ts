import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { cacheMiddleware } from './middleware/cache';
import { getCacheService } from './services/cache';
import { createLogger } from './utils/logger';

const logger = createLogger('API');
const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cacheMiddleware);

// Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        cache: cache.isAvailable() ? 'ok' : 'degraded',
        realtime: 'ok',
        database: 'ok'
      }
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'One or more services are down'
    });
  }
});

// Metrics Endpoint
app.get('/api/metrics', (req: Request, res: Response) => {
  const agentId = req.query.agentId || 'all';
  const limit = parseInt(req.query.limit as string) || 10;

  const metrics = [];
  for (let i = 0; i < limit; i++) {
    metrics.push({
      agentId: agentId === 'all' ? `agent-${i + 1}` : agentId,
      status: ['running', 'idle', 'paused'][Math.floor(Math.random() * 3)],
      latency_ms: Math.floor(Math.random() * 100) + 20,
      success_rate: Math.random() * 5 + 95,
      error_count: Math.floor(Math.random() * 5),
      processed_count: Math.floor(Math.random() * 2000) + 500,
      memory_usage_mb: Math.floor(Math.random() * 256) + 64,
      cpu_percentage: Math.random() * 80,
      timestamp: new Date(Date.now() - i * 10000).toISOString()
    });
  }

  res.status(200).json({
    data: metrics,
    total: metrics.length,
    limit
  });
});

// System Metrics Endpoint
app.get('/api/system-metrics', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const metrics = [];
  for (let i = 0; i < limit; i++) {
    metrics.push({
      timestamp: new Date(Date.now() - i * 10000).toISOString(),
      cpu_percentage: Math.random() * 80,
      memory_percentage: Math.random() * 60 + 30,
      memory_used_gb: (Math.random() * 6 + 4).toFixed(1),
      disk_used_gb: Math.floor(Math.random() * 500) + 200,
      network_in_mbps: Math.floor(Math.random() * 200) + 50,
      network_out_mbps: Math.floor(Math.random() * 150) + 30,
      db_connections: Math.floor(Math.random() * 30) + 5,
      api_requests_per_sec: Math.floor(Math.random() * 1000) + 200,
      api_error_rate: (Math.random() * 2).toFixed(2)
    });
  }

  res.status(200).json({
    data: metrics,
    total: metrics.length,
    limit
  });
});

// Cache Stats Endpoint
app.get('/api/cache-stats', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();
    const stats = cache.getStats();

    res.status(200).json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get cache stats', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear Cache Endpoint
app.delete('/api/cache', async (req: Request, res: Response) => {
  try {
    const cache = await getCacheService();
    await cache.clear();

    res.status(200).json({
      message: 'Cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to clear cache', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Start Server
const server = app.listen(PORT, async () => {
  const cache = await getCacheService();
  logger.info(`✅ AIOX Dashboard API listening on http://localhost:${PORT}`);
  logger.info(`📊 Health: http://localhost:${PORT}/api/health`);
  logger.info(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
  logger.info(`Cache: ${cache.isAvailable() ? '✅ Enabled' : '⚠️  Disabled (Redis not available)'}`);
});

// Graceful Shutdown
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
