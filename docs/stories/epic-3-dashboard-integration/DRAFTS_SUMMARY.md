# 📝 Wave 5 Stories: Draft Summary

**Status:** ✅ All 6 stories drafted and ready for @dev
**Date:** 2026-03-13 23:59 UTC
**Drafted By:** River (@sm - Scrum Master)

---

## 🎯 What Was Drafted

| Story | Title | Points | Files | Status |
|-------|-------|--------|-------|--------|
| **3.10** | Agent Metrics Real-Time | 5-8 | 1 | ✅ DRAFTED |
| **3.11** | Stories & Squads Real Reading | 8-13 | 1 | ✅ DRAFTED |
| **3.12** | GitHub Integration | 5-8 | 1 | ✅ DRAFTED |
| **3.13** | Engine/Tasks/Workflows | 13-21 | 1 | ✅ DRAFTED |
| **3.14** | Hand-offs Monitoring | 5-8 | 1 | ✅ DRAFTED |
| **3.15** | Agent Memory Visualization | 8-13 | 1 | ✅ DRAFTED |

**Total:** 49-81 story points across 6 files

---

## 📍 Where Stories Live

```
docs/stories/epic-3-dashboard-integration/stories/
├── 3.10.story.md    ← Agent Metrics (Foundation)
├── 3.11.story.md    ← Stories/Squads + Backend endpoint work
├── 3.12.story.md    ← GitHub API integration
├── 3.13.story.md    ← Engine/Tasks/Workflows (Largest)
├── 3.14.story.md    ← Hand-offs from .aiox/handoffs/
└── 3.15.story.md    ← Memory browser & search
```

---

## 🚀 Execution Sequence

### Week 1: Story 3.10 (Foundation)
**Agent Metrics Real-Time** — Get agents showing with REAL Supabase data
- Effort: 5-8 pts
- All infra exists (metricsService, API endpoints)
- Just wire them together
- Unblocks 3.11 & 3.12

### Week 2: Stories 3.11 + 3.12 (Parallel)
**Stories/Squads + GitHub** — Add more observability

#### Story 3.11 (8-13 pts)
- Backend: Create `/api/stories` endpoint
- Frontend: Replace FALLBACK_STORIES with real data
- Read from `docs/stories/` directory

#### Story 3.12 (5-8 pts)
- GitHub API client setup
- Create `/api/github/commits`, `/api/github/prs`, `/api/github/branches`
- Use GITHUB_TOKEN from .env

### Week 3: Story 3.13 (Largest)
**Engine/Tasks/Workflows** — System execution status
- Effort: 13-21 pts
- Create 3 backend endpoints
- Update 3 frontend hooks
- Big effort but critical for observability

### Week 4: Stories 3.14 + 3.15 (Parallel)
**Hand-offs + Memories** — Agent context & memory visualization

#### Story 3.14 (5-8 pts)
- Read from `.aiox/handoffs/` directory
- Create `/api/handoffs/history` & `/api/handoffs/:id`
- Timeline visualization

#### Story 3.15 (8-13 pts)
- Read agent memories from filesystem
- Create `/api/memory/list`, `/api/memory/{file}`, `/api/memory/search`
- Memory browser with search

---

## 📋 What Each Story Includes

### Per Story: Everything @dev Needs

✅ User Story (why)
✅ Acceptance Criteria (what to test)
✅ Technical Details (how):
   - Files to modify
   - Backend endpoints needed
   - Frontend hooks required
   - Implementation code examples
✅ Testing Checklist (validation)
✅ Definition of Done (completion)
✅ Dependencies & Blockers (risk)
✅ Implementation Hints (shortcuts for @dev)
✅ Success Metrics (final validation)

---

## 🎯 Key Points for @dev

### Frontend Pattern (Consistent Across All Stories)

1. **Create Hook** that calls API via service
   ```typescript
   export function useRealData() {
     return useQuery({
       queryKey: ['data'],
       queryFn: () => service.getData(),
       refetchInterval: 5000 or 10000 or 30000, // As needed
     });
   }
   ```

2. **Create Service** that calls backend
   ```typescript
   // services/api/xyz.ts
   async function getData() {
     return apiClient.get('/xyz');
   }
   ```

3. **Update Component** to use real data
   ```typescript
   const { data, isLoading, error } = useRealData();
   // Replace mock data with real data
   ```

### Backend Pattern (Consistent Across All Stories)

1. **Create Service** that reads from data source
2. **Create Endpoints** that call service
3. **Handle Errors** gracefully
4. **Add Caching** for performance

---

## 🔧 Backend Endpoints Summary

**Already Exist (Story 3.10):**
- ✅ `GET /api/metrics` — Agent metrics from Supabase
- ✅ `GET /api/system-metrics` — System metrics from Supabase
- ✅ `GET /api/health` — Health check

