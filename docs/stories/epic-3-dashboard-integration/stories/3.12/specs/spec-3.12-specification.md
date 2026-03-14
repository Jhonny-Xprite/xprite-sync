# Specification: Story 3.12 — GitHub Integration

## Summary

Integrate real GitHub data (recent commits, pull requests, branches) into the Dashboard GitHubView component via three new backend endpoints that call the GitHub API. Replace any hardcoded or mock GitHub data with live repository information. This provides developers with current code repository status without leaving the dashboard.

## Requirements Breakdown

### Functional Requirements

**FR-1:** Recent Commits Display
- Endpoint: `GET /api/github/commits?limit=10`
- Data source: GitHub API (REST or CLI)
- Per commit: message, author name, branch, timestamp (relative "2h ago"), commit SHA, URL to GitHub
- Behavior: Sorted by date (newest first)
- Link: Clickable URL opens commit in GitHub (new tab)

**FR-2:** Pull Requests Display
- Endpoint: `GET /api/github/prs?status=all`
- Status filter: open, merged, closed, all
- Per PR: title, PR number, status, author, created_at, merged_at (if merged), URL, reviews_pending count
- Sorting: Newest PRs first
- Link: URL opens PR in GitHub (new tab)

**FR-3:** Branches Display
- Endpoint: `GET /api/github/branches`
- Per branch: name, last commit message, last updated timestamp, creator, URL
- Sorting: Recently updated first
- Link: URL opens branch in GitHub (new tab)

**FR-4:** Authentication
- Method: Use GITHUB_TOKEN from `.env` file
- Scope: Read-only access to repository
- Configuration: Token must be set in environment before starting API

**FR-5:** Auto-Refresh
- Refetch interval: 5 minutes (300 seconds)
- Rationale: GitHub data changes less frequently than metrics
- User action: Manual refresh button optional

**FR-6:** Error Handling
- If GitHub API fails: Show "GitHub data temporarily unavailable" message
- Don't crash dashboard — show graceful degradation
- Log actual error to console for debugging

### Non-Functional Requirements

**NFR-1:** Performance
- Query caching: 4-5 minute staleTime (5-min refetch interval)
- API rate limiting: Respect GitHub API limits (60 calls/hour for public repos, 5000/hour with auth)
- Response time: < 500ms from API to frontend

**NFR-2:** Reliability
- Graceful fallback: Show "No data available" instead of crashing
- Retry logic: Retry failed requests once
- Network resilience: Handle offline gracefully

**NFR-3:** Data Accuracy
- Always show real GitHub data (no caching beyond 5 minutes)
- Timestamps in relative format ("2h ago") for readability

**CON-1:** Brownfield Pattern
- Reuse GitHub CLI if available (already authenticated in project)
- Follow Hook → useQuery → Component pattern
- Maintain consistency with 3.10, 3.11, 3.13, 3.14, 3.15

## Design Decisions

### Why GitHub CLI Over Octokit?
- **Reason:** GITHUB_TOKEN already authenticated in project. CLI is simpler for script-based operations.
- **Alternative:** Octokit (full Node.js client) — more features but overkill
- **Choice:** GitHub CLI via `execSync` for simplicity
- **Fallback:** Octokit if GitHub CLI not available

### Why 5-Minute Polling Instead of WebSocket?
- **Reason:** GitHub doesn't provide real-time WebSocket; polling is standard
- **Trade-off:** 5 minutes is balanced (respects rate limits, provides reasonable freshness)
- **Future:** Can upgrade to webhook-based updates if needed

### Why Read-Only API Scope?
- **Reason:** Dashboard is monitoring tool, not administration tool
- **Limitation:** Cannot create/merge PRs from dashboard
- **Benefit:** Minimal security risk

## Implementation Strategy

### Step 1: Backend Service (`packages/api/src/services/github.ts`)
```typescript
import { execSync } from 'child_process';

class GitHubService {
  private owner = 'SynkraAI';
  private repo = 'aiox-core';
  private token = process.env.GITHUB_TOKEN;

  async getRecentCommits(limit = 10): Promise<Commit[]> {
    // Use GitHub CLI:
    // gh api repos/{owner}/{repo}/commits --jq ".[0:{limit}]"
    // Parse response and return array
  }

  async getPullRequests(status = 'all'): Promise<PullRequest[]> {
    // Use GitHub CLI:
    // gh pr list --state {status}
    // Parse response and return array
  }

  async getBranches(): Promise<Branch[]> {
    // Use GitHub CLI:
    // gh repo view --json branches
    // Parse response and return array
  }
}
```

