/**
 * MetricsController
 *
 * Handles metric collection endpoints that broadcast updates
 * via Realtime to connected dashboard clients.
 *
 * Story: 3.2 - Integração de Dados em Tempo Real
 */

import { getRealtimeService } from '../services/realtime';

/**
 * Submit agent metrics and broadcast to dashboard
 *
 * Request body:
 * {
 *   agentId: string,
 *   teamId: string,
 *   status: 'running' | 'idle' | 'error' | 'paused',
 *   latency_ms: number,
 *   success_rate: number,
 *   error_count: number,
 *   processed_count: number,
 *   memory_usage_mb: number,
 *   cpu_percentage: number
 * }
 */
export async function submitAgentMetrics(req: any, res: any): Promise<void> {
  try {
    const {
      agentId,
      teamId,
      status,
      latency_ms,
      success_rate,
      error_count,
      processed_count,
      memory_usage_mb,
      cpu_percentage,
    } = req.body;

    // Validate required fields
    if (!agentId || !teamId || !status) {
      res.status(400).json({
        error: 'Missing required fields: agentId, teamId, status',
      });
      return;
    }

    // Validate field types
    if (typeof latency_ms !== 'number' || typeof success_rate !== 'number') {
      res.status(400).json({
        error: 'Invalid field types: latency_ms and success_rate must be numbers',
      });
      return;
    }

    // Broadcast to Realtime subscribers
    const realtimeService = getRealtimeService();

    await realtimeService.broadcastAgentMetric(
      {
        agentId,
        status,
        latency_ms,
        success_rate,
        error_count: error_count || 0,
        processed_count: processed_count || 0,
        memory_usage_mb: memory_usage_mb || 0,
        cpu_percentage: cpu_percentage || 0,
      },
      teamId
    );

    res.status(200).json({
      status: 'success',
      message: `Agent metrics received and broadcasted for agent ${agentId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in submitAgentMetrics:', error);
    res.status(500).json({
      error: 'Failed to process agent metrics',
      details: error.message,
    });
  }
}

/**
 * Submit system metrics and broadcast to dashboard
 *
 * Request body:
 * {
 *   teamId: string,
 *   cpu_percentage: number,
 *   memory_percentage: number,
 *   memory_used_gb: number,
 *   disk_used_gb: number,
 *   network_in_mbps: number,
 *   db_connections: number,
 *   api_requests_per_sec: number,
 *   api_error_rate: number
 * }
 */
export async function submitSystemMetrics(req: any, res: any): Promise<void> {
  try {
    const {
      teamId,
      cpu_percentage,
      memory_percentage,
      memory_used_gb,
      disk_used_gb,
      network_in_mbps,
      db_connections,
      api_requests_per_sec,
      api_error_rate,
    } = req.body;

    // Validate required fields
    if (!teamId || typeof cpu_percentage !== 'number') {
      res.status(400).json({
        error: 'Missing required fields: teamId, cpu_percentage',
      });
      return;
    }

    // Broadcast to Realtime subscribers
    const realtimeService = getRealtimeService();

    await realtimeService.broadcastSystemMetric(
      {
        cpu_percentage,
        memory_percentage: memory_percentage || 0,
        memory_used_gb: memory_used_gb || 0,
        disk_used_gb: disk_used_gb || 0,
        network_in_mbps: network_in_mbps || 0,
        db_connections: db_connections || 0,
        api_requests_per_sec: api_requests_per_sec || 0,
        api_error_rate: api_error_rate || 0,
      },
      teamId
    );

    res.status(200).json({
      status: 'success',
      message: `System metrics received and broadcasted for team ${teamId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in submitSystemMetrics:', error);
    res.status(500).json({
      error: 'Failed to process system metrics',
      details: error.message,
    });
  }
}

/**
 * Submit workflow log and broadcast to dashboard
 *
 * Request body:
 * {
 *   workflowId: string,
 *   teamId: string,
 *   status: 'running' | 'completed' | 'failed',
 *   started_at: string,
 *   duration_ms?: number,
 *   error_message?: string
 * }
 */
export async function submitWorkflowLog(req: any, res: any): Promise<void> {
  try {
    const { workflowId, teamId, status, started_at, duration_ms, error_message } = req.body;

    // Validate required fields
    if (!workflowId || !teamId || !status || !started_at) {
      res.status(400).json({
        error: 'Missing required fields: workflowId, teamId, status, started_at',
      });
      return;
    }

    // Broadcast to Realtime subscribers
    const realtimeService = getRealtimeService();

    await realtimeService.broadcastWorkflowLog({
      workflowId,
      teamId,
      status,
      started_at,
      duration_ms,
      error_message,
    });

    res.status(200).json({
      status: 'success',
      message: `Workflow log received and broadcasted for workflow ${workflowId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in submitWorkflowLog:', error);
    res.status(500).json({
      error: 'Failed to process workflow log',
      details: error.message,
    });
  }
}

/**
 * Health check endpoint
 */
export async function health(req: any, res: any): Promise<void> {
  try {
    const realtimeService = getRealtimeService();
    const isHealthy = await realtimeService.healthCheck();

    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'metrics-api',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'metrics-api',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      service: 'metrics-api',
      details: error.message,
    });
  }
}