**Need to Create (3.11 onwards):**
- `GET /api/stories` — Stories from docs/stories/
- `GET /api/github/commits`, `/prs`, `/branches` — GitHub API
- `GET /api/engine/status` — Worker pool status
- `GET /api/tasks/list` — Active tasks
- `GET /api/workflows/list` — Active workflows
- `GET /api/handoffs/history`, `/:id` — Hand-off timeline
- `GET /api/memory/list`, `/{file}`, `/search` — Agent memories

---

## ✨ Success Criteria: Wave 5 Complete

Dashboard home shows:
```
✅ 0️⃣ Dashboard UI — Fast, responsive, no errors
✅ 1️⃣ Agents — 5+ agents from Supabase (LIVE)
✅ 2️⃣ Squads — Real squads with member counts
✅ 3️⃣ Stories — Project stories (not mock)
✅ 4️⃣ GitHub — Recent commits, PRs, branches
✅ 5️⃣ Engine — Worker pool, queue status
✅ 6️⃣ Tasks — Active tasks with progress
✅ 7️⃣ Workflows — Running workflows
✅ 8️⃣ Hand-offs — Agent context transfer timeline
✅ 9️⃣ Memories — Agent memory files browser
```

**All with "Last updated X seconds ago" and "Live" badges.**

---

## 🚦 Next Steps for @dev

1. **Start with 3.10** (smallest, foundation)
2. **Read the story file** carefully
3. **Check what's already there:**
   - metricsService exists? Yes ✅
   - API endpoints exist? Yes ✅
   - Just wire them together!
4. **Test with curl** before touching frontend
5. **Implement frontend** changes
6. **Run tests**
7. **Create PR** (via @devops for push)

---

## 📊 Effort & Timeline

| Week | Stories | Points | Effort | Notes |
|------|---------|--------|--------|-------|
| 1 | 3.10 | 5-8 | ⭐ Easy | Foundation, all infra exists |
| 2 | 3.11+3.12 | 13-21 | 🔥 Medium | Parallel backend+frontend |
| 3 | 3.13 | 13-21 | 🔥 Large | Biggest story, lots of endpoints |
| 4 | 3.14+3.15 | 13-21 | 🔥 Medium | Parallel filesystem+search |
| **Total** | **6 stories** | **49-81** | **4 weeks** | **Full observability** |

---

## 📞 Questions @dev Might Have

**Q: Where do I start?**
A: Open `docs/stories/epic-3-dashboard-integration/stories/3.10.story.md` and read the User Story section.

**Q: What's already working?**
A: API (/api/metrics), Dashboard UI, metricsService hook. Just wire them together.

**Q: Do I implement all 6 at once?**
A: No! One per week in sequence (3.10 → 3.11+3.12 → 3.13 → 3.14+3.15)

**Q: Can I run this in parallel?**
A: Yes! 3.11+3.12 parallel, 3.14+3.15 parallel. But 3.10 must be first.

**Q: How do I test?**
A: Curl the endpoints first, then test in browser. Checklist in each story.

---

## 🎓 Pro Tips for @dev

1. **Copy the pattern:** Each story uses same frontend pattern (hook→service→component)
2. **Reuse infrastructure:** Backend uses same patterns (service→endpoint→error handling)
3. **Test endpoints first:** Curl works before touching UI
4. **Use existing components:** Don't build new; wire existing ones
5. **Follow hints:** Each story has "Implementation Hints" section for shortcuts

---

## 📝 Files Created

```
docs/stories/epic-3-dashboard-integration/
├── epic.md                          ✅ Updated with Wave 5
├── INDEX.md                         ✅ Complete index
├── WAVE5_PROGRESS.md               ✅ Detailed checklist
├── DRAFTS_SUMMARY.md               ✅ This file
└── stories/
    ├── 3.10.story.md               ✅ DRAFTED
    ├── 3.11.story.md               ✅ DRAFTED
    ├── 3.12.story.md               ✅ DRAFTED
    ├── 3.13.story.md               ✅ DRAFTED
    ├── 3.14.story.md               ✅ DRAFTED
    └── 3.15.story.md               ✅ DRAFTED
```

---

## ✅ Checklist for @dev

- [ ] Read `3.10.story.md` completely
- [ ] Verify `/api/metrics` works with curl
- [ ] Check metricsService exists in dashboard code
- [ ] Review AgentsMonitor component
- [ ] Implement useRealAgentMetrics hook
- [ ] Connect to AgentsMonitor component
- [ ] Test in browser
- [ ] Run tests: `npm run test`
- [ ] Run lint: `npm run lint`
- [ ] Create PR (via @devops)

---

**Wave 5 Ready! 🚀**

All stories drafted, structured, and ready for implementation.
@dev: Start with Story 3.10 whenever ready.

— River, removendo obstáculos 🌊

*Last updated: 2026-03-13 23:59 UTC*
