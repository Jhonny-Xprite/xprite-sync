# Epic 3 Specification Bundle — Stories 3.10-3.17

**Pipeline Status:** Phase 4 — Write Spec
**Created:** 2026-03-14
**Owner:** @pm (Morgan)
**QA Gate:** Pending (Phase 5)

---

## Specification Overview

This document contains formal specifications for all 8 stories (3.10-3.17) generated through the spec-pipeline process. Each specification includes:
- Detailed functional requirements
- Technical implementation details
- API contracts
- Database schema changes (if needed)
- Testing strategy
- Acceptance criteria

---

## Story 3.10: Agent Metrics Real-Time

**Complexity:** SIMPLE | **Effort:** 6-8h | **Priority:** HIGHEST

### Functional Specification

#### User Story
As a **project manager observing the AIOX dashboard**, I want to **see real agent metrics from Supabase** (not mock data), so that **I can monitor actual agent performance in real-time**.

#### Acceptance Criteria
1. Dashboard AgentsMonitor fetches from `GET /api/metrics`
2. Each agent card displays: name, status, latency_ms, success_rate, cpu_percentage, memory_usage_mb
3. Auto-refresh every 5 seconds via polling
4. Shows "Last updated X seconds ago" timestamp
5. Live Data badge visible when data is real
6. Loading skeleton during fetch
7. Error handling for failed API calls
8. Graceful fallback when API unavailable

### Technical Specification

#### Files to Modify
```
packages/dashboard/src/
├── components/agents-monitor/
│   ├── AgentsMonitor.tsx (UPDATE)
│   └── AgentMonitorCard.tsx (UPDATE)
├── hooks/
│   ├── useApiMetrics.ts (CREATE)
│   └── useAgents.ts (UPDATE)
└── services/api/
    └── metrics.ts (CONSUME)
```

#### API Contract
**Endpoint:** `GET /api/metrics`
**Query Params:** `?agentId=@dev` (optional), `?limit=10` (default)
**Response Format:**
```typescript
{
  data: Array<{
    id: string;
    agent_id: string;
    status: "running" | "idle" | "offline";
    latency_ms: number;
    success_rate: number; // 0-100
    error_count: number;
    processed_count: number;
    cpu_percentage: number;
    memory_usage_mb: number;
    updated_at: ISO8601;
  }>;
  total: number;
  limit: number;
}
```

#### Implementation Steps
1. Create `useApiMetrics.ts` hook with 5-second polling
2. Update `AgentsMonitor.tsx` to use hook
3. Add loading skeleton and error boundary
4. Implement Live Data badge
5. Add timestamp display
6. Test with real API endpoint

#### Testing Strategy
- **Unit:** useApiMetrics hook with mock responses
- **Integration:** Dashboard component with mock API
- **E2E:** Full flow with real /api/metrics endpoint
- **Error Cases:** API timeout, network failure, empty response

---

## Story 3.11: Stories & Squads Real Reading

**Complexity:** SIMPLE | **Effort:** 8-10h | **Priority:** HIGHEST

### Functional Specification

#### User Story
As a **developer**, I want to **see real stories and squads from the project** (not mock data), so that **I have accurate visibility into project structure**.

#### Acceptance Criteria
1. StoriesTab displays stories from YAML files or API
2. SquadsTab displays squads from configuration
3. No mock/demo data in display
4. Real-time sync with file changes (within refresh interval)
5. Empty state when no data available

### Technical Specification

#### Files to Modify
```
packages/api/src/services/
├── stories.ts (REFERENCE - copy pattern)
└── squads.ts (CREATE)

packages/dashboard/src/
├── components/tabs/
│   ├── StoriesTab.tsx (UPDATE)
│   └── SquadsTab.tsx (UPDATE)
└── hooks/
    ├── useStories.ts (UPDATE)
    └── useSquads.ts (CREATE)
```

#### API Contracts

**GET /api/stories**
```typescript
{
  data: Array<{
    id: string;
    number: string; // e.g., "3.10"
    title: string;
    status: "draft" | "ready" | "in-progress" | "done";
    story_points: string; // e.g., "5-8"
    owner: string;
  }>;
  total: number;
  limit: number;
}
```

