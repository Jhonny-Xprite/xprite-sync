# Epic 3 — Dashboard Integration: Full Real Data Implementation

**Status:** 🔴 **PHASE 0 IN PROGRESS** (Foundation — Env Files + Supabase)
**Created:** 2026-03-14
**Updated:** 2026-03-14
**Owner:** @dev (Dex) + @architect (Aria)

---

## 01. EXECUTIVE SUMMARY

Epic 3 delivers a **100% functional dashboard with real project data** — eliminating all hardcoded demo fallbacks, mocking, and dishonest agent data streams. The dashboard will display live metrics, stories, workflows, agents, and system health from the actual AIOX system.

### Current State (Issue)
- **2 API services are pure stubs:** `EngineService`, `WorkflowsService` return hardcoded data
- **3 critical API routes missing:** `/api/agents`, `/api/squads`, `/api/analytics/*`
- **Supabase configured but empty:** `agent_metrics` table never receives real data
- **GitHub hardcoded wrong repo:** Uses `SynkraAI/aiox-core` instead of actual project
- **Dashboard DEMO fallbacks active:** AgentsTab, CostsTab, OverviewTab show demo data because routes don't exist
- **No `.env` files:** Supabase credentials missing in API package
- **RLS blocked:** `team_members` table missing, preventing Supabase row-level security

### Outcome (Success Criteria)
- ✅ All 19 API endpoints returning real or empty (never demo) data
- ✅ Dashboard shows actual project stories (from `docs/stories/`)
- ✅ Workflows displayed from `.aiox-core/development/workflows/*.yaml`
- ✅ Agents list from `.aiox-core/development/agents/*.md` (12 AIOX agents)
- ✅ Squads list populated from project registry
- ✅ GitHub integration using correct repository (configurable via env)
- ✅ Engine status reflecting real system metrics (not hardcoded 4 workers)
- ✅ Zero DEMO fallback data — only real data or "No data available" states
- ✅ Supabase integration fully functional with RLS enabled

---

## 02. SCOPE — WHAT'S INCLUDED

### Stories to Implement (6 existing + 2 new)

| ID | Title | Story Points | Owner | Status |
|----|-------|--------------|-------|--------|
| 3.10 | Agent Metrics Real-Time | 5-8 | @dev | Draft |
| 3.11 | Stories & Squads Real Reading | 8-13 | @dev | Draft |
| 3.12 | GitHub Integration | 5-8 | @dev | Draft |
| 3.13 | Engine Status, Tasks & Workflows | 13-21 | @dev | Draft |
| 3.14 | Hand-offs Monitoring | 5-8 | @dev | Draft |
| 3.15 | Agent Memory Visualization | 8-13 | @dev | Draft |
| **3.16** | **Missing Analytics & Routes** | 13-21 | @dev | NEW |
| **3.17** | **Complete Data Integration** | 8-13 | @dev | NEW |

### Gaps to Address (Phases 0-5)

| Gap | Impact | Phase | Effort |
|-----|--------|-------|--------|
| No `.env` with Supabase credentials | API cannot connect | 0.1 | Low |
| `team_members` table missing | RLS blocks all queries | 0.3 | Low |
| WorkflowsService returns stub data | Workflows view shows 3 hardcoded items | 1.1 | Low |
| EngineService returns stub data | Engine panel shows fake active_workers | 1.2 | Low |
| GitHub repo hardcoded wrong | Commits from wrong repo | 1.3 | Low |
| `/api/agents` does not exist | OverviewTab shows 0 agents | 2.1 | Medium |
| `/api/squads` does not exist | SquadsView empty | 2.2 | Medium |
| `/api/tools/mcp` does not exist | Dashboard shows 2 hardcoded MCPs | 2.3 | Medium |
| `/api/analytics/overview` missing | OverviewTab uses DEMO fallback | 2.4 | Medium |
| `/api/analytics/performance/agents` missing | AgentsTab shows DEMO_AGENT_ANALYTICS | 2.5 | Medium |
| SystemMetricsCollector doesn't persist | Historical metrics always empty | 3.1 | Low |
| AgentsTab shows DEMO data | Users see fake agent analytics | 4.1 | Low |
| CostsTab shows DEMO data | Users see fake $32.40/month | 4.2 | Low |
| RoadmapView has hardcoded features | Roadmap doesn't use real PRDs | 4.6 | Medium |

