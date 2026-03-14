# 🧪 Story 3.10 QA Review — Agent Metrics Real-Time

**Date:** 2026-03-14
**Story:** 3.10 — Agent Metrics Real-Time
**Status:** 🟡 Ready for Review
**Priority:** 🔴 HIGHEST (Foundation for Wave 5)

---

## 📋 Review Summary

| Category | Status | Details |
|----------|--------|---------|
| **Requirements** | ⚠️ PARTIAL | Core functionality present, but data source validation needed |
| **Implementation** | ⚠️ ISSUES | Code exists but linting + dependency issues detected |
| **Testing** | ⚠️ NOT TESTED | No functional tests run, backend data validation pending |
| **Overall Verdict** | 🔴 CONCERNS | Cannot approve until critical issues resolved |

---

## ✅ Acceptance Criteria Status

### Primary (Must Have)

| Criterion | Status | Notes |
|-----------|--------|-------|
| AgentsMonitor displays agents from `/api/metrics` | ⚠️ PARTIAL | Component wired, but data source needs validation |
| Each agent card shows required fields | ✅ IMPLEMENTED | Agent name, status, latency, success_rate, CPU%, memory% |
| Auto-update every 5 seconds | ✅ IMPLEMENTED | `refetchInterval: 5 * 1000` in hook |
| "Last updated X seconds ago" timestamp | ✅ IMPLEMENTED | Timestamp tracking with 1s interval update |
| "Live Data" badge appears | ✅ IMPLEMENTED | Badge shows when `agents.length > 0` |
| Loading skeleton | ✅ IMPLEMENTED | Uses React Query `isLoading` state |
| Error handling | ✅ IMPLEMENTED | Error boundary + error message display |
| Graceful fallback | ⚠️ PARTIAL | Returns placeholder data when Supabase empty (not real data) |

### Secondary (Nice to Have)

| Criterion | Status |
|-----------|--------|
| Manual "Refresh Now" button | ❌ NOT IMPLEMENTED |
| Status animation | ❌ NOT IMPLEMENTED |
| Hover tooltip | ❌ NOT IMPLEMENTED |
| Sort by status/latency/success_rate | ❌ NOT IMPLEMENTED |
| Color coding | ⚠️ PARTIAL (implicit in mapping) |

---

## 🔴 Critical Issues Found

### Issue #1: Placeholder Data Instead of Real Data

**Severity:** CRITICAL
**File:** `packages/api/src/index.ts`, GET `/api/metrics`
**Problem:**
```typescript
if (metrics.length === 0) {
  logger.info('No agent metrics in Supabase, returning placeholder');
  const placeholder = {
    id: 'placeholder-1',
    agent_id: agentId || 'all',
    status: 'idle',
    latency_ms: 0,
    success_rate: 0,
    // ... all zeros
  };
  return res.status(200).json({
    data: [placeholder],
    message: 'No data in database yet. Insert agent metrics to see real data.',
  });
}
```

**Impact:**
- Story requirement: "see **real agent metrics from Supabase** (not mock data)"
- Current: Returns placeholder zeros when no data
- User sees fake data, thinks system is working when it's not

**Acceptance Criteria:** ❌ FAILS
- AC says "**zero mock data** — all from real Supabase table"
- Placeholder is mock data

**Recommendation:**
- Either: Populate Supabase with real test data
- Or: Return error 204 (No Content) instead of placeholder
- Or: Return real historical data if available

---

### Issue #2: ESLint Warnings — setState in useEffect

**Severity:** HIGH
**Files:**
- `packages/dashboard/src/components/agents-monitor/AgentsMonitor.tsx:51`
- `packages/dashboard/src/hooks/useApiMetrics.ts:82`

**Problem:**
```typescript
// AgentsMonitor.tsx
useEffect(() => {
  if (metricsResponse?.data && metricsResponse.data.length > 0) {
    setLastUpdated(new Date());  // ← setState in effect
  }
}, [metricsResponse?.data]);  // ← Dependency is .data
```

**Impact:**
- Can cause cascading renders
- React recommends avoiding setState synchronously in effects
- May cause performance issues with 5s polling

**Linter Output:**
```
Warning: Error: Calling setState synchronously within an effect
can trigger cascading renders
```

**Recommendation:**
- Use `useCallback` to memoize state updates
- Or use `useRef` + `useLayoutEffect`
- Or refactor to use React Query's built-in state

---

### Issue #3: ESLint Errors — Unused Imports

**Severity:** MEDIUM
**Files:** Multiple files with linting errors

**Problems:**
```
useApiMetrics.ts
- 'HandoffsResponse' is defined but never used
- 'MemoryResponse' is defined but never used
- 'MemorySearchResponse' is defined but never used

stories.ts
- 'Story' is defined but never used
- 'StoriesResponse' is defined but never used

handoffs.ts
- 'queryClient' is assigned but never used
```

**Impact:**
- Linting failures block PR merge
- Extra imports increase bundle size (minor)
- Code quality degradation

