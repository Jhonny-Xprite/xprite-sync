import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger';

const logger = createLogger('AgentsService');

export interface Agent {
  id: string;
  name: string;
  title: string;
  role: string;
  icon?: string;
  status: 'active' | 'inactive' | 'offline';
  description?: string;
}

export interface AgentsResponse {
  data: Agent[];
  total: number;
  limit: number;
}

class AgentsService {
  private agentsPath = (() => {
    const cwd = process.cwd();
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', '.aiox-core', 'development', 'agents');
    }
    return path.resolve(cwd, '.aiox-core', 'development', 'agents');
  })();

  /**
   * List all agents from .aiox-core/development/agents/ directory
   */
  async listAgents(limit: number = 50): Promise<AgentsResponse> {
    try {
      logger.debug(`Fetching agents from ${this.agentsPath}`);

      const files = fs.readdirSync(this.agentsPath).filter(f => f.endsWith('.md'));
      const agents: Agent[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.agentsPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');

          // Parse YAML frontmatter
          const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
          let metadata: any = {
            id: path.basename(filePath, path.extname(filePath)),
            name: path.basename(filePath),
            status: 'active',
          };

          if (yamlMatch) {
            try {
              const parsed = yaml.load(yamlMatch[1]) as any;
              if (parsed) {
                metadata = { ...metadata, ...parsed };
              }
            } catch {
              logger.debug(`YAML parse error in ${file}`);
            }
          }

          const agent: Agent = {
            id: metadata.id || path.basename(filePath, path.extname(filePath)),
            name: metadata.name || metadata.persona || metadata.id || 'Unknown',
            title: metadata.title || metadata.role || 'Agent',
            role: metadata.role || metadata.persona || 'default',
            icon: metadata.icon,
            status: metadata.status || 'active',
            description: metadata.description || metadata.bio,
          };

          agents.push(agent);
        } catch (error) {
          logger.warn(`Failed to parse agent file ${file}:`, error);
        }
      }

      // Sort by ID for consistency
      agents.sort((a, b) => a.id.localeCompare(b.id));

      const displayAgents = agents.slice(0, limit);

      const response: AgentsResponse = {
        data: displayAgents,
        total: agents.length,
        limit,
      };

      logger.debug(`Agents retrieved: ${displayAgents.length} items`);
      return response;
    } catch (error) {
      logger.error('Failed to fetch agents', error);
      // Return empty list instead of throwing
      return { data: [], total: 0, limit };
    }
  }

  /**
   * Get single agent by ID
   */
  async getAgent(agentId: string): Promise<Agent | null> {
    try {
      const filePath = path.join(this.agentsPath, `${agentId}.md`);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let metadata: any = {
        id: agentId,
        name: agentId,
        status: 'active',
      };

      if (yamlMatch) {
        try {
          const parsed = yaml.load(yamlMatch[1]) as any;
          if (parsed) {
            metadata = { ...metadata, ...parsed };
          }
        } catch (e) {
          logger.debug(`YAML parse error in ${agentId}`);
        }
      }

      return {
        id: metadata.id || agentId,
        name: metadata.name || metadata.persona || agentId,
        title: metadata.title || metadata.role || 'Agent',
        role: metadata.role || metadata.persona || 'default',
        icon: metadata.icon,
        status: metadata.status || 'active',
        description: metadata.description || metadata.bio,
      };
    } catch (error) {
      logger.error(`Failed to fetch agent ${agentId}`, error);
      return null;
    }
  }
}

export const agentsService = new AgentsService();
