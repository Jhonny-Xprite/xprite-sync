export interface Commit {
  message: string;
  author: string;
  sha: string;
  timestamp: string;
  url: string;
  branch: string;
}

export interface PullRequest {
  title: string;
  number: number;
  status: 'open' | 'merged' | 'closed';
  author: string;
  created_at: string;
  merged_at: string | null;
  url: string;
  reviews_pending: number;
}

export interface Branch {
  name: string;
  last_commit: string;
  last_updated: string;
  creator: string;
  url: string;
}

export interface CommitsResponse {
  data: Commit[];
  total: number;
  limit: number;
}

export interface PullRequestsResponse {
  data: PullRequest[];
  total: number;
  limit: number;
}

export interface BranchesResponse {
  data: Branch[];
  total: number;
  limit: number;
}

class GitHubService {
  private owner = process.env.GITHUB_OWNER || 'SynkraAI';
  private repo = process.env.GITHUB_REPO || 'aiox-core';
  private token = process.env.GITHUB_TOKEN;
  private baseURL = 'https://api.github.com';

  /**
   * Make authenticated GitHub API call
   */
  private async fetchGitHub(endpoint: string, params: Record<string, string | number> = {}): Promise<any> {
    if (!this.token) {
      throw new Error('GITHUB_TOKEN environment variable not set');
    }

    // Build URL with query parameters
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AIOX-Dashboard-API',
        },
      });

      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} ${response.statusText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error calling GitHub API:', error);
      return null;
    }
  }

  /**
   * Get recent commits from repository
   */
  async getRecentCommits(limit: number = 10): Promise<CommitsResponse> {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/commits`;
      const data = await this.fetchGitHub(endpoint, { per_page: limit });

      if (!data) {
        return { data: [], total: 0, limit };
      }

      const commits = data.map((commit: any) => ({
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author?.name || commit.author?.login || 'Unknown',
        sha: commit.sha.slice(0, 7),
        timestamp: commit.commit.author?.date || new Date().toISOString(),
        url: commit.html_url,
        branch: 'master', // Default to master, can be enhanced
      }));

      return {
        data: commits.slice(0, limit),
        total: commits.length,
        limit,
      };
    } catch (error) {
      console.error('Error fetching commits:', error);
      return { data: [], total: 0, limit };
    }
  }

  /**
   * Get open pull requests
   */
  async getPullRequests(status: 'open' | 'all' = 'all', limit: number = 20): Promise<PullRequestsResponse> {
    try {
      const state = status === 'all' ? 'all' : 'open';
      const endpoint = `/repos/${this.owner}/${this.repo}/pulls`;
      const data = await this.fetchGitHub(endpoint, { state, per_page: limit });

      if (!data) {
        return { data: [], total: 0, limit };
      }

      const prs = data.map((pr: any) => ({
        title: pr.title,
        number: pr.number,
        status: pr.merged_at ? 'merged' : pr.state === 'open' ? 'open' : 'closed',
        author: pr.user?.login || 'Unknown',
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        url: pr.html_url,
        reviews_pending: 0, // Could be enhanced with review API
      }));

      return {
        data: prs.slice(0, limit),
        total: prs.length,
        limit,
      };
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      return { data: [], total: 0, limit };
    }
  }

  /**
   * Get branches
   */
  async getBranches(limit: number = 20): Promise<BranchesResponse> {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}/branches`;
      const data = await this.fetchGitHub(endpoint, { per_page: limit });

      if (!data) {
        return { data: [], total: 0, limit };
      }

      const branches = data.map((branch: any) => ({
        name: branch.name,
        last_commit: branch.commit?.commit?.message?.split('\n')[0] || 'N/A',
        last_updated: branch.commit?.commit?.committer?.date || new Date().toISOString(),
        creator: branch.commit?.author?.login || 'unknown',
        url: `https://github.com/${this.owner}/${this.repo}/tree/${branch.name}`,
      }));

      return {
        data: branches.slice(0, limit),
        total: branches.length,
        limit,
      };
    } catch (error) {
      console.error('Error fetching branches:', error);
      return { data: [], total: 0, limit };
    }
  }

  /**
   * Get repository information
   */
  async getRepository() {
    try {
      const endpoint = `/repos/${this.owner}/${this.repo}`;
      const repo = await this.fetchGitHub(endpoint);

      if (!repo) {
        return null;
      }

      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        open_issues: repo.open_issues_count,
      };
    } catch (error) {
      console.error('Error fetching repository:', error);
      return null;
    }
  }
}

export const githubService = new GitHubService();
