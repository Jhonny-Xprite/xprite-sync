# 📊 Dashboard Database Schema Documentation

**Version:** 1.0
**Created:** 2026-03-13
**Story:** 3.3 - Schema & RLS Policies para Dashboard

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Design](#schema-design)
3. [Tables](#tables)
4. [Security (RLS)](#security-rls)
5. [Performance](#performance)
6. [Data Retention](#data-retention)
7. [Relationships](#relationships)

---

## Overview

The AIOX Dashboard database schema provides observability storage for:

- **Agent Metrics** - Real-time performance data for AI agents
- **System Metrics** - Infrastructure health monitoring (CPU, memory, disk, network)
- **Workflow Logs** - Audit trail of workflow executions
- **User Activity** - Compliance audit log of user actions

### Design Principles

- **Time-Series Focused** - Optimized for metrics collection and historical analysis
- **Team-Based Isolation** - All tables include `team_id` for RLS enforcement
- **Retention-Aware** - Each table has a configured retention period for cost optimization
- **Performance-First** - Composite indexes for common dashboard query patterns
- **Secure-by-Default** - RLS policies enabled on all tables

---

## Schema Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD SCHEMA                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  agent_metrics       │    │  system_metrics      │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ id (PK)              │    │ id (PK)              │      │
│  │ agent_id             │    │ team_id (FK, RLS)    │      │
│  │ team_id (FK, RLS)    │    │ cpu_percentage       │      │
│  │ status               │    │ memory_percentage    │      │
│  │ latency_ms           │    │ disk_used_gb         │      │
│  │ recorded_at          │    │ recorded_at          │      │
│  │ created_at, updated_at│   │ created_at           │      │
│  └──────────────────────┘    └──────────────────────┘      │
│          ▲                            ▲                      │
│          │                            │                      │
│          └────────────┬───────────────┘                      │
│                       │ (team_id)                            │
│                       │                                      │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  workflow_logs       │    │  user_activity       │      │
│  ├──────────────────────┤    ├──────────────────────┤      │
│  │ id (PK)              │    │ id (PK)              │      │
│  │ workflow_id          │    │ user_id (FK)         │      │
│  │ team_id (FK, RLS)    │    │ team_id (FK, RLS)    │      │
│  │ status               │    │ action               │      │
│  │ started_at           │    │ resource_type        │      │
│  │ duration_ms          │    │ resource_id          │      │
│  │ metadata (JSONB)     │    │ changes (JSONB)      │      │
│  │ created_at           │    │ created_at           │      │
│  └──────────────────────┘    └──────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Legend:
  PK = Primary Key (UUID)
  FK = Foreign Key
  RLS = Row Level Security enabled
```

---

## Tables

### 1. agent_metrics

**Purpose:** Store real-time performance metrics for AI agents

**Retention:** 30 days

**Primary Use Cases:**
- Dashboard agent status display
- Agent performance trending
- Error tracking and alerting
- Capacity planning

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique metric record identifier |
| `agent_id` | VARCHAR(255) | NOT NULL | Unique identifier of the AI agent |
| `team_id` | UUID | NOT NULL, RLS | Team owning this agent (enforces row security) |
| `status` | VARCHAR(50) | CHECK: valid status | Current execution state: running, idle, error, paused |
| `latency_ms` | INTEGER | ≥ 0 | Average latency in milliseconds |
| `success_rate` | NUMERIC(4,2) | CHECK: 0-100 | Success rate as percentage |
| `error_count` | INTEGER | ≥ 0 | Count of errors in period |
| `processed_count` | INTEGER | ≥ 0 | Count of successful executions |
| `memory_usage_mb` | INTEGER | ≥ 0 | Memory consumption in MB |
| `cpu_percentage` | NUMERIC(5,2) | CHECK: 0-100 | CPU utilization as percentage |
| `recorded_at` | TIMESTAMP | DEFAULT now() | When metric was recorded |
| `created_at` | TIMESTAMP | DEFAULT now() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update time |

**Indexes:**
- `idx_agent_metrics_team_id` - Dashboard queries by team
- `idx_agent_metrics_agent_id` - Agent-specific metrics
- `idx_agent_metrics_recorded_at` - Time-series queries
- `idx_agent_metrics_team_recorded` - Combined team + time
- `idx_agent_metrics_status_time` - Status filtering
- `idx_agent_metrics_agent_status` - Agent status queries
- `idx_agent_metrics_errors` - Error alerting
- `idx_agent_metrics_recent` - Last 24h (partial index)

**Example Query:**
```sql
-- Get latest metrics for all agents in team
SELECT agent_id, status, latency_ms, success_rate
FROM agent_metrics
WHERE team_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY recorded_at DESC
LIMIT 10;
```

---

### 2. system_metrics

**Purpose:** Store infrastructure-level metrics (CPU, memory, disk, network, database)

**Retention:** 30 days

**Primary Use Cases:**
- Infrastructure health monitoring
- Capacity planning and forecasting
- Performance baseline analysis
- Alert threshold management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique metric record |
| `team_id` | UUID | NOT NULL, RLS | Team owning infrastructure |
| `cpu_percentage` | NUMERIC(5,2) | CHECK: 0-100 | CPU utilization |
| `memory_percentage` | NUMERIC(5,2) | CHECK: 0-100 | Memory utilization |
| `memory_used_gb` | NUMERIC(10,2) | ≥ 0 | Memory used in GB |
| `memory_total_gb` | NUMERIC(10,2) | ≥ 0 | Total memory in GB |
| `disk_used_gb` | NUMERIC(10,2) | ≥ 0 | Disk used in GB |
| `disk_total_gb` | NUMERIC(10,2) | ≥ 0 | Total disk in GB |
| `network_in_mbps` | NUMERIC(10,2) | ≥ 0 | Inbound network speed |
| `network_out_mbps` | NUMERIC(10,2) | ≥ 0 | Outbound network speed |
| `db_connections` | INTEGER | ≥ 0 | Active DB connections |
| `db_query_time_ms` | NUMERIC(10,2) | ≥ 0 | Average query time |
| `api_requests_per_sec` | INTEGER | ≥ 0 | API throughput |
| `api_error_rate` | NUMERIC(4,2) | CHECK: 0-100 | API error percentage |
| `recorded_at` | TIMESTAMP | DEFAULT now() | Metric recording time |
| `created_at` | TIMESTAMP | DEFAULT now() | Record creation time |

**Indexes:**
- `idx_system_metrics_team_id` - Team-scoped queries
- `idx_system_metrics_recorded_at` - Time-series analysis
- `idx_system_metrics_team_recorded` - Dashboard views
- `idx_system_metrics_resource_usage` - Resource trending
- `idx_system_metrics_high_cpu` - CPU alert alerting
- `idx_system_metrics_high_memory` - Memory alert alerting
- `idx_system_metrics_db_health` - Database monitoring
- `idx_system_metrics_recent` - Last 24h (partial index)

**Example Query:**
```sql
-- Alert: CPU > 80% in last 5 minutes
SELECT recorded_at, cpu_percentage, memory_percentage
FROM system_metrics
WHERE team_id = '550e8400-e29b-41d4-a716-446655440000'
  AND recorded_at > NOW() - INTERVAL '5 minutes'
  AND cpu_percentage > 80
ORDER BY recorded_at DESC;
```

---

### 3. workflow_logs

**Purpose:** Audit trail of workflow executions (compliance, debugging, SLA tracking)

**Retention:** 90 days

**Primary Use Cases:**
- Workflow execution history
- SLA compliance tracking (duration)
- Error debugging and root cause analysis
- Workflow performance trending

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique execution record |
| `workflow_id` | VARCHAR(255) | NOT NULL | Identifier of workflow definition |
| `team_id` | UUID | NOT NULL, RLS | Team owning workflow |
| `status` | VARCHAR(50) | NOT NULL, CHECK valid | Execution status: pending, running, completed, failed, cancelled |
| `started_at` | TIMESTAMP | NULL | When execution started |
| `completed_at` | TIMESTAMP | NULL | When execution finished |
| `duration_ms` | INTEGER | ≥ 0 | Total execution time |
| `error_message` | TEXT | NULL | Error details if failed |
| `metadata` | JSONB | NULL | Task results, parameters, custom data |
| `created_at` | TIMESTAMP | DEFAULT now() | Record creation time |

**Indexes:**
- `idx_workflow_logs_team_id` - Team filtering
- `idx_workflow_logs_workflow_id` - Workflow-specific history
- `idx_workflow_logs_started_at` - Time-series queries
- `idx_workflow_logs_team_started` - Dashboard timeline
- `idx_workflow_logs_status` - Status filtering
- `idx_workflow_logs_status_time` - Status + time queries
- `idx_workflow_logs_failed` - Failed execution debugging
- `idx_workflow_logs_duration` - SLA tracking

**Example Query:**
```sql
-- Get failed workflows from last 24h for debugging
SELECT workflow_id, started_at, duration_ms, error_message
FROM workflow_logs
WHERE team_id = '550e8400-e29b-41d4-a716-446655440000'
  AND status = 'failed'
  AND started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;
```

---

### 4. user_activity

**Purpose:** Compliance audit log of all user actions (required for GDPR, SOC2, etc.)

**Retention:** 180 days (6 months - legal requirement)

**Primary Use Cases:**
- User action auditing
- Compliance reporting
- Security investigation
- Change tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique activity record |
| `user_id` | UUID | NOT NULL, FK(auth.users) | User who performed action |
| `team_id` | UUID | NOT NULL, RLS | Team context |
| `action` | VARCHAR(100) | NOT NULL, CHECK not empty | Action type: viewed, created, updated, deleted, etc. |
| `resource_type` | VARCHAR(100) | NOT NULL, CHECK not empty | Resource affected: agent, workflow, dashboard, metric, etc. |
| `resource_id` | VARCHAR(255) | NULL | Specific resource identifier |
| `changes` | JSONB | NULL | Before/after values for updates |
| `created_at` | TIMESTAMP | DEFAULT now() | When action occurred |

**Indexes:**
- `idx_user_activity_team_id` - Team audit trail
- `idx_user_activity_user_id` - User-specific history
- `idx_user_activity_created_at` - Timeline queries
- `idx_user_activity_team_user` - User within team
- `idx_user_activity_action` - Action type filtering
- `idx_user_activity_resource` - Resource-specific tracking
- `idx_user_activity_timeline` - Activity feed
- `idx_user_activity_user_timeline` - User activity timeline
- `idx_user_activity_team_audit` - Team compliance audit

**Example Query:**
```sql
-- Audit: What did user modify in last 7 days?
SELECT action, resource_type, resource_id, changes, created_at
FROM user_activity
WHERE team_id = '550e8400-e29b-41d4-a716-446655440000'
  AND user_id = '650e8400-e29b-41d4-a716-446655440000'
  AND created_at > NOW() - INTERVAL '7 days'
  AND action IN ('created', 'updated', 'deleted')
ORDER BY created_at DESC;
```

---

## Security (RLS)

### Row Level Security Policies

All dashboard tables are protected by RLS policies that enforce team isolation:

#### Authentication Pattern

- **Unauthenticated (anon):** No access to any data
- **Authenticated (user):** Access only to their team's data
- **Service Role:** Full access (for metrics collection, cleanup jobs)

#### Policies by Table

**agent_metrics & system_metrics & workflow_logs:**
- ✅ **SELECT:** Only if user is member of `team_id` team
- ✅ **INSERT:** Only service role or team member with `data-writer` permission
- ✅ **UPDATE:** Only service role (metrics are immutable)
- ✅ **DELETE:** Only service role (via retention policy)

**user_activity:**
- ✅ **SELECT:** User sees own activity OR user is team admin
- ✅ **INSERT:** User records their own activity
- ✅ **UPDATE:** Only service role
- ✅ **DELETE:** Only service role

### Security Testing

To test RLS policies:

```sql
-- As authenticated user (should see own team's data)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-id-here';
SELECT COUNT(*) FROM agent_metrics;  -- Should return team data only

-- As different user (should see nothing)
SET request.jwt.claim.sub = 'different-user-id';
SELECT COUNT(*) FROM agent_metrics;  -- Should return 0

-- As service role (should see all data)
SET ROLE service_role;
SELECT COUNT(*) FROM agent_metrics;  -- Should return all rows
```

---

## Performance

### Query Performance Targets

| Query Type | Target Latency | Example |
|-----------|---------------|---------|
| Single metric record | < 50ms | Get latest agent status |
| Dashboard aggregate | < 150ms | Last 24h metrics for team |
| Time-range analysis | < 200ms | Agent performance last 7 days |
| Alert detection | < 100ms | Find CPU > 80% alerts |

### Index Strategy

Indexes are designed for:

1. **Team-scoped queries** - Most common (RLS enforcement)
   - `team_id` as first column in composite indexes
   - Enables efficient filtering by team

2. **Time-series analysis** - Dashboard views
   - `recorded_at DESC` for latest-first ordering
   - Partial indexes for recent data (last 24h)

3. **Alert conditions** - Threshold detection
   - Partial indexes (WHERE cpu_percentage > 80)
   - Reduces index size for common alerts

4. **Status queries** - Filtering and grouping
   - Composite indexes with status for quick filters

### Query Optimization Tips

```sql
-- ✅ GOOD: Uses team_id index, efficient
SELECT * FROM agent_metrics
WHERE team_id = ? AND recorded_at > NOW() - INTERVAL '24h'
ORDER BY recorded_at DESC
LIMIT 100;

-- ❌ SLOW: Full table scan without team_id
SELECT * FROM agent_metrics
WHERE status = 'error'
ORDER BY recorded_at DESC;

-- ✅ GOOD: Uses partial index
SELECT * FROM agent_metrics
WHERE team_id = ? AND cpu_percentage > 80;

-- ❌ SLOW: No index available
SELECT AVG(latency_ms) FROM agent_metrics
WHERE agent_id LIKE '%service%';
```

---

## Data Retention

### Retention Policy

| Table | Days | Purpose |
|-------|------|---------|
| `agent_metrics` | 30 | Operational dashboard (rolling window) |
| `system_metrics` | 30 | Infrastructure monitoring (cost optimization) |
| `workflow_logs` | 90 | Execution history (debugging, SLA) |
| `user_activity` | 180 | Compliance audit trail (legal requirement) |

### Automatic Cleanup

Cleanup procedures run automatically:

```sql
-- Manual trigger (usually via cron job daily at 02:00 UTC)
SELECT * FROM cleanup_all_expired_data();

-- Result:
-- table_name        | deleted_count
-- agent_metrics     | 45000
-- system_metrics    | 50000
-- workflow_logs     | 5000
-- user_activity     | 2000
```

### Monitoring Data Size

```sql
-- Check table sizes and retention status
SELECT * FROM dashboard_data_size;

-- Result:
-- table_name    | row_count | size_mb | retention_days
-- agent_metrics | 1234567   | 245.6   | 30
-- system_metrics| 1456789   | 287.3   | 30
-- workflow_logs | 234567    | 45.2    | 90
-- user_activity | 123456    | 28.9    | 180
```

---

## Relationships

### Foreign Keys

```
agent_metrics.team_id → teams.id (implicit in RLS)
system_metrics.team_id → teams.id (implicit in RLS)
workflow_logs.team_id → teams.id (implicit in RLS)
user_activity.user_id → auth.users.id
user_activity.team_id → teams.id (implicit in RLS)
```

### Logical Relationships

```
Team
  ├── agent_metrics (1:many) - Multiple metric records per agent per team
  ├── system_metrics (1:many) - Multiple metric readings per team
  ├── workflow_logs (1:many) - Multiple executions per workflow per team
  └── User
      └── user_activity (1:many) - Multiple actions per user per team
```

---

## Integration Points

### Backend API Integration

**Metrics Collection:**
```javascript
// Insert new agent metrics
POST /api/metrics/agent
{
  "agent_id": "agent-123",
  "team_id": "team-456",
  "status": "running",
  "latency_ms": 145,
  "success_rate": 99.5
}
```

**Dashboard Queries:**
```javascript
// Get team's agent metrics
GET /api/dashboard/metrics/agents?team_id=...&hours=24

// Get system health
GET /api/dashboard/metrics/system?team_id=...

// Get workflow history
GET /api/dashboard/workflows?team_id=...&days=7
```

### Frontend Real-time Updates

```javascript
// Subscribe to agent metrics via Supabase Realtime
const subscription = supabase
  .from('agent_metrics')
  .on('INSERT', payload => {
    // Update dashboard in real-time
    updateAgentStatus(payload.new);
  })
  .subscribe();
```

---

## Migration Status

✅ **Applied Migrations:**
1. `20260313_dashboard_metrics.sql` - Tables + basic indexes
2. `20260313_dashboard_logs.sql` - Logs tables + indexes
3. `20260313_dashboard_rls.sql` - RLS policies
4. `20260313_dashboard_indexes.sql` - Performance indexes
5. `20260313_dashboard_retention.sql` - Retention cleanup jobs

**All ACs Met:**
- ✅ AC 3.3.1: Schema created (4 tables)
- ✅ AC 3.3.2: Indexes for < 200ms performance
- ✅ AC 3.3.3: RLS policies implemented
- ✅ AC 3.3.4: RLS security tested
- ✅ AC 3.3.5: Migrations reversible
- ✅ AC 3.3.6: Documentation complete
- ✅ AC 3.3.7: Retention policy defined (30/90/180 days)
- ✅ AC 3.3.8: Performance verified (indexes optimized)

---

**Created by:** Dara (@data-engineer)
**Story:** 3.3 - Schema & RLS Policies para Dashboard
**Status:** ✅ COMPLETE
