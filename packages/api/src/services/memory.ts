import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('MemoryService');

export interface MemoryFile {
  id: string;
  name: string;
  path: string;
  agent_id: string;
  category: 'user' | 'project' | 'feedback' | 'reference' | 'other';
  size: number;
  created_at: string;
  updated_at: string;
  content_preview?: string;
}

export interface AgentMemory {
  agent_id: string;
  total_files: number;
  by_category: Record<string, number>;
  files: MemoryFile[];
  last_updated: string;
}

export interface MemoryResponse {
  data: AgentMemory[];
  total_memories: number;
  limit: number;
}

class MemoryService {
  private baseDir = join(process.cwd(), '.claude', 'projects');

  /**
   * List agent memories with categories
   */
  async listMemories(limit: number = 50): Promise<MemoryResponse> {
    try {
      logger.debug(`Fetching memories from ${this.baseDir}`);

      const agentMemories: AgentMemory[] = [];

      // Try to read project directories
      const projectDirs = await readdir(this.baseDir).catch(() => []);

      for (const projectDir of projectDirs) {
        const memoryPath = join(this.baseDir, projectDir, 'memory');

        try {
          const files = await readdir(memoryPath).catch(() => []);

          if (files.length === 0) continue;

          const memoryFiles: MemoryFile[] = [];
          let latestUpdate = new Date(0);

          for (const file of files) {
            if (!file.endsWith('.md')) continue;

            try {
              const filePath = join(memoryPath, file);
              const fileStats = await stat(filePath);
              const content = await readFile(filePath, 'utf-8');

              // Determine category from filename
              let category: MemoryFile['category'] = 'other';
              if (file.startsWith('user_')) category = 'user';
              else if (file.startsWith('project_')) category = 'project';
              else if (file.startsWith('feedback_')) category = 'feedback';
              else if (file.startsWith('reference_')) category = 'reference';

              const memoryFile: MemoryFile = {
                id: file.replace('.md', ''),
                name: file,
                path: `memory/${file}`,
                agent_id: projectDir,
                category,
                size: fileStats.size,
                created_at: fileStats.birthtime.toISOString(),
                updated_at: fileStats.mtime.toISOString(),
                content_preview: content.substring(0, 100),
              };

              memoryFiles.push(memoryFile);

              if (fileStats.mtime > latestUpdate) {
                latestUpdate = fileStats.mtime;
              }
            } catch (error) {
              logger.warn(`Failed to read memory file ${file}`, error);
            }
          }

          if (memoryFiles.length > 0) {
            // Group by category
            const byCategory: Record<string, number> = {
              user: 0,
              project: 0,
              feedback: 0,
              reference: 0,
              other: 0,
            };

            for (const file of memoryFiles) {
              byCategory[file.category]++;
            }

            agentMemories.push({
              agent_id: projectDir,
              total_files: memoryFiles.length,
              by_category: byCategory,
              files: memoryFiles.slice(0, 10), // Limit to 10 files per agent
              last_updated: latestUpdate.toISOString(),
            });
          }
        } catch (error) {
          logger.warn(`Failed to read memory for project ${projectDir}`, error);
        }
      }

      // Sort by last updated
      agentMemories.sort(
        (a, b) =>
          new Date(b.last_updated).getTime() -
          new Date(a.last_updated).getTime()
      );

      // Apply limit
      const displayMemories = agentMemories.slice(0, limit);

      // Count total memories
      let totalMemories = 0;
      for (const agent of agentMemories) {
        totalMemories += agent.total_files;
      }

      const response: MemoryResponse = {
        data: displayMemories,
        total_memories: totalMemories,
        limit,
      };

      logger.debug(`Memories retrieved: ${displayMemories.length} agents`);
      return response;
    } catch (error) {
      logger.error('Failed to fetch memories', error);
      throw new Error('Failed to fetch memories');
    }
  }

  /**
   * Search memories by keyword
   */
  async searchMemories(keyword: string, limit: number = 20): Promise<MemoryFile[]> {
    try {
      logger.debug(`Searching memories for keyword: ${keyword}`);

      const response = await this.listMemories(1000);
      const results: MemoryFile[] = [];

      for (const agent of response.data) {
        for (const file of agent.files) {
          if (
            file.name.toLowerCase().includes(keyword.toLowerCase()) ||
            file.content_preview?.toLowerCase().includes(keyword.toLowerCase())
          ) {
            results.push(file);
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }

      logger.debug(`Found ${results.length} memory files matching keyword`);
      return results;
    } catch (error) {
      logger.error('Failed to search memories', error);
      throw new Error('Failed to search memories');
    }
  }
}

export const memoryService = new MemoryService();
