import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('MCPToolsService');

export interface MCPTool {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'enabled' | 'disabled';
}

export interface MCPToolsResponse {
  data: MCPTool[];
  total: number;
  limit: number;
  updatedAt: string;
}

class MCPToolsService {
  private registryPath = (() => {
    const cwd = process.cwd();
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', 'extensions', 'mcp-registry.json');
    }
    return path.resolve(cwd, 'extensions', 'mcp-registry.json');
  })();

  /**
   * List all MCP tools from mcp-registry.json
   */
  async listTools(limit: number = 50): Promise<MCPToolsResponse> {
    try {
      logger.debug(`Fetching MCP tools from ${this.registryPath}`);

      let tools: MCPTool[] = [];

      // Try to read MCP registry
      if (fs.existsSync(this.registryPath)) {
        try {
          const content = fs.readFileSync(this.registryPath, 'utf-8');
          const registry = JSON.parse(content) as any;

          if (registry.tools && Array.isArray(registry.tools)) {
            tools = registry.tools.map((tool: any) => ({
              id: tool.id || tool.name,
              name: tool.name || tool.id || 'Unknown',
              type: tool.type || 'unknown',
              description: tool.description,
              status: tool.enabled !== false ? 'enabled' : 'disabled',
            }));
          } else if (registry.mcps && Array.isArray(registry.mcps)) {
            tools = registry.mcps.map((mcp: any) => ({
              id: mcp.id || mcp.name,
              name: mcp.name || mcp.id || 'Unknown',
              type: mcp.type || 'mcp',
              description: mcp.description,
              status: mcp.enabled !== false ? 'enabled' : 'disabled',
            }));
          }
        } catch (_error) {
          logger.warn('Failed to parse MCP registry', _error);
        }
      }

      // If no tools found, return empty array (honest state, no mock data)
      // This prevents "mentira" (lying) by disguising demo data as real

      // Sort by name
      tools.sort((a, b) => a.name.localeCompare(b.name));

      const displayTools = tools.slice(0, limit);

      const response: MCPToolsResponse = {
        data: displayTools,
        total: tools.length,
        limit,
        updatedAt: new Date().toISOString(),
      };

      logger.debug(`MCP tools retrieved: ${displayTools.length} items`);
      return response;
    } catch (_error) {
      logger.error('Failed to fetch MCP tools', _error);
      return {
        data: [],
        total: 0,
        limit,
        updatedAt: new Date().toISOString(),
      };
    }
  }
}

export const mcpToolsService = new MCPToolsService();
