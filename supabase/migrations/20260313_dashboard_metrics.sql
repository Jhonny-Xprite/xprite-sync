-- Migration: Dashboard Metrics Tables
-- Story: 3.3 - Schema & RLS Policies para Dashboard
-- Created: 2026-03-13
-- Description: Create agent_metrics and system_metrics tables for dashboard observability

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: agent_metrics
-- Purpose: Store real-time metrics for AI agents in the system
-- Retention: 30 days (via cleanup job)
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Agent identification
  agent_id VARCHAR(255) NOT NULL,
  team_id UUID NOT NULL,

  -- Status and performance metrics
  status VARCHAR(50),  -- running, idle, error, paused
  latency_ms INTEGER,
  success_rate NUMERIC(4, 2),  -- percentage 0-100
  error_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,

  -- Resource usage
  memory_usage_mb INTEGER,
  cpu_percentage NUMERIC(5, 2),

  -- Timestamps
  recorded_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT agent_metrics_success_rate_valid CHECK (success_rate >= 0 AND success_rate <= 100),
  CONSTRAINT agent_metrics_cpu_valid CHECK (cpu_percentage >= 0 AND cpu_percentage <= 100)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agent_metrics_team_id
  ON agent_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id
  ON agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_recorded_at
  ON agent_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_team_recorded
  ON agent_metrics(team_id, recorded_at DESC);

-- Add table documentation
COMMENT ON TABLE agent_metrics IS 'Real-time metrics for AI agents. Retained for 30 days.';
COMMENT ON COLUMN agent_metrics.agent_id IS 'Unique identifier of the AI agent';
COMMENT ON COLUMN agent_metrics.team_id IS 'Team that owns this agent';
COMMENT ON COLUMN agent_metrics.status IS 'Current execution status: running, idle, error, paused';
COMMENT ON COLUMN agent_metrics.latency_ms IS 'Average latency of last execution in milliseconds';
COMMENT ON COLUMN agent_metrics.success_rate IS 'Success rate as percentage (0-100)';
COMMENT ON COLUMN agent_metrics.recorded_at IS 'Timestamp when metric was recorded';

-- ============================================================
-- TABLE: system_metrics
-- Purpose: Store infrastructure and system-level metrics
-- Retention: 30 days (via cleanup job)
-- ============================================================

CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Team identification
  team_id UUID NOT NULL,

  -- CPU and Memory metrics
  cpu_percentage NUMERIC(5, 2),
  memory_percentage NUMERIC(5, 2),
  memory_used_gb NUMERIC(10, 2),
  memory_total_gb NUMERIC(10, 2),

  -- Disk metrics
  disk_used_gb NUMERIC(10, 2),
  disk_total_gb NUMERIC(10, 2),

  -- Network metrics
  network_in_mbps NUMERIC(10, 2),
  network_out_mbps NUMERIC(10, 2),

  -- Database metrics
  db_connections INTEGER,
  db_query_time_ms NUMERIC(10, 2),

  -- API metrics
  api_requests_per_sec INTEGER,
  api_error_rate NUMERIC(4, 2),  -- percentage 0-100

  -- Timestamps
  recorded_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT system_metrics_percentages_valid CHECK (
    cpu_percentage >= 0 AND cpu_percentage <= 100 AND
    memory_percentage >= 0 AND memory_percentage <= 100 AND
    api_error_rate >= 0 AND api_error_rate <= 100
  ),
  CONSTRAINT system_metrics_sizes_valid CHECK (
    memory_used_gb >= 0 AND memory_total_gb > 0 AND
    disk_used_gb >= 0 AND disk_total_gb > 0
  )
);

-- Create indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_system_metrics_team_id
  ON system_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at
  ON system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_team_recorded
  ON system_metrics(team_id, recorded_at DESC);

-- Add table documentation
COMMENT ON TABLE system_metrics IS 'System-level observability metrics. Retained for 30 days.';
COMMENT ON COLUMN system_metrics.team_id IS 'Team that owns this infrastructure';
COMMENT ON COLUMN system_metrics.cpu_percentage IS 'CPU utilization as percentage (0-100)';
COMMENT ON COLUMN system_metrics.memory_percentage IS 'Memory utilization as percentage (0-100)';
COMMENT ON COLUMN system_metrics.db_connections IS 'Active database connections';
COMMENT ON COLUMN system_metrics.api_error_rate IS 'API error rate as percentage (0-100)';
COMMENT ON COLUMN system_metrics.recorded_at IS 'Timestamp when metric was recorded';

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- 1. Both tables require team_id for RLS policies
-- 2. Indexes optimized for time-series queries (recorded_at DESC)
-- 3. Retention: Both tables managed by cleanup job (30 days)
-- 4. Check constraints validate percentage and size fields
-- 5. Rollback: DROP TABLE IF EXISTS system_metrics, agent_metrics CASCADE;
