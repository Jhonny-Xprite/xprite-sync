# 📋 Epic 3: Complete Index & Status

**Last Updated:** 2026-03-13
**Total Stories:** 15 (9 completed infra + 6 real-data integration)
**Current Phase:** Wave 5 Planning & Drafting

---

## 📊 At-A-Glance Status

```
Waves 1-4: Infrastructure Foundation
├─ Wave 1 (Setup, Schema, CI/CD)     ✅ SPECIFIED
├─ Wave 2 (Real-time Data, Metrics)  ✅ SPECIFIED
├─ Wave 3 (Caching, Tracing)        ✅ SPECIFIED
└─ Wave 4 (Documentation)            ✅ SPECIFIED

Wave 5: Real Data Integration ⭐ IN PROGRESS
├─ 3.10: Agent Metrics Real-Time     📝 DRAFTING
├─ 3.11: Stories & Squads            📝 DRAFTING
├─ 3.12: GitHub Integration          📝 DRAFTING
├─ 3.13: Engine/Tasks/Workflows      📝 DRAFTING
├─ 3.14: Hand-offs Monitoring        📝 DRAFTING
└─ 3.15: Agent Memories              📝 DRAFTING
```

---

## 🗂️ Documentation Structure

```
epic-3-dashboard-integration/
├── epic.md                          👈 Main epic definition
├── INDEX.md                         👈 YOU ARE HERE
├── WAVE5_PROGRESS.md               👈 Detailed checklist
├── execution-plan.yaml              → Wave execution strategy
├── stories-status.md                → Story-by-story status
│
├── stories/
│   ├── 3.1.story.md                ✅ Setup Inicial
│   ├── 3.2.story.md                ✅ Real-time Data
│   ├── 3.3.story.md                ✅ Schema & RLS
│   ├── 3.4.story.md                ✅ Agent Metrics
│   ├── 3.5.story.md                ✅ System Metrics
│   ├── 3.6.story.md                ✅ Caching
│   ├── 3.7.story.md                ✅ Tracing
│   ├── 3.8.story.md                ✅ CI/CD
│   ├── 3.9.story.md                ✅ Documentation
│   │
│   ├── 3.10.story.md               📝 DRAFT NEEDED
│   ├── 3.11.story.md               📝 DRAFT NEEDED
│   ├── 3.12.story.md               📝 DRAFT NEEDED
│   ├── 3.13.story.md               📝 DRAFT NEEDED
│   ├── 3.14.story.md               📝 DRAFT NEEDED
│   └── 3.15.story.md               📝 DRAFT NEEDED
```

---

## 🎯 Wave 5 at-a-Glance

### What's Complete ✅

| Component | Status | Details |
|-----------|--------|---------|
| API Running | ✅ | http://localhost:3000 |
| Supabase Connected | ✅ | agent_metrics, system_metrics tables |
| Dashboard UI | ✅ | Vite on :5175, all components built |
| Agent Metrics Endpoints | ✅ | `/api/metrics`, `/api/system-metrics` return REAL data |
| System Metrics Collector | ✅ | Real CPU, memory, disk, uptime from OS |
| metricsService | ✅ | Dashboard has `metricsService` with polling |
| WebSocket Infra | ✅ | WebSocketManager exists (not yet used) |

**Bottom Line:** We have everything. We just need to **wire it together**.

---

### What's Missing ❌

| Component | Need | Story | Effort |
|-----------|------|-------|--------|
| Agent Display | Connect real data to UI | 3.10 | 5-8 |
| Stories Backend | API endpoint for docs/stories/ | 3.11 | 8-13 |
| Squads Backend | Verify API returns real squads | 3.11 | (included) |
| GitHub Backend | GitHub API client | 3.12 | 5-8 |
| Engine Status | API endpoint for pool/queue | 3.13 | 13-21 |
| Tasks Listing | API endpoint for tasks | 3.13 | (included) |
| Workflows Listing | API endpoint for workflows | 3.13 | (included) |
| Hand-offs API | Endpoint for `.aiox/handoffs/` | 3.14 | 5-8 |
| Memory API | Endpoint for agent memories | 3.15 | 8-13 |

**Total Frontend & Backend Work:** ~49-81 story points

---

## 🚦 Execution Sequence

### Priority 1: Story 3.10 ⭐ START HERE
**Agent Metrics Real-Time** — Get agents showing on Dashboard with REAL Supabase data

**Why first?**
- Smallest story (5-8 pts)
- All infra exists (`metricsService`, API endpoints)
- Just wire them together
- Unblocks stories 3.11 and 3.12

**What happens:**
- Dashboard home shows agents from Supabase
- Each agent displays: name, status, latency, success_rate, CPU%, memory%
- Updates every 5s with "Last updated X seconds ago"

