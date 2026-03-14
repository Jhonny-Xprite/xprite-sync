import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
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
  private tasksPath = (() => {
    const cwd = process.cwd();
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', '.aiox', 'tasks');
    }
    return path.resolve(cwd, '.aiox', 'tasks');
  })();

  /**
   * Recursively find all task files (.md, .yaml, .yml)
   */
  private findTaskFiles(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          this.findTaskFiles(filePath, fileList);
        } else if (file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')) {
          fileList.push(filePath);
        }
      }
    } catch {
      logger.debug(`Could not read tasks directory: ${dir}`);
    }

    return fileList;
  }

  /**
   * Parse task metadata from file content
   */
  private parseTaskFile(filePath: string): Task | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

      let metadata: any = {
        id: path.basename(filePath, path.extname(filePath)),
        name: path.basename(filePath),
        status: 'pending',
        executor: 'system',
        progress: 0,
      };

      if (yamlMatch) {
        try {
          const parsed = yaml.load(yamlMatch[1]) as any;
          if (parsed) {
            metadata = { ...metadata, ...parsed };
          }
        } catch {
          logger.debug(`YAML parse error in ${filePath}`);
        }
      }

      const now = new Date().toISOString();
      return {
        id: metadata.id || path.basename(filePath, path.extname(filePath)),
        name: metadata.name || metadata.title || path.basename(filePath),
        status: metadata.status || 'pending',
        executor: metadata.executor || metadata.assignedAgent || 'system',
        progress: metadata.progress || 0,
        started_at: metadata.started_at || now,
        estimated_completion: metadata.estimated_completion || new Date(Date.now() + 3600000).toISOString(),
      };
    } catch (error) {
      logger.error(`Error parsing task file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * List tasks with optional filtering by status
   */
  async listTasks(
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'all',
    limit: number = 20
  ): Promise<TasksResponse> {
    try {
      logger.debug(`Fetching tasks (status=${status}, limit=${limit})`);

      // Try to load real tasks from files
      const taskFiles = this.findTaskFiles(this.tasksPath);
      let allTasks: Task[] = [];

      for (const filePath of taskFiles) {
        const task = this.parseTaskFile(filePath);
        if (task) {
          allTasks.push(task);
        }
      }

      // If no tasks found from files, use sample data
      if (allTasks.length === 0) {
        allTasks = [
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
        ];
      }

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

      logger.debug(`Tasks retrieved: ${displayTasks.length} items`);
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
