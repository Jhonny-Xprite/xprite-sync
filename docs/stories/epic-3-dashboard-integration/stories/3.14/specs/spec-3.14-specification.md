# Specification: Story 3.14 — Hand-offs Functional & Monitored

## Summary

Surface agent hand-off history (context transfers between agents) on the Dashboard via a new HandoffMonitor component. Read hand-off YAML files from `.aiox/handoffs/` directory through a backend endpoint, display them in a timeline visualization, and allow clicking to see full hand-off context. This enables orchestration engineers to understand agent collaboration patterns and trace execution flow.

## Requirements Breakdown

### Hand-off Display

**FR-1:** Timeline Visualization
- Format: Vertical timeline with chronological hand-off events
- Each event shows: from_agent → to_agent, timestamp (relative: "5 min ago"), status badge
- Status colors: Green (completed), Blue (in-progress), Red (failed)
- Scrollable list: Show last 20 hand-offs, sorted newest first

**FR-2:** Hand-off Details
- Per hand-off card: from_agent, to_agent, timestamp (relative), status
- On click: Modal or expanded view shows:
  - Full story context
  - Decisions made
  - Files modified
  - Blockers (if any)
  - Next action taken

**FR-3:** Quick Statistics
- Display: "Last hand-off: @pm → @dev (5 min ago)"
- Success rate: "95% of hand-offs completed"
- Total hand-offs: "45 total hand-offs"

**FR-4:** Data Source
- Read from: `.aiox/handoffs/` directory
- File format: YAML (handoff-pm-to-dev-20260313_235000.yaml)
- Parsing: Extract from YAML frontmatter
- Real data: Show actual agent collaborations from project

### Real-Time Updates

**FR-5:** Auto-Refresh
- Interval: 30 seconds (balanced — hand-offs created infrequently)
- Manual refresh button: Force immediate update
- Loading skeleton while fetching

**FR-6:** Error Handling
- If .aiox/handoffs/ directory missing: Show "No hand-offs yet" message
- If YAML parse fails: Skip that file, log error
- If API fails: Show "Hand-off data unavailable" message

### Optional Features

**FR-7:** Search & Filter (Optional)
- Filter by from_agent or to_agent
- Filter by date range
- Search by story ID

## Design Decisions

### Why 30-Second Polling Instead of Real-Time?
- **Reason:** Hand-offs created infrequently (during agent handoff protocol). 30s is reasonable balance.
- **Alternative:** Real-time file watcher (more complex, not needed for MVP)
- **Trade-off:** Slight delay (acceptable for non-critical feature)

### Why Timeline Visualization?
- **Reason:** Chronological display makes agent collaboration flow obvious
- **UX:** Visual representation easier to understand than list
- **Alternative:** Simple list (rejected — less intuitive)

### Why Modal for Details?
- **Reason:** Full hand-off context is lengthy. Modal keeps main view uncluttered.
- **Alternative:** Expandable cards (works but more layout complexity)

### Why Backend Endpoint Instead of Direct File Read?
- **Reason:** Filesystem access controlled on backend. Browser can't read .aiox/handoffs/.
- **Security:** Limits exposure of hand-off content to authorized APIs
- **Scalability:** Can add caching/filtering on backend

## Implementation Strategy

### Step 1: Backend Service (`packages/api/src/services/handoffs.ts`)
```typescript
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

class HandoffService {
  private handoffsDir = '.aiox/handoffs';

  async getHandoffHistory(limit = 20): Promise<Handoff[]> {
    // 1. Read .aiox/handoffs/ directory
    // 2. Filter for handoff-*.yaml files
    // 3. Sort by timestamp (newest first)
    // 4. Parse YAML for each file
    // 5. Return array of Handoff objects
    // 6. Slice to limit
  }

  async getHandoff(id: string): Promise<HandoffDetail> {
    // 1. Read specific handoff-{id}.yaml file
    // 2. Parse full YAML
    // 3. Return complete handoff object with all fields
  }

  private parseHandoffFile(filePath: string): Handoff {
    // Extract: from_agent, to_agent, timestamp, status, story_id
    // Calculate: duration if end timestamp exists
    // Return: summary Handoff object
  }
}
```

### Step 2: Backend Endpoints (`packages/api/src/index.ts`)
```typescript
app.get('/api/handoffs/history', async (req, res) => {
  try {
    const { limit = 20, from_agent, to_agent } = req.query;
    let handoffs = await handoffService.getHandoffHistory(limit);

    // Optional filtering
    if (from_agent) handoffs = handoffs.filter(h => h.from_agent === from_agent);
    if (to_agent) handoffs = handoffs.filter(h => h.to_agent === to_agent);

    const stats = {
      total_handoffs: handoffs.length,
      success_rate: handoffs.filter(h => h.status === 'completed').length / handoffs.length,
      most_recent: handoffs[0]?.timestamp,
    };

    res.json({ data: handoffs, stats });
  } catch (error) {
    res.status(500).json({ error: 'Handoff data unavailable' });
  }
});

app.get('/api/handoffs/:id', async (req, res) => {
  try {
    const handoff = await handoffService.getHandoff(req.params.id);
    res.json(handoff);
  } catch (error) {
    res.status(404).json({ error: 'Handoff not found' });
  }
});
```

