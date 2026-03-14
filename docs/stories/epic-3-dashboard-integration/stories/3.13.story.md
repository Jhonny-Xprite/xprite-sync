# 📖 Story 3.13: Engine, Tasks & Workflows Functional

**Status:** 🟢 Drafted
**Epic:** Epic 3 — Dashboard Integration
**Owner:** @dev (Dex)
**Story Points:** 13-21 (🔴 LARGEST in Wave 5)
**Priority:** 🔴 HIGH (Depends on 3.11)

---

## 👤 User Story

As an **orchestration engineer managing AIOX system**,
I want to **see Engine status, active Tasks, and running Workflows** on Dashboard,
So that **I can monitor system health** and understand execution queue.

---

## 🎯 Acceptance Criteria

### Engine Status (Must Have)

- [ ] Dashboard Engine card displays:
  - Worker pool status (X active workers out of Y total)
  - Queue size (X pending tasks)
  - System health: CPU, memory, uptime
  - Last health check timestamp
- [ ] Color coding: green (healthy), yellow (degraded), red (critical)
- [ ] Links to Engine Workspace for detailed view
- [ ] Auto-refreshes every 10 seconds

### Tasks Listing (Must Have)

- [ ] Dashboard Tasks card shows:
  - Total active tasks
  - Tasks by status: pending, running, completed, failed
  - Recent task execution log (last 5)
  - Each task shows: name, status, assigned executor, progress %
- [ ] Task cards clickable → opens TaskOrchestrator
- [ ] Quick stats: "12 pending | 3 running | 45 completed today"
- [ ] Filter by status or executor (optional)

### Workflows Listing (Must Have)

- [ ] Dashboard Workflows card displays:
  - Active workflows count
  - Running workflows with progress
  - Recent workflow execution history (last 5)
  - Each workflow shows: name, status, progress %, estimated time remaining
- [ ] Workflow cards clickable → opens WorkflowView
- [ ] Status indicators: running (blue), paused (yellow), failed (red), completed (green)
- [ ] Quick stats: "2 running | 1 paused | 8 completed"

### Real-Time Updates (Must Have)

- [ ] All data fetches from backend in real-time (not mock)
- [ ] Auto-refresh interval configurable (default: 10 seconds)
- [ ] Manual refresh button
- [ ] Loading skeletons while fetching
- [ ] Error handling: shows "Engine unavailable" if API fails

### Secondary (Nice to Have)

- [ ] Real-time notifications when task fails
- [ ] Workflow dependency visualization
- [ ] Task priority levels in queue
- [ ] Resource usage per task
- [ ] Historical metrics (tasks/hour, success rate)

---

## 🔧 Technical Details

### Files to Modify

```
packages/dashboard/src/
├── components/
│   ├── dashboard/
│   │   ├── CockpitDashboard.tsx      ← Add Engine, Tasks, Workflows cards
│   │   └── DashboardWorkspace.tsx    ← If needed
│   ├── orchestration/
│   │   └── TaskOrchestrator.tsx      ← Update to use real data
│   ├── engine/
│   │   └── (existing components)     ← Verify they use real API
│   └── workflow/
│       └── (existing components)     ← Verify they use real API
├── hooks/
│   ├── useEngine.ts                  ← Verify uses real API
│   ├── useTaskHistory.ts             ← Verify uses real API
│   └── useWorkflows.ts               ← Verify uses real API
└── services/api/
    ├── engine.ts                     ← Verify implementation
    ├── tasks.ts                      ← Verify implementation
    └── workflows.ts                  ← Verify implementation
```

### Backend Work Required

**New Endpoints:**

```bash
# Engine Status
GET /api/engine/status

Response:
{
  "status": "healthy",
  "pool": {
    "active_workers": 4,
    "total_workers": 8,
    "queue_size": 12,
    "queue_estimated_time_seconds": 450
  },
  "health": {
    "cpu_percentage": 45.2,
    "memory_percentage": 62.8,
    "uptime_hours": 72.5
  },
  "last_check": "2026-03-13T23:55:00Z"
}

# Tasks List
GET /api/tasks/list?status=active&limit=20

Response:
{
  "data": [
    {
      "id": "task-123",
      "name": "Process agent metrics",
      "status": "running",
      "executor": "@dev",
      "progress": 0.65,
      "started_at": "2026-03-13T23:45:00Z",
      "estimated_completion": "2026-03-13T23:50:00Z"
    }
  ],
  "stats": {
    "pending": 12,
    "running": 3,
    "completed": 45,
    "failed": 2
  }
}

# Workflows List
GET /api/workflows/list?status=active&limit=20

Response:
{
  "data": [
    {
      "id": "workflow-456",
      "name": "Epic 3 Wave 5 Execution",
      "status": "running",
      "progress": 0.34,
      "started_at": "2026-03-13T20:00:00Z",
      "estimated_completion": "2026-03-14T04:00:00Z",
      "total_steps": 15,
      "completed_steps": 5
    }
  ],
  "stats": {
    "running": 2,
    "paused": 1,
    "completed": 8
  }
}
```

### Implementation Notes

