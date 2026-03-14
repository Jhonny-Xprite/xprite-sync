import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xsyixazfqnsvvdsihccv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeWl4YXpmcW5zdnZkc2loY2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDYwMTEsImV4cCI6MjA4Nzc4MjAxMX0.2EvbK_psB0CesFjq1YE8kiR1j-00BswNJMmSWKAnuyo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface AgentMetricRow {
  id: string;
  agent_id: string;
  team_id: string;
  status: 'running' | 'idle' | 'error' | 'paused';
  latency_ms: number;
  success_rate: number;
  error_count: number;
  processed_count: number;
  memory_usage_mb: number;
  cpu_percentage: number;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetricRow {
  id: string;
  team_id: string;
  cpu_percentage: number;
  memory_percentage: number;
  memory_used_gb: number;
  memory_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  network_in_mbps: number;
  network_out_mbps: number;
  db_connections: number;
  db_query_time_ms: number;
  api_requests_per_sec: number;
  api_error_rate: number;
  recorded_at: string;
  created_at: string;
}

export class SupabaseService {
  /**
   * Fetch latest agent metrics
   */
  async getAgentMetrics(limit: number = 10, agentId?: string): Promise<AgentMetricRow[]> {
    try {
      let query = supabase
        .from('agent_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (agentId && agentId !== 'all') {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agent metrics:', error);
        return [];
      }

      return (data as AgentMetricRow[]) || [];
    } catch (error) {
      console.error('Exception fetching agent metrics:', error);
      return [];
    }
  }

  /**
   * Fetch latest system metrics
   */
  async getSystemMetrics(limit: number = 10): Promise<SystemMetricRow[]> {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching system metrics:', error);
        return [];
      }

      return (data as SystemMetricRow[]) || [];
    } catch (error) {
      console.error('Exception fetching system metrics:', error);
      return [];
    }
  }

  /**
   * Fetch agent metrics aggregated by status
   */
  async getAgentMetricsByStatus(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('agent_metrics')
        .select('status')
        .order('recorded_at', { ascending: false })
        .limit(1000);

      if (error || !data) {
        return { running: 0, idle: 0, error: 0, paused: 0 };
      }

      const statusCounts = { running: 0, idle: 0, error: 0, paused: 0 };
      (data as { status: string }[]).forEach((metric) => {
        if (metric.status in statusCounts) {
          statusCounts[metric.status as keyof typeof statusCounts]++;
        }
      });

      return statusCounts;
    } catch (error) {
      console.error('Exception getting agent metrics by status:', error);
      return { running: 0, idle: 0, error: 0, paused: 0 };
    }
  }

  /**
   * Get average metrics across all agents
   */
  async getAverageAgentMetrics(): Promise<Partial<AgentMetricRow> | null> {
    try {
      const { data, error } = await supabase
        .from('agent_metrics')
        .select('latency_ms, success_rate, error_count, processed_count, memory_usage_mb, cpu_percentage')
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) {
        return null;
      }

      const count = data.length;
      const sum = (data as any[]).reduce(
        (acc, metric) => ({
          latency_ms: (acc.latency_ms || 0) + (metric.latency_ms || 0),
          success_rate: (acc.success_rate || 0) + (metric.success_rate || 0),
          error_count: (acc.error_count || 0) + (metric.error_count || 0),
          processed_count: (acc.processed_count || 0) + (metric.processed_count || 0),
          memory_usage_mb: (acc.memory_usage_mb || 0) + (metric.memory_usage_mb || 0),
          cpu_percentage: (acc.cpu_percentage || 0) + (metric.cpu_percentage || 0),
        }),
        {}
      );

      return {
        latency_ms: Math.round(sum.latency_ms / count),
        success_rate: Number((sum.success_rate / count).toFixed(2)),
        error_count: Math.round(sum.error_count / count),
        processed_count: Math.round(sum.processed_count / count),
        memory_usage_mb: Math.round(sum.memory_usage_mb / count),
        cpu_percentage: Number((sum.cpu_percentage / count).toFixed(2)),
      };
    } catch (error) {
      console.error('Exception getting average agent metrics:', error);
      return null;
    }
  }

  /**
   * Insert agent metric
   */
  async insertAgentMetric(metric: Omit<AgentMetricRow, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('agent_metrics').insert([metric]);

      if (error) {
        console.error('Error inserting agent metric:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting agent metric:', error);
      return false;
    }
  }

  /**
   * Insert system metric
   */
  async insertSystemMetric(metric: Omit<SystemMetricRow, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase.from('system_metrics').insert([metric]);

      if (error) {
        console.error('Error inserting system metric:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting system metric:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
