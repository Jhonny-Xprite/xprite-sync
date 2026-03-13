-- Migration: Dashboard Data Retention Policy
-- Story: 3.3 - Schema & RLS Policies para Dashboard
-- Created: 2026-03-13
-- Description: Implement automated data retention and cleanup policies

-- ============================================================
-- RETENTION POLICY CONFIGURATION
-- ============================================================
-- This migration sets up automated deletion of old data based on retention periods:
-- - agent_metrics: 30 days
-- - system_metrics: 30 days
-- - workflow_logs: 90 days
-- - user_activity: 180 days (compliance/audit)

-- ============================================================
-- HELPER TABLE: retention_config
-- ============================================================

CREATE TABLE IF NOT EXISTS retention_config (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  last_cleanup TIMESTAMP DEFAULT NOW(),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT retention_days_valid CHECK (retention_days > 0)
);

-- Insert retention configuration
INSERT INTO retention_config (table_name, retention_days, enabled)
VALUES
  ('agent_metrics', 30, TRUE),
  ('system_metrics', 30, TRUE),
  ('workflow_logs', 90, TRUE),
  ('user_activity', 180, TRUE)
ON CONFLICT (table_name) DO UPDATE SET
  retention_days = EXCLUDED.retention_days,
  enabled = EXCLUDED.enabled;

COMMENT ON TABLE retention_config IS 'Configuration for automated data retention policies per table';

-- ============================================================
-- CLEANUP PROCEDURE: cleanup_expired_metrics
-- ============================================================
-- Purpose: Delete agent_metrics older than retention period
-- Retention: 30 days

