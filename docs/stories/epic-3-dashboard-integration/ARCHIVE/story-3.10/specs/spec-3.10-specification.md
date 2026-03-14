# Specification: Story 3.10 — Agent Metrics Real-Time

## Summary

Replace mock agent metrics in the Dashboard AgentsMonitor component with real data from the Supabase-backed `/api/metrics` endpoint. The component will poll the endpoint every 5 seconds, display live metrics for all agents, and provide visual feedback (loading states, error handling, live badge) to indicate real-time data.

## Requirements Breakdown

### Functional Requirements

**FR-1:** Fetch Real Agent Metrics
- Service: Use existing `metricsService.getAgentMetrics()` from `packages/dashboard/src/services/api/metrics.ts`
- Endpoint: `GET /api/metrics` (already exists and returns real Supabase data)
- Frequency: Poll every 5 seconds
- Caching: React Query with staleTime 4000ms (refresh before next poll)

**FR-2:** Display Agent Information
- Component: `AgentsMonitor.tsx` (main container)
- Sub-component: `AgentMonitorCard.tsx` (individual agent card)
- Data displayed per agent:
  - Agent ID (e.g., "@dev", "@qa", "@architect")
  - Status (running, idle, offline)
  - Latency (milliseconds)
  - Success rate (percentage, 0-100)
  - CPU usage (percentage, 0-100)
  - Memory usage (MB)

**FR-3:** Auto-Refresh & Timestamps
- Refetch interval: 5000ms (automatic via React Query)
- Timestamp display: "Last updated X seconds ago" (relative time)
- Increment counter every second (even between polls)

**FR-4:** Real Data Indication
- Badge: "LIVE" displayed when showing real (not mock) data
- Condition: Always shown (since data is always real after implementation)
- Styling: Subtle, green-colored badge in top-right of AgentsMonitor

**FR-5:** Error Handling
- Scenario 1: API returns error → Show error toast: "Failed to load agent metrics"
- Scenario 2: API timeout → Show graceful message: "Metrics temporarily unavailable"
- Scenario 3: Network failure → Show fallback UI with last known data (if available)

**FR-6:** Loading States
- Initial load: Display skeleton loader (AgentsSkeleton component)
- Subsequent refetches: Show subtle loading indicator or refresh spinner
- UX: Don't block UI — allow user interaction while loading

### Non-Functional Requirements

**NFR-1:** Performance
- Query caching: 4 seconds staleTime to reduce redundant fetches
- Refetch optimization: React Query handles smart refetching
- Component render: < 100ms re-render time
- Network request: < 200ms response time expected

**NFR-2:** Reliability
- Graceful degradation: Show helpful messages, never crash on API failure
- Fallback behavior: If API fails, show last known state with "stale" indicator
- Error recovery: Auto-retry failed requests up to 3 times before showing error

**NFR-3:** Accessibility
- ARIA labels on agent cards (status, metrics)
- Tooltip text: Hover shows full agent details
- Color coding: Not sole indicator (text + color for status)
- Keyboard navigation: Sortable columns accessible via keyboard

**FR-CON-1:** Brownfield Pattern
- Reuse existing metricsService (do not reinvent)
- Follow established Hook → useQuery → Component pattern
- Maintain consistency with other real-data stories (3.11, 3.12, 3.13, 3.14, 3.15)

## Design Decisions

### Why Use React Query for Polling?
- **Reason:** Automatic refetch interval, stale time management, built-in caching
- **Alternative considered:** Manual setInterval — rejected (more boilerplate, harder to manage)
- **Impact:** Clean, maintainable, follows team patterns

### Why 5-Second Polling Interval?
- **Reason:** Balances real-time feel with API load and network efficiency
- **Trade-off:** More frequent = more responsive but higher server load; less frequent = delayed feedback
- **Chosen:** 5s is standard for dashboard monitoring patterns

### Why metricsService Instead of Direct Fetch?
- **Reason:** Abstraction layer handles polling logic, error handling, rate limiting
- **Service already exists:** No duplication of effort
- **Benefit:** Consistent with backend architecture, easier to swap transport later (WebSocket)

### Why Relative Timestamps ("X seconds ago")?
- **Reason:** More intuitive for users than absolute times
- **Implementation:** Update counter every 1 second, calculate delta from last poll time
- **Benefit:** Users see "just now" vs "5 minutes ago" at a glance

## Implementation Strategy

