-- Migration: Enable Realtime Replication
-- Story: 3.2 - Integração de Dados em Tempo Real
-- Created: 2026-03-13
-- Description: Enable PostgreSQL replication for real-time updates on metrics tables

-- ============================================================
-- REALTIME PUBLICATION SETUP
-- ============================================================
-- Supabase Realtime uses PostgreSQL logical replication
-- to broadcast changes to connected clients

-- Enable replication for agent_metrics table
BEGIN;

-- Create or replace the publication for real-time events
CREATE PUBLICATION IF NOT EXISTS supabase_realtime FOR TABLE agent_metrics, system_metrics, workflow_logs, user_activity;

COMMIT;

-- ============================================================
-- REALTIME CONFIGURATION
-- ============================================================
-- Verify replication is active and tables are included

-- Check publication status
-- SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Check tables included in publication
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================================
-- USAGE NOTES
-- ============================================================
-- 1. Supabase Realtime listens to the 'supabase_realtime' publication
-- 2. Changes to agent_metrics, system_metrics, workflow_logs, user_activity
--    will be broadcast to all connected clients
-- 3. RLS policies control which users can receive which updates
-- 4. Clients subscribe via: supabase.from('table_name').on('*', callback)

-- ============================================================
-- TESTING
-- ============================================================
-- To test Realtime in browser console:
--
-- const channel = supabase
--   .channel('realtime:agent_metrics')
--   .on(
--     'postgres_changes',
--     { event: 'INSERT', schema: 'public', table: 'agent_metrics' },
--     (payload) => console.log('New metric:', payload.new)
--   )
--   .subscribe()
--
-- Then insert a record and watch console output
