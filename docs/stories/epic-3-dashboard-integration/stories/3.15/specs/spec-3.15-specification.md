# Specification: Story 3.15 — Agent Memory Visualization

## Summary

Create a Dashboard Memory Browser component that displays and searches Claude Code agent memory files from `~/.claude/projects/AIOX-CORE/memory/` directory. Provide tree view navigation by agent and category, full-text search across memory content, and markdown viewer for examining individual memory files. This enables orchestration engineers to understand what agents remember about users, projects, and past interactions.

## Requirements Breakdown

### Memory Browser Display

**FR-1:** Memory File Listing
- Data source: `~/.claude/projects/AIOX-CORE/memory/` directory
- List format: Expandable tree view by agent
- Per agent: name, total memory count, categories breakdown
- Categories: user, project, feedback, reference
- Per file: filename, size (bytes), last modified date

**FR-2:** Tree View Navigation
- Expandable hierarchy:
  - Agent (@dev, @qa, @architect, etc.)
    - Category (user, project, feedback, reference)
      - File (filename.md)
- Visual indicators: folder icon (category), file icon (memory file)
- Collapsible categories for compact view

**FR-3:** File Content Display
- Click file → opens modal/viewer
- Content: Display full markdown formatted
- Metadata: Created, updated, file size, line count
- Copy button: Copy content to clipboard
- Close button: Return to tree view

**FR-4:** Search Functionality
- Search box: Type to filter memories
- Minimum 3 characters to trigger search (avoid noise)
- Search scope: File names + content
- Results display:
  - File path
  - Matching line(s) with context
  - Relevance score (if searchable files)
  - Highlight matches in results

**FR-5:** Filtering
- Filter by agent: Show only memories for selected agent
- Filter by category: Show only specific category (user, project, etc.)
- Filter by date range: Show memories modified in date range (optional)
- Multiple filters: Combine filters (AND logic)

**FR-6:** Memory Statistics** (Optional)
- Total memories across all agents
- Memory by type (pie chart or bar)
- Most recently updated memories
- Largest memory files
- "Agent @dev has 234 memories, 45 new this week" style insight

### Real-Time Updates

**FR-7:** Auto-Refresh
- Interval: 60 seconds (memories change less frequently)
- Shows: "Last sync: X seconds ago"
- Manual refresh button: Force immediate update

