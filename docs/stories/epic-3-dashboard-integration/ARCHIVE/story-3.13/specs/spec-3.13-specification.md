# Specification: Story 3.13 — Engine, Tasks & Workflows Functional

## Summary

Surface real AIOX Engine, Task Queue, and Workflow Execution system status on the Dashboard via three new backend endpoints and matching frontend hooks. Display engine health (worker pool, queue size, CPU/memory), active task list with progress tracking, and running workflow status. This provides orchestration engineers with real-time visibility into system execution state.

This is the LARGEST story in Wave 5. Consider breaking into 3.13a (Engine only) and 3.13b (Tasks + Workflows) if capacity is limited.

## Requirements Breakdown

### Engine Status Card

**FR-1:** Worker Pool Visibility
- Display: "4 / 8 active workers" (active / total)
- Queue size: "12 pending tasks, ~450 seconds estimated"
- Refresh interval: 10 seconds
- Color coding: Green (all healthy), Yellow (degraded), Red (critical)

**FR-2:** System Health Metrics
- CPU usage: percentage (e.g., "45.2%")
- Memory usage: percentage (e.g., "62.8%")
- Uptime: hours (e.g., "72.5 hours")
- Last health check: timestamp (relative: "checked 5 seconds ago")

**FR-3:** Navigation
- Link to Engine Workspace for detailed view
- Link should navigate without errors

### Tasks Card

**FR-4:** Active Tasks Display
- List format: Show last 5-10 active tasks
- Per task: name, status (pending|running|completed|failed), assigned executor, progress %
- Status color coding: Blue (pending), Green (running), Gray (completed), Red (failed)
- Task cards clickable → opens TaskOrchestrator with task details

**FR-5:** Task Statistics
- Quick stat line: "12 pending | 3 running | 45 completed today"
- Dynamically updated based on actual queue state
- Help users understand workload at a glance

**FR-6:** Task Progress
- Progress bar or percentage visible for each task
- Estimated time remaining (if available)

### Workflows Card

**FR-7:** Active Workflows Display
- List format: Show last 5-10 active workflows
- Per workflow: name, status (running|paused|completed|failed), progress %, estimated time remaining
- Status indicators: Blue (running), Yellow (paused), Green (completed), Red (failed)
- Workflow cards clickable → opens WorkflowView with execution details

**FR-8:** Workflow Statistics
- Quick stat line: "2 running | 1 paused | 8 completed"
- Dynamically updated
- Shows execution capacity at a glance

**FR-9:** Workflow Details
- Progress: Current step count and total steps (e.g., "5 / 15 steps")
- Timeline: Estimated completion time
- Link to workflow execution page

### Real-Time Updates

**FR-10:** Auto-Refresh Mechanism
- Default interval: 10 seconds
- Configurable: Allow changing interval in settings
- Manual refresh button: Force immediate update
- Behavior: Don't block UI during refresh

**FR-11:** Loading & Error States
- Loading skeleton while fetching (prevent FOUC)
- Error message if API fails: "Engine status temporarily unavailable"
- Graceful degradation: Show last known state if API fails

## Design Decisions

### Why 10-Second Polling for Engine/Tasks/Workflows?
- **Reason:** System state changes frequently (tasks queuing, workflows progressing). 5s would be too aggressive.
- **Trade-off:** 10s provides good balance (fresh data, reasonable server load)
- **Alternative:** 5s (rejected — too much polling), 30s (rejected — too stale for operational monitoring)

### Why Color Coding for Status?
- **Reason:** Quick visual scan for problems (red = critical, yellow = warning, green = healthy)
- **WCAG:** Combined with text labels (not color-only) for accessibility

### Why 3 Separate Cards vs One Mega Card?
- **Reason:** Separation of concerns. Each system has distinct purpose.
- **Benefit:** Users can focus on relevant information (may only care about Tasks, not Workflows)
- **Layout:** Grid layout allows responsive design (stack on mobile)

### Why Separate Backend Services?
- **Reason:** Each system (Engine, Tasks, Workflows) has distinct logic and data sources
- **Benefit:** Can evolve services independently (e.g., add caching to one without affecting others)