---

### Priority 2: Stories 3.11 + 3.12 (Parallel)
**Stories/Squads + GitHub** — Add more observability to Dashboard

**Why parallel?**
- Independent: don't depend on each other
- Both are 5-13 points (medium effort)
- Ready to start once 3.10 merges

---

### Priority 3: Story 3.13
**Engine/Tasks/Workflows Functional** — Show execution status

**Why after 3.11?**
- Largest story (13-21 pts)
- Needs both frontend and backend work
- Ready once team settled from 3.10

---

### Priority 4: Stories 3.14 + 3.15 (Parallel)
**Hand-offs + Memories** — Observability completeness

**Why last?**
- Depends on 3.13 for context
- Can run in parallel while 3.13 wraps up

---

## 📈 Expected Timeline

```
Week 1 (Mar 17-21):   Story 3.10 (Agent Metrics)
Week 2 (Mar 24-28):   Stories 3.11 + 3.12 (Parallel)
Week 3 (Mar 31-Apr4): Story 3.13 (Engine/Tasks/Workflows)
Week 4 (Apr 7-11):    Stories 3.14 + 3.15 (Parallel)
```

**Total:** 4 weeks to 100% dashboard observability

---

## 🎓 User Success Criteria

Dashboard home shows **all 9 observability criteria:**

```
✅ 0️⃣ Dashboard UI — No errors, responsive, fast
✅ 1️⃣ Agents — Live data from Supabase
✅ 2️⃣ Squads — Real squad list with members
✅ 3️⃣ Stories — Actual stories from project (not mock)
✅ 4️⃣ GitHub — Recent commits, PRs, branches
✅ 5️⃣ Engine — Worker pool status, queue size
✅ 6️⃣ Tasks — Active tasks with status
✅ 7️⃣ Workflows — Running workflows
✅ 8️⃣ Hand-offs — Agent context transfer history
✅ 9️⃣ Memories — Agent memory files browser
```

**All with "Last updated X seconds ago" and "Live" badges**

---

## 👤 Agent Assignments

| Story | Executor | Why |
|-------|----------|-----|
| 3.10 | @dev (Dex) | Frontend + minimal backend |
| 3.11 | @dev (Dex) | Frontend + backend endpoints |
| 3.12 | @dev (Dex) | GitHub API integration |
| 3.13 | @dev (Dex) + @architect (Aria) | Complex, may need architecture review |
| 3.14 | @dev (Dex) | Frontend + history tracking |
| 3.15 | @dev (Dex) | Memory browser + search |

**Planning:** @pm (Morgan) — drafting & prioritization
**Drafting:** @sm (River) — story creation & specs

---

## 📍 Key Files & Paths

### Frontend
- Dashboard: `packages/dashboard/src/`
  - Components: `components/dashboard/`, `components/agents-monitor/`, etc.
  - Hooks: `hooks/useAgents.ts`, `hooks/useDashboard.ts`, `hooks/useApiMetrics.ts` (NEW)
  - Services: `services/api/metrics.ts` ✅, `services/api/github.ts` (TODO)

### Backend
- API: `packages/api/src/`
  - Endpoints: `index.ts` (GET /api/metrics, /api/system-metrics) ✅
  - Services: `services/supabase.ts`, `services/system-metrics.ts`
  - New services needed: github.ts, handoffs.ts, workflows.ts, etc.

### Data
- Stories: `docs/stories/epic-3-dashboard-integration/stories/*.md` (9 done, 6 TODO)
- Dashboard: Running on :5175
- API: Running on :3000
- Supabase: `xsyixazfqnsvvdsihccv.supabase.co`

---

## 🔗 Related Documents

- **Epic Definition:** [epic.md](./epic.md)
- **Wave 5 Detailed Checklist:** [WAVE5_PROGRESS.md](./WAVE5_PROGRESS.md)
- **Execution Plan:** [execution-plan.yaml](./execution-plan.yaml)
- **Story Status:** [stories-status.md](./stories-status.md)

---

## ✨ Quick Start for @dev

1. **Read:** [WAVE5_PROGRESS.md](./WAVE5_PROGRESS.md) — understand what's missing
2. **Review:** `packages/dashboard/src/services/api/metrics.ts` — service already exists!
3. **Draft:** Start with story 3.10 (`@sm` will draft, you implement)
4. **Test:** Use curl to verify `/api/metrics` returns real data
5. **Wire:** Connect metricsService to AgentsMonitor component

**ETA for 3.10:** 1-2 days (most infra exists)

---

**Created by:** @pm (Morgan)
**Last Updated:** 2026-03-13 23:45 UTC
**Next Review:** After story 3.10 draft by @sm
