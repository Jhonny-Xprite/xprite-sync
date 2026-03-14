import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface Story {
  id: string;
  epic_id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: string;
  progress: number;
  assigned_executor?: string;
  created_at: string;
  updated_at: string;
  file_path: string;
}

export interface StoriesResponse {
  data: Story[];
  total: number;
  limit: number;
}

class StoriesService {
  // Resolve docs/stories from project root
  // When npm run dev is executed from packages/api, cwd is packages/api
  // We need to go up to root, then into docs/stories
  private docsStoriesPath = (() => {
    const cwd = process.cwd();
    // If cwd is packages/api, go up to root
    if (cwd.includes('packages' + path.sep + 'api')) {
      return path.resolve(cwd, '..', '..', 'docs', 'stories');
    }
    // Otherwise assume we're at root
    return path.resolve(cwd, 'docs', 'stories');
  })();

  /**
   * Recursively find all .story.md files
   */
  private findStoryFiles(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          this.findStoryFiles(filePath, fileList);
        } else if (file.endsWith('.story.md')) {
          fileList.push(filePath);
        }
      }
    } catch (error) {
      console.error(`[Stories] Error reading directory ${dir}:`, error);
    }
    return fileList;
  }

  /**
   * Read all story files from docs/stories directory
   */
  private async readStoryFiles(): Promise<string[]> {
    try {
      // Check if directory exists
      if (!fs.existsSync(this.docsStoriesPath)) {
        console.error('Stories directory not found:', this.docsStoriesPath);
        return [];
      }

      // Use recursive directory traversal to find all .story.md files
      return this.findStoryFiles(this.docsStoriesPath);
    } catch (error) {
      console.error('Error reading story files:', error);
      return [];
    }
  }

  /**
   * Parse story file to extract metadata
   */
  private parseStoryFile(filePath: string): Story | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract story ID from filename (e.g., "3.10.story.md" -> "3.10")
      const filename = path.basename(filePath);
      const idMatch = filename.match(/^(\d+\.\d+)\.story\.md$/);
      if (!idMatch) return null;

      const storyId = idMatch[1];
      const [epicId] = storyId.split('.');

      // Extract YAML frontmatter sections
      const titleMatch = content.match(/^# 📖 Story.*?:\s*(.+?)$/m);
      const statusMatch = content.match(/\*\*Status:\*\*\s*[🟢🟠🔴]\s*(\w+)/);
      const priorityMatch = content.match(/\*\*Priority:\*\*\s*[🔴🟡🟢]\s*(\w+)/);
      const pointsMatch = content.match(/\*\*Story Points:\*\*\s*([\d\-]+)/);

      // Calculate progress from AC checkboxes
      const acMatch = content.match(/##\s*🎯\s*Acceptance Criteria[\s\S]*?(?=---|\n##)/);
      const checkboxes = acMatch ? (acMatch[0].match(/- \[x\]/g) || []).length : 0;
      const totalCheckboxes = acMatch ? (acMatch[0].match(/- \[.?\]/g) || []).length : 1;
      const progress = totalCheckboxes > 0 ? (checkboxes / totalCheckboxes) * 100 : 0;

      return {
        id: storyId,
        epic_id: epicId,
        title: titleMatch ? titleMatch[1].trim() : `Story ${storyId}`,
        description: '',
        status: (statusMatch ? statusMatch[1].toLowerCase() : 'backlog') as Story['status'],
        priority: (priorityMatch ? priorityMatch[1].toLowerCase() : 'medium') as Story['priority'],
        effort: pointsMatch ? pointsMatch[1] : '5-8',
        progress: Math.round(progress),
        assigned_executor: '@dev',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        file_path: filePath,
      };
    } catch (error) {
      console.error(`Error parsing story file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get all stories, optionally filtered by epic and status
   */
  async getStories(epic?: string, status?: string, limit: number = 50): Promise<StoriesResponse> {
    const files = await this.readStoryFiles();
    let stories: Story[] = [];

    for (const filePath of files) {
      const story = this.parseStoryFile(filePath);
      if (story) {
        stories.push(story);
      }
    }

    // Filter by epic if provided
    if (epic) {
      stories = stories.filter(s => s.epic_id === epic);
    }

    // Filter by status if provided
    if (status) {
      stories = stories.filter(s => s.status === status);
    }

    // Sort by ID (numeric)
    stories.sort((a, b) => {
      const aNum = parseFloat(a.id);
      const bNum = parseFloat(b.id);
      return aNum - bNum;
    });

    return {
      data: stories.slice(0, limit),
      total: stories.length,
      limit,
    };
  }

  /**
   * Get a single story by ID
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    const response = await this.getStories();
    return response.data.find(s => s.id === storyId) || null;
  }
}

export const storiesService = new StoriesService();
