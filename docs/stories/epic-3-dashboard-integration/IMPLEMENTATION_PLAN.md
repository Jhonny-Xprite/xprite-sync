# Epic 3 — Implementation Master Plan

**Created:** 2026-03-14
**Owner:** Orion (@aiox-master) → @dev (Dex)
**Status:** Ready for Story Drafting

---

## Overview

This document contains the **complete, detailed implementation plan** for Epic 3 — Dashboard Integration with Real Project Data. All gaps have been analyzed, all phases have been designed, and the path to 100% functionality is clear.

This plan is the **blueprint for drafting all 8 user stories** (3.10–3.15 existing + 3.16–3.17 new).

---

## Five Implementation Phases

### ⚠️ PHASE 0 — FOUNDATION (Critical Blocker)
**Status:** NOT STARTED
**Duration:** ~2 hours
**Effort:** LOW

**What blocks everything:** Supabase credentials, .env files, RLS configuration

#### Tasks

1. **Create `packages/api/.env`**
   ```env
   SUPABASE_URL=https://xsyixazfqnsvvdsihccv.supabase.co
   SUPABASE_ANON_KEY=<anon_key>
   TEAM_ID=<uuid>
   API_PORT=3000
   GITHUB_OWNER=SynkraAI  # User must verify via git remote -v
   GITHUB_REPO=aiox-core   # User must verify via git remote -v
   ```

2. **Create `packages/dashboard/.env`**
   ```env
   VITE_SUPABASE_URL=https://xsyixazfqnsvvdsihccv.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon_key>
   VITE_API_URL=/api
   ```

3. **Create & apply Supabase migration `20260314_team_members.sql`**
   - Create `team_members` table
   - Disable RLS on 4 tables (temporary, until auth is real)

#### Verification
```bash
curl http://localhost:3000/api/metrics
# Should return: { data: [], total: 0 } — no 500 error
```

**Unblocks:** Phases 1, 2, 3

---

### 🟠 PHASE 1 — REPLACE STUBS WITH REAL DATA
**Status:** NOT STARTED
**Duration:** ~6 hours
**Effort:** LOW (mostly copy-paste from existing patterns)

**Files to modify:** 3 services in `packages/api/src/services/`

#### 1.1: `workflows.ts` — Read YAML Files Instead of Hardcoded Data
**Current:** Returns 3 hardcoded workflows (workflow-456, workflow-457, workflow-458)
**Fix:**
- Scan `.aiox-core/development/workflows/*.yaml`
- Parse each YAML file (name, description, phases, agents fields)
- Map to Workflow interface
- Return `{ data: Workflow[], total, limit }`
- If directory empty or error → return `{ data: [], total: 0 }`

**Code pattern (reference):** Copy from `StoriesService.findStoryFiles()` + `parseStoryFile()`

#### 1.2: `engine.ts` — Use Real System Metrics + Honest Flag
**Current:** Returns hardcoded `{ active_workers: 4, total_workers: 8, queue_size: 12 }`
**Fix:**
- Try HTTP call to `http://localhost:4002/health` (2 second timeout)
- If successful → use real engine data
- If timeout/failure → use `SystemMetricsCollector.collectCurrentMetrics()`
- Return honest flag: `engine_available: true/false`
- Never return fake `active_workers: 4` when engine is down

**Code pattern:**
```typescript
async getStatus(): Promise<EngineStatus> {
  const systemMetrics = await systemMetricsCollector.collectCurrentMetrics();
  const engineAvailable = await checkEngineHealth(); // with timeout

  return {
    status: systemMetrics.cpu_percentage < 90 ? 'healthy' : 'degraded',
    pool: engineAvailable ? { real engine data } : { active: 0, total: 0 },
    health: systemMetrics,
    engine_available: engineAvailable
  };
}
```

#### 1.3: `github.ts` — Make Repository Configurable via Environment
**Current:** `owner = 'SynkraAI'` and `repo = 'aiox-core'` hardcoded
**Fix:**
```typescript
const owner = process.env.GITHUB_OWNER || 'SynkraAI';
const repo = process.env.GITHUB_REPO || 'aiox-core';
```