**FR-8:** Error Handling
- If directory missing: Show "Memory directory not found" message
- If file unreadable: Show "Unable to read file" for that file (don't crash)
- If search fails: Show "Search temporarily unavailable"

## Design Decisions

### Why Tree View vs Flat List?
- **Reason:** Hierarchical organization (Agent → Category → File) makes navigation intuitive
- **Alternative:** Flat list with filters (rejected — less scannable)
- **Benefit:** Users understand structure at a glance

### Why 60-Second Polling?
- **Reason:** Memory files updated infrequently (not real-time system)
- **Trade-off:** Slight delay acceptable for non-critical feature
- **Alternative:** Real-time file watcher (overkill for MVP)

### Why 3-Character Search Minimum?
- **Reason:** Avoid false positives and expensive searches on every keystroke
- **Alternative:** Search only on Enter key (less responsive)
- **Chosen:** 3 characters is balanced

### Why Markdown Viewer?
- **Reason:** Memory files are markdown. Render as intended (formatted, not raw text).
- **Tool:** react-markdown or similar library (likely already in project)
- **Benefit:** Better readability for YAML frontmatter, headers, lists

## Implementation Strategy

### Step 1: Backend Service (`packages/api/src/services/memory.ts`)
```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

class MemoryService {
  private baseDir = path.join(
    os.homedir(),
    '.claude/projects/AIOX-CORE/memory'
  );

  async listMemories(
    agent?: string,
    category?: string
  ): Promise<MemoryFile[]> {
    // 1. Check if baseDir exists
    // 2. Read all .md files
    // 3. For each file:
    //    a. Get file stats (size, modified)
    //    b. Infer category from filename/metadata
    //    c. Create MemoryFile object
    // 4. Filter by agent and category if provided
    // 5. Return sorted array
  }

  async readMemory(filename: string): Promise<MemoryContent> {
    // 1. Validate filename (prevent path traversal)
    // 2. Read file content
    // 3. Parse YAML frontmatter if exists
    // 4. Return { content, metadata }
  }

  async searchMemories(
    query: string,
    agent?: string,
    category?: string
  ): Promise<SearchResult[]> {
    // 1. Validate query length (>= 3 chars)
    // 2. Read all matching files
    // 3. For each file:
    //    a. Search content for query
    //    b. Get line numbers and context
    //    c. Calculate relevance score
    // 4. Filter by agent/category if provided
    // 5. Sort by relevance score
    // 6. Return results with highlights
  }

  private inferCategory(filename: string): string {
    // Logic to determine category from filename
    // Examples: user_profile.md → 'user', feedback_*.md → 'feedback'
  }
}
```

### Step 2: Backend Endpoints (`packages/api/src/index.ts`)
```typescript
app.get('/api/memory/list', async (req, res) => {
  try {
    const { agent, category } = req.query;
    const memories = await memoryService.listMemories(agent, category);
    const agents = [...new Set(memories.map(m => m.agent_id))];
    const categories = [...new Set(memories.map(m => m.category))];
    const stats = {
      total_memories: memories.length,
      total_size_mb: memories.reduce((sum, m) => sum + m.size_bytes, 0) / 1024 / 1024,
      last_updated: memories[0]?.updated_at,
    };
    res.json({ data: memories, agents, categories, stats });
  } catch (error) {
    res.status(500).json({ error: 'Memory list unavailable' });
  }
});

app.get('/api/memory/:filename', async (req, res) => {
  try {
    const content = await memoryService.readMemory(req.params.filename);
    res.json(content);
  } catch (error) {
    res.status(404).json({ error: 'Memory file not found' });
  }
});

app.get('/api/memory/search', async (req, res) => {
  try {
    const { query, agent, category } = req.query;
    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Query must be 3+ characters' });
    }
    const results = await memoryService.searchMemories(query, agent, category);
    res.json({ results, count: results.length, query });
  } catch (error) {
    res.status(500).json({ error: 'Search temporarily unavailable' });
  }
});
```

### Step 3: Frontend Service (`packages/dashboard/src/services/api/memory.ts`)
```typescript
export const memoryApi = {
  async listMemories(agent?: string, category?: string) {
    const params = new URLSearchParams();
    if (agent) params.append('agent', agent);
    if (category) params.append('category', category);
    const response = await fetch(`/api/memory/list?${params}`);
    return response.json();
  },

  async readMemory(filename: string) {
    const response = await fetch(`/api/memory/${filename}`);
    return response.json();
  },

  async search(query: string, agent?: string, category?: string) {
    const params = new URLSearchParams();
    params.append('query', query);
    if (agent) params.append('agent', agent);
    if (category) params.append('category', category);
    const response = await fetch(`/api/memory/search?${params}`);
    return response.json();
  },
};
```

### Step 4: Frontend Hook (`packages/dashboard/src/hooks/useMemory.ts`)
```typescript
export function useMemoryList(agent?: string, category?: string) {
  return useQuery({
    queryKey: ['memory-list', agent, category],
    queryFn: () => memoryApi.listMemories(agent, category),
    refetchInterval: 60 * 1000, // 60 seconds
    staleTime: 55 * 1000,
  });
}

export function useMemoryContent(filename: string) {
  return useQuery({
    queryKey: ['memory', filename],
    queryFn: () => memoryApi.readMemory(filename),
  });
}

export function useMemorySearch(query: string, agent?: string, category?: string) {
  return useQuery({
    queryKey: ['memory-search', query, agent, category],
    queryFn: () => memoryApi.search(query, agent, category),
    enabled: query.length >= 3, // Only search if 3+ chars
  });
}
```

### Step 5: Frontend Components

#### MemoryBrowser.tsx (Container)
- Call useMemoryList() hook
- State: selectedAgent, selectedCategory, searchQuery
- Render: MemorySearch + MemoryTreeView or MemorySearchResults
- Display quick stats

#### MemorySearch.tsx (Search Box)
- Input field with debounce (300ms)
- Minimum 3 characters validation
- Submit on Enter or button click

#### MemoryTreeView.tsx (Tree View)
- Render hierarchical structure
- Expandable nodes (Agent → Category → File)
- Click file → call useMemoryContent() and open MemoryViewer
- Visual icons (folder, file)

#### MemoryViewer.tsx (Modal)
- Display markdown content formatted
- Show file metadata (created, updated, size, lines)
- Copy to clipboard button
- Close button

#### MemoryStats.tsx (Optional)
- Display statistics:
  - Total memories
  - By category (pie chart)
  - Most recent
  - Largest files

## Testing Strategy

### Curl Tests
```bash
curl http://localhost:3000/api/memory/list
curl http://localhost:3000/api/memory/user_profile.md
curl "http://localhost:3000/api/memory/search?query=developer"
```

### Browser Testing
1. Open Dashboard → Memory Browser
2. Verify tree view displays agents
3. Expand agent → show categories
4. Expand category → show memory files
5. Click file → modal opens with markdown formatted content
6. Verify metadata (created, updated, size)
7. Click copy button → content copied to clipboard
8. Type in search → shows matching files
9. Verify search highlights matches
10. Filter by agent → shows only that agent's memories
11. Filter by category → shows only that category
12. Verify auto-refresh every 60 seconds (DevTools)
13. Delete a memory file → verify list updates on refresh

### Automated Tests
- Mock memory service responses
- Test tree view renders hierarchy correctly
- Test search filtering works
- Test modal content displays
- Test copy to clipboard
- Test error handling (directory missing, search fails)

### Edge Cases
- Empty memory directory (new project)
- Single memory file
- Very large memory file (10MB+)
- Special characters in filename
- YAML frontmatter only (no content)
- Very long search results (100+ matches)

## Risk Mitigation

### Risk: Memory Directory Missing or Inaccessible
**Mitigation:**
- Check directory exists at service initialization
- Show friendly message: "Memory directory not found"
- Log actual error for debugging

### Risk: Search on Large Directory is Slow
**Mitigation:**
- Implement 3-character minimum (reduces false positives)
- Consider caching search results (backend)
- Could add debounce on frontend
- Performance: acceptable for < 1000 files

### Risk: Large Memory Files Cause Memory Pressure
**Mitigation:**
- Lazy load file content (only when clicked)
- Stream large files if needed (not implemented for MVP)
- Show file size warning for > 10MB files

### Risk: Path Traversal in Filename
**Mitigation:**
- Validate filename (no ../, no absolute paths)
- Whitelist .md extension only
- Check file is within baseDir

## Success Criteria

### Quantifiable Metrics
- ✅ `/api/memory/list` returns valid JSON with all memory files
- ✅ Dashboard displays memory tree view
- ✅ Tree shows agents, categories, and files
- ✅ Clicking file opens modal with markdown content
- ✅ File metadata displayed (created, updated, size)
- ✅ Copy to clipboard button works
- ✅ Search returns matching files (3+ char queries only)
- ✅ Search results highlight matches
- ✅ Filter by agent works
- ✅ Filter by category works
- ✅ Auto-refresh every 60 seconds verified in DevTools
- ✅ Error handling: "Memory directory not found" if missing
- ✅ All tests passing
- ✅ TypeScript: zero errors
- ✅ Linting: zero warnings

### User Experience Metrics
- ✅ Tree view is intuitive and easy to navigate
- ✅ Search is fast (< 500ms for typical queries)
- ✅ Markdown rendering is readable
- ✅ Copy to clipboard is convenient
- ✅ No hardcoded data — all from real memory files

---

**Created by:** Spec Pipeline (Phase 3/4)
**Date:** 2026-03-14
**Complexity:** STANDARD (12/25 pts)
**Estimated Effort:** 8-13 story points (5 hours)
**Dependency:** Story 3.13 must be approved first
**Can Run In Parallel:** Story 3.14
**Note:** Last story in Wave 5