**GET /api/squads**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    description: string;
    members_count: number;
    status: "active" | "inactive";
  }>;
  total: number;
  limit: number;
}
```

#### Data Sources
- **Stories:** Parse from `docs/stories/**/[0-9]+.[0-9]+.story.md` files
- **Squads:** Read from `core-config.yaml` squads section OR team_members table

#### Implementation Steps
1. Create StoriesService to scan and parse story files
2. Create SquadsService to read from config or database
3. Create API endpoints GET /api/stories and GET /api/squads
4. Create useStories and useSquads hooks
5. Update StoriesTab and SquadsTab components
6. Add error handling and empty states

#### Testing Strategy
- File system reading with various directory structures
- YAML parsing robustness
- Squad data source switching (config vs. DB)
- Component rendering with various data sizes

---

## Story 3.12: GitHub Integration

**Complexity:** SIMPLE | **Effort:** 4-6h | **Priority:** HIGHEST

### Functional Specification

#### User Story
As a **dashboard user**, I want to **see the correct GitHub repository configured** (not hardcoded), so that **the dashboard works with any GitHub org/repo**.

#### Acceptance Criteria
1. GITHUB_OWNER and GITHUB_REPO configurable via .env
2. Dashboard displays current repo info
3. Links to GitHub repo working
4. Fallback to hardcoded defaults if env not set

### Technical Specification

#### Environment Variables
```env
# packages/api/.env
GITHUB_OWNER=SynkraAI (user must verify via git remote -v)
GITHUB_REPO=aiox-core
```

#### Files to Modify
```
packages/api/src/services/
└── github.ts (UPDATE - 3 lines)

packages/dashboard/src/
└── components/header/
    └── RepoLink.tsx (UPDATE)
```

#### Implementation Steps
1. Update github.ts to use env variables
2. Create GET /api/github/config endpoint
3. Update dashboard to display repo info
4. Add link to GitHub repo
5. Document .env setup in story

#### Testing Strategy
- Different GitHub org/repo combinations
- Missing env variables (test fallback)
- Valid vs. invalid GitHub URLs

---

## Story 3.13: Engine/Tasks/Workflows (Phase 1 Replacement)

**Complexity:** STANDARD | **Effort:** 12-16h | **Priority:** HIGH

### Functional Specification

#### User Story
As a **system monitor**, I want to **see real workflows and engine metrics** (not hardcoded data), so that **I can accurately assess system state**.

#### Acceptance Criteria
1. WorkflowsService reads real YAML files from .aiox-core/development/workflows/
2. EngineService uses real system metrics
3. engine_available flag reflects actual engine health
4. 2-second health check timeout
5. No fake data when engine unavailable
6. Graceful handling of missing files/services

### Technical Specification

#### Files to Modify
```
packages/api/src/services/
├── workflows.ts (REFACTOR)
├── engine.ts (REFACTOR)
└── github.ts (UPDATE - env var)
```

#### API Contracts

**GET /api/workflows/list**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    description: string;
    phases: string[];
    agents: string[];
    status: "draft" | "active" | "archived";
  }>;
  total: number;
  limit: number;
}
```

**GET /api/engine/status**
```typescript
{
  status: "healthy" | "degraded" | "offline";
  engine_available: boolean; // CRITICAL FLAG
  pool: {
    active: number;
    total: number;
  };
  health: {
    cpu_percentage: number;
    memory_usage_mb: number;
    uptime_seconds: number;
  };
  timestamp: ISO8601;
}
```

#### Implementation Details

**1. workflows.ts Refactoring**
- Scan `.aiox-core/development/workflows/*.yaml`
- Parse each YAML: extract name, description, phases, agents
- Return array with total count
- If directory empty → return { data: [], total: 0 }

**2. engine.ts Refactoring**
- Call http://localhost:4002/health with 2-second timeout
- If success → return real engine data
- If timeout/error → use SystemMetricsCollector
- CRITICAL: Set engine_available flag truthfully

**3. github.ts Update**
- Use process.env.GITHUB_OWNER and process.env.GITHUB_REPO
- Fallback to hardcoded values if not set

#### Testing Strategy
- YAML parsing with various structures
- Health check timeout behavior
- Graceful degradation when engine down
- Empty directory handling
- Error logging validation

---

## Story 3.14: Hand-offs Monitoring

**Complexity:** SIMPLE | **Effort:** 6-8h | **Priority:** HIGHEST

