-- Migration: Dashboard Logs Tables
-- Story: 3.3 - Schema & RLS Policies para Dashboard
-- Created: 2026-03-13
-- Description: Create workflow_logs and user_activity tables for dashboard auditing

-- Enable UUID extension (already exists from previous migration)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: workflow_logs
-- Purpose: Store audit logs of workflow executions
-- Retention: 90 days (via cleanup job)
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow identification
  workflow_id VARCHAR(255) NOT NULL,
  team_id UUID NOT NULL,

  -- Execution status
  status VARCHAR(50) NOT NULL,  -- pending, running, completed, failed, cancelled
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,

  -- Error tracking
  error_message TEXT,

  -- Additional metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT workflow_logs_status_valid CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  CONSTRAINT workflow_logs_duration_valid CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

-- Create indexes for query patterns
CREATE INDEX IF NOT EXISTS idx_workflow_logs_team_id
  ON workflow_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow_id
  ON workflow_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_started_at
  ON workflow_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_team_started
  ON workflow_logs(team_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status
  ON workflow_logs(status);

-- Add table documentation
COMMENT ON TABLE workflow_logs IS 'Audit log of workflow executions. Retained for 90 days.';
COMMENT ON COLUMN workflow_logs.workflow_id IS 'Unique identifier of the workflow';
COMMENT ON COLUMN workflow_logs.team_id IS 'Team that owns this workflow';
COMMENT ON COLUMN workflow_logs.status IS 'Execution status: pending, running, completed, failed, cancelled';
COMMENT ON COLUMN workflow_logs.duration_ms IS 'Total execution duration in milliseconds';
COMMENT ON COLUMN workflow_logs.error_message IS 'Error details if execution failed';
COMMENT ON COLUMN workflow_logs.metadata IS 'Additional metadata as JSON (task results, parameters, etc.)';

-- ============================================================
-- TABLE: user_activity
-- Purpose: Store user activity audit trail for compliance and debugging
-- Retention: 180 days (via cleanup job)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  user_id UUID NOT NULL,
  team_id UUID NOT NULL,

  -- Activity details
  action VARCHAR(100) NOT NULL,  -- viewed, created, updated, deleted, etc.
  resource_type VARCHAR(100),     -- agent, workflow, metric, dashboard, etc.
  resource_id VARCHAR(255),       -- ID of the resource being acted upon

  -- Change tracking
  changes JSONB,  -- Before/after values for updates

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT user_activity_action_not_empty CHECK (action <> ''),
  CONSTRAINT user_activity_resource_type_not_empty CHECK (resource_type <> '')
);

-- Create indexes for query patterns
CREATE INDEX IF NOT EXISTS idx_user_activity_team_id
  ON user_activity(team_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id
  ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at
  ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_team_user
  ON user_activity(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action
  ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_resource
  ON user_activity(resource_type, resource_id);

-- Add table documentation
COMMENT ON TABLE user_activity IS 'User activity audit trail for compliance and debugging. Retained for 180 days.';
COMMENT ON COLUMN user_activity.user_id IS 'User who performed the action';
COMMENT ON COLUMN user_activity.team_id IS 'Team context for the action';
COMMENT ON COLUMN user_activity.action IS 'Type of action: viewed, created, updated, deleted, etc.';
COMMENT ON COLUMN user_activity.resource_type IS 'Type of resource affected: agent, workflow, metric, etc.';
COMMENT ON COLUMN user_activity.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN user_activity.changes IS 'JSON object with before/after values for updates';

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- 1. workflow_logs.metadata supports JSONB for flexible task results storage
-- 2. user_activity.changes tracks modifications (null for creates/deletes)
-- 3. Indexes optimized for:
--    - Time-series: started_at DESC, created_at DESC
--    - Team/user queries: team_id, user_id, team_user combinations
--    - Activity filtering: action, resource_type, status
-- 4. Retention:
--    - workflow_logs: 90 days
--    - user_activity: 180 days (compliance requirement)
-- 5. Rollback: DROP TABLE IF EXISTS user_activity, workflow_logs CASCADE;