### Step 2: Backend Endpoints (`packages/api/src/index.ts`)
```typescript
app.get('/api/github/commits', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const commits = await githubService.getRecentCommits(limit);
    res.json({ data: commits });
  } catch (error) {
    res.status(500).json({ error: 'GitHub API failed' });
  }
});

app.get('/api/github/prs', async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const prs = await githubService.getPullRequests(status);
    res.json({ data: prs });
  } catch (error) {
    res.status(500).json({ error: 'GitHub API failed' });
  }
});

app.get('/api/github/branches', async (req, res) => {
  try {
    const branches = await githubService.getBranches();
    res.json({ data: branches });
  } catch (error) {
    res.status(500).json({ error: 'GitHub API failed' });
  }
});
```

### Step 3: Frontend Service (`packages/dashboard/src/services/api/github.ts`)
```typescript
export const githubApi = {
  async getRecentCommits(limit = 10) {
    const response = await fetch(`/api/github/commits?limit=${limit}`);
    return response.json();
  },

  async getPullRequests(status = 'all') {
    const response = await fetch(`/api/github/prs?status=${status}`);
    return response.json();
  },

  async getBranches() {
    const response = await fetch('/api/github/branches');
    return response.json();
  },
};
```

### Step 4: Frontend Hook
```typescript
export function useGitHubData() {
  return useQuery({
    queryKey: ['github-data'],
    queryFn: async () => {
      const [commits, prs, branches] = await Promise.all([
        githubApi.getRecentCommits(10),
        githubApi.getPullRequests('all'),
        githubApi.getBranches(),
      ]);
      return { commits: commits.data, prs: prs.data, branches: branches.data };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000, // 4 minutes
  });
}
```

### Step 5: Frontend Component (Update `GitHubView.tsx`)
- Call `useGitHubData()` hook
- Display loading skeleton while loading
- Display error message if error
- Render three sections:
  - Recent Commits (newest first)
  - Pull Requests (grouped by status)
  - Branches (newest updated first)
- Each item has clickable link to GitHub

## Testing Strategy

### Curl Tests
```bash
# Commits
curl http://localhost:3000/api/github/commits?limit=5

# Pull Requests
curl http://localhost:3000/api/github/prs?status=open

# Branches
curl http://localhost:3000/api/github/branches
```

### Browser Testing
1. Verify GITHUB_TOKEN configured in `.env`
2. Open Dashboard → GitHub section
3. Verify recent commits display (from master branch)
4. Verify PR count and status (open, merged, closed)
5. Verify branch names and last commit messages
6. Click links → opens GitHub.com in new tab
7. Verify timestamps in relative format ("2h ago")
8. Stop API server → verify error message shown (not crashed)
9. Restart API → verify auto-refresh updates data

### Automated Tests
- Mock GitHub API responses
- Test service methods parse responses correctly
- Test component renders with real data shape
- Test error handling (API failure, no data)
- Test link generation (correct URLs)

### Edge Cases
- Empty commits list (new repo)
- No open PRs (all closed/merged)
- Very long commit messages (text wrapping)
- PR with special characters in title
- Branch with forward slashes in name

## Risk Mitigation

### Risk: GITHUB_TOKEN Missing or Invalid
**Mitigation:**
- Check token at API startup
- Show clear error message if missing
- Log helpful hint ("Set GITHUB_TOKEN in .env")

### Risk: GitHub API Rate Limiting
**Mitigation:**
- Implement 5-minute caching (staleTime)
- Monitor API response headers for rate limit info
- Cache responses even if API is slow

### Risk: Repository Permissions Changed
**Mitigation:**
- Handle 403 Forbidden gracefully
- Show message: "GitHub access token may be invalid"

### Risk: Network Failure
**Mitigation:**
- Retry failed requests once (configured in fetch)
- Show last known data if available (React Query caching)

## Success Criteria

### Quantifiable Metrics
- ✅ `/api/github/commits` returns last 10 commits from master
- ✅ `/api/github/prs` returns all PRs (open, merged, closed)
- ✅ `/api/github/branches` returns all branches with last commit info
- ✅ GitHubView component displays all three data types
- ✅ All links open GitHub.com correctly
- ✅ Timestamps in relative format ("2h ago", not "2026-03-13T20:15:00Z")
- ✅ Error handling works (API fails → shows message, not crash)
- ✅ Auto-refresh every 5 minutes verified in DevTools
- ✅ All tests passing
- ✅ TypeScript: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ Dashboard loads GitHub data in < 500ms
- ✅ Data refreshes automatically every 5 minutes
- ✅ Users can see current code status without leaving dashboard
- ✅ Links are clearly clickable
- ✅ Error messages are helpful

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** STANDARD (12/25 pts)
**Estimated Effort:** 5-8 story points (3 hours)
**Dependency:** None — can run in parallel with 3.11