## Implementation Strategy

### Part A: Backend Services (3 files)

#### 1. Engine Service (`packages/api/src/services/engine.ts`)
```typescript
class EngineService {
  async getStatus(): Promise<EngineStatus> {
    // Query engine health monitoring
    // Return: status, pool info, CPU/memory/uptime
    return {
      status: 'healthy' | 'degraded' | 'critical',
      pool: {
        active_workers: 4,
        total_workers: 8,
        queue_size: 12,
        queue_estimated_time_seconds: 450,
      },
      health: {
        cpu_percentage: 45.2,
        memory_percentage: 62.8,
        uptime_hours: 72.5,
      },
      last_check: new Date(),
    };
  }
}
```

#### 2. Tasks Service (`packages/api/src/services/tasks.ts`)
```typescript
class TasksService {
  async listActive(limit = 10): Promise<{ data: Task[]; stats: TaskStats }> {
    // Query task execution queue
    // Return: active tasks, statistics (pending/running/completed/failed counts)
    return {
      data: [
        {
          id: 'task-123',
          name: 'Process agent metrics',
          status: 'running',
          executor: '@dev',
          progress: 0.65,
          started_at: new Date(),
          estimated_completion: new Date(),
        },
      ],
      stats: {
        pending: 12,
        running: 3,
        completed: 45,
        failed: 2,
      },
    };
  }
}
```

#### 3. Workflows Service (`packages/api/src/services/workflows.ts`)
```typescript
class WorkflowsService {
  async listActive(limit = 10): Promise<{ data: Workflow[]; stats: WorkflowStats }> {
    // Query workflow execution state
    // Return: active workflows, statistics (running/paused/completed counts)
    return {
      data: [
        {
          id: 'workflow-456',
          name: 'Epic 3 Wave 5 Execution',
          status: 'running',
          progress: 0.34,
          started_at: new Date(),
          estimated_completion: new Date(),
          total_steps: 15,
          completed_steps: 5,
        },
      ],
      stats: {
        running: 2,
        paused: 1,
        completed: 8,
      },
    };
  }
}
```

### Part B: Backend Endpoints (3 routes)

```typescript
// In packages/api/src/index.ts

app.get('/api/engine/status', async (req, res) => {
  try {
    const status = await engineService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Engine status unavailable' });
  }
});

app.get('/api/tasks/list', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const tasks = await tasksService.listActive(limit);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Tasks unavailable' });
  }
});

app.get('/api/workflows/list', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const workflows = await workflowsService.listActive(limit);
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Workflows unavailable' });
  }
});
```

### Part C: Frontend Hooks (3 files)

```typescript
// packages/dashboard/src/hooks/useEngine.ts
export function useEngineStatus(refetchInterval = 10000) {
  return useQuery({
    queryKey: ['engine-status'],
    queryFn: () => fetch('/api/engine/status').then(r => r.json()),
    refetchInterval,
    staleTime: 9000,
  });
}

// packages/dashboard/src/hooks/useTaskHistory.ts
export function useActiveTasks(limit = 10) {
  return useQuery({
    queryKey: ['tasks-active'],
    queryFn: () => fetch(`/api/tasks/list?limit=${limit}`).then(r => r.json()),
    refetchInterval: 10000,
    staleTime: 9000,
  });
}

// packages/dashboard/src/hooks/useWorkflows.ts
export function useActiveWorkflows(limit = 10) {
  return useQuery({
    queryKey: ['workflows-active'],
    queryFn: () => fetch(`/api/workflows/list?limit=${limit}`).then(r => r.json()),
    refetchInterval: 10000,
    staleTime: 9000,
  });
}
```

### Part D: Frontend Components (Update existing or create cards)

```typescript
// In packages/dashboard/src/components/dashboard/CockpitDashboard.tsx
export function DashboardOverview() {
  const { data: engine, isLoading: engineLoading } = useEngineStatus();
  const { data: tasks, isLoading: tasksLoading } = useActiveTasks();
  const { data: workflows, isLoading: workflowsLoading } = useActiveWorkflows();

  return (
    <div className="grid grid-cols-3 gap-4">
      <EngineStatusCard engine={engine} isLoading={engineLoading} />
      <TasksCard tasks={tasks?.data} stats={tasks?.stats} isLoading={tasksLoading} />
      <WorkflowsCard workflows={workflows?.data} stats={workflows?.stats} isLoading={workflowsLoading} />
    </div>
  );
}
```

