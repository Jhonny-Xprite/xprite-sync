# 📖 Story 3.15: Agent Memory Visualization

**Status:** 🟢 Drafted
**Epic:** Epic 3 — Dashboard Integration
**Owner:** @dev (Dex)
**Story Points:** 8-13
**Priority:** 🟡 MEDIUM (Can run in parallel with 3.14)

---

## 👤 User Story

As an **AI orchestration engineer**,
I want to **browse and search agent memory files** on Dashboard,
So that **I can understand what each agent remembers** about users, projects, and past interactions.

---

## 🎯 Acceptance Criteria

### Primary (Must Have)

- [ ] Dashboard Memory Browser displays:
  - List of all agents with memory file counts
  - For each agent: show memory categories (user, project, feedback, reference)
  - File count per category
  - Last updated timestamp for each memory
- [ ] Memory file browser (expandable tree view):
  - Shows directory structure: `~/.claude/projects/{project}/memory/`
  - Lists all `.md` files organized by category
  - Each file shows size, last modified date
  - Clickable to view full content in modal/viewer
- [ ] Search functionality:
  - Search across all agent memories
  - Search by keyword in file contents
  - Filter by agent, category, or date range
  - Results show file path and matching context
- [ ] Memory content viewer:
  - Display markdown formatted
  - Highlight search matches
  - Copy to clipboard option
  - Show file metadata (created, updated, size)
- [ ] Real-time updates:
  - Memory list refreshes when new files added
  - Shows "Last sync: X seconds ago"
- [ ] Error handling:
  - Shows "Memory directory not found" if path missing
  - Graceful degradation if search fails

### Secondary (Nice to Have)

- [ ] Memory statistics:
  - Total memories across all agents
  - Memory by type pie chart
  - Most recently updated memories
  - Largest memory files
- [ ] Memory timeline: show memory updates over time
- [ ] Memory diff: compare memory versions
- [ ] Export functionality: download agent memory as JSON/CSV
- [ ] Memory insights: "Agent @dev has 234 memories, 45 new this week"

---

## 🔧 Technical Details

### Files to Create/Modify

```
packages/dashboard/src/
├── components/
│   ├── memory/
│   │   ├── MemoryBrowser.tsx         ← CREATE (NEW)
│   │   ├── MemoryTreeView.tsx        ← CREATE (NEW)
│   │   ├── MemoryViewer.tsx          ← CREATE (NEW)
│   │   ├── MemorySearch.tsx          ← CREATE (NEW)
│   │   └── MemoryStats.tsx           ← CREATE (NEW)
│   └── dashboard/
│       └── DashboardOverview.tsx     ← Add MemoryBrowser component
├── services/api/
│   ├── memory.ts                     ← CREATE (NEW)
│   └── index.ts                      ← Export memory service
└── hooks/
    └── useMemory.ts                  ← CREATE (NEW hook)
```

### Backend Work Required

**Memory Data Source:**
```
~/.claude/projects/AIOX-CORE/memory/
├── user_profile.md
├── feedback_testing.md
├── project_status.md
├── reference_tools.md
└── ...
```

**New Endpoints:**

```bash
# List all memories (indexed by agent)
GET /api/memory/list?agent=&category=

Response:
{
  "data": [
    {
      "agent_id": "@dev",
      "category": "user",
      "file_path": "~/.claude/projects/AIOX-CORE/memory/user_profile.md",
      "filename": "user_profile.md",
      "size_bytes": 2048,
      "created_at": "2026-01-15",
      "updated_at": "2026-03-13",
      "line_count": 45
    }
  ],
  "agents": ["@dev", "@qa", "@architect", "@pm"],
  "categories": ["user", "feedback", "project", "reference"],
  "stats": {
    "total_memories": 234,
    "total_size_mb": 12.5,
    "last_updated": "2026-03-13T23:59:00Z"
  }
}

# Get memory file content
GET /api/memory/:agent_id/:filename

Response:
{
  "filename": "user_profile.md",
  "agent_id": "@dev",
  "category": "user",
  "content": "# User Profile\n\nSenior developer...",
  "size_bytes": 2048,
  "created_at": "2026-01-15",
  "updated_at": "2026-03-13"
}

# Search memories
GET /api/memory/search?query=&agent=&category=

Response:
{
  "results": [
    {
      "file_path": "~/.claude/projects/.../memory/user_profile.md",
      "agent_id": "@dev",
      "matches": [
        {
          "line": 5,
          "text": "Senior developer with 10+ years experience",
          "highlight_start": 0,
          "highlight_end": 6
        }
      ],
      "relevance_score": 0.95
    }
  ],
  "count": 3,
  "query": "developer"
}
```

