# Specification: Story 3.11 — Stories & Squads Real Reading

## Summary

Replace hardcoded FALLBACK_STORIES in Dashboard with real project stories read from `docs/stories/epic-*/[0-9]*.story.md` files via a new backend endpoint `/api/stories`. Display stories in Kanban board by status, group by epic, and support filtering. Additionally, ensure SquadsView displays real squads from API. This story bridges project planning visibility into live dashboard monitoring.

## Requirements Breakdown

### Functional Requirements — Stories

**FR-1:** Real Stories Source
- Source: `docs/stories/epic-*/[0-9]*.story.md` files on filesystem
- Delivery: Backend endpoint `GET /api/stories`
- Parsing: Extract story metadata from YAML frontmatter + markdown content
- Filtering: Support `epic` and `status` query parameters

**FR-2:** Story Metadata Display
- Per story, display:
  - Story ID (e.g., "3.10")
  - Title ("Agent Metrics Real-Time")
  - Current status (backlog, in-progress, review, done) — inferred from story markdown
  - Priority (low, medium, high, critical) — from frontmatter
  - Story points/effort (e.g., "5-8") — from frontmatter
  - Assigned executor (e.g., "@dev") — from frontmatter
  - Progress percentage (% tasks completed) — count completed checkboxes in AC section

**FR-3:** Kanban Board Layout
- Columns: Backlog | In Progress | Review | Done
- Drag-drop: Optional (not required for MVP)
- Visual grouping: Stories grouped within each column by epic
- Epic counter: "Epic 3 (2 in-progress, 1 done)" style header

**FR-4:** Search & Filter
- Search: Filter stories by title or description
- Filter by epic: "Show Epic 3 only"
- Filter by status: "Show in-progress stories"
- Filter by executor: "Show stories assigned to @dev"
- Results: Update UI immediately (client-side filtering OK)

**FR-5:** Story Links
- Clicking a story card opens the actual `.story.md` file
- Link destination: Relative path to markdown file in project
- Behavior: Opens in new tab or modal viewer

### Functional Requirements — Squads

**FR-6:** Real Squads Display
- Source: Backend endpoint `GET /api/squads` (or squadConfiguration file)
- Display: SquadsView component shows real squads (not mocks)
- Per squad: Name, member count, squad type, primary domain, assigned agents

**FR-7:** Squad Updates
- List refreshes when new squads added (60-second polling)
- Agent-to-squad mappings correct and current

### Non-Functional Requirements

**NFR-1:** Performance
- Query caching: 30-60 second staleTime (stories change less frequently than metrics)
- Refetch interval: 60 seconds (balanced with file system updates)
- Initial load: < 500ms with 15+ stories
- Search/filter: < 100ms response time (client-side)

**NFR-2:** Reliability
- Graceful degradation: If story file unparseable, skip or show error for that story
- Fallback: Show helpful error message instead of empty list
- File watching: Optional — polling is acceptable

**NFR-3:** Data Integrity
- Story ID must match filename (e.g., "3.10" from "3.10.story.md")
- Status must be valid enum (backlog|in-progress|review|done)
- If file missing or corrupt, don't crash — show error toast

**CON-1:** Remove All Mock Data
- Delete FALLBACK_STORIES constant from components
- No hardcoded story data anywhere in frontend
- 100% real project data

## Design Decisions

