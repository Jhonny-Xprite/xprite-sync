import { createLogger } from '../utils/logger';

const logger = createLogger('TasksService');

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executor: string;
  progress: number;
  started_at: string;
  estimated_completion: string;
}

export interface TaskStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface TasksResponse {
  data: Task[];
  stats: TaskStats;
  total: number;
  limit: number;
}

class TasksService {
  /**
   * List tasks with optional filtering by status
   */
  async listTasks(
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'all',
    limit: number = 20
  ): Promise<TasksResponse> {
    try {
      logger.debug(`Fetching tasks (status=${status}, limit=${limit})`);

      // TODO: Connect to actual task execution system
      // For now, return realistic mock data structure
      const allTasks: Task[] = [
        {
          id: 'task-123',
          name: 'Process agent metrics',
          status: 'running',
          executor: '@dev',
          progress: 0.65,
          started_at: new Date(Date.now() - 5 * 60000).toISOString(),
          estimated_completion: new Date(Date.now() + 5 * 60000).toISOString(),
        },
        {
          id: 'task-124',
          name: 'Aggregate dashboard data',
          status: 'pending',
          executor: '@qa',
          progress: 0,
          started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 15 * 60000).toISOString(),
        },
        {
          id: 'task-125',
          name: 'Update story status',
          status: 'completed',
          executor: '@sm',
          progress: 1.0,
          started_at: new Date(Date.now() - 30 * 60000).toISOString(),
          estimated_completion: new Date(Date.now() - 20 * 60000).toISOString(),
        },
      ];

      // Filter by status if provided
      let filteredTasks = allTasks;
      if (status && status !== 'all') {
        filteredTasks = allTasks.filter(t => t.status === status);
      }

      // Apply limit
      const displayTasks = filteredTasks.slice(0, limit);

      // Calculate stats
      const stats: TaskStats = {
        pending: allTasks.filter(t => t.status === 'pending').length,
        running: allTasks.filter(t => t.status === 'running').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        failed: allTasks.filter(t => t.status === 'failed').length,
      };

      const response: TasksResponse = {
        data: displayTasks,
        stats,
        total: filteredTasks.length,
        limit,
      };

      logger.debug(`Tasks retrieved: ${displayTasks.length} items`, response);
      return response;
    } catch (error) {
      logger.error('Failed to fetch tasks', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Get active tasks (pending + running)
   */
  async listActiveTasks(limit: number = 20): Promise<TasksResponse> {
    return this.listTasks('running', limit);
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<TaskStats> {
    const response = await this.listTasks('all');
    return response.stats;
  }
}

export const tasksService = new TasksService();