**Recommendation:**
- Remove unused imports
- Use prefixed names if intentionally unused: `type _Unused = ...`

---

### Issue #4: Missing Dependencies in useEffect

**Severity:** HIGH
**Files:** Multiple hooks

**Problem:**
```typescript
// Missing 'onError' dependency
useEffect(() => {
  // ... code using onError
}, []); // ← onError not in deps
```

**Impact:**
- Stale closures - callbacks won't update
- React warnings in development
- Potential bugs with outdated functions

**Recommendation:**
- Add all dependencies to dependency array
- Or use `useCallback` for callback functions

---

## ⚠️ Functional Testing Required

### Missing Test Coverage

**Test Type** | **Status** | **Required For AC**
---|---|---
Curl endpoint test | ❌ NOT RUN | Must verify real data endpoint |
Dashboard load test | ❌ NOT RUN | Must verify UI renders |
Data update test | ❌ NOT RUN | Must verify 5s refresh |
Error handling test | ❌ NOT RUN | Must test API failure |
Unit tests | ⚠️ CREATED | `useRealAgentMetrics.test.ts` exists but not validated |

**Critical Test:** Real Data Source Validation
```bash
# Must verify the endpoint returns REAL data, not placeholder
curl http://localhost:3000/api/metrics
# Expected: Real metrics from Supabase, NOT placeholder zeros
```

---

## 📊 Code Quality Analysis

### TypeScript Compilation

✅ **PASS** — No compilation errors found

```bash
$ npm run typecheck --workspace=packages/api
# No errors
```

### Linting Results

❌ **FAIL** — 13 problems (7 errors, 6 warnings)

```
7 errors (unused imports)
6 warnings (setState in useEffect, missing dependencies)
```

---

## 🎯 Gate Decision Criteria

| Criterion | Required | Status |
|-----------|----------|--------|
| **All primary AC met** | YES | ⚠️ PARTIAL (placeholder data issue) |
| **No critical bugs** | YES | ❌ FAILS (placeholder data) |
| **No blocking linting** | YES | ❌ 7 ESLint errors |
| **Real data, not mock** | YES | ❌ Returns placeholder |
| **Tests passing** | YES | ❌ No functional tests run |

---

## 🔗 Related Stories

- **3.11** — Depends on 3.10 pattern for stories
- **3.12** — Depends on 3.10 pattern for GitHub
- **3.13-3.15** — All depend on 3.10 real-data pattern

**Risk:** If 3.10 returns mock data, all dependent stories will also show mock data.

---

## 💡 Recommendations

### Must Fix (Blocking)

1. **Resolve placeholder data issue**
   - Option A: Populate Supabase with real test data
   - Option B: Return 204 No Content instead of placeholder
   - Option C: Change story AC to accept placeholder (NOT RECOMMENDED)

2. **Fix ESLint errors** (7 errors)
   - Remove unused imports
   - This blocks PR merge

3. **Run functional tests**
   - Verify endpoint returns real data
   - Verify dashboard renders correctly
   - Verify 5s refresh works

### Should Fix (Quality)

4. **Fix ESLint warnings** (6 warnings)
   - useState in useEffect issue
   - Missing dependencies

5. **Add manual refresh button**
   - AC says "Nice to have" but users expect it

---

## 📝 QA Results Section

### What Works

✅ Component properly wired to hook
✅ Hook uses React Query with correct 5s interval
✅ "Last updated X seconds ago" tracking
✅ "Live Data" badge shows
✅ Loading + error states implemented
✅ TypeScript types correct

### What Doesn't Work / Needs Work

❌ **Endpoint returns placeholder data instead of real** (CRITICAL)
❌ ESLint errors block merge (7 errors)
❌ No functional validation tests run
⚠️ setState in useEffect warnings (6)
⚠️ Missing dependencies in useEffects

### Blockers

- Cannot approve story while endpoint returns placeholder data
- Cannot merge PR with 7 linting errors
- Need real data to validate "Live Data" badge actually shows real data

---

## 🏁 Gate Verdict

### **🔴 FAIL — Cannot Approve**

**Reason:** Critical issues prevent passing QA gate.

**Blocker #1:** Acceptance Criteria requires "**zero mock data — all from real Supabase table**" but endpoint returns placeholder data when Supabase is empty.

**Blocker #2:** 7 ESLint errors prevent PR merge.

**Blocker #3:** No functional tests run to verify real data integration.

### Recommendation

**RETURN TO @dev FOR FIXES**

Required fixes before re-review:
1. Resolve placeholder data (populate Supabase or change error handling)
2. Fix 7 ESLint errors
3. Run functional tests to verify real data
4. Re-run lint to clear warnings
5. Resubmit for QA review

---

## 📋 Next Steps

1. **Create QA_FIX_REQUEST.md** with detailed fix instructions
2. **Return to @dev** for issue resolution
3. **Re-test after fixes** before final approval
4. **Document** real-data validation approach in story notes

---

*QA Review: Quinn (Guardian) — 2026-03-14*
*Verdict: FAIL — Blockers require resolution before approval*
