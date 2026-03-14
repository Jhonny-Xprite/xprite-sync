import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger';

const logger = createLogger('WorkflowsService');

export interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  estimated_completion: string;
  total_steps: number;
  completed_steps: number;
}

export interface WorkflowStats {
  running: number;
  paused: number;
  completed: number;
  failed: number;
}

export interface WorkflowsResponse {
  data: Workflow[];
  stats: WorkflowStats;
  total: number;
  limit: number;
}

class WorkflowsService {
  private workflowsPath = (() => {
    const cwd = process.cwd();
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', '.aiox-core', 'development', 'workflows');
    }
    return path.resolve(cwd, '.aiox-core', 'development', 'workflows');
  })();

  /**
   * Recursively find all workflow files (.yaml, .yml)
   */
  private findWorkflowFiles(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          this.findWorkflowFiles(filePath, fileList);
        } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          fileList.push(filePath);
        }
      }
    } catch (error) {
      logger.debug(`Could not read workflows directory: ${dir}`);
    }

    return fileList;
  }

  /**
   * Parse workflow metadata from YAML file
   */
  private parseWorkflowFile(filePath: string): Workflow | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = yaml.load(content) as any;

      if (!parsed) return null;

      const totalSteps = parsed.steps?.length || 0;
      const completedSteps = parsed.completedSteps || (parsed.steps?.filter((s: any) => s.status === 'completed').length || 0);
      const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;

      return {
        id: parsed.id || path.basename(filePath, path.extname(filePath)),
        name: parsed.name || parsed.title || path.basename(filePath),
        status: parsed.status || 'paused',
        progress,
        started_at: parsed.started_at || new Date().toISOString(),
        estimated_completion: parsed.estimated_completion || new Date(Date.now() + 24 * 3600000).toISOString(),
        total_steps: totalSteps,
        completed_steps: completedSteps,
      };
    } catch (error) {
      logger.debug(`Error parsing workflow file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * List workflows with optional filtering by status
   */
  async listWorkflows(
    status?: 'running' | 'paused' | 'completed' | 'failed' | 'all',
    limit: number = 20
  ): Promise<WorkflowsResponse> {
    try {
      logger.debug(`Fetching workflows (status=${status}, limit=${limit})`);

      // Try to load real workflows from files
      const workflowFiles = this.findWorkflowFiles(this.workflowsPath);
      let allWorkflows: Workflow[] = [];

      for (const filePath of workflowFiles) {
        const workflow = this.parseWorkflowFile(filePath);
        if (workflow) {
          allWorkflows.push(workflow);
        }
      }

      // If no workflows found from files, return empty array (honest state, no mock data)
      // This prevents "mentira" (lying) by disguising demo data as real

      // Filter by status if provided
      let filteredWorkflows = allWorkflows;
      if (status && status !== 'all') {
        filteredWorkflows = allWorkflows.filter(w => w.status === status);
      }

      // Apply limit
      const displayWorkflows = filteredWorkflows.slice(0, limit);

      // Calculate stats
      const stats: WorkflowStats = {
        running: allWorkflows.filter(w => w.status === 'running').length,
        paused: allWorkflows.filter(w => w.status === 'paused').length,
        completed: allWorkflows.filter(w => w.status === 'completed').length,
        failed: allWorkflows.filter(w => w.status === 'failed').length,
      };

      const response: WorkflowsResponse = {
        data: displayWorkflows,
        stats,
        total: filteredWorkflows.length,
        limit,
      };

      logger.debug(`Workflows retrieved: ${displayWorkflows.length} items`, response);
      return response;
    } catch (error) {
      logger.error('Failed to fetch workflows', error);
      throw new Error('Failed to fetch workflows');
    }
  }

  /**
   * Get active workflows (running + paused)
   */
  async listActiveWorkflows(limit: number = 20): Promise<WorkflowsResponse> {
    const allResponse = await this.listWorkflows('all', limit);
    const activeWorkflows = allResponse.data.filter(
      w => w.status === 'running' || w.status === 'paused'
    );

    return {
      data: activeWorkflows,
      stats: allResponse.stats,
      total: activeWorkflows.length,
      limit,
    };
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(): Promise<WorkflowStats> {
    const response = await this.listWorkflows('all');
    return response.stats;
  }
}

export const workflowsService = new WorkflowsService();
