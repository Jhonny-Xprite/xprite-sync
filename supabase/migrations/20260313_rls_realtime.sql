-- Migration: RLS Policies for Real-time Subscriptions
-- Story: 3.2 - Integração de Dados em Tempo Real
-- Created: 2026-03-13
-- Description: Enforce RLS on real-time subscriptions to ensure users only receive authorized data

-- ============================================================
-- RLS POLICIES FOR AGENT_METRICS REALTIME
-- ============================================================
-- NOTE: Policies from 20260313_dashboard_rls.sql already control
-- which rows users can see. Supabase Realtime automatically
-- enforces these policies for subscriptions.

-- Users can only subscribe to metrics for teams they belong to
-- (This is enforced by existing SELECT policy)

-- ============================================================
-- RLS POLICIES FOR SYSTEM_METRICS REALTIME
-- ============================================================
-- Users can only subscribe to system metrics for their teams
-- (This is enforced by existing SELECT policy)

-- ============================================================
-- RLS POLICIES FOR WORKFLOW_LOGS REALTIME
-- ============================================================
-- Users can only subscribe to workflow logs for their teams
-- (This is enforced by existing SELECT policy)

-- ============================================================
-- RLS POLICIES FOR USER_ACTIVITY REALTIME
-- ============================================================
-- Users can only subscribe to activity for:
-- 1. Their own activity
-- 2. Team activity (if they're team admin)
-- (This is enforced by existing SELECT policy)

-- ============================================================
-- REALTIME SUBSCRIPTION SECURITY VERIFICATION
-- ============================================================
-- RLS policies automatically apply to real-time subscriptions in Supabase.
-- When a client subscribes via supabase.from('table').on(...),
-- the subscription is filtered using the same RLS policies defined in the SELECT policies.

-- Example validation query:
-- SELECT * FROM agent_metrics
-- WHERE team_id IN (
--   SELECT team_id FROM team_members
--   WHERE user_id = auth.uid()
-- );
-- This query is automatically applied during real-time subscription filtering.

-- ============================================================
-- TESTING RLS WITH REALTIME
-- ============================================================
-- 1. Connect as User A (belongs to Team X)
-- 2. Subscribe to agent_metrics:
--    const channelA = supabase.from('agent_metrics').on('*', callback).subscribe()
-- 3. User A should receive ONLY metrics for Team X
--
-- 4. Try to manually query metrics for Team Y (not a member):
--    const { data } = await supabase.from('agent_metrics').select()
--    Result: Empty (RLS blocks access)
--
-- 5. Verify same filtering applies to Realtime:
--    Realtime subscription should also show empty/no updates for Team Y

-- ============================================================
-- NOTES
-- ============================================================
-- - No additional RLS policies are needed for Realtime
-- - Existing SELECT policies automatically protect Realtime subscriptions
-- - If RLS policies are modified, they immediately affect new subscriptions
-- - Active subscriptions continue with previously allowed data