### Functional Specification

#### User Story
As a **scrum master**, I want to **see agent handoff artifacts** (not mock), so that **I can track agent communication flows**.

#### Acceptance Criteria
1. HandoffsTab displays handoff artifacts from .aiox/handoffs/
2. Shows: from_agent, to_agent, timestamp, status (consumed/pending)
3. Real-time queue monitoring
4. Graceful handling when no handoffs exist

### Technical Specification

#### Files to Modify
```
packages/api/src/services/
└── handoffs.ts (CREATE)

packages/dashboard/src/
├── components/tabs/
│   └── HandoffsTab.tsx (UPDATE)
└── hooks/
    └── useHandoffs.ts (CREATE)
```

#### API Contract

**GET /api/handoffs**
```typescript
{
  data: Array<{
    id: string;
    from_agent: string;
    to_agent: string;
    timestamp: ISO8601;
    status: "pending" | "consumed";
    story_context?: {
      story_id: string;
      branch: string;
    };
  }>;
  total: number;
  limit: number;
}
```

#### Implementation Steps
1. Create HandoffsService to read .aiox/handoffs/
2. Parse YAML handoff artifacts
3. Create GET /api/handoffs endpoint
4. Create useHandoffs hook
5. Update HandoffsTab component

#### Testing Strategy
- Directory reading with various file formats
- YAML parsing robustness
- Real-time monitoring accuracy
- Empty queue handling

---

## Story 3.15: Agent Memory Visualization

**Complexity:** SIMPLE | **Effort:** 8-10h | **Priority:** HIGH

### Functional Specification

#### User Story
As a **framework developer**, I want to **visualize agent memory files** (user, feedback, project, reference), so that **I can understand agent context and learning**.

#### Acceptance Criteria
1. MemoryTab displays memory hierarchy
2. Shows: memory type, file name, metadata, content preview
3. Real-time sync with .claude/memory/ directory
4. Proper rendering of frontmatter

### Technical Specification

#### Files to Modify
```
packages/api/src/services/
└── memory.ts (CREATE)

packages/dashboard/src/
├── components/tabs/
│   └── MemoryTab.tsx (CREATE)
└── hooks/
    └── useMemory.ts (CREATE)
```

#### API Contracts

**GET /api/memory**
```typescript
{
  data: Array<{
    id: string;
    type: "user" | "feedback" | "project" | "reference";
    file_name: string;
    metadata: {
      name: string;
      description: string;
      type: string;
    };
    content_preview: string; // First 500 chars
    last_modified: ISO8601;
  }>;
  total: number;
}
```

**GET /api/memory/{agent-id}**
```typescript
{
  data: Array<Memory>;
  total: number;
  agent_id: string;
}
```

#### Implementation Steps
1. Create MemoryService for file system traversal
2. Implement YAML frontmatter parser
3. Create GET /api/memory endpoints
4. Create useMemory hook
5. Create MemoryTab component
6. Add content preview logic

#### Testing Strategy
- Frontmatter extraction from various formats
- Directory traversal with nested structures
- Content preview truncation
- Missing metadata handling

---

## Story 3.16: Missing Analytics & Routes (Phase 2 Routes)

**Complexity:** STANDARD | **Effort:** 12-16h | **Priority:** HIGH

### Functional Specification

#### User Story
As a **product manager**, I want to **see project analytics and agent performance** (comprehensive), so that **I can make data-driven decisions**.

#### Acceptance Criteria
1. GET /api/agents returns 12 AIOX agents
2. GET /api/squads returns project squads
3. GET /api/tools/mcp returns MCP registry
4. GET /api/analytics/overview returns aggregated metrics
5. GET /api/analytics/performance/agents returns per-agent stats

### Technical Specification

#### Files to Modify
```
packages/api/src/
├── routes/agents.ts (CREATE)
├── routes/squads.ts (CREATE)
├── routes/tools.ts (CREATE)
└── routes/analytics.ts (CREATE)

packages/api/src/services/
├── agents.ts (CREATE)
├── analytics.ts (CREATE)
└── mcp-registry.ts (CREATE)
```

#### API Contracts

**GET /api/agents**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    icon: string;
    role: string;
    status: "online" | "offline" | "idle";
  }>;
  total: number;
}
// Always returns hardcoded list of 12 AIOX agents
```

**GET /api/tools/mcp**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    type: string;
    status: "enabled" | "disabled" | "error";
    version: string;
  }>;
  total: number;
}
```