**User must:**
- Run `git remote -v` to find actual repo owner/name
- Update `packages/api/.env` with correct values

#### Verification
```bash
curl http://localhost:3000/api/workflows/list | jq '.data[0].name'
# Should return real workflow name, not "Epic 3 Wave 5 Execution"

curl http://localhost:3000/api/engine/status | jq '.engine_available'
# Should return boolean reflecting actual engine state

curl http://localhost:3000/api/github/commits | jq '.data[0].message'
# Should return commit from correct repo
```

**Unblocks:** Phase 4 (dashboard can use real data)

---

### 🟡 PHASE 2 — CREATE MISSING API ROUTES
**Status:** NOT STARTED
**Duration:** ~10 hours
**Effort:** MEDIUM (new services + routes)

**Files to create:** 3 new services in `packages/api/src/services/`
**Files to modify:** `packages/api/src/index.ts` (add 6 routes)

#### 2.1: `/api/agents` — GET (NEW)
**File:** Create `packages/api/src/services/agents.ts`
**Source:** `.aiox-core/development/agents/*.md` (12 agent files exist)
**Algorithm:**
1. Read each agent YAML file
2. Extract: `agent.id`, `agent.name`, `agent.title`, `persona.role`, `agent.icon`
3. Return Agent[] with status='available'

**Route:**
```typescript
app.get('/api/agents', async (req, res) => {
  const agents = await agentsService.getAgents();
  res.json({ data: agents, total: agents.length });
});
```

#### 2.2: `/api/squads` — GET (NEW)
**File:** Create `packages/api/src/services/squads.ts`
**Source:** `packages/dashboard/src/data/aios-registry.generated.ts` or squads directory
**Algorithm:**
1. Read registry data or squads directory
2. Map to Squad interface: `{ id, name, type, description, agents[], status }`
3. Return Squad[]

**Route:**
```typescript
app.get('/api/squads', async (req, res) => {
  const squads = await squadsService.getSquads();
  res.json({ data: squads, total: squads.length });
});
```

#### 2.3: `/api/tools/mcp` — GET (NEW)
**File:** Create `packages/api/src/services/mcp-tools.ts`
**Source:** `extensions/mcp-registry.json` (exists, contains MCP list)
**Algorithm:**
1. Read JSON file
2. Return registry.mcps array + metadata

**Route:**
```typescript
app.get('/api/tools/mcp', async (req, res) => {
  const registry = await readJSON('extensions/mcp-registry.json');
  res.json({ data: registry.mcps, total: registry.mcps.length, updatedAt: registry.updatedAt });
});
```

#### 2.4: `/api/analytics/overview` — GET (NEW)
**No new file needed** — add route to `index.ts`
**Algorithm:**
1. Fetch in parallel:
   - `storiesService.getStories()` → count by status
   - `githubService.getRecentCommits(5)` → recent commits
   - `handoffsService.getHandoffs(20)` → handoff count
   - `supabaseService.getAgentsSummary()` → agent status
   - `systemMetricsCollector.collectCurrentMetrics()` → system health
2. Aggregate into dashboard-ready object

**Route:**
```typescript
app.get('/api/analytics/overview', async (req, res) => {
  const [stories, github, handoffs, agents, system] = await Promise.all([...]);
  res.json({
    stories: { total: stories.total, byStatus: {} },
    github: { recentCommits: [...] },
    handoffs: { total: handoffs.total },
    agents: agents,
    system: { cpu: system.cpu_percentage, memory: system.memory_percentage },
    timestamp: new Date().toISOString()
  });
});
```

#### 2.5: `/api/analytics/performance/agents` — GET (NEW)
**No new file needed** — add route to `index.ts`
**Algorithm:**
1. Fetch `supabaseService.getAgentMetrics(undefined, 100)` — last 100 metrics
2. Group by agent_id
3. Calculate: avg success_rate, avg latency_ms, avg cpu, avg memory
4. Return array of agent statistics