CREATE OR REPLACE FUNCTION cleanup_expired_agent_metrics()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_retention_days INTEGER;
BEGIN
  -- Get retention days from config
  SELECT retention_days INTO v_retention_days
  FROM retention_config
  WHERE table_name = 'agent_metrics' AND enabled = TRUE;

  IF v_retention_days IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER;
    RETURN;
  END IF;

  -- Delete expired records
  WITH deleted_rows AS (
    DELETE FROM agent_metrics
    WHERE recorded_at < (NOW() - (v_retention_days || ' days')::INTERVAL)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  -- Update last cleanup timestamp
  UPDATE retention_config
  SET last_cleanup = NOW()
  WHERE table_name = 'agent_metrics';

  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLEANUP PROCEDURE: cleanup_expired_system_metrics
-- ============================================================
-- Purpose: Delete system_metrics older than retention period
-- Retention: 30 days

CREATE OR REPLACE FUNCTION cleanup_expired_system_metrics()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_retention_days INTEGER;
BEGIN
  SELECT retention_days INTO v_retention_days
  FROM retention_config
  WHERE table_name = 'system_metrics' AND enabled = TRUE;

  IF v_retention_days IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER;
    RETURN;
  END IF;

  WITH deleted_rows AS (
    DELETE FROM system_metrics
    WHERE recorded_at < (NOW() - (v_retention_days || ' days')::INTERVAL)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  UPDATE retention_config
  SET last_cleanup = NOW()
  WHERE table_name = 'system_metrics';

  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLEANUP PROCEDURE: cleanup_expired_workflow_logs
-- ============================================================
-- Purpose: Delete workflow_logs older than retention period
-- Retention: 90 days

CREATE OR REPLACE FUNCTION cleanup_expired_workflow_logs()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_retention_days INTEGER;
BEGIN
  SELECT retention_days INTO v_retention_days
  FROM retention_config
  WHERE table_name = 'workflow_logs' AND enabled = TRUE;

  IF v_retention_days IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER;
    RETURN;
  END IF;

  WITH deleted_rows AS (
    DELETE FROM workflow_logs
    WHERE started_at < (NOW() - (v_retention_days || ' days')::INTERVAL)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  UPDATE retention_config
  SET last_cleanup = NOW()
  WHERE table_name = 'workflow_logs';

  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLEANUP PROCEDURE: cleanup_expired_user_activity
-- ============================================================
-- Purpose: Delete user_activity older than retention period
-- Retention: 180 days (compliance requirement)

CREATE OR REPLACE FUNCTION cleanup_expired_user_activity()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_retention_days INTEGER;
BEGIN
  SELECT retention_days INTO v_retention_days
  FROM retention_config
  WHERE table_name = 'user_activity' AND enabled = TRUE;

  IF v_retention_days IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER;
    RETURN;
  END IF;

  WITH deleted_rows AS (
    DELETE FROM user_activity
    WHERE created_at < (NOW() - (v_retention_days || ' days')::INTERVAL)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

  UPDATE retention_config
  SET last_cleanup = NOW()
  WHERE table_name = 'user_activity';

  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MASTER CLEANUP PROCEDURE
-- ============================================================
-- Purpose: Execute all cleanup procedures in sequence
-- Call this daily via cron or external scheduler

CREATE OR REPLACE FUNCTION cleanup_all_expired_data()
RETURNS TABLE(table_name VARCHAR, deleted_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Clean agent_metrics
  SELECT deleted_count INTO v_count FROM cleanup_expired_agent_metrics();
  RETURN QUERY SELECT 'agent_metrics'::VARCHAR, v_count::INTEGER;

  -- Clean system_metrics
  SELECT deleted_count INTO v_count FROM cleanup_expired_system_metrics();
  RETURN QUERY SELECT 'system_metrics'::VARCHAR, v_count::INTEGER;

  -- Clean workflow_logs
  SELECT deleted_count INTO v_count FROM cleanup_expired_workflow_logs();
  RETURN QUERY SELECT 'workflow_logs'::VARCHAR, v_count::INTEGER;

  -- Clean user_activity
  SELECT deleted_count INTO v_count FROM cleanup_expired_user_activity();
  RETURN QUERY SELECT 'user_activity'::VARCHAR, v_count::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MONITORING & ALERTING
-- ============================================================
-- Views to monitor retention policy effectiveness

CREATE OR REPLACE VIEW dashboard_data_size AS
SELECT
  'agent_metrics' AS table_name,
  COUNT(*) AS row_count,
  (pg_total_relation_size('agent_metrics') / 1024 / 1024)::NUMERIC(10,2) AS size_mb,
  (SELECT retention_days FROM retention_config WHERE table_name = 'agent_metrics') AS retention_days
FROM agent_metrics
UNION ALL
SELECT
  'system_metrics' AS table_name,
  COUNT(*) AS row_count,
  (pg_total_relation_size('system_metrics') / 1024 / 1024)::NUMERIC(10,2) AS size_mb,
  (SELECT retention_days FROM retention_config WHERE table_name = 'system_metrics') AS retention_days
FROM system_metrics
UNION ALL
SELECT
  'workflow_logs' AS table_name,
  COUNT(*) AS row_count,
  (pg_total_relation_size('workflow_logs') / 1024 / 1024)::NUMERIC(10,2) AS size_mb,
  (SELECT retention_days FROM retention_config WHERE table_name = 'workflow_logs') AS retention_days
FROM workflow_logs
UNION ALL
SELECT
  'user_activity' AS table_name,
  COUNT(*) AS row_count,
  (pg_total_relation_size('user_activity') / 1024 / 1024)::NUMERIC(10,2) AS size_mb,
  (SELECT retention_days FROM retention_config WHERE table_name = 'user_activity') AS retention_days
FROM user_activity;

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
-- To manually trigger cleanup:
--   SELECT * FROM cleanup_all_expired_data();
--
-- To check data sizes:
--   SELECT * FROM dashboard_data_size;
--
-- To modify retention period:
--   UPDATE retention_config
--   SET retention_days = 60
--   WHERE table_name = 'agent_metrics';
--
-- To disable cleanup for a table:
--   UPDATE retention_config
--   SET enabled = FALSE
--   WHERE table_name = 'agent_metrics';
--
-- ============================================================
-- SCHEDULING (Recommended)
-- ============================================================
-- Use Supabase's pg_cron extension or an external scheduler (e.g., AWS Lambda, Cloud Tasks):
--
-- With pg_cron (if available):
--   SELECT cron.schedule('cleanup-dashboard-metrics', '0 2 * * *', 'SELECT cleanup_all_expired_data()');
--
-- With external scheduler (e.g., daily at 02:00 UTC):
--   POST https://api.example.com/admin/cleanup
--   Body: SELECT * FROM cleanup_all_expired_data();
--
-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- DROP VIEW IF EXISTS dashboard_data_size;
-- DROP FUNCTION IF EXISTS cleanup_all_expired_data();
-- DROP FUNCTION IF EXISTS cleanup_expired_user_activity();
-- DROP FUNCTION IF EXISTS cleanup_expired_workflow_logs();
-- DROP FUNCTION IF EXISTS cleanup_expired_system_metrics();
-- DROP FUNCTION IF EXISTS cleanup_expired_agent_metrics();
-- DROP TABLE IF EXISTS retention_config;
--