---

## 03. TECHNICAL ARCHITECTURE

### System Topology

```
Frontend (React Vite - 5173)
    ↓
Vite Proxy: /api → localhost:3000
    ↓
Express API (3000)
    ├── Filesystem scans: .aiox-core/, docs/, .aiox/
    ├── Supabase client: xsyixazfqnsvvdsihccv.supabase.co
    ├── GitHub CLI: via `gh api` (SynkraAI/aiox-core → configurable)
    └── System metrics: Node.js os module
    ↓
Services:
    ├── StoriesService → docs/stories/**/*.story.md ✅
    ├── WorkflowsService → .aiox-core/development/workflows/*.yaml (STUB)
    ├── EngineService → SystemMetrics + HTTP localhost:4002 (STUB)
    ├── GitHubService → `gh api` CLI (configurable repo)
    ├── HandoffsService → .aiox/handoffs/*.yaml ✅
    ├── MemoryService → .claude/projects/*/memory/*.md ✅
    ├── AgentsService → .aiox-core/development/agents/*.md (NEW)
    ├── SquadsService → registry data (NEW)
    ├── MCPToolsService → extensions/mcp-registry.json (NEW)
    ├── AnalyticsService → aggregate endpoints (NEW)
    ├── SystemMetricsCollector → os module + Supabase insert
    └── SupabaseService → agent_metrics, system_metrics, workflow_logs tables
```

### Data Flow: Real Data Example

```
.aiox-core/development/agents/dev.md (file)
    ↓ (parse YAML frontmatter)
{ id: "dev", name: "Dex", title: "Developer", role: "Implementation", ... }
    ↓ (AgentsService.getAgents())
GET /api/agents
    ↓ (response)
{ data: [{ id: "dev", ... }, ...], total: 12 }
    ↓ (useAgents hook in dashboard)
OverviewTab shows "12 agentes"
    ↓ (browser renders)
✅ Counter displays real count
```

---

## 04. EXECUTION PHASES

### PHASE 0 — Foundation (Critical Blocker)

**Without this, Supabase cannot function.**

#### 0.1: Create `packages/api/.env`
```env
SUPABASE_URL=https://xsyixazfqnsvvdsihccv.supabase.co
SUPABASE_ANON_KEY=<project-anon-key>
TEAM_ID=<uuid>
API_PORT=3000
GITHUB_OWNER=<repo-owner>
GITHUB_REPO=<repo-name>
```

#### 0.2: Create `packages/dashboard/.env`
```env
VITE_SUPABASE_URL=https://xsyixazfqnsvvdsihccv.supabase.co
VITE_SUPABASE_ANON_KEY=<project-anon-key>
VITE_API_URL=/api
```

#### 0.3: Migration — `team_members` table + RLS disable
```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.agent_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity DISABLE ROW LEVEL SECURITY;
```

**Verification:** `curl http://localhost:3000/api/metrics` returns `{ data: [], total: 0 }` (no 500 error)

---

### PHASE 1 — Replace Stubs with Real Data

#### 1.1: WorkflowsService → Read YAML
- **Source:** `.aiox-core/development/workflows/*.yaml` (8+ files exist)
- **Logic:** Scan YAML, parse name/description/phases/agents
- **Output:** `{ id, name, description, status: 'available', phases, agents, file_path, updated_at }`

#### 1.2: EngineService → Use OS Metrics + Honest Flag
- **Source A:** `SystemMetricsCollector.collectCurrentMetrics()` (real)
- **Source B:** HTTP call to `http://localhost:4002/health` with 2s timeout
- **Output:** Real CPU/memory/uptime + `engine_available: false` flag if engine not running
- **Key:** Never return `active_workers: 4` hardcoded when engine is down

#### 1.3: GitHubService → Make Repo Configurable
- **Current:** `owner = 'SynkraAI'`, `repo = 'aiox-core'` hardcoded
- **Fix:** Use `process.env.GITHUB_OWNER` and `process.env.GITHUB_REPO`
- **User must:** Check `git remote -v` and set correct values in `.env`

---

### PHASE 2 — Create Missing API Routes

#### 2.1: `GET /api/agents`
- **Source:** `.aiox-core/development/agents/*.md` (12 files)
- **Parse:** YAML frontmatter: `agent.id`, `agent.name`, `agent.title`, `persona.role`
- **Output:** `{ data: Agent[], total: number }`

