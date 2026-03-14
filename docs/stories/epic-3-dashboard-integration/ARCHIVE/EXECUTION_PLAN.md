# 🎯 Wave 5 Execution Plan

**Epic:** Epic 3 — Dashboard Integration
**Wave:** 5 (Real Data Integration)
**Total Effort:** 44-71 story points (~4 weeks)
**Status:** ✅ READY FOR DEVELOPMENT

---

## 📊 Dependency Graph

```
                    START
                      │
                    3.10 ← Foundation (5-8 pts, 2-4h)
                      │
         ┌────────────┼────────────┐
         │            │            │
    3.11 ╱ 3.12    3.13        (unblocks)
    (parallel)    (8h)
         │            │
         └────┬───────┘
              │
         3.14 ╱ 3.15
         (parallel)
              │
            END
```

**Critical Path:** 3.10 → 3.13 → (3.14|3.15) = Longest duration
**Parallel Opportunities:** (3.11|3.12), (3.14|3.15)

---

## 🚦 Detailed Dependency Matrix

### Story 3.10: Agent Metrics Real-Time

**Status:** ✅ FOUNDATION
**Depends On:** None (all infrastructure exists)
**Blocks:** 3.11, 3.12, 3.13, 3.14, 3.15 (as pattern reference)
**Can Start:** Immediately
**Effort:** 5-8 pts | **Duration:** 2-4 hours

**Why it's foundation:**
- Establishes frontend pattern: Hook → Service → Component
- Establishes backend pattern: Service → Endpoint
- All other stories use same pattern
- @dev learns the workflow once, applies 5 more times

**Critical Deliverables:**
- useRealAgentMetrics hook
- AgentsMonitor component wired to real API
- All tests passing

---

### Stories 3.11 + 3.12: Parallel (Week 2)

#### 3.11: Stories & Squads Real Reading
**Status:** ✅ READY (Depends on 3.10 pattern)
**Depends On:** 3.10 (pattern reference only, not blocking implementation)
**Blocks:** None directly, but should complete before 3.13 starts
**Can Start:** After 3.10 OR in parallel with 3.12
**Effort:** 8-13 pts | **Duration:** 4-6 hours

**Key Work:**
- Create `/api/stories` endpoint (backend)
- Replace FALLBACK_STORIES with real API call (frontend)
- Implement story filtering & kanban board

**Critical Path Item:** YES — foundational for observability

#### 3.12: GitHub Integration
**Status:** ✅ READY (Independent)
**Depends On:** 3.10 (pattern reference only)
**Blocks:** None directly
**Can Start:** Parallel with 3.11
**Effort:** 5-8 pts | **Duration:** 3-4 hours

**Key Work:**
- Create GitHub API client (Octokit or gh CLI)
- Create `/api/github/*` endpoints (3 endpoints)
- Wire GitHubView component

**Not on Critical Path:** Can be delayed if needed, but benefits from parallelism

**Rationale for Parallelism:**
- Both follow same pattern as 3.10
- Both have independent backends (no conflicts)
- @dev can work on 3.11 while another dev works on 3.12
- Reduces overall timeline from 10 hours to ~7 hours

---

### Story 3.13: Engine/Tasks/Workflows (Week 3)

**Status:** ✅ READY (but COMPLEX)
**Depends On:** 3.10, 3.11 (pattern reference)
**Blocks:** 3.14, 3.15 (as pattern reference)
**Can Start:** After 3.10 completes
**Effort:** 13-21 pts | **Duration:** 6-8 hours

**Why COMPLEX:**
- 3 separate systems (Engine, Tasks, Workflows)
- 3 backend endpoints
- Multiple frontend components
- High visibility (critical for observability)

**Recommendation: SPLIT INTO 2 STORIES**

#### 3.13a: Engine Status (Subset)
**Effort:** 5-8 pts | **Duration:** 2-3 hours
**Deliverables:**
- `/api/engine/status` endpoint only
- EngineStatusCard component
- Health monitoring dashboard

**Unblocks:** 3.14, 3.15 faster (can start sooner)

#### 3.13b: Tasks & Workflows (Subset)
**Effort:** 8-13 pts | **Duration:** 4-5 hours
**Depends On:** 3.13a (pattern reference)
**Deliverables:**
- `/api/tasks/list` endpoint
- `/api/workflows/list` endpoint
- TasksCard + WorkflowsCard components