1. **Engine API Client**
   ```typescript
   // packages/api/src/services/engine.ts
   class EngineService {
     async getStatus(): Promise<EngineHealth>
     async getWorkerPool(): Promise<PoolStatus>
     async getQueueSize(): Promise<number>
   }
   ```

2. **Frontend Hooks**
   ```typescript
   export function useEngineStatus(refetchInterval = 10000) {
     return useQuery({
       queryKey: ['engine-status'],
       queryFn: () => engineApi.getStatus(),
       refetchInterval,
     });
   }

   export function useActiveTasks(limit = 10) {
     return useQuery({
       queryKey: ['tasks-active'],
       queryFn: () => tasksApi.listActive(limit),
       refetchInterval: 10000,
     });
   }

   export function useActiveWorkflows(limit = 10) {
     return useQuery({
       queryKey: ['workflows-active'],
       queryFn: () => workflowsApi.listActive(limit),
       refetchInterval: 10000,
     });
   }
   ```

3. **Dashboard Integration**
   ```typescript
   // In CockpitDashboard.tsx or similar
   export function DashboardOverview() {
     const { data: engine } = useEngineStatus();
     const { data: tasks } = useActiveTasks();
     const { data: workflows } = useActiveWorkflows();

     if (!engine || !tasks || !workflows) return <LoadingSkeleton />;

     return (
       <div className="grid grid-cols-3 gap-4">
         <EngineStatusCard engine={engine} />
         <TasksCard tasks={tasks} />
         <WorkflowsCard workflows={workflows} />
       </div>
     );
   }
   ```

### Testing Checklist

- [ ] Backend endpoints created: `/api/engine/status`, `/api/tasks/list`, `/api/workflows/list`
- [ ] Curl tests return real data:
  - `curl http://localhost:3000/api/engine/status`
  - `curl http://localhost:3000/api/tasks/list`
  - `curl http://localhost:3000/api/workflows/list`
- [ ] Frontend loads Engine/Tasks/Workflows data
- [ ] Dashboard cards display real statistics
- [ ] Auto-refresh working (10-second interval visible)
- [ ] Error handling: shows message if API fails
- [ ] Color coding correct (green/yellow/red)
- [ ] All links navigate to correct views
- [ ] TypeScript compilation passes
- [ ] Tests passing
- [ ] E2E test: Dashboard shows engine status → link → Engine page loads

---

## 📊 Definition of Done

- [ ] Three backend endpoints implemented and tested
- [ ] Three hooks created/verified to use real API
- [ ] Dashboard cards display real Engine/Tasks/Workflows data
- [ ] No mock data — all real
- [ ] Auto-refresh working at 10-second interval
- [ ] Error handling implemented
- [ ] Navigation links working
- [ ] All tests passing
- [ ] Code review passed
- [ ] Dashboard shows execution status

---

## 🚀 Dependencies & Blockers

**Depends on:**
- Story 3.11 (Stories/Squads) ✅ — for similar real data patterns
- ✅ Task execution system working
- ✅ Workflow execution system working

**Blocks:**
- Story 3.14 (Hand-offs) — depends on tasks display
- Story 3.15 (Memories) — can run in parallel

---

## 🔗 Related Stories

- **3.10:** Agent Metrics Real-Time (Wave 5 — foundation)
- **3.11:** Stories & Squads Real Reading (Wave 5 — must complete first)
- **3.12:** GitHub Integration (Wave 5 — parallel)
- **3.14:** Hand-offs Functional (Wave 5 — depends on this)
- **3.15:** Agent Memories (Wave 5 — can run in parallel)

---

## 💡 Implementation Hints for @dev

1. **Largest story:** Break into 3 sub-parts:
   - Part A: Backend endpoints (3-5 pts)
   - Part B: Frontend hooks integration (3-5 pts)
   - Part C: Dashboard cards + styling (5-8 pts)

2. **Reuse patterns:** Follow same pattern as Story 3.10 (metricsService)
3. **Caching:** Cache engine/tasks/workflows for 10 seconds
4. **Error recovery:** Show last known state if API fails
5. **Progressive disclosure:** Show most critical info first, expandable details

---

## 📌 Notes

- **Largest story in Wave 5:** Spans Engine + Tasks + Workflows
- **Multi-layered:** Backend + frontend + styling work
- **Consider breaking into 2 stories if feeling too large:**
  - 3.13a: Engine Status Only
  - 3.13b: Tasks & Workflows
- **Future:** Real-time WebSocket for immediate updates

---

## ✨ Success Metrics

When this story is DONE:
- Dashboard shows **Engine worker pool status** (e.g., "4/8 active")
- **Queue size displayed** ("12 pending tasks")
- **Active tasks shown** with progress
- **Running workflows visible** with progress
- All data is **real-time** (not mock)
- **System health indicators** (CPU, memory, uptime)
- Users can **navigate to Engine, Tasks, Workflows** pages from cards

---

**Created by:** River (@sm) — 2026-03-13 23:55 UTC
**Drafted from:** WAVE5_PROGRESS.md & INDEX.md
**Note:** Largest story — can be split if needed
**Next:** Story 3.14 (Hand-offs) — starts after 3.13 complete
