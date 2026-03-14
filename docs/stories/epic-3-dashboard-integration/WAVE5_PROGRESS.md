# 📈 Wave 5: Real Data Integration — Progress & Checklist

**Status:** 🔵 PLANNING → DRAFTING → DEVELOPMENT
**Last Updated:** 2026-03-13
**Owner:** @dev (Dex)

---

## 🎯 Wave 5 Objective

Transform Dashboard from **mock data** → **100% real project observability**
Users can see everything: agents, stories, workflows, GitHub, engine, memories — all LIVE

---

## ✅ What's Already Done (Prerequisites)

| Component | Status | Details |
|-----------|--------|---------|
| **API Infrastructure** | ✅ Complete | Express.js running on :3000, Supabase connected |
| **Agent Metrics Endpoints** | ✅ Complete | `/api/metrics`, `/api/system-metrics`, `/api/health` returning REAL data |
| **System Metrics Collector** | ✅ Complete | SystemMetricsCollector collecting real CPU, memory, disk metrics |
| **Dashboard React App** | ✅ Running | Vite dev server on :5175, all UI components built |
| **metricsService Hook** | ✅ Ready | Dashboard has `metricsService` configured, polling every 5s |
| **API Client** | ✅ Ready | `apiClient` configured with `VITE_API_URL` env var |
| **WebSocket Infrastructure** | ✅ Partial | WebSocketManager exists, needs metrics integration |

**ℹ️ Bottom Line:** Infrastructure is 95% ready. We just need to **wire it together** in Wave 5.

---

## 📋 What's Missing (Wave 5 Scope)

### Story 3.10: Agent Metrics Real-Time ⭐ START HERE

**What's needed:**
- [ ] Connect metricsService to AgentsMonitor component
- [ ] Replace hardcoded mock agents with real Supabase data
- [ ] Show "Live" badge when data is real-time
- [ ] Implement error handling + loading states
- [ ] Test: Verify agents display with real latency_ms, success_rate, etc.

**Files to modify:**
- `packages/dashboard/src/components/agents-monitor/AgentsMonitor.tsx`
- `packages/dashboard/src/hooks/useApiMetrics.ts` (create if missing)
- `packages/dashboard/src/services/api/metrics.ts` (already exists!)

**Acceptance Criteria:**
```
[ ] Dashboard displays agents from GET /api/metrics (not mocks)
[ ] Each agent card shows: name, status, latency_ms, success_rate, cpu%, memory%
[ ] "Last updated X seconds ago" timestamp visible
[ ] Loading skeleton shows while fetching
[ ] Error toast appears if API fails
```

---

### Story 3.11: Stories & Squads Real Reading

**What's needed:**
- [ ] Replace FALLBACK_STORIES with real stories from `docs/stories/`
- [ ] Read from filesystem (backend endpoint needed) or git API
- [ ] SquadsView connects to real squads (likely already from API)
- [ ] Kanban board status reflects actual story status

**Files to touch:**
- `packages/dashboard/src/hooks/useStories.ts`
- `packages/dashboard/src/components/stories/StoryWorkspace.tsx`
- `packages/dashboard/src/components/squads-view/SquadsView.tsx`
- Backend: Create `/api/stories` endpoint

**Status:**
```
- useSquads() already connects to squadsApi ✅
- useStories() still uses FALLBACK_STORIES ❌ needs fixing
```

---

### Story 3.12: GitHub Integration

**What's needed:**
- [ ] Connect to GitHub API (use `gh` CLI or octokit)
- [ ] GitHubView shows: recent commits, PRs, branches
- [ ] Use GITHUB_TOKEN from .env
- [ ] Real-time status of latest push

**Files to touch:**
- `packages/dashboard/src/components/github/GitHubView.tsx`
- Create: `packages/dashboard/src/services/api/github.ts`
- Backend: GitHub integration service

**Status:**
```
- GitHubView component exists but likely shows mock data ❌
- Need backend GitHub API wrapper
```

---

### Story 3.13: Engine, Tasks & Workflows Functional

**What's needed:**
- [ ] Engine status endpoint (`/api/engine/status`) returns real worker pool status
- [ ] Tasks endpoint (`/api/tasks/list`) shows actual tasks
- [ ] Workflows endpoint (`/api/workflows/list`) shows active workflows
- [ ] Real-time updates via polling or WebSocket

**Files to touch:**
- `packages/dashboard/src/components/orchestration/TaskOrchestrator.tsx`
- `packages/dashboard/src/hooks/useEngine.ts`
- `packages/dashboard/src/hooks/useTaskHistory.ts`
- `packages/dashboard/src/hooks/useWorkflows.ts`
- Backend: Engine status, task list, workflow list endpoints

**Status:**
```
- Components exist but likely show mocks ❌
- Need backend endpoints for real data
```

---

### Story 3.14: Hand-offs Functional & Monitored

**What's needed:**
- [ ] Hand-off history tracking (read from `.aiox/handoffs/`)
- [ ] Timeline visualization of agent context transfers
- [ ] Status: completed, in-progress, failed
- [ ] Show "last handoff: @pm → @dev (5 min ago)"