### Why Backend Endpoint Instead of Direct File Read?
- **Reason:** Separation of concerns. Backend handles file I/O and parsing. Frontend receives clean JSON.
- **Security:** File system access controlled on backend, not exposed to browser
- **Scalability:** Can add caching, rate limiting, transformations on backend
- **Alternative:** Direct Vite dev server file read — rejected (doesn't work in production)

### Why YAML Frontmatter Parsing?
- **Reason:** Story files already have structured YAML at top (Status, Owner, Priority, etc.)
- **Tool:** `js-yaml` or `yaml` npm package
- **Fallback:** If frontmatter missing, use sensible defaults

### Why 60-Second Polling for Stories?
- **Reason:** Stories change less frequently than metrics (typically during sprint planning)
- **Trade-off:** Less API load than 5s polling, still responsive enough
- **User experience:** 60s delay is acceptable for strategic planning data

### Why Client-Side Filtering?
- **Reason:** Keep backend simple. Frontend caches full story list.
- **Trade-off:** Works for < 100 stories. For > 1000, move filtering to backend.
- **Current:** 15 stories → client-side filtering is fine

## Implementation Strategy

### Step 1: Backend Service (`packages/api/src/services/stories.ts`)
```typescript
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

class StoriesService {
  async getStories(epic?: string, status?: string): Promise<Story[]> {
    // 1. Read docs/stories/epic-*/[0-9]*.story.md files
    // 2. For each file:
    //    a. Extract YAML frontmatter
    //    b. Parse markdown content
    //    c. Infer status from checklist progress
    //    d. Create Story object
    // 3. Filter by epic and status if provided
    // 4. Return array sorted by story ID
  }

  private parseStoryFile(filePath: string): Story {
    // Extract frontmatter (---)
    // Parse YAML
    // Count completed checkboxes ([x] vs [ ])
    // Return Story object with all metadata
  }
}
```

### Step 2: Backend Endpoint (`packages/api/src/index.ts`)
```typescript
app.get('/api/stories', async (req, res) => {
  const { epic, status, limit = 50 } = req.query;
  let stories = await storiesService.getStories(epic, status);
  res.json({
    data: stories.slice(0, limit),
    total: stories.length,
    limit,
  });
});
```

### Step 3: Frontend Service (`packages/dashboard/src/services/api/stories.ts`)
```typescript
export const storiesApi = {
  async getStories(epic?: string, status?: string) {
    const params = new URLSearchParams();
    if (epic) params.append('epic', epic);
    if (status) params.append('status', status);
    const response = await fetch(`/api/stories?${params}`);
    return response.json();
  },
};
```

### Step 4: Frontend Hook (`packages/dashboard/src/hooks/useStories.ts`)
```typescript
export function useStories(epic?: string, status?: string) {
  return useQuery({
    queryKey: ['stories', epic, status],
    queryFn: () => storiesApi.getStories(epic, status),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 60 seconds
  });
}
```

### Step 5: Frontend Component (`packages/dashboard/src/components/stories/StoryWorkspace.tsx`)
- Remove FALLBACK_STORIES import
- Call `useStories()` hook
- Render loading skeleton while loading
- Render Kanban board with 4 columns (backlog, in-progress, review, done)
- Group stories by epic within each column
- Add search/filter inputs at top
- On story click, open .story.md file in modal or new tab

### Step 6: Update SquadsView
- Verify it calls `useSquads()` hook
- Hook should call `GET /api/squads` endpoint
- Render real squad data (name, members, type, domain, agents)

## Testing Strategy

### Curl Tests (Backend Verification)
```bash
# Get all stories
curl http://localhost:3000/api/stories

# Filter by epic
curl "http://localhost:3000/api/stories?epic=3"

# Filter by status
curl "http://localhost:3000/api/stories?status=in-progress"

# Get squads
curl http://localhost:3000/api/squads
```

### Browser Testing
1. Open Dashboard at http://localhost:5175
2. Navigate to StoryWorkspace
3. Verify Kanban board shows all 15 stories (not FALLBACK_STORIES)
4. Verify each story displays: title, status, priority, effort, executor
5. Verify stories grouped by epic
6. Test search: type "metrics" → filters to "Agent Metrics Real-Time"
7. Test status filter: select "In Progress" → shows only in-progress stories
8. Click a story card → opens .story.md file
9. Verify SquadsView shows real squads

### Automated Tests
- Unit test: parseStoryFile() correctly extracts metadata
- Unit test: getStories() filters by epic and status correctly
- Component test: StoryWorkspace renders stories from API
- Component test: Search/filter updates UI immediately
- Integration test: Full flow from API call to Kanban board display

### Edge Cases
- Empty epic (no stories in epic)
- Story with no priority specified (use default)
- Very long story titles (test text wrapping)
- Stories with special characters in title
- Corrupt story file (should show error, not crash)
- Status enum mismatch (default to "backlog")

## Risk Mitigation

### Risk: Story File Parsing Fails
**Mitigation:**
- Validate YAML structure before parsing
- Log parsing errors (don't silently ignore)
- Return error object for failed stories (user sees which files are corrupt)

### Risk: Progress % Incorrect
**Mitigation:**
- Count [ ] and [x] in markdown
- Test with sample story files (3.10, 3.11, etc.)
- Edge case: If no checkboxes, progress = 0

### Risk: Squad API Not Implemented
**Mitigation:**
- Confirm squad data source before starting
- Create squads endpoint as part of this story if needed

### Risk: File Path Links Don't Work
**Mitigation:**
- Generate relative paths from project root
- Test links manually before merging
- Open in modal viewer as fallback if link fails

## Success Criteria

### Quantifiable Metrics
- ✅ Dashboard shows 15 stories from docs/stories/ (not FALLBACK_STORIES)
- ✅ Stories grouped by epic (Epic 1, 2, 3, 4)
- ✅ Kanban board shows correct distribution: 3 in-progress, 4 done, 8 backlog
- ✅ Search filters to 1 story when searching "Agent Metrics"
- ✅ Status filter works (show only in-progress)
- ✅ Executor filter works (show only @dev stories)
- ✅ Story card links to real .story.md file
- ✅ SquadsView displays real squads (not mocks)
- ✅ All tests passing (unit, component, integration)
- ✅ TypeScript: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ StoryWorkspace loads in < 500ms
- ✅ Kanban board is visually clear
- ✅ Search/filter is fast (< 100ms)
- ✅ Story cards are clickable and links work
- ✅ No hardcoded data visible anywhere

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** STANDARD (13/25 pts)
**Estimated Effort:** 8-10 story points (4 hours)
**Dependency:** Story 3.10 must be approved first (pattern reference)
