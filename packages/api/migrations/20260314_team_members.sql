-- Epic 3 Phase 0: Team Members Table & RLS Disable
-- Created: 2026-03-14
-- Purpose: Foundation for dashboard integration

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at);

-- Disable RLS temporarily (until authentication is implemented)
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Grant permissions for anon user
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO anon;

-- Optional: Create system_metrics table for Phase 3 metrics persistence
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  agent_id VARCHAR(50) NOT NULL,
  cpu_percentage NUMERIC(5,2),
  memory_usage_mb NUMERIC(10,2),
  latency_ms INTEGER,
  success_rate NUMERIC(5,2),
  error_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0
);

-- Create indexes for system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_agent_id ON system_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_collected_at ON system_metrics(collected_at);

-- Disable RLS on system_metrics
ALTER TABLE system_metrics DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON system_metrics TO anon;

-- Completion marker
COMMENT ON TABLE team_members IS 'Epic 3 Phase 0 Foundation - Team members for dashboard integration';
COMMENT ON TABLE system_metrics IS 'Epic 3 Phase 3 - System metrics collection for dashboard persistence';
