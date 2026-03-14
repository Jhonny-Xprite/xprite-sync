import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger';

const logger = createLogger('SquadsService');

export interface Squad {
  id: string;
  name: string;
  type: string;
  description?: string;
  agents?: string[];
  status: 'active' | 'inactive' | 'paused';
  member_count?: number;
}

export interface SquadsResponse {
  data: Squad[];
  total: number;
  limit: number;
}

class SquadsService {
  private squadsPath = (() => {
    const cwd = process.cwd();
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', '.aiox-core', 'development', 'squads');
    }
    return path.resolve(cwd, '.aiox-core', 'development', 'squads');
  })();

  /**
   * List all squads from .aiox-core/development/squads/ directory
   */
  async listSquads(limit: number = 50): Promise<SquadsResponse> {
    try {
      logger.debug(`Fetching squads from ${this.squadsPath}`);

      // Try to read squads directory
      const squads: Squad[] = [];

      try {
        const entries = fs.readdirSync(this.squadsPath, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const configPath = path.join(this.squadsPath, entry.name, 'config.yaml');
          if (!fs.existsSync(configPath)) continue;

          try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const parsed = yaml.load(content) as any;

            if (parsed) {
              const squad: Squad = {
                id: entry.name,
                name: parsed.name || entry.name,
                type: parsed.type || 'general',
                description: parsed.description,
                agents: parsed.agents || [],
                status: parsed.status || 'active',
                member_count: parsed.agents?.length || 0,
              };
              squads.push(squad);
            }
          } catch (error) {
            logger.warn(`Failed to parse squad config: ${entry.name}`, error);
          }
        }
      } catch (error) {
        logger.debug(`Could not read squads directory: ${this.squadsPath}`);
      }

      // If no squads found, return empty array (honest state, no mock data)
      // This prevents "mentira" (lying) by disguising demo data as real

      // Sort by ID
      squads.sort((a, b) => a.id.localeCompare(b.id));

      const displaySquads = squads.slice(0, limit);

      const response: SquadsResponse = {
        data: displaySquads,
        total: squads.length,
        limit,
      };

      logger.debug(`Squads retrieved: ${displaySquads.length} items`);
      return response;
    } catch (error) {
      logger.error('Failed to fetch squads', error);
      return { data: [], total: 0, limit };
    }
  }
}

export const squadsService = new SquadsService();
