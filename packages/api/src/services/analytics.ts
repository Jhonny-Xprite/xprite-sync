import { createLogger } from '../utils/logger';
import { storiesService } from './stories';
import { githubService } from './github';
import { handoffsService } from './handoffs';
import { engineService } from './engine';
import { tasksService } from './tasks';
import { supabaseService } from './supabase';
import { systemMetricsCollector } from './system-metrics';

const logger = createLogger('AnalyticsService');

export interface AnalyticsOverview {
  timestamp: string;
  stories: {
    total: number;
    by_status: Record<string, number>;
  };
  github: {
    recent_commits: number;
    total_prs: number;
    open_prs: number;
  };
  handoffs: {
    total: number;
    recent_count: number;
  };
  agents: {
    active: number;
  };
  system: {
    cpu_percentage: number;
    memory_percentage: number;
    engine_status: string;
  };
}

export interface AgentPerformance {
  agent_id: string;
  metrics: {
    avg_success_rate: number;
    avg_latency_ms: number;
    avg_cpu_percentage: number;
    avg_memory_percentage: number;
  };
  task_count: number;
  samples: number;
}

class AnalyticsService {
  /**
   * Get analytics overview aggregating multiple data sources
   */
  async getOverview(): Promise<AnalyticsOverview> {
    try {
      logger.debug('Fetching analytics overview');

      // Fetch data from multiple services in parallel
      const [storiesData, commitsData, prsData, handoffsData, engineStatus, tasksData] = await Promise.all([
        storiesService.getStories().catch(() => ({ data: [] })),
        githubService.getRecentCommits(10).catch(() => ({ data: [] })),
        githubService.getPullRequests('all', 20).catch(() => ({ data: [] })),
        handoffsService.listHandoffs(50).catch(() => ({ data: [] })),
        engineService.getStatus().catch(() => null),
        tasksService.listTasks('all').catch(() => ({ data: [], stats: {} })),
      ]);

      // Count stories by status
      const storiesByStatus: Record<string, number> = {};
      storiesData.data.forEach((story: any) => {
        const status = story.status || 'unknown';
        storiesByStatus[status] = (storiesByStatus[status] || 0) + 1;
      });

      // Count open PRs
      const openPRs = prsData.data.filter((pr: any) => pr.status === 'open').length;

      const overview: AnalyticsOverview = {
        timestamp: new Date().toISOString(),
        stories: {
          total: storiesData.data?.length || 0,
          by_status: storiesByStatus,
        },
        github: {
          recent_commits: commitsData.data?.length || 0,
          total_prs: prsData.data?.length || 0,
          open_prs: openPRs,
        },
        handoffs: {
          total: handoffsData.data?.length || 0,
          recent_count: Math.min((handoffsData.data?.length || 0), 10),
        },
        agents: {
          active: (tasksData.stats as any)?.running || 0,
        },
        system: {
          cpu_percentage: engineStatus?.health.cpu_percentage || 0,
          memory_percentage: engineStatus?.health.memory_percentage || 0,
          engine_status: engineStatus?.status || 'unknown',
        },
      };

      logger.debug('Analytics overview retrieved', overview);
      return overview;
    } catch (error) {
      logger.error('Failed to fetch analytics overview', error);
      throw new Error('Failed to fetch analytics overview');
    }
  }

  /**
   * Get agent performance metrics from real Supabase data
   */
  async getAgentPerformance(): Promise<AgentPerformance[]> {
    try {
      logger.debug('Fetching agent performance metrics from Supabase');

      // Get real metrics from Supabase agent_metrics table
      const metrics = await supabaseService.getAgentMetrics(1000);

      if (!metrics || metrics.length === 0) {
        logger.warn('No agent metrics found in Supabase, returning empty array');
        return [];
      }

      // Group metrics by agent_id and calculate averages
      const agentMetricsMap = new Map<string, AgentPerformance>();

      for (const metric of metrics) {
        const agentId = metric.agent_id;

        if (!agentMetricsMap.has(agentId)) {
          agentMetricsMap.set(agentId, {
            agent_id: agentId,
            metrics: {
              avg_success_rate: 0,
              avg_latency_ms: 0,
              avg_cpu_percentage: 0,
              avg_memory_percentage: 0,
            },
            task_count: 0,
            samples: 0,
          });
        }

        const perf = agentMetricsMap.get(agentId)!;
        perf.metrics.avg_success_rate += metric.success_rate || 0;
        perf.metrics.avg_latency_ms += metric.latency_ms || 0;
        perf.metrics.avg_cpu_percentage += metric.cpu_percentage || 0;
        perf.metrics.avg_memory_percentage += 0; // Not directly available in agent_metrics
        perf.task_count += metric.processed_count || 0;
        perf.samples++;
      }

      // Calculate averages
      const agentPerformance = Array.from(agentMetricsMap.values()).map(perf => ({
        ...perf,
        metrics: {
          avg_success_rate: perf.samples > 0 ? perf.metrics.avg_success_rate / perf.samples : 0,
          avg_latency_ms: perf.samples > 0 ? Math.round(perf.metrics.avg_latency_ms / perf.samples) : 0,
          avg_cpu_percentage: perf.samples > 0 ? Number((perf.metrics.avg_cpu_percentage / perf.samples).toFixed(1)) : 0,
          avg_memory_percentage: perf.samples > 0 ? Number((perf.metrics.avg_memory_percentage / perf.samples).toFixed(1)) : 0,
        },
      }));

      logger.debug(`Agent performance retrieved: ${agentPerformance.length} agents with ${metrics.length} total metrics`);
      return agentPerformance;
    } catch (error) {
      logger.error('Failed to fetch agent performance', error);
      return []; // Graceful fallback: return empty array instead of throwing
    }
  }
}

export const analyticsService = new AnalyticsService();