**Files to touch:**
- Create: `packages/dashboard/src/components/handoffs/HandoffMonitor.tsx`
- Create: `packages/dashboard/src/services/api/handoffs.ts`
- Backend: Hand-off history endpoint

**Status:**
```
- No existing handoff monitoring component ❌
- Hand-off files exist in `.aiox/handoffs/` (needs API)
```

---

### Story 3.15: Agent Memory Visualization

**What's needed:**
- [ ] Memory browser component showing agent memory files
- [ ] Display memory types: user, feedback, project, reference
- [ ] Search across memories
- [ ] Show last updated timestamp

**Files to touch:**
- Create: `packages/dashboard/src/components/memory/MemoryBrowser.tsx`
- Create: `packages/dashboard/src/services/api/memory.ts`
- Backend: Memory file listing, search endpoints

**Status:**
```
- No existing memory visualization ❌
- Memory files exist at `.claude/projects/*/memory/`
```

---

## 🛠️ Backend Work Summary

**New API Endpoints Needed:**
```bash
GET /api/stories              # Return stories from docs/stories/
GET /api/github/commits       # Recent commits
GET /api/github/prs           # Open/merged PRs
GET /api/engine/status        # Worker pool, queue status
GET /api/tasks/list           # Active tasks
GET /api/workflows/list       # Active workflows
GET /api/handoffs/history     # Hand-off timeline
GET /api/agents/:id/memory    # Agent memory files
GET /api/memory/search        # Search memories
```

**Current Status:**
- ✅ `/api/metrics`, `/api/system-metrics` DONE
- ❌ All others need implementation

---

## 🚦 Dependency Tree

```
3.10 (Agent Metrics) ← Foundation, start here
  ↓
3.11 (Stories/Squads) + 3.12 (GitHub) ← Can run in parallel
  ↓
3.13 (Engine/Tasks/Workflows) ← Depends on 3.11
  ↓
3.14 (Hand-offs) ← Depends on 3.13
  ↓
3.15 (Memories) ← Can run in parallel with 3.14
```

**Recommended Sequence:**
1. **Week 1:** Story 3.10 only (get agents working)
2. **Week 2:** Stories 3.11 + 3.12 in parallel
3. **Week 3:** Story 3.13 (biggest)
4. **Week 3-4:** Stories 3.14 + 3.15 in parallel

---

## 📊 Implementation Checklist

### Story 3.10 (Agent Metrics)
- [ ] Create `useRealAgentMetrics()` hook
- [ ] Update AgentsMonitor to consume real data
- [ ] Add "Live" badge
- [ ] Implement polling every 5s
- [ ] Error handling + loading states
- [ ] Manual refresh button
- [ ] Tests pass

### Story 3.11 (Stories/Squads)
- [ ] Create `/api/stories` endpoint
- [ ] Update `useStories()` to call endpoint (not FALLBACK_STORIES)
- [ ] Verify stories display in Kanban
- [ ] Status reflects actual project state
- [ ] Tests pass

### Story 3.12 (GitHub)
- [ ] GitHub API client setup
- [ ] GitHubView component updates
- [ ] Recent commits, PRs, branches display
- [ ] GITHUB_TOKEN from .env
- [ ] Tests pass

### Story 3.13 (Engine/Tasks/Workflows)
- [ ] Create `/api/engine/status` endpoint
- [ ] Create `/api/tasks/list` endpoint
- [ ] Create `/api/workflows/list` endpoint
- [ ] Update TaskOrchestrator, Engine, Workflows components
- [ ] Real-time updates working
- [ ] Tests pass

### Story 3.14 (Hand-offs)
- [ ] Create HandoffMonitor component
- [ ] Create `/api/handoffs/history` endpoint
- [ ] Timeline visualization working
- [ ] Tests pass

### Story 3.15 (Memories)
- [ ] Create MemoryBrowser component
- [ ] Create `/api/agents/:id/memory` endpoint
- [ ] Create `/api/memory/search` endpoint
- [ ] Search functionality working
- [ ] Tests pass

---

## 🎯 Success Criteria

Dashboard home shows:
```
✅ Agents card: 5 agents from Supabase (LIVE)
✅ Squads card: 3 squads with member count
✅ Stories card: 12 stories across 4 epics
✅ GitHub card: Last commit 2h ago, 2 open PRs
✅ Engine card: 4 workers active, 12 pending tasks
✅ Workflows card: 2 running workflows
✅ Hand-offs: "Last: @pm → @dev (5 min ago)"
✅ Memories: 234 files across agents
```

All with **"Last updated X seconds ago"** timestamps.

---

## 📞 Questions for @dev

1. Is `VITE_API_URL` set to `http://localhost:3000`?
2. Should we use polling (5s interval) or WebSocket for real-time?
3. For Stories: read from filesystem or create backend endpoint?
4. For GitHub: use GitHub CLI (`gh`) or JavaScript client (octokit)?

---

*Document Created by @pm (Morgan) — Wave 5 Planning
Last sync: 2026-03-13 with actual codebase inspection*