**Benefit of Split:**
- 3.13a unblocks 3.14/3.15 in Week 3 midpoint
- Faster feedback loop (smaller PRs)
- Reduced risk (smaller scope per story)
- Better team velocity (can parallelize across team)

---

### Stories 3.14 + 3.15: Parallel (Week 4)

#### 3.14: Hand-offs Monitoring
**Status:** ✅ READY
**Depends On:** 3.13a (or 3.13 full) — pattern reference
**Blocks:** None
**Can Start:** After 3.13a completes
**Effort:** 5-8 pts | **Duration:** 3-4 hours

**Key Work:**
- Create `/api/handoffs/*` endpoints (2 endpoints)
- Read `.aiox/handoffs/` YAML files
- Implement hand-off timeline visualization

#### 3.15: Agent Memory Visualization
**Status:** ✅ READY
**Depends On:** 3.13a (or 3.13 full) — pattern reference
**Blocks:** None
**Can Start:** After 3.13a completes
**Effort:** 8-13 pts | **Duration:** 4-6 hours

**Key Work:**
- Create `/api/memory/*` endpoints (3 endpoints)
- Read agent memory files from filesystem
- Implement memory browser with search

**Rationale for Parallelism:**
- Both independent (no shared code/data)
- Both have similar patterns to 3.10-3.13
- Can be worked on simultaneously
- Reduces final week duration from 7-10 hours to ~6 hours

---

## 🗓️ Timeline & Capacity

### Week-by-Week Breakdown

```
WEEK 1: Story 3.10 Foundation
├─ Mon: Draft → Approved
├─ Tue-Wed: Implementation (2-3h)
├─ Wed: Testing + QA
├─ Thu: Code review + refinement
└─ Fri: Merge + ready for 3.11/3.12

Hours: 6-8h | Effort: 5-8 pts | Velocity: 1 story
Outcome: Pattern established, all stories unblocked

---

WEEK 2: Stories 3.11 + 3.12 PARALLEL
├─ Dev 1: Story 3.11 (4-6h)
│  ├─ Tue-Wed: Backend endpoint + frontend
│  ├─ Thu: Testing + code review
│  └─ Fri: Merge
│
├─ Dev 2: Story 3.12 (3-4h)
│  ├─ Tue-Wed: GitHub client + endpoints + component
│  ├─ Thu: Testing + code review
│  └─ Fri: Merge
│
└─ Team Velocity: 2 stories in parallel time

Hours: 7-10h (parallel) | Effort: 13-21 pts | Velocity: 2 stories

---

WEEK 3: Story 3.13 (or 3.13a + 3.13b split)
OPTION A: Single Large Sprint (Higher Risk)
├─ Mon-Wed: Implementation (6-8h, intense)
├─ Thu: Testing + refinement
└─ Fri: Code review + merge

Hours: 8-10h | Effort: 13-21 pts | Velocity: 1 large story

OPTION B: Split Into Two (RECOMMENDED - Lower Risk)
├─ Mon-Tue: 3.13a Implementation (2-3h)
├─ Wed: 3.13a Testing + code review
├─ Thu-Fri: 3.13b Implementation (4-5h)
└─ Friday: 3.13b Testing + code review + merge both

Hours: 7-9h | Effort: 13-21 pts | Velocity: 2 small stories
Benefit: 3.14/3.15 can start Wed (vs Friday)

---

WEEK 4: Stories 3.14 + 3.15 PARALLEL
├─ Dev 1: Story 3.14 (3-4h)
├─ Dev 2: Story 3.15 (4-6h)
├─ Mid-week: First story completes + reviews
└─ End-of-week: Both stories merged

Hours: 6-8h (parallel) | Effort: 13-21 pts | Velocity: 2 stories
Outcome: Wave 5 COMPLETE
```

### Total Capacity

| Metric | Value |
|--------|-------|
| **Total Points** | 44-71 pts (estimate: 57) |
| **Total Hours** | 27-37 hours (estimate: 31h) |
| **Calendar Duration** | 4 weeks |
| **Parallel Efficiency** | +1 week saved by parallelism |
| **Dev Team Size** | 1-2 devs (optimal: 2 for parallel work) |
| **Velocity** | 11-18 pts/week (optimal: 14 pts/week) |

---

## ⚠️ Blockers & Risk Assessment

