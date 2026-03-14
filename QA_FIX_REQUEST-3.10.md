# 📝 QA Fix Request — Story 3.10

**Story:** 3.10 — Agent Metrics Real-Time
**Status:** 🔴 BLOCKED — QA Gate Failed
**Issues Found:** 3 Critical + 3 High + 3 Medium
**Priority:** HIGHEST (Foundation for Wave 5)

---

## 🔴 Critical Issues (Must Fix Before Approval)

### Fix #1: Placeholder Data Issue

**File:** `packages/api/src/index.ts`
**Endpoint:** `GET /api/metrics`
**Problem:** Returns placeholder zeros when Supabase is empty, violating AC "zero mock data"
**Status:** BLOCKS APPROVAL

**Current Code (Lines 65-90):**
```typescript
if (metrics.length === 0) {
  logger.info('No agent metrics in Supabase, returning placeholder');
  const placeholder = {
    id: 'placeholder-1',
    agent_id: agentId || 'all',
    team_id: DEFAULT_TEAM_ID,
    status: 'idle' as const,
    latency_ms: 0,
    success_rate: 0,
    error_count: 0,
    processed_count: 0,
    memory_usage_mb: 0,
    cpu_percentage: 0,
    recorded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return res.status(200).json({
    data: [placeholder],
    total: 1,
    limit,
    message: 'No data in database yet. Insert agent metrics to see real data.',
  });
}
```

**Fix Options:**

**Option A (Recommended): Insert Real Test Data**
1. Connect to Supabase dashboard
2. Insert 3-5 real agent metrics for @dev, @qa, @architect
3. Verify `GET /api/metrics` returns real data
4. Update AC testing checklist in story to document test data

**Option B: Return Error Instead of Placeholder**
1. Change status code to 204 (No Content) when empty
2. Frontend handles no-data gracefully
3. No mock data returned

**Option C: Populate with Dynamic Test Data**
1. Create test seed function
2. Run on API startup if Supabase empty
3. Ensure it's clearly labeled as "test data"

**Recommendation:** Option A (insert real test data via Supabase UI)

---

### Fix #2: ESLint Errors (Blocking PR Merge)

**Files:** Multiple
**Issue Count:** 7 errors preventing merge
**Status:** BLOCKS PR MERGE

**Errors to Fix:**

```
packages/dashboard/src/hooks/useApiMetrics.ts
├─ Line 3:32 – 'HandoffsResponse' is defined but never used
├─ Line 3:30 – 'MemoryResponse' is defined but never used
└─ Line 3:51 – 'MemorySearchResponse' is defined but never used

packages/dashboard/src/hooks/useStories.ts
├─ Line 3:31 – 'Story' is defined but never used
└─ Line 3:43 – 'StoriesResponse' is defined but never used

packages/dashboard/src/components/handoffs/HandoffMonitor.tsx
└─ Line 70:9 – 'queryClient' is assigned but never used
```

**Fix Steps:**

1. **useApiMetrics.ts** (Line 3)
   ```typescript
   // BEFORE
   import { ... HandoffsResponse, MemoryResponse, MemorySearchResponse } from '../services/api/handoffs'

   // AFTER
   import { ... } from '../services/api/handoffs'  // Remove unused types
   ```

2. **useStories.ts** (Line 3)
   ```typescript
   // BEFORE
   import { ... Story, StoriesResponse } from '../services/api/stories'

   // AFTER
   import { ... } from '../services/api/stories'  // Remove unused
   ```

3. **HandoffMonitor.tsx** (Line 70)
   ```typescript
   // BEFORE
   const queryClient = useQueryClient();  // Assigned but never used

   // AFTER
   // Remove the line entirely if not needed
   // Or if intentionally unused: const _queryClient = useQueryClient();
   ```

**Validation:**
```bash
npm run lint  # Should show 0 errors after fixes
```

---

### Fix #3: Run Functional Tests

**Status:** NO TESTS RUN YET
**Required:** Must verify real data integration

**Test Checklist:**

```bash
# Test 1: API Returns Real Data
curl http://localhost:3000/api/metrics
# Expected: Real metrics from Supabase (NOT placeholder zeros)
# Verify: latency_ms > 0, success_rate varies, data is real

# Test 2: Dashboard Loads
npm run dev --workspace=packages/dashboard
# Navigate to: http://localhost:5175
# Expected: AgentsMonitor shows agents with real data
# Verify: Live Data badge shows, no 404 errors

# Test 3: Auto-Refresh Works
# Open DevTools Network tab
# Wait 5 seconds
# Expected: New fetch to /api/metrics every 5s
# Verify: "Last updated X seconds ago" increments

# Test 4: Error Handling
# Stop API server (kill localhost:3000)
# Expected: Dashboard shows error message
# Verify: No console errors, graceful fallback shown
```