**Route:**
```typescript
app.get('/api/analytics/performance/agents', async (req, res) => {
  const metrics = await supabaseService.getAgentMetrics(undefined, 100);
  const byAgent = groupBy(metrics.data, 'agent_id');
  const stats = Object.entries(byAgent).map(([agentId, rows]) => ({
    agentId,
    totalExecutions: rows.length,
    successRate: avg(rows, 'success_rate'),
    avgLatency: avg(rows, 'latency_ms') / 1000,
    ...
  }));
  res.json({ data: stats, total: stats.length });
});
```

#### Verification
```bash
# Test all 6 new routes
curl http://localhost:3000/api/agents | jq '.total'        # 12
curl http://localhost:3000/api/squads | jq '.total'        # N
curl http://localhost:3000/api/tools/mcp | jq '.total'     # 2+
curl http://localhost:3000/api/analytics/overview | jq '.stories.total'   # 6
curl http://localhost:3000/api/analytics/performance/agents | jq '.total' # 0+ (empty OK)
```

**Unblocks:** Phase 4 (dashboard can query new endpoints)

---

### 🟢 PHASE 3 — PERSIST SYSTEM METRICS
**Status:** NOT STARTED
**Duration:** ~2 hours
**Effort:** LOW

**File to modify:** `packages/api/src/services/system-metrics.ts`