## Testing Strategy

### Curl Tests
```bash
curl http://localhost:3000/api/engine/status
curl http://localhost:3000/api/tasks/list
curl http://localhost:3000/api/workflows/list
```

### Browser Testing
1. Open Dashboard → Overview
2. Verify Engine card displays: worker count, queue size, health metrics
3. Verify color coding (green/yellow/red based on health)
4. Verify Tasks card shows active tasks with progress
5. Verify quick stats: "12 pending | 3 running | 45 completed"
6. Verify Workflows card shows running workflows with progress
7. Verify data refreshes every 10 seconds (check DevTools Network)
8. Click task → opens TaskOrchestrator
9. Click workflow → opens WorkflowView
10. Stop API → verify error message (not crash)

### Automated Tests
- Mock engine/tasks/workflows services
- Test cards render with real data shape
- Test color coding logic (status → color mapping)
- Test error handling (API failure)
- Test navigation links

### Edge Cases
- No active tasks (empty list)
- No workflows (empty list)
- Engine degraded/critical (color changes)
- Very long task/workflow names (text wrapping)
- 100+ tasks in queue (pagination or scrolling)

## Risk Mitigation

### Risk: Progress Calculation Incorrect
**Mitigation:**
- Verify progress calculation logic with sample data
- Test with edge cases (0% and 100%)
- Add unit tests for progress calculation

### Risk: API Polling Causes High Load
**Mitigation:**
- Use staleTime = 9s with 10s refetchInterval (prevents redundant fetches)
- Monitor API response times during testing
- Cache responses on backend (optional)

### Risk: Engine/Task/Workflow Systems Unavailable
**Mitigation:**
- Implement graceful fallback: show "System unavailable" message
- Retry failed requests once
- Use React Query error boundaries

### Risk: Status/Color Mapping Incorrect
**Mitigation:**
- Create comprehensive mapping table
- Test with all status values (healthy, degraded, critical, running, paused, failed)
- Verify color contrast for accessibility

## Success Criteria

### Quantifiable Metrics
- ✅ `/api/engine/status` returns valid health data
- ✅ `/api/tasks/list` returns active tasks (5+)
- ✅ `/api/workflows/list` returns workflows (0+)
- ✅ Dashboard displays 3 cards: Engine, Tasks, Workflows
- ✅ Engine card shows worker pool (X/Y format)
- ✅ Engine card shows health metrics (CPU, memory, uptime)
- ✅ Tasks card shows statistics: "X pending | Y running | Z completed"
- ✅ Workflows card shows statistics: "X running | Y paused | Z completed"
- ✅ Data refreshes every 10 seconds ±2 seconds
- ✅ All links navigate correctly (Engine Workspace, TaskOrchestrator, WorkflowView)
- ✅ Color coding works: green (healthy), yellow (degraded), red (critical)
- ✅ Error handling: Shows message if API fails
- ✅ All tests passing
- ✅ TypeScript: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ Dashboard loads all 3 cards in < 500ms
- ✅ Data updates smoothly (no jank)
- ✅ System health visible at a glance
- ✅ Users can navigate to detailed views from cards
- ✅ Error messages are helpful

## Size & Recommendation

**Total Story Points:** 13-21 (COMPLEX)
**Recommendation:** Consider splitting into:
- **3.13a - Engine Status Only** (5-8 points)
- **3.13b - Tasks & Workflows** (8-13 points)

This allows parallel work and reduces per-story complexity.

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** COMPLEX (18/25 pts)
**Estimated Effort:** 13-21 story points (8 hours)
**Dependency:** Story 3.11 must be approved first
**Blocks:** Story 3.14 (Hand-offs) depends on this
**Note:** Largest story in Wave 5 — consider splitting for better velocity