#### 2.2: `GET /api/squads`
- **Source:** `packages/dashboard/src/data/aios-registry.generated.ts` or registry
- **Output:** `{ data: Squad[], total: number }`

#### 2.3: `GET /api/tools/mcp`
- **Source:** `extensions/mcp-registry.json` (read and return)
- **Output:** `{ data: mcp[], total: number, updatedAt: timestamp }`

#### 2.4: `GET /api/analytics/overview`
- **Aggregate:** Stories count, GitHub commits, handoffs, agent summary, system metrics
- **Output:** Dashboard-ready summary object

#### 2.5: `GET /api/analytics/performance/agents`
- **Aggregate:** Group `agent_metrics` by agent_id, compute averages
- **Output:** `{ data: [{ agentId, successRate, avgLatency, ... }], total }`

---

### PHASE 3 — Data Persistence

#### 3.1: SystemMetricsCollector → Persist to Supabase
- **Current:** Collects real CPU/RAM/disk but never saves
- **Fix:** Add `setInterval` that calls `supabaseService.insertSystemMetric()` every 60s
- **Key:** Silent fail if Supabase unavailable (don't block API)

---

### PHASE 4 — Dashboard Data Wiring

#### 4.1: AgentsTab → Remove DEMO fallback
- **Current:** `analyticsData = rawData || DEMO_AGENT_ANALYTICS`
- **Fix:** Show EmptyState when data empty (not DEMO data)

#### 4.2: CostsTab → Show honest empty state
- **Current:** Shows `DEMO_COST_SUMMARY` with fake $32.40/month
- **Fix:** Show "LLM integration pending" message when no data

#### 4.3: OverviewTab → Use real agent/squad counts
- **Current:** `/api/agents` and `/api/squads` don't exist → counters = 0
- **Fix:** With Phase 2 routes created, these will auto-populate

#### 4.6: RoadmapView → Fetch from API instead of hardcoded
- **Current:** Uses `sampleFeatures` hardcoded in `roadmapStore.ts`
- **Fix:** Create `/api/roadmap` endpoint, fetch on mount

---

### PHASE 5 — QA & Verification

#### 5.1: Endpoint Verification (curl each)
```bash
curl http://localhost:3000/api/stories        # 6 real stories
curl http://localhost:3000/api/agents          # 12 AIOX agents
curl http://localhost:3000/api/squads          # squad list
curl http://localhost:3000/api/tools/mcp       # MCP registry
curl http://localhost:3000/api/workflows/list  # real YAML workflows
curl http://localhost:3000/api/github/commits  # repo commits
curl http://localhost:3000/api/handoffs/list   # real handoffs
curl http://localhost:3000/api/memory/list     # agent memory
curl http://localhost:3000/api/analytics/overview
curl http://localhost:3000/api/analytics/performance/agents
curl http://localhost:3000/api/engine/status   # not active_workers=4
```

#### 5.2: Dashboard Visual Check
- Stories kanban shows 6 real cards ✅
- OverviewTab shows real counts (12 agents, N squads, 6 stories) ✅
- AgentsTab shows real performance or EmptyState (no DEMO) ✅
- CostsTab shows "pending" or real data (no $32.40 fake) ✅
- GitHub view shows correct repo ✅

#### 5.3: TypeScript + Lint
```bash
npm run typecheck --workspace=packages/api
npm run typecheck --workspace=packages/dashboard
npm run lint --workspace=packages/api
npm run lint --workspace=packages/dashboard
```

---

## 05. ANTI-MENTIRA PRINCIPLES

1. **Never disguise demo data as real data**
   - If real data unavailable → return `{ data: [], total: 0 }`
   - Dashboard shows "No data available" not fake examples

2. **Honest flags on unavailable systems**
   - Engine not running? → `engine_available: false` explicit flag
   - Don't hide failure behind hardcoded mock numbers

3. **Transparent fallbacks**
   - Filesystem scan empty? → Empty array returned
   - Supabase unavailable? → Graceful degradation or error message

4. **EmptyState > DEMO data**
   - All `|| DEMO_*` fallbacks replaced with UI showing "This data is not available yet"
   - Users understand what's working vs. what's not

5. **Configuration over hardcoding**
   - GitHub repo → `process.env.GITHUB_OWNER` / `GITHUB_REPO`
   - Supabase → `.env` files
   - No hardcoded credentials or repo names

6. **Graceful degradation**
   - Supabase down? → Use filesystem data
   - Filesystem empty? → Return `{ data: [] }`
   - Always respond with `200 OK` + empty array, never silent failure

---

## 06. FILES TO CREATE/MODIFY

### Create (6 new files)
- `packages/api/.env`
- `packages/dashboard/.env`
- `supabase/migrations/20260314_team_members.sql`
- `packages/api/src/services/agents.ts`
- `packages/api/src/services/squads.ts`
- `packages/api/src/services/mcp-tools.ts`

### Modify (9 existing)
- `packages/api/src/services/workflows.ts` (replace stub)
- `packages/api/src/services/engine.ts` (replace stub)
- `packages/api/src/services/github.ts` (env-configurable)
- `packages/api/src/services/system-metrics.ts` (add persistence)
- `packages/api/src/index.ts` (add 6 new routes)
- `packages/dashboard/src/components/dashboard/AgentsTab.tsx` (no DEMO)
- `packages/dashboard/src/components/dashboard/CostsTab.tsx` (no DEMO)
- `packages/dashboard/src/hooks/useDashboard.ts` (real MCP data)
- `packages/dashboard/src/stores/roadmapStore.ts` (fetch API)

---

## 07. SUCCESS METRICS

When Epic 3 is **DONE**:

- ✅ **19 API endpoints** all returning real or empty data (never demo)
- ✅ **Dashboard shows actual project data:**
  - 6 real stories from `docs/stories/`
  - 12 AIOX agents from `.aiox-core/development/agents/`
  - N squads from project registry
  - Real GitHub commits (correct repo)
  - Real workflow definitions from YAML
  - Real handoff history
  - Real agent memories
- ✅ **Zero DEMO fallback data** — all `DEMO_*` constants removed or gutted
- ✅ **EmptyState UI** shown when data unavailable (not fake examples)
- ✅ **Supabase functional** with real data flowing in
- ✅ **System metrics persisting** to Supabase every 60s
- ✅ **All tests passing** (typecheck + lint)
- ✅ **Configuration via `.env`** (no hardcoded values)

---

## 08. OUT OF SCOPE

- **SalesRoom/WAHA:** User evaluating alternative solution — paused pending decision
- **Real-time WebSocket:** Using polling initially, WebSocket future enhancement
- **Advanced RLS:** RLS disabled while no user auth; enable when auth implemented
- **LLM Cost Integration:** Awaiting external billing provider integration

---

## 09. DEPENDENCIES & RISKS

### Critical Dependencies
- ✅ Supabase project configured (`xsyixazfqnsvvdsihccv`)
- ✅ GitHub `gh` CLI authenticated
- ✅ `.aiox-core/development/` files exist
- ✅ `docs/stories/` files exist
- ❓ `extensions/mcp-registry.json` exists

### Risks & Mitigations
| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Supabase credentials missing | High | Phase 0.1-0.2 creates `.env` files |
| GitHub auth fails | Medium | Graceful fallback to empty array |
| Filesystem scan fails | Low | Try/catch + return empty array |
| RLS blocks all queries | High | Phase 0.3 disables RLS temporarily |

---

## 10. ACCEPTANCE CRITERIA

### For Completion
- [ ] All 6 existing stories (3.10-3.15) refactored to use real data
- [ ] All 2 new stories (3.16-3.17) created and implemented
- [ ] Zero DEMO/mock data visible in dashboard
- [ ] All 19 endpoints verified with curl
- [ ] TypeScript/lint passing
- [ ] Dashboard visual QA passed
- [ ] Supabase real-time metrics flowing
- [ ] All `.env` files created with real values
- [ ] Migration applied to Supabase
- [ ] GitHub repo correctly configured

### Definition of Done
- Code reviewed and approved
- All tests passing (build, lint, typecheck)
- Dashboard fully functional with real project data
- No hardcoded credentials or demo values remaining
- Documentation updated (this PRD + story files)
- Ready for user acceptance testing

---

**Document Version:** 2.0
**Last Updated:** 2026-03-14 by Orion (@aiox-master)
**Next Review:** After Phase 0 completion