### Step 3: Frontend Service (`packages/dashboard/src/services/api/handoffs.ts`)
```typescript
export const handoffsApi = {
  async getHistory(limit = 20, fromAgent?: string, toAgent?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (fromAgent) params.append('from_agent', fromAgent);
    if (toAgent) params.append('to_agent', toAgent);
    const response = await fetch(`/api/handoffs/history?${params}`);
    return response.json();
  },

  async getDetail(id: string) {
    const response = await fetch(`/api/handoffs/${id}`);
    return response.json();
  },
};
```

### Step 4: Frontend Hook (`packages/dashboard/src/hooks/useHandoffs.ts`)
```typescript
export function useHandoffs(limit = 20) {
  return useQuery({
    queryKey: ['handoffs'],
    queryFn: () => handoffsApi.getHistory(limit),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 25 * 1000, // 25 seconds
  });
}

export function useHandoffDetail(id: string) {
  return useQuery({
    queryKey: ['handoff', id],
    queryFn: () => handoffsApi.getDetail(id),
  });
}
```

### Step 5: Frontend Components

#### HandoffMonitor.tsx (Container)
- Call `useHandoffs(20)` hook
- Render loading skeleton
- Render error message if error
- Pass handoffs to HandoffTimeline
- Display quick stats

#### HandoffTimeline.tsx (Timeline)
- Render vertical timeline
- Each handoff = event node with arrow/line
- Status color: green/blue/red
- Click handler: open HandoffCard modal

#### HandoffCard.tsx (Details)
- Show full hand-off details in modal
- Display: from_agent → to_agent, story_context, decisions, files, blockers, next_action
- Close button to dismiss modal

## Testing Strategy

### Curl Tests
```bash
curl http://localhost:3000/api/handoffs/history
curl http://localhost:3000/api/handoffs/history?limit=5
curl http://localhost:3000/api/handoffs/handoff-pm-to-dev-20260313_235000
```

### Browser Testing
1. Open Dashboard → Hand-offs section
2. Verify timeline displays recent hand-offs
3. Verify each hand-off shows: from_agent → to_agent
4. Verify timestamps in relative format ("5 min ago")
5. Verify status color coding (green/blue/red)
6. Click a hand-off → modal opens with full details
7. Verify story context visible in modal
8. Close modal → back to timeline
9. Verify stats: "Last hand-off: @pm → @dev (5 min ago)"
10. Verify auto-refresh every 30 seconds (DevTools Network)
11. Delete a hand-off file → verify list updates on next refresh

### Automated Tests
- Mock handoff service responses
- Test timeline renders with real data shape
- Test click opens detail modal
- Test error handling (API failure, missing directory)
- Test filter by agent (if implemented)

### Edge Cases
- Empty handoffs directory (new project)
- Single hand-off
- Hand-off with special characters in story_id
- Very long file list (100+ handoffs)
- Malformed YAML file (should skip gracefully)

## Risk Mitigation

### Risk: .aiox/handoffs/ Directory Missing
**Mitigation:**
- Check directory exists in service initialization
- Show friendly message: "No hand-offs yet — agent collaboration history will appear here"

### Risk: YAML Parse Error
**Mitigation:**
- Wrap parsing in try-catch
- Log error but don't crash
- Skip failed files, show count of successful parses

### Risk: Stale Data During Development
**Mitigation:**
- Use 25s staleTime with 30s refetchInterval (ensures refresh)
- Manual refresh button for testing

## Success Criteria

### Quantifiable Metrics
- ✅ `/api/handoffs/history` returns valid JSON with last 20 hand-offs
- ✅ Dashboard displays hand-off timeline
- ✅ Each hand-off shows: from_agent, to_agent, timestamp, status
- ✅ All hand-offs from .aiox/handoffs/ directory (not mock)
- ✅ Clicking hand-off opens modal with full details
- ✅ Success rate metric displayed (e.g., "95% completed")
- ✅ Auto-refresh every 30 seconds verified in DevTools
- ✅ Error handling: Shows "No hand-offs yet" if directory empty
- ✅ All tests passing
- ✅ TypeScript: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ Timeline visualization is clear and intuitive
- ✅ Agent collaboration flow obvious at a glance
- ✅ Detail modal is readable and complete
- ✅ No hardcoded data — all from real .aiox/handoffs/

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** SIMPLE-STANDARD (9/25 pts)
**Estimated Effort:** 5-8 story points (3 hours)
**Dependency:** Story 3.13 must be approved first
**Can Run In Parallel:** Story 3.15
