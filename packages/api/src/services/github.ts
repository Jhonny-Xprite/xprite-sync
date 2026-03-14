import { execSync } from 'child_process';

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
  private owner = 'SynkraAI';
  private repo = 'aiox-core';

  /**
   * Get recent commits from repository
   */
  async getRecentCommits(limit: number = 10): Promise<CommitsResponse> {
    try {
      const query = `repos/${this.owner}/${this.repo}/commits`;
      const output = execSync(`gh api ${query} --jq '.[0:${limit}]'`, {
        encoding: 'utf-8',
      });

      const commits = JSON.parse(output).map((commit: any) => ({
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name,
        sha: commit.sha.slice(0, 7),
        timestamp: commit.commit.author.date,
        url: commit.html_url,
        branch: 'master', // Default to master, can be enhanced
      }));

      return {
        data: commits,
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
      const query = `repos/${this.owner}/${this.repo}/pulls?state=${state}&per_page=${limit}`;
      const output = execSync(`gh api ${query}`, {
        encoding: 'utf-8',
      });

      const prs = JSON.parse(output).map((pr: any) => ({
        title: pr.title,
        number: pr.number,
        status: pr.merged_at ? 'merged' : pr.state === 'open' ? 'open' : 'closed',
        author: pr.user.login,
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        url: pr.html_url,
        reviews_pending: 0, // Could be enhanced with review API
      }));

      return {
        data: prs,
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
      const query = `repos/${this.owner}/${this.repo}/branches?per_page=${limit}`;
      const output = execSync(`gh api ${query}`, {
        encoding: 'utf-8',
      });

      const branches = JSON.parse(output).map((branch: any) => ({
        name: branch.name,
        last_commit: branch.commit.message ? branch.commit.message.split('\n')[0] : 'N/A',
        last_updated: new Date().toISOString(),
        creator: 'unknown', // Would need additional API call
        url: `https://github.com/${this.owner}/${this.repo}/tree/${branch.name}`,
      }));

      return {
        data: branches,
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
      const query = `repos/${this.owner}/${this.repo}`;
      const output = execSync(`gh api ${query}`, {
        encoding: 'utf-8',
      });

      const repo = JSON.parse(output);
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