**GET /api/analytics/overview**
```typescript
{
  total_agents: number;
  active_agents: number;
  total_workflows: number;
  active_workflows: number;
  total_stories: number;
  total_squads: number;
  system_health: "healthy" | "degraded" | "critical";
  timestamp: ISO8601;
}
```

**GET /api/analytics/performance/agents**
```typescript
{
  data: Array<{
    agent_id: string;
    success_rate: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    error_count: number;
    total_requests: number;
    time_window: "24h" | "7d" | "30d";
  }>;
  total: number;
}
```

#### Implementation Details

**1. Agents Endpoint**
- Return hardcoded list of 12 AIOX agents
- Include: id, name, icon, role, status
- Status can be hardcoded "online" for MVP

**2. Squads Endpoint**
- Read from core-config.yaml OR team_members table
- Aggregate member counts
- Handle both data sources gracefully

**3. MCP Registry Endpoint**
- Read extensions/mcp-registry.json
- Format for dashboard consumption
- Include version information

**4. Analytics Overview**
- Aggregate from multiple sources:
  - total_agents: count from agents list
  - active_agents: count from metrics table where status='running'
  - total_workflows: count from file system scan
  - active_workflows: count where not archived
  - total_stories: count from file system scan
  - total_squads: count from config/DB
  - system_health: derived from engine status + CPU

**5. Performance Metrics**
- Query metrics table grouped by agent_id
- Calculate: success_rate, avg/p95 latency
- Support time window parameter
- Handle missing data gracefully

#### Testing Strategy
- Hardcoded agent list completeness
- Data source switching (config vs DB)
- Query performance with large metrics dataset
- Time window parameter validation
- Missing/incomplete data handling

---

## Story 3.17: Complete Data Integration (Phases 1, 3, 4)

**Complexity:** COMPLEX | **Effort:** 16-20h | **Priority:** HIGH

### Functional Specification

#### User Story
As a **dashboard user**, I want to **see all real data with proper persistence** (no more DEMO), so that **the dashboard is a true system monitor**.

#### Acceptance Criteria
1. SystemMetricsCollector persists to Supabase every 60s
2. 11 dashboard components refactored (remove DEMO flags)
3. AgentsTab displays real agent metrics
4. CostsTab displays real cost data
5. OverviewTab uses real counters
6. RoadmapView fetches from API
7. useDashboard hook uses all real endpoints
8. No performance regression from metrics collection
9. All error states handled gracefully
10. Empty states show honestly when no data

### Technical Specification

#### Files to Modify
```
packages/api/src/
├── services/metrics-persistence.ts (CREATE)
├── jobs/metrics-collector.ts (CREATE)
└── config/
    └── persistence.ts (CREATE)

packages/dashboard/src/
├── components/
│   ├── AgentsTab.tsx (REFACTOR)
│   ├── CostsTab.tsx (REFACTOR)
│   ├── OverviewTab.tsx (REFACTOR)
│   ├── RoadmapView.tsx (REFACTOR)
│   ├── StoriesTab.tsx (REFACTOR - from 3.11)
│   ├── SquadsTab.tsx (REFACTOR - from 3.11)
│   ├── WorkflowsTab.tsx (REFACTOR)
│   ├── EngineStatusCard.tsx (REFACTOR)
│   ├── HandoffsTab.tsx (REFACTOR - from 3.14)
│   ├── MemoryTab.tsx (REFACTOR - from 3.15)
│   └── AnalyticsTab.tsx (REFACTOR)
├── hooks/
│   └── useDashboard.ts (REFACTOR)
└── services/
    └── dashboard.ts (REFACTOR)
```

#### Database Migration

**File:** `packages/api/migrations/20260314_system_metrics.sql`
```sql
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  agent_id VARCHAR(50) NOT NULL,
  cpu_percentage NUMERIC(5,2),
  memory_usage_mb NUMERIC(10,2),
  latency_ms INTEGER,
  success_rate NUMERIC(5,2),
  error_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,

  CONSTRAINT fk_agent_id FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_system_metrics_agent_id ON system_metrics(agent_id);
CREATE INDEX idx_system_metrics_collected_at ON system_metrics(collected_at);
```

