-- Migration: Dashboard RLS Policies
-- Story: 3.3 - Schema & RLS Policies para Dashboard
-- Created: 2026-03-13
-- Description: Implement Row Level Security for dashboard tables

-- ============================================================
-- SECURITY SETUP
-- ============================================================

-- Enable RLS on all dashboard tables
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- agent_metrics RLS POLICIES
-- ============================================================

-- Policy: Users can view metrics for their teams
CREATE POLICY "Users can view agent metrics for their teams"
  ON agent_metrics
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND team_id = agent_metrics.team_id
    )
  );

-- Policy: Service role and backend can insert metrics
CREATE POLICY "Service can insert agent metrics"
  ON agent_metrics
  FOR INSERT
  WITH CHECK (
    -- Allow insert if user is service role or has metrics writer permission
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
        AND team_id = agent_metrics.team_id
        AND role IN ('admin', 'data-writer')
    )
  );

-- Policy: Only service role can update metrics
CREATE POLICY "Only service role can update agent metrics"
  ON agent_metrics
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: Only service role can delete (via retention job)
CREATE POLICY "Service can delete agent metrics"
  ON agent_metrics
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- system_metrics RLS POLICIES
-- ============================================================

CREATE POLICY "Users can view system metrics for their teams"
  ON system_metrics
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND team_id = system_metrics.team_id
    )
  );

CREATE POLICY "Service can insert system metrics"
  ON system_metrics
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
        AND team_id = system_metrics.team_id
        AND role IN ('admin', 'data-writer')
    )
  );

CREATE POLICY "Only service role can update system metrics"
  ON system_metrics
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service can delete system metrics"
  ON system_metrics
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- workflow_logs RLS POLICIES
-- ============================================================

CREATE POLICY "Users can view workflow logs for their teams"
  ON workflow_logs
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND team_id = workflow_logs.team_id
    )
  );

CREATE POLICY "Service can insert workflow logs"
  ON workflow_logs
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
        AND team_id = workflow_logs.team_id
        AND role IN ('admin', 'data-writer')
    )
  );

CREATE POLICY "Only service role can update workflow logs"
  ON workflow_logs
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service can delete workflow logs"
  ON workflow_logs
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- user_activity RLS POLICIES
-- ============================================================

-- Policy: Users can view their own activity
CREATE POLICY "Users can view their own activity"
  ON user_activity
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    -- Team admins can view team activity
    (
      team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid() AND team_id = user_activity.team_id AND role = 'admin'
      )
    )
  );

-- Policy: System and authenticated users can insert
CREATE POLICY "Authenticated users can record their activity"
  ON user_activity
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    user_id = auth.uid()
  );

-- Policy: Only service role can update activity logs
CREATE POLICY "Only service role can update user activity"
  ON user_activity
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: Only service role can delete (via retention job)
CREATE POLICY "Service can delete user activity"
  ON user_activity
  FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- TESTING NOTES
-- ============================================================
-- Test RLS policies with these scenarios:
--
-- 1. SELECT as authenticated user (should see only their team's data)
--    SET ROLE authenticated;
--    SELECT * FROM agent_metrics WHERE team_id = '...' LIMIT 1;
--
-- 2. SELECT as different team member (should see nothing)
--    SET ROLE authenticated;
--    -- Set request.jwt.claim.sub to different user
--    SELECT * FROM agent_metrics;
--
-- 3. INSERT as service role (should succeed)
--    SET ROLE service_role;
--    INSERT INTO agent_metrics (...) VALUES (...);
--
-- 4. DELETE as authenticated user (should fail)
--    SET ROLE authenticated;
--    DELETE FROM agent_metrics WHERE id = '...';
--    -- Should return error: "new row violates row-level security policy"
--
-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback all RLS policies:
--   ALTER TABLE agent_metrics DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE system_metrics DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE workflow_logs DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE user_activity DISABLE ROW LEVEL SECURITY;
--
--   DROP POLICY IF EXISTS "Users can view agent metrics for their teams" ON agent_metrics;
--   DROP POLICY IF EXISTS "Service can insert agent metrics" ON agent_metrics;
--   (repeat for all policies on all tables)
