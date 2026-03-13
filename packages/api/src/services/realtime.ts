/**
 * RealtimeService
 *
 * Handles real-time data broadcasting to connected dashboard clients
 * using Supabase Realtime (PostgreSQL logical replication).
 *
 * Story: 3.2 - Integração de Dados em Tempo Real
 */

import { createClient } from '@supabase/supabase-js';

// Message format versioning
const MESSAGE_VERSION = '1.0';

// Message type definitions
interface BaseMessage {
  type: string;
  version: string;
  timestamp: string;
}

export interface AgentMetricUpdate extends BaseMessage {
  type: 'agent_metric_update';
  data: {
    agentId: string;
    teamId: string;
    status: 'running' | 'idle' | 'error' | 'paused';
    latency_ms: number;
    success_rate: number;
    error_count: number;
    processed_count: number;
    memory_usage_mb: number;
    cpu_percentage: number;
  };
}

export interface SystemMetricUpdate extends BaseMessage {
  type: 'system_metric_update';
  data: {
    teamId: string;
    cpu_percentage: number;
    memory_percentage: number;
    memory_used_gb: number;
    disk_used_gb: number;
    network_in_mbps: number;
    db_connections: number;
    api_requests_per_sec: number;
    api_error_rate: number;
  };
}

export interface WorkflowLogUpdate extends BaseMessage {
  type: 'workflow_log_update';
  data: {
    workflowId: string;
    teamId: string;
    status: 'running' | 'completed' | 'failed';
    started_at: string;
    duration_ms?: number;
    error_message?: string;
  };
}

export type RealtimeMessage = AgentMetricUpdate | SystemMetricUpdate | WorkflowLogUpdate;

/**
 * RealtimeService
 *
 * Manages real-time subscriptions and broadcasting.
 * Leverages Supabase Realtime for automatic change detection.
 */
export class RealtimeService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private supabase: any; // Supabase client

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('Missing Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY)');
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
  }

  /**
   * Broadcast an agent metric update
   *
   * Updates are automatically replicated to all subscribed dashboard clients
   * via Supabase Realtime subscriptions.
   */
  async broadcastAgentMetric(payload: Omit<AgentMetricUpdate['data'], 'teamId'>, teamId: string): Promise<void> {
    try {
      const message: AgentMetricUpdate = {
        type: 'agent_metric_update',
        version: MESSAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: {
          ...payload,
          teamId,
        },
      };

      // Insert into database - Realtime automatically broadcasts to subscribers
      const { error } = await this.supabase
        .from('agent_metrics')
        .insert({
          agent_id: payload.agentId,
          team_id: teamId,
          status: payload.status,
          latency_ms: payload.latency_ms,
          success_rate: payload.success_rate,
          error_count: payload.error_count,
          processed_count: payload.processed_count,
          memory_usage_mb: payload.memory_usage_mb,
          cpu_percentage: payload.cpu_percentage,
          recorded_at: message.timestamp,
        });

      if (error) {
        console.error('❌ Failed to broadcast agent metric:', error);
        throw new Error(`Realtime broadcast failed: ${error.message}`);
      }

      console.log(`✅ Agent metric broadcasted for agent ${payload.agentId}`);
    } catch (error) {
      console.error('Error in broadcastAgentMetric:', error);
      throw error;
    }
  }

  /**
   * Broadcast a system metric update
   */
  async broadcastSystemMetric(payload: Omit<SystemMetricUpdate['data'], 'teamId'>, teamId: string): Promise<void> {
    try {
      const message: SystemMetricUpdate = {
        type: 'system_metric_update',
        version: MESSAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: {
          ...payload,
          teamId,
        },
      };

      // Insert into database - Realtime automatically broadcasts
      const { error } = await this.supabase
        .from('system_metrics')
        .insert({
          team_id: teamId,
          cpu_percentage: payload.cpu_percentage,
          memory_percentage: payload.memory_percentage,
          memory_used_gb: payload.memory_used_gb,
          disk_used_gb: payload.disk_used_gb,
          network_in_mbps: payload.network_in_mbps,
          db_connections: payload.db_connections,
          api_requests_per_sec: payload.api_requests_per_sec,
          api_error_rate: payload.api_error_rate,
          recorded_at: message.timestamp,
        });

      if (error) {
        console.error('❌ Failed to broadcast system metric:', error);
        throw new Error(`Realtime broadcast failed: ${error.message}`);
      }

      console.log(`✅ System metric broadcasted for team ${teamId}`);
    } catch (error) {
      console.error('Error in broadcastSystemMetric:', error);
      throw error;
    }
  }

  /**
   * Broadcast a workflow log update
   */
  async broadcastWorkflowLog(payload: WorkflowLogUpdate['data']): Promise<void> {
    try {
      const message: WorkflowLogUpdate = {
        type: 'workflow_log_update',
        version: MESSAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      // Insert into database - Realtime automatically broadcasts
      const { error } = await this.supabase
        .from('workflow_logs')
        .insert({
          workflow_id: payload.workflowId,
          team_id: payload.teamId,
          status: payload.status,
          started_at: payload.started_at,
          completed_at: payload.status === 'completed' ? new Date().toISOString() : null,
          duration_ms: payload.duration_ms,
          error_message: payload.error_message,
        });

      if (error) {
        console.error('❌ Failed to broadcast workflow log:', error);
        throw new Error(`Realtime broadcast failed: ${error.message}`);
      }

      console.log(`✅ Workflow log broadcasted for workflow ${payload.workflowId}`);
    } catch (error) {
      console.error('Error in broadcastWorkflowLog:', error);
      throw error;
    }
  }

  /**
   * Health check for Realtime connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('agent_metrics')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Realtime health check failed:', error);
        return false;
      }

      console.log('✅ Realtime service healthy');
      return true;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }
}

// Export singleton instance
let realtimeServiceInstance: RealtimeService | null = null;

export function getRealtimeService(): RealtimeService {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService();
  }
  return realtimeServiceInstance;
}