### Implementation Notes

1. **Backend Service: Memory Reader**
   ```typescript
   // packages/api/src/services/memory.ts
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
       const files = fs.readdirSync(this.baseDir);
       return files
         .filter(f => f.endsWith('.md'))
         .map(f => ({
           filename: f,
           path: path.join(this.baseDir, f),
           size: fs.statSync(path.join(this.baseDir, f)).size,
           updated_at: fs.statSync(path.join(this.baseDir, f)).mtime,
           // Infer category from filename or frontmatter
           category: this.inferCategory(f),
           agent_id: agent || '@dev', // Can be inferred
         }));
     }

     async readMemory(filename: string): Promise<MemoryContent> {
       const content = fs.readFileSync(
         path.join(this.baseDir, filename),
         'utf-8'
       );
       return { filename, content };
     }

     async searchMemories(query: string): Promise<SearchResult[]> {
       const files = fs.readdirSync(this.baseDir);
       const results = [];

       for (const file of files) {
         const content = fs.readFileSync(
           path.join(this.baseDir, file),
           'utf-8'
         );
         const lines = content.split('\n');
         const matches = lines
           .map((line, idx) => ({
             line: idx,
             text: line,
             match: line.includes(query),
           }))
           .filter(m => m.match);

         if (matches.length > 0) {
           results.push({
             file,
             matches,
           });
         }
       }

       return results;
     }

     private inferCategory(filename: string): string {
       if (filename.includes('user')) return 'user';
       if (filename.includes('feedback')) return 'feedback';
       if (filename.includes('project')) return 'project';
       return 'reference';
     }
   }
   ```

2. **Backend Endpoints**
   ```typescript
   // packages/api/src/index.ts
   app.get('/api/memory/list', async (req, res) => {
     const { agent, category } = req.query;
     const memories = await memoryService.listMemories(agent, category);
     res.json({ data: memories });
   });

   app.get('/api/memory/:filename', async (req, res) => {
     const content = await memoryService.readMemory(req.params.filename);
     res.json(content);
   });

   app.get('/api/memory/search', async (req, res) => {
     const { query, agent, category } = req.query;
     const results = await memoryService.searchMemories(query);
     res.json({ results });
   });
   ```

3. **Frontend Hooks**
   ```typescript
   // packages/dashboard/src/hooks/useMemory.ts
   export function useMemoryList(agent?: string, category?: string) {
     return useQuery({
       queryKey: ['memory-list', agent, category],
       queryFn: () => memoryApi.listMemories(agent, category),
       refetchInterval: 60 * 1000, // 60 seconds
     });
   }

   export function useMemoryContent(filename: string) {
     return useQuery({
       queryKey: ['memory', filename],
       queryFn: () => memoryApi.getMemory(filename),
     });
   }

   export function useMemorySearch(query: string) {
     return useQuery({
       queryKey: ['memory-search', query],
       queryFn: () => memoryApi.search(query),
       enabled: query.length > 2, // Only search if 3+ chars
     });
   }
   ```

