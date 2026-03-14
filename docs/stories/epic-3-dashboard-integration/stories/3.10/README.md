# 📖 Story 3.10: Agent Metrics Real-Time

**Complexity:** SIMPLE | **Points:** 5-8 | **Status:** ✅ APPROVED & READY

---

## 📁 Contents

This directory contains everything needed to implement Story 3.10:

```
3.10/
├── story.md                    ← User story, ACs, technical details
├── specs/
│   ├── spec-3.10-requirements.json    ← Phase 1: Requirements gathered
│   ├── spec-3.10-complexity.json      ← Phase 2: Complexity assessment (SIMPLE)
│   ├── spec-3.10-specification.md     ← Phase 3: Formal specification
│   └── spec-3.10-critique.json        ← Phase 4: QA validation (APPROVED)
└── README.md                   ← This file
```

---

## 🚀 Quick Start for @dev

1. **Read:** `story.md` (complete user story)
2. **Review:** `specs/spec-3.10-specification.md` (formal spec)
3. **Test:** Checklist in story.md (curl endpoints, test UI)
4. **Implement:** Follow pattern: Hook → Service → Component
5. **Validate:** All tests passing before PR

---

## 📋 Story Summary

- **What:** Dashboard shows real agent metrics from Supabase (not mock)
- **Why:** Monitor actual agent performance in real-time
- **How:** Connect existing metricsService to AgentsMonitor component
- **Effort:** 5-8 story points | ~2-4 hours
- **Complexity:** SIMPLE (foundation story, everything exists)

---

## 🎯 Acceptance Criteria

- [ ] Dashboard AgentsMonitor displays agents from `/api/metrics` endpoint
- [ ] Each agent shows: name, status, latency, success_rate, CPU%, memory
- [ ] Data updates automatically every 5 seconds
- [ ] "Last updated X seconds ago" timestamp visible
- [ ] "Live Data" badge appears when data is real
- [ ] Loading skeleton shows while fetching
- [ ] Error toast displays if API fails
- [ ] Graceful fallback when API unavailable

---

## 📊 Spec Files

### `spec-3.10-requirements.json`
**Phase 1 Output** - Requirements extracted and validated
- User story breakdown
- Acceptance criteria mapping
- Technical scope
- Dependencies & blockers

### `spec-3.10-complexity.json`
**Phase 2 Output** - Complexity assessment (SIMPLE class)
- Dimension scores: Scope(2), Integration(1), Infrastructure(1), Knowledge(1), Risk(1)
- Average: 1.2 pts → SIMPLE category
- No research needed, standard patterns only

### `spec-3.10-specification.md`
**Phase 3 Output** - Formal specification with implementation roadmap
- Summary & user value
- Requirements breakdown (FR/NFR/CON)
- Design decisions & patterns
- Implementation strategy
- Testing strategy
- Success metrics

### `spec-3.10-critique.json`
**Phase 4 Output** - QA gate validation
- Verdict: **APPROVED** ✅
- All 6 quality checks passed
- No blockers or issues
- Ready for implementation

---

## 🔧 Implementation Pattern

This story follows the standard pattern used across Wave 5:

### Frontend (React)
```typescript
// 1. Create hook (or update existing)
export function useRealAgentMetrics() {
  return useQuery({
    queryKey: ['agent-metrics-real'],
    queryFn: () => metricsService.getAgentMetrics(),
    refetchInterval: 5000,
  });
}

// 2. Use in component
const { data, isLoading, error } = useRealAgentMetrics();
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorAlert />;

return <AgentCards data={data} />;
```

### Backend (Already Exists!)
- ✅ API running: `http://localhost:3000`
- ✅ Endpoint: `GET /api/metrics`
- ✅ Returns: Real Supabase agent metrics
- ✅ No work needed! Just consume it

---

## 🧪 Testing Strategy

### 1. Backend Verification
```bash
# Verify API returns real data
curl http://localhost:3000/api/metrics?limit=10

# Expected: Array of real agents from Supabase
# [{ agent_id: "@dev", status: "running", latency_ms: 156, ... }]
```

### 2. Frontend Component Tests
- [ ] AgentsMonitor loads without errors
- [ ] Data displays correctly from API
- [ ] Refresh interval works (5 seconds)
- [ ] Timestamps update correctly
- [ ] Error handling works
- [ ] Loading skeleton visible while fetching

### 3. Integration Test
- [ ] Dashboard homepage → AgentsMonitor visible
- [ ] Real agent data shows (not mock "AGENT_PLACEHOLDER")
- [ ] "Live Data" badge visible
- [ ] Links to agent pages work
- [ ] Manual refresh button works

---

## 📈 Success Criteria

When this story is DONE:
- ✅ Dashboard shows 5+ agents from Supabase
- ✅ Each agent displays real metrics (latency, success_rate, CPU%, memory)
- ✅ Data updates automatically every 5 seconds
- ✅ "Last updated X seconds ago" visible
- ✅ Zero mock data
- ✅ All tests passing
- ✅ Code review approved

---

## 🚦 Dependencies & Blockers

**Depends On:**
- ✅ API running on :3000 (DONE)
- ✅ Supabase connected (DONE)
- ✅ `/api/metrics` endpoint working (DONE)
- ✅ metricsService exists (DONE)

**Blocks:**
- Story 3.11 — Similar pattern for stories/squads
- Story 3.12 — Similar pattern for GitHub data

---

## 💡 Pro Tips for @dev

1. **Don't reinvent:** metricsService already exists with polling
2. **Use React Query:** TanStack Query handles caching automatically
3. **Test API first:** Curl works before touching frontend
4. **Reuse components:** LoadingSkeleton, ErrorAlert already exist
5. **Follow hints:** Implementation hints in story.md are shortcuts

---

## 📞 Questions?

- **"Where's metricsService?"** → `packages/dashboard/src/services/api/metrics.ts`
- **"Does API work?"** → `curl http://localhost:3000/api/metrics`
- **"What about mock data?"** → Remove it, use real API only
- **"How to test?"** → Checklist in story.md
- **"Need help?"** → Check spec-3.10-specification.md for implementation details

---

## 🔗 Related

- **Epic:** Epic 3 — Dashboard Integration
- **Wave:** Wave 5 (Real Data Integration)
- **Predecessor:** Stories 3.1-3.9 (wave 1-4)
- **Parallel:** None (3.10 is foundation)
- **Successor:** 3.11 & 3.12 (can start after 3.10 completes)

---

**Status:** ✅ READY FOR IMPLEMENTATION | **Approver:** @pm (Morgan) | **Next:** Hand to @dev