#### 3.1: Add Persistence to Supabase
**Current:** `SystemMetricsCollector` collects real OS data but never saves
**Problem:** Historical metrics always empty
**Fix:**
- Add background job every 60 seconds
- Call `supabaseService.insertSystemMetric({ team_id: TEAM_ID, ...metrics })`
- Graceful error handling (log but don't throw)

**Code pattern:**
```typescript
private startPersistence() {
  const teamId = process.env.TEAM_ID;
  setInterval(async () => {
    try {
      const current = await this.collectCurrentMetrics();
      await supabaseService.insertSystemMetric({
        team_id: teamId,
        ...current,
        recorded_at: new Date().toISOString()
      });
    } catch (err) {
      logger.warn('Failed to persist system metrics', { error: err.message });
      // Don't throw — graceful degradation
    }
  }, 60_000); // Every 60 seconds
}
```

#### Verification
```bash
# Wait 60 seconds, then check Supabase
SELECT COUNT(*) FROM system_metrics WHERE team_id = '...' AND recorded_at > NOW() - INTERVAL '2 minutes';
# Should return >= 1 row
```

**Unblocks:** Phase 4 (dashboard can display historical metrics)

---

### 🔵 PHASE 4 — DASHBOARD DATA WIRING
**Status:** NOT STARTED
**Duration:** ~8 hours
**Effort:** LOW (mostly removing DEMO fallbacks)

**Files to modify:** 5 dashboard files

#### 4.1: `AgentsTab.tsx` — Remove DEMO Fallback
**Current:**
```typescript
const analyticsData = rawData || DEMO_AGENT_ANALYTICS;
```

**Fix:**
```typescript
const analyticsData = rawData?.data || [];
const isEmpty = analyticsData.length === 0;
if (isEmpty) {
  return <EmptyState message="Agent analytics not available yet" />;
}
return <AgentPerformanceTable data={analyticsData} />;
```

#### 4.2: `CostsTab.tsx` — Show Honest Empty State
**Current:**
```typescript
const costData = rawData || DEMO_COST_SUMMARY; // Shows fake $32.40
```

**Fix:**
```typescript
if (!rawData) {
  return <EmptyState message="LLM cost tracking pending integration with billing provider" />;
}
return <CostSummaryCards data={rawData} />;
```

#### 4.3: `useDashboard.ts` — MCP Tools with Real Data
**Current:** `useMCPStatus()` has hardcoded 2 MCPs fallback
**Fix:** With `/api/tools/mcp` route created in Phase 2, hook will auto-fetch real data
- Remove hardcoded fallback
- Show EmptyState if `/api/tools/mcp` returns empty

#### 4.4: `OverviewTab.tsx` — Use Real Counts
**Current:** `useSquads()` returns empty because `/api/squads` doesn't exist → counters = 0
**Fix:** With Phase 2 routes created, these will auto-populate:
```typescript
const agents = useAgents();     // Now returns 12 from /api/agents
const squads = useSquads();     // Now returns N from /api/squads
const stories = useStories();   // Already works, returns 6

// UI auto-updates with real counts
```

#### 4.5: `StoryWorkspace.tsx` / `KanbanBoard.tsx` — Verify Current Integration
**Current Status:** Already uses `useInitializeStories` hook ✅
**Action:** Verify that StoryWorkspace reads from `useStoryStore` (not broken hook)
**No changes needed** if wiring is already correct

#### 4.6: `roadmapStore.ts` & `RoadmapView.tsx` — Fetch from API
**Current:** `sampleFeatures` hardcoded with 12 fake features
**Fix:**
1. Create `/api/roadmap` endpoint (parse `docs/prd/*.md` for epics)
2. In `roadmapStore`, add `fetchRoadmap()` action
3. In `RoadmapView`, call on mount
4. Replace `sampleFeatures` with API response

**Code pattern:**
```typescript
// In roadmapStore
const fetchRoadmap = async () => {
  const response = await apiClient.get('/roadmap');
  setFeatures(response.data || []);
};

// In RoadmapView component
useEffect(() => {
  fetchRoadmap();
}, []);
```

#### Verification
```bash
# In browser:
# 1. Dashboard OverviewTab: Should show "12 agentes, N squads, 6 stories"
# 2. AgentsTab: Should show "No agent analytics available" (empty state, not DEMO)
# 3. CostsTab: Should show "LLM cost tracking pending" (not $32.40 fake)
# 4. RoadmapView: Should show real epics from PRDs (not 12 hardcoded)
```

**Unblocks:** Phase 5 (dashboard 100% functional)

---

### ✅ PHASE 5 — QA & VERIFICATION
**Status:** NOT STARTED
**Duration:** ~4 hours
**Effort:** LOW

#### 5.1: Endpoint Verification (curl each)
```bash
# Run after all phases complete
curl http://localhost:3000/api/health
curl http://localhost:3000/api/stories | jq '.total'
curl http://localhost:3000/api/agents | jq '.total'
curl http://localhost:3000/api/squads | jq '.total'
curl http://localhost:3000/api/tools/mcp | jq '.total'
curl http://localhost:3000/api/workflows/list | jq '.data[0].name'
curl http://localhost:3000/api/github/commits | jq '.data[0].message'
curl http://localhost:3000/api/github/prs | jq '.total'
curl http://localhost:3000/api/handoffs/list | jq '.total'
curl http://localhost:3000/api/memory/list | jq '.total_memories'
curl http://localhost:3000/api/analytics/overview | jq '.stories.total'
curl http://localhost:3000/api/analytics/performance/agents | jq '.total'
curl http://localhost:3000/api/engine/status | jq '.engine_available'
```

#### 5.2: Dashboard Visual QA
| View | Verify |
|------|--------|
| Stories/Kanban | 6 real story cards displayed ✅ |
| Dashboard OverviewTab | Counters show real counts (not 0) ✅ |
| Dashboard AgentsTab | Shows "No analytics available" or real data (no DEMO) ✅ |
| Dashboard CostsTab | Shows "LLM tracking pending" (no $32.40 fake) ✅ |
| Dashboard SystemTab | CPU/Memory real ✅ |
| GitHub View | Commits from correct repo ✅ |
| Handoffs View | Real handoff history ✅ |
| Memory Browser | Real agent memories ✅ |
| RoadmapView | Real epics from PRDs ✅ |
| Engine Workspace | `engine_available` flag shows truth ✅ |

#### 5.3: Code Quality
```bash
npm run typecheck --workspace=packages/api
npm run typecheck --workspace=packages/dashboard
npm run lint --workspace=packages/api
npm run lint --workspace=packages/dashboard
```

#### 5.4: Success Criteria
- ✅ Zero DEMO/mock data visible in dashboard
- ✅ All 19 endpoints return real data or empty array (with 200 status)
- ✅ GitHub repo configured correctly
- ✅ Supabase metrics persisting
- ✅ All TypeScript/lint passing
- ✅ All curl tests successful

---

## Story Drafting Guidelines

When drafting Stories 3.10–3.17, use this template:

```markdown
# 📖 Story X.Y: [Title]

**Status:** 🟠 Ready for Review
**Epic:** Epic 3 — Dashboard Integration
**Owner:** @dev (Dex)
**Story Points:** [SP range from plan]
**Priority:** 🔴 HIGH or 🟡 MEDIUM

## 👤 User Story
[From PRD]

## 🎯 Acceptance Criteria
### Primary (Must Have)
- [ ] Task 1
- [ ] Task 2

### Secondary (Nice to Have)
- [ ] Task 3

## 🔧 Technical Details
### Phase(s): [Phase 0-5 from implementation plan]
### Files to Modify: [list from plan]
### Dependencies: [list from plan]

## 📁 Files Modified/Created
[Extracted from implementation plan]

## 📊 Definition of Done
- [ ] [all criteria from plan]

## 🚀 Dependencies & Blockers
**Depends on:**
[from plan]

**Blocks:**
[from plan]

## ✨ Success Metrics
[from plan]
```

---

## Execution Checklist

### Pre-Implementation
- [ ] All team members read Epic 3 PRD + this plan
- [ ] Supabase project credentials available
- [ ] GitHub `gh` CLI authenticated
- [ ] `.aiox-core/development/` files verified to exist
- [ ] All 8 stories drafted

### Phase 0
- [ ] `packages/api/.env` created with real values
- [ ] `packages/dashboard/.env` created
- [ ] Supabase migration applied
- [ ] `curl /api/metrics` test passes
- [ ] API server restarts successfully

### Phase 1
- [ ] WorkflowsService reads real YAML ✅
- [ ] EngineService returns honest data ✅
- [ ] GitHubService uses configurable repo ✅
- [ ] All 3 services verified with curl

### Phase 2
- [ ] AgentsService created + `/api/agents` works ✅
- [ ] SquadsService created + `/api/squads` works ✅
- [ ] MCPToolsService created + `/api/tools/mcp` works ✅
- [ ] `/api/analytics/overview` returns aggregated data ✅
- [ ] `/api/analytics/performance/agents` returns stats ✅
- [ ] All 6 new routes verified with curl

### Phase 3
- [ ] SystemMetricsCollector persistence enabled ✅
- [ ] Supabase `system_metrics` table populated after 60s ✅
- [ ] Verify with SQL query

### Phase 4
- [ ] AgentsTab no longer shows DEMO data ✅
- [ ] CostsTab shows honest empty state ✅
- [ ] OverviewTab shows real counts ✅
- [ ] RoadmapView fetches from API ✅
- [ ] All 5 dashboard files modified

### Phase 5
- [ ] All 19 curl tests pass
- [ ] Dashboard visual QA passed
- [ ] TypeScript/lint passing
- [ ] All success criteria met

### Post-Implementation
- [ ] All 8 stories marked Done
- [ ] PRD updated with completion date
- [ ] Documentation reviewed
- [ ] User acceptance testing scheduled

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Supabase credentials missing | High | Blocks all | Phase 0 requires filled .env |
| RLS blocks queries | High | Blocks Supabase | Phase 0 disables RLS (temp) |
| GitHub auth fails | Medium | GitHub routes broken | Graceful empty array fallback |
| Filesystem scan fails | Low | Routes return empty | Try/catch in all services |
| API downtime during testing | Low | Phase blocks | Run API in parallel terminal |

---

## Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 0 | 2h | NOT STARTED |
| Phase 1 | 6h | NOT STARTED |
| Phase 2 | 10h | NOT STARTED |
| Phase 3 | 2h | NOT STARTED |
| Phase 4 | 8h | NOT STARTED |
| Phase 5 | 4h | NOT STARTED |
| **Total** | **~32 hours** | **6-8 dev days with breaks** |

---

**Document Version:** 2.0
**Last Updated:** 2026-03-14 by Orion (@aiox-master)
**Ready for Story Drafting:** ✅ YES
**Ready for Implementation:** ✅ YES (after story drafts approved)