4. **Dashboard Component**
   ```typescript
   // packages/dashboard/src/components/memory/MemoryBrowser.tsx
   export function MemoryBrowser() {
     const { data: memories } = useMemoryList();
     const [searchQuery, setSearchQuery] = useState('');
     const { data: searchResults } = useMemorySearch(searchQuery);

     if (!memories) return <LoadingSkeleton />;

     return (
       <div className="space-y-4">
         <MemorySearch value={searchQuery} onChange={setSearchQuery} />

         {searchQuery && searchResults && (
           <MemorySearchResults results={searchResults} />
         )}

         {!searchQuery && (
           <MemoryTreeView memories={memories} />
         )}
       </div>
     );
   }
   ```

### Testing Checklist

- [ ] Backend endpoint `/api/memory/list` works
- [ ] Returns memories from `~/.claude/projects/AIOX-CORE/memory/`
- [ ] Curl test: `curl http://localhost:3000/api/memory/list`
- [ ] Memory content endpoint works: `curl http://localhost:3000/api/memory/user_profile.md`
- [ ] Search endpoint works: `curl "http://localhost:3000/api/memory/search?query=developer"`
- [ ] Frontend loads memory list
- [ ] Memory browser displays files in tree view
- [ ] Clicking file shows content in modal/viewer
- [ ] Search highlighting works
- [ ] Category filtering works
- [ ] Copy to clipboard works
- [ ] Auto-refresh every 60 seconds
- [ ] Error handling if memory directory missing
- [ ] TypeScript compilation passes
- [ ] Tests passing

---

## 📊 Definition of Done

- [ ] Backend service reads memory files from filesystem
- [ ] Three endpoints implemented: `/api/memory/list`, `/api/memory/{file}`, `/api/memory/search`
- [ ] MemoryBrowser component created with tree view
- [ ] MemoryViewer component displays file contents
- [ ] Dashboard displays agent memories
- [ ] Real memory files showing (not mock)
- [ ] Search functionality working
- [ ] Auto-refresh every 60 seconds
- [ ] Error handling implemented
- [ ] Tests passing
- [ ] Code review passed

---

## 🚀 Dependencies & Blockers

**Depends on:**
- Story 3.13 (Engine/Tasks) ✅ — for similar patterns
- Story 3.14 (Hand-offs) — can run in parallel
- ✅ Memory files exist at `~/.claude/projects/*/memory/`

**Blocks:**
- None — last story in Wave 5

---

## 🔗 Related Stories

- **3.13:** Engine/Tasks/Workflows (Wave 5 — pattern reference)
- **3.14:** Hand-offs Functional (Wave 5 — can run in parallel)

---

## 💡 Implementation Hints for @dev

1. **File reading:** Use Node.js `fs` module
2. **Directory path:** Construct path to `~/.claude/projects/AIOX-CORE/memory/`
3. **Tree view:** Use existing tree component from codebase or simple expandable list
4. **Search:** Simple substring matching OK for MVP (can use fuzzy search later)
5. **Markdown viewer:** Use react-markdown (likely already in dashboard)
6. **Performance:** Cache memory list for 60 seconds
7. **Error handling:** Show friendly message if memory directory missing

---

## 📌 Notes

- **Data source:** `~/.claude/projects/*/memory/` contains real agent memories
- **Format:** Markdown files with YAML frontmatter
- **Real data:** Shows actual memories from Claude Code sessions
- **Security:** Only read from memory directories (no write capability)
- **Future:** Could add memory editing/management capabilities

---

## ✨ Success Metrics

When this story is DONE:
- Dashboard shows **memory file browser** for all agents
- **Memory categories** clearly displayed (user, feedback, project, reference)
- **File counts** shown per category
- **Last updated** timestamps visible
- Users can **search across memories**
- **Memory content** viewable in modal with markdown formatting
- Users understand **what agents remember** about projects and users

---

**Created by:** River (@sm) — 2026-03-13 23:59 UTC
**Drafted from:** WAVE5_PROGRESS.md & INDEX.md
**Status:** All 6 stories drafted ✅
**Next Step:** @dev starts with Story 3.10 implementation