#### Implementation Details

**1. Metrics Persistence Strategy**
- setInterval(60000) to trigger batch collection
- SystemMetricsCollector.collectCurrentMetrics() → in-memory buffer
- Every 60s: batch insert to Supabase system_metrics table
- Error handling: log errors, don't crash
- Auto-cleanup: archive metrics >90 days old

**2. MetricsPersistenceService**
```typescript
class MetricsPersistenceService {
  private buffer: SystemMetric[] = [];

  constructor() {
    // Start batch insert job every 60s
    setInterval(() => this.flushMetrics(), 60000);
  }

  async flushMetrics(): Promise<void> {
    if (this.buffer.length === 0) return;
    try {
      await supabase
        .from('system_metrics')
        .insert(this.buffer);
      this.buffer = [];
    } catch (error) {
      logger.error('Metrics persistence failed', error);
      // Don't crash, keep buffer for retry
    }
  }
}
```

**3. Component Refactoring (all 11 components)**

Each component needs:
- Remove DEMO flag checks
- Wire to real API endpoints
- Handle loading states properly
- Show error boundaries
- Empty states when no data
- Proper error logging

**4. useDashboard Hook Refactoring**
```typescript
function useDashboard() {
  const metrics = useQuery(
    ['metrics'],
    () => fetch('/api/metrics').then(r => r.json()),
    { refetchInterval: 5000 }
  );

  const workflows = useQuery(
    ['workflows'],
    () => fetch('/api/workflows/list').then(r => r.json()),
    { refetchInterval: 30000 }
  );

  // ... fetch all endpoints in parallel

  return {
    metrics: metrics.data,
    workflows: workflows.data,
    // ... merge all results
    isLoading: metrics.isLoading || workflows.isLoading || ...,
    error: metrics.error || workflows.error || ...,
  };
}
```

**5. Performance Optimization**
- Metrics collection runs async (no await)
- React Query for smart caching
- Debounce re-renders for frequently updated data
- Monitor CLS/LCP during metrics collection

#### Testing Strategy

**Unit Tests**
- MetricsPersistenceService batch logic
- Metrics collector data format
- Hook data aggregation logic

**Integration Tests**
- Component rendering with real data
- Error boundary behavior
- Empty state display

**Performance Tests**
- Metrics collection impact on dashboard
- FCP, LCP, CLS metrics before/after
- Database query performance

**E2E Tests**
- Full dashboard flow with real API
- Data persistence to Supabase
- Component interaction flows

#### Implementation Order (CRITICAL)
1. Phase 0: Supabase setup (team_members table + RLS)
2. Create system_metrics table migration
3. Implement MetricsPersistenceService
4. Start metrics collection job
5. Verify Supabase persistence working
6. Refactor useDashboard hook
7. Component refactoring one at a time (test after each)
8. Performance testing
9. Deploy and monitor

---

## Specification Summary

| Story | Title | Complexity | Effort | Status |
|-------|-------|-----------|--------|--------|
| 3.10 | Agent Metrics Real-Time | SIMPLE | 6-8h | Ready for Review |
| 3.11 | Stories & Squads Real Reading | SIMPLE | 8-10h | Ready for Review |
| 3.12 | GitHub Integration | SIMPLE | 4-6h | Ready for Review |
| 3.13 | Engine/Tasks/Workflows | STANDARD | 12-16h | Ready for Review |
| 3.14 | Hand-offs Monitoring | SIMPLE | 6-8h | Ready for Review |
| 3.15 | Agent Memory Visualization | SIMPLE | 8-10h | Ready for Review |
| 3.16 | Missing Analytics & Routes | STANDARD | 12-16h | Ready for Review |
| 3.17 | Complete Data Integration | COMPLEX | 16-20h | Ready for Review |

**Total Effort:** 72-94 hours
**Total Story Points:** 80-100 SP

---

## Next Phase: QA Critique (Phase 5)

All specifications are ready for @qa critique. Specifications will be evaluated on:
- Completeness and clarity
- Technical feasibility
- Risk identification
- Test coverage adequacy
- Architecture alignment

**Proceed to Phase 5:** QA Critique and Verdict

---

*Specification Bundle Generated: 2026-03-14 14:20:00 UTC*
*Owner: @pm (Morgan)*
*Next: @qa Critique Phase*