### Critical Blockers: NONE ✅

All infrastructure exists:
- ✅ API running on :3000
- ✅ Supabase connected
- ✅ Dashboard framework ready
- ✅ React Query setup
- ✅ Service layer patterns established
- ✅ Error handling patterns ready

### Potential Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| 3.13 too large | Medium | Split into 3.13a + 3.13b |
| Backend endpoints not working | Medium | Test with curl first (provided in specs) |
| React Query cache conflicts | Low | Follow existing patterns from 3.10 |
| GitHub API rate limits | Low | Implement caching (30 min default) |
| File reading performance | Low | Cache for 60 seconds |
| Type safety issues | Low | Use TypeScript strict mode |

### Decision Points

**Decision 1: Story 3.13 Split?**
- ✅ RECOMMENDED: Split into 3.13a + 3.13b
- Timeline benefit: ~1 day saved
- Risk reduction: Smaller scope per PR
- Team benefit: Can parallelize across team

**Decision 2: Parallel Devs for 3.11+3.12?**
- ✅ RECOMMENDED: Use 2 devs for parallel work
- Timeline benefit: ~3 days saved
- No conflicts: Independent stories

**Decision 3: Start 3.14+3.15 Before 3.13 Complete?**
- ✅ RECOMMENDED: Start 3.14+3.15 after 3.13a completes
- Timeline benefit: ~1 day saved
- Pattern available: 3.13a provides reference

---

## 📋 Success Criteria by Story

### Story 3.10: Foundation Complete
- [ ] Hook created & exported
- [ ] Component wired to real API
- [ ] API returns real Supabase data
- [ ] All tests passing
- [ ] PR merged
- **→ Ready for 3.11, 3.12, 3.13**

### Stories 3.11 + 3.12: Parallel Complete
- [ ] 3.11: `/api/stories` endpoint working
- [ ] 3.11: StoryWorkspace component wired
- [ ] 3.12: GitHub client initialized
- [ ] 3.12: 3 GitHub endpoints working
- [ ] 3.12: GitHubView component wired
- [ ] Both: All tests passing
- [ ] Both: PRs merged
- **→ Ready for 3.13**

### Story 3.13 (or 3.13a+3.13b): Engine Complete
- [ ] 3 endpoints created (`/api/engine/*`, `/api/tasks/*`, `/api/workflows/*`)
- [ ] Dashboard cards display real data
- [ ] All tests passing
- [ ] PRs merged
- **→ Ready for 3.14 + 3.15**

### Stories 3.14 + 3.15: Parallel Complete
- [ ] 3.14: Hand-off timeline displays
- [ ] 3.15: Memory browser functional
- [ ] 3.14: Search working
- [ ] 3.15: All tests passing
- [ ] Both: PRs merged
- **→ Wave 5 COMPLETE**

---

## 🚀 Go/No-Go Checklist

Before each story starts, verify:

- [ ] Previous story(ies) merged & working
- [ ] Specs reviewed & understood
- [ ] Testing strategy clear
- [ ] API endpoints designed (if new)
- [ ] Frontend components identified
- [ ] No blockers identified
- [ ] @dev has all resources needed

---

## 📞 Communication Plan

### Status Updates

- **Weekly:** Monday morning standup (progress + blockers)
- **Daily:** Async updates in #wave-5-dev channel (if using)
- **PR Reviews:** Within 24 hours
- **Blockers:** Escalate immediately to @pm

### Escalation Path

- **Minor issues:** Fix directly or ask in Slack
- **Design questions:** Escalate to @architect
- **API questions:** Escalate to @pm
- **Critical blockers:** Escalate to @aiox-master

---

## ✅ Final Approval

| Role | Item | Status | Sign-Off |
|------|------|--------|----------|
| **@pm** | Execution Plan Clear | ✅ | Morgan (@pm) |
| **@po** | Stories Ready | ⏳ AWAITING | Pax (@po) |
| **@dev** | Ready to Implement | ⏳ AWAITING | Dex (@dev) |
| **@architect** | No Architecture Concerns | ⏳ AWAITING | Aria (@architect) |

---

**Plan Status:** READY FOR @po VALIDATION ✅
**Next Step:** Hand off to @po (Pax) for story validation
**Development Start:** Upon @po approval

---

*Created: 2026-03-14 09:45 UTC | By: Morgan (@pm)*