**Document Results in Story:**
- Add test screenshots
- Add curl responses
- Add browser console output (if any)
- Update AC testing checklist

---

## 🟠 High Priority Issues (Should Fix)

### Issue #4: setState in useEffect Warnings

**Severity:** HIGH (Can cause cascading renders)
**Files:** 2 files, 2 warnings
**Status:** WILL NOT BLOCK but QA recommends fix

**AgentsMonitor.tsx (Line 48-52):**
```typescript
// Current (WARNING)
useEffect(() => {
  if (metricsResponse?.data && metricsResponse.data.length > 0) {
    setLastUpdated(new Date());
  }
}, [metricsResponse?.data]);

// Recommendation
useEffect(() => {
  if (metricsResponse?.data && metricsResponse.data.length > 0) {
    setLastUpdated(new Date());
  }
}, [metricsResponse?.data, setLastUpdated]);  // Add all dependencies
```

**useApiMetrics.ts (Line 76-99):**
```typescript
// useRealtimeMetricSubscription hook
// Fix missing dependency: 'onError'
// Add to dependency array: [agentId, onError]
```

---

### Issue #5: Missing useEffect Dependencies

**Severity:** HIGH (Stale closures)
**Count:** 2+ instances
**Fix:** Add all dependencies to arrays

---

## 🟡 Medium Priority (Documentation/Nice to Have)

### Enhancement: Manual Refresh Button

**Status:** AC says "Nice to Have" but critical for real data
**Current:** Refresh only via automatic polling
**Suggested:** Add "Refresh Now" button next to "Live Data" badge

```typescript
// In AgentsMonitor.tsx
<div className="flex items-center gap-3">
  <Badge>Live Data</Badge>
  <button onClick={handleRefresh} className="...">
    <RefreshCw className="w-4 h-4" />
  </button>
</div>
```

---

## ✅ Implementation Checklist

### Critical Path (MUST DO)

- [ ] **Fix #1:** Resolve placeholder data issue
  - [ ] Option chosen: _______________
  - [ ] Implementation complete
  - [ ] Verified with curl test

- [ ] **Fix #2:** Remove 7 ESLint errors
  - [ ] useApiMetrics.ts (3 imports)
  - [ ] useStories.ts (2 imports)
  - [ ] HandoffMonitor.tsx (1 variable)
  - [ ] Verified: `npm run lint` shows 0 errors

- [ ] **Fix #3:** Run functional tests
  - [ ] API endpoint test (curl)
  - [ ] Dashboard load test
  - [ ] Auto-refresh test (DevTools)
  - [ ] Error handling test
  - [ ] Document results

### Quality Path (SHOULD DO)

- [ ] Fix #4: useEffect warnings (both files)
- [ ] Fix #5: Add missing dependencies
- [ ] Enhancement: Add "Refresh Now" button

---

## 🔄 Submission Workflow

**After Fixes:**

1. Run full test suite
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

2. Document test results in story notes

3. Commit with message:
   ```
   fix(story-3.10): resolve placeholder data + fix eslint issues

   - Insert real test data to Supabase
   - Remove unused imports (7 errors)
   - Add missing useEffect dependencies
   - Run functional tests
   ```

4. Push and request QA re-review
   ```
   *review 3.10
   ```

---

## 📊 QA Re-Review Criteria

After submitting fixes, QA will verify:

- ✅ No placeholder data (real Supabase metrics returned)
- ✅ 0 ESLint errors
- ✅ 0 critical warnings
- ✅ Functional tests all pass
- ✅ "Live Data" badge works correctly
- ✅ Auto-refresh every 5 seconds verified

**Target:** QA Approval → Ready for Merge

---

## 📞 Questions?

**About placeholder data issue:**
- Can we access Supabase UI to insert test data?
- Or should we populate via API seed function?

**About testing:**
- Should functional tests be added to test suite?
- Or is manual curl testing sufficient?

---

*QA Fix Request Generated: 2026-03-14*
*Assigned to: @dev (Dex)*
*Expected Resolution: 2-4 hours*
