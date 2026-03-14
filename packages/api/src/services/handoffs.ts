import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as YAML from 'js-yaml';
import { createLogger } from '../utils/logger';

const logger = createLogger('HandoffsService');

export interface HandoffContext {
  story_id?: string;
  story_path?: string;
  current_task?: string;
  branch?: string;
}

export interface Handoff {
  id: string;
  from_agent: string;
  to_agent: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'failed';
  story_context?: HandoffContext;
  decisions?: string[];
  files_modified?: string[];
  blockers?: string[];
  next_action?: string;
}

export interface HandoffsResponse {
  data: Handoff[];
  total: number;
  limit: number;
}

class HandoffsService {
  private handoffsDir = join(process.cwd(), '.aiox', 'handoffs');

  /**
   * List recent hand-offs from .aiox/handoffs/ directory
   */
  async listHandoffs(limit: number = 20): Promise<HandoffsResponse> {
    try {
      logger.debug(`Fetching handoffs from ${this.handoffsDir}`);

      const files = await readdir(this.handoffsDir).catch(() => []);

      // Parse each handoff file
      const handoffs: Handoff[] = [];

      for (const file of files) {
        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;

        try {
          const filePath = join(this.handoffsDir, file);
          const content = await readFile(filePath, 'utf-8');
          const parsed = YAML.load(content) as any;

          if (parsed?.handoff) {
            const handoff: Handoff = {
              id: file.replace(/\.(yaml|yml)$/, ''),
              from_agent: parsed.handoff.from_agent || 'unknown',
              to_agent: parsed.handoff.to_agent || 'unknown',
              timestamp: parsed.handoff.timestamp || new Date().toISOString(),
              status: parsed.handoff.status || 'completed',
              story_context: parsed.handoff.story_context,
              decisions: parsed.handoff.decisions,
              files_modified: parsed.handoff.files_modified,
              blockers: parsed.handoff.blockers,
              next_action: parsed.handoff.next_action,
            };

            handoffs.push(handoff);
          }
        } catch (error) {
          logger.warn(`Failed to parse handoff file ${file}`, error);
        }
      }

      // Sort by timestamp descending (newest first)
      handoffs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply limit
      const displayHandoffs = handoffs.slice(0, limit);

      const response: HandoffsResponse = {
        data: displayHandoffs,
        total: handoffs.length,
        limit,
      };

      logger.debug(`Handoffs retrieved: ${displayHandoffs.length} items`);
      return response;
    } catch (error) {
      logger.error('Failed to fetch handoffs', error);
      throw new Error('Failed to fetch handoffs');
    }
  }

  /**
   * Get handoff statistics
   */
  async getHandoffStats(): Promise<{ total: number; by_agent: Record<string, number> }> {
    const response = await this.listHandoffs(1000);

    const by_agent: Record<string, number> = {};

    for (const handoff of response.data) {
      const key = `${handoff.from_agent}→${handoff.to_agent}`;
      by_agent[key] = (by_agent[key] || 0) + 1;
    }

    return {
      total: response.total,
      by_agent,
    };
  }
}

export const handoffsService = new HandoffsService();