### Step 1: Create Hook (`packages/dashboard/src/hooks/useApiMetrics.ts`)
```typescript
export function useRealAgentMetrics(refetchInterval = 5000) {
  return useQuery({
    queryKey: ['agent-metrics-real'],
    queryFn: () => metricsService.getAgentMetrics(),
    refetchInterval,
    staleTime: 4000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

### Step 2: Update AgentsMonitor Component
- Remove FALLBACK_METRICS or mock data
- Call `useRealAgentMetrics()` hook
- Render loading skeleton while isLoading
- Render error alert if error exists
- Render agent list with real data
- Add "Last updated X seconds ago" counter
- Add "LIVE" badge

### Step 3: Update AgentMonitorCard Component
- Accept real metrics object
- Display all required fields (status, latency, success_rate, cpu, memory)
- Apply color coding: green (status=running), yellow (status=idle), red (status=offline)
- Add optional hover tooltip with full metrics

### Step 4: Add Helper Functions
- `formatRelativeTime(timestamp)` — convert ISO timestamp to "X seconds ago"
- `getStatusColor(status)` — return color based on agent status
- `getHealthIndicator(cpu, memory)` — determine if agent is healthy/degraded/critical

### Step 5: Testing
- Unit test hook: mocking metricsService.getAgentMetrics()
- Component test: AgentsMonitor renders real data, updates on refetch
- E2E test: Dashboard loads → API called → agents displayed → data refreshes every 5s

## Testing Strategy

### Curl Test (Backend Verification)
```bash
curl http://localhost:3000/api/metrics
# Expected: Real agent metrics JSON
```

### Browser Testing
1. Open Dashboard on http://localhost:5175
2. Navigate to AgentsMonitor
3. Verify agents displayed with real data (not placeholders)
4. Open DevTools Network tab
5. Confirm API calls every 5 seconds
6. Verify "Last updated" counter increments every 1 second
7. Disconnect API (throttle to "Offline" in DevTools)
8. Verify error toast appears
9. Reconnect API
10. Verify data refreshes and "LIVE" badge appears

### Automated Tests
- **Unit Test:** `useRealAgentMetrics()` with mocked metricsService
- **Component Test:** AgentsMonitor renders data correctly
- **Integration Test:** Full flow from API call to display
- **Snapshot Test:** Visual regression for AgentMonitorCard

### Edge Cases
- Empty response (no agents)
- Single agent
- Agent with all metrics = 0
- Rapid reconnect/disconnect
- Very long agent IDs or names
- Unicode in agent names

## Risk Mitigation

### Risk: API Endpoint Not Returning Expected Data
**Mitigation:**
- Verify `/api/metrics` returns correct schema before starting
- Add TypeScript types for response validation
- Log actual response if type mismatch occurs

### Risk: Polling Causes High API Load
**Mitigation:**
- Use staleTime to reduce unnecessary fetches
- Implement exponential backoff for retries
- Monitor API request rate during testing

### Risk: Stale Timestamps After App Backgrounded
**Mitigation:**
- Reset timestamp counter on focus (use window focus event)
- Optional: pause polling when app backgrounded

### Risk: Users Confused by "Last updated 5 seconds ago" When Seeing Old Data
**Mitigation:**
- Display actual data timestamp: "Recorded at 14:32:15 UTC"
- Add visual indicator if data is > 30 seconds old

## Success Criteria

### Quantifiable Metrics
- ✅ All 5+ agents display on Dashboard
- ✅ Each agent shows all 6 required metrics (status, latency, success_rate, cpu, memory)
- ✅ Data refreshes every 5 seconds ±1 second (verify in DevTools)
- ✅ "Last updated X seconds ago" increments correctly
- ✅ Zero mock data in production (100% real Supabase data)
- ✅ Error handling shows user-friendly messages (not console errors)
- ✅ All tests passing (unit, component, integration)
- ✅ TypeScript compilation: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ Dashboard loads AgentsMonitor in < 2 seconds
- ✅ Agent list updates smoothly (no jank)
- ✅ "LIVE" badge clearly indicates real data
- ✅ Loading skeleton shows briefly on initial load
- ✅ Error message is helpful (not cryptic)

## Acceptance Gates

- [ ] Story requirements reviewed by @po (Product Owner)
- [ ] Acceptance criteria confirmed achievable
- [ ] No architectural conflicts with other Wave 5 stories
- [ ] metricsService confirmed working with real Supabase data
- [ ] Frontend development can begin

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** SIMPLE (7/25 pts)
**Estimated Effort:** 3-5 story points (2 hours)
