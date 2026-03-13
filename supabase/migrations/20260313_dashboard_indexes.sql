-- Migration: Dashboard Performance Indexes
-- Story: 3.3 - Schema & RLS Policies para Dashboard
-- Created: 2026-03-13
-- Description: Add performance indexes for time-series and analytical queries

-- ============================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================
-- These indexes are specifically designed for time-series queries
-- and dashboard analytical patterns (group by, aggregation, filtering)

-- ============================================================
-- agent_metrics PERFORMANCE INDEXES
-- ============================================================

-- Composite index for status queries with time range
CREATE INDEX IF NOT EXISTS idx_agent_metrics_status_time
  ON agent_metrics(status, recorded_at DESC)
  WHERE status IS NOT NULL;

-- Index for agent status queries (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_status
  ON agent_metrics(agent_id, status, recorded_at DESC);

-- Index for error filtering (alerts)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_errors
  ON agent_metrics(team_id, recorded_at DESC)
  WHERE status = 'error';

-- Partial index for recent metrics (last 24h most common)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_recent
  ON agent_metrics(team_id, recorded_at DESC)
  WHERE recorded_at > NOW() - INTERVAL '24 hours';

-- ============================================================
-- system_metrics PERFORMANCE INDEXES
-- ============================================================

-- Composite index for system health queries (CPU, memory alerts)
CREATE INDEX IF NOT EXISTS idx_system_metrics_resource_usage
  ON system_metrics(team_id, recorded_at DESC, cpu_percentage, memory_percentage);

-- Index for alert conditions (high CPU/memory)
CREATE INDEX IF NOT EXISTS idx_system_metrics_high_cpu
  ON system_metrics(team_id, recorded_at DESC)
  WHERE cpu_percentage > 80;

CREATE INDEX IF NOT EXISTS idx_system_metrics_high_memory
  ON system_metrics(team_id, recorded_at DESC)
  WHERE memory_percentage > 85;

-- Index for database metrics (connection pool monitoring)
CREATE INDEX IF NOT EXISTS idx_system_metrics_db_health
  ON system_metrics(team_id, recorded_at DESC, db_connections, db_query_time_ms);

-- Partial index for recent system metrics (most common queries)
CREATE INDEX IF NOT EXISTS idx_system_metrics_recent
  ON system_metrics(team_id, recorded_at DESC)
  WHERE recorded_at > NOW() - INTERVAL '24 hours';

-- ============================================================
-- workflow_logs PERFORMANCE INDEXES
-- ============================================================

-- Composite index for workflow status queries
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status_time
  ON workflow_logs(status, started_at DESC)
  WHERE status IS NOT NULL;

-- Index for failed workflow debugging
CREATE INDEX IF NOT EXISTS idx_workflow_logs_failed
  ON workflow_logs(team_id, started_at DESC)
  WHERE status = 'failed';

-- Index for workflow duration analysis (SLA tracking)
CREATE INDEX IF NOT EXISTS idx_workflow_logs_duration
  ON workflow_logs(team_id, started_at DESC, duration_ms)
  WHERE duration_ms IS NOT NULL;

-- Composite index for user dashboard views (team + time)
CREATE INDEX IF NOT EXISTS idx_workflow_logs_team_time
  ON workflow_logs(team_id, started_at DESC);

-- ============================================================
-- user_activity PERFORMANCE INDEXES
-- ============================================================

-- Composite index for activity timeline
CREATE INDEX IF NOT EXISTS idx_user_activity_timeline
  ON user_activity(team_id, created_at DESC, action);

-- Index for resource-specific activity tracking
CREATE INDEX IF NOT EXISTS idx_user_activity_resource_tracking
  ON user_activity(resource_type, resource_id, created_at DESC);

-- Index for user audit trail
CREATE INDEX IF NOT EXISTS idx_user_activity_user_timeline
  ON user_activity(user_id, created_at DESC);

-- Index for compliance/auditing (all actions by team)
CREATE INDEX IF NOT EXISTS idx_user_activity_team_audit
  ON user_activity(team_id, action, created_at DESC);

-- ============================================================
-- QUERY PERFORMANCE TARGETS
-- ============================================================
-- With these indexes, expected query latencies:
--
-- Single metric query:        < 50ms
-- Dashboard aggregate query:  < 150ms
-- Time-range aggregation:     < 200ms
-- Alert detection query:      < 100ms
--
-- These should be validated with EXPLAIN ANALYZE on production-like data
--
-- ============================================================
-- INDEX STATISTICS & ANALYSIS
-- ============================================================
-- To verify index effectiveness:
--
-- 1. Check index sizes and usage:
--    SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
--    FROM pg_stat_user_indexes
--    WHERE tablename LIKE 'agent_%' OR tablename LIKE 'system_%';
--
-- 2. Analyze query plans:
--    EXPLAIN ANALYZE SELECT * FROM agent_metrics WHERE team_id = '...' ORDER BY recorded_at DESC LIMIT 100;
--
-- 3. Find missing indexes:
--    SELECT * FROM pg_stat_user_tables
--    WHERE seq_scan > idx_scan AND seq_scan > 1000;
--
-- 4. Identify slow queries:
--    SELECT * FROM pg_stat_statements
--    WHERE mean_exec_time > 200 ORDER BY mean_exec_time DESC;
--
-- ============================================================
-- MAINTENANCE
-- ============================================================
-- PostgreSQL maintains indexes automatically, but periodic maintenance helps:
--
-- 1. Analyze statistics (weekly):
--    ANALYZE agent_metrics;
--    ANALYZE system_metrics;
--    ANALYZE workflow_logs;
--    ANALYZE user_activity;
--
-- 2. Reindex if necessary (monthly or after large data deletions):
--    REINDEX TABLE agent_metrics;
--    REINDEX TABLE system_metrics;
--
-- 3. Monitor index bloat:
--    SELECT * FROM pg_stat_user_indexes WHERE idx_blks_read > 1000 ORDER BY idx_blks_read DESC;
--
-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
-- To rollback this migration, drop all additional indexes:
--
-- DROP INDEX IF EXISTS idx_agent_metrics_status_time;
-- DROP INDEX IF EXISTS idx_agent_metrics_agent_status;
-- DROP INDEX IF EXISTS idx_agent_metrics_errors;
-- DROP INDEX IF EXISTS idx_agent_metrics_recent;
-- DROP INDEX IF EXISTS idx_system_metrics_resource_usage;
-- DROP INDEX IF EXISTS idx_system_metrics_high_cpu;
-- DROP INDEX IF EXISTS idx_system_metrics_high_memory;
-- DROP INDEX IF EXISTS idx_system_metrics_db_health;
-- DROP INDEX IF EXISTS idx_system_metrics_recent;
-- DROP INDEX IF EXISTS idx_workflow_logs_status_time;
-- DROP INDEX IF EXISTS idx_workflow_logs_failed;
-- DROP INDEX IF EXISTS idx_workflow_logs_duration;
-- DROP INDEX IF EXISTS idx_workflow_logs_team_time;
-- DROP INDEX IF EXISTS idx_user_activity_timeline;
-- DROP INDEX IF EXISTS idx_user_activity_resource_tracking;
-- DROP INDEX IF EXISTS idx_user_activity_user_timeline;
-- DROP INDEX IF EXISTS idx_user_activity_team_audit;
--
