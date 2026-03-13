# AIOX Dashboard — Setup Guide

Complete guide to install, configure, and verify the AIOX Dashboard.

## Prerequisites

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher
- **Redis:** 7.0.0 or higher (for caching)
- **PostgreSQL:** 14.0 or higher (Supabase)
- **Git:** Latest version

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/synkra/aiox-core.git
cd aiox-core
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# API
NODE_ENV=development
API_PORT=3000

# Monitoring
VITE_MONITOR_URL=http://localhost:4001
VITE_ENGINE_URL=http://localhost:4002
```

### 4. Database Setup

Apply migrations to your Supabase project:

```bash
cd packages/api
npx supabase db push
cd ../..
```

Verify tables created:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected tables:
- `agent_metrics`
- `system_metrics`
- `workflow_logs`
- `user_activity`

### 5. Start Services

Terminal 1 - Start API server:

```bash
npm run dev:api
```

Terminal 2 - Start Dashboard (in another terminal):

```bash
npm run dev:dashboard
```

Terminal 3 (Optional) - Start monitoring service:

```bash
npm run dev:monitor
```

### 6. Verify Installation

#### API Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "services": {
    "cache": "ok",
    "realtime": "ok",
    "database": "ok"
  }
}
```

#### Dashboard Access

Open browser: http://localhost:5173

#### Redis Connection

```bash
redis-cli ping
```

Expected: `PONG`

## Configuration

### Redis Configuration

Update `.env` to customize Redis:

```env
REDIS_HOST=redis.example.com
REDIS_PORT=6380
REDIS_PASSWORD=your-password
```

### Database Configuration

Configure Supabase connection:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Tracing Configuration

Configure OpenTelemetry (production):

```env
NODE_ENV=production
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

### Logging Configuration

```env
LOG_LEVEL=debug  # debug, info, warn, error
```

## Running Tests

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests (Dashboard)

```bash
npm run test:e2e
```

## Build for Production

### Build API

```bash
npm run build:api
```

### Build Dashboard

```bash
npm run build:dashboard
```

### Run Production Build

```bash
NODE_ENV=production npm start
```

## Docker Setup (Optional)

```bash
docker-compose up -d
```

Services started:
- API: http://localhost:3000
- Dashboard: http://localhost:5173
- Redis: localhost:6379
- PostgreSQL: localhost:5432

## Troubleshooting

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# Start Redis (if using Docker)
docker run -d -p 6379:6379 redis:latest
```

### Database Connection Error

```bash
# Verify Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection
npx supabase status
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Performance Optimization

### Enable Caching

Verify cache is enabled in `packages/api/src/middleware/cache.ts`:

```bash
curl http://localhost:3000/api/metrics -H "Cache-Control: max-age=300"
```

### Monitor Cache Hit Rate

```bash
curl http://localhost:3000/api/cache-stats
```

### Database Index Verification

```sql
-- Check indexes on metrics tables
SELECT indexname FROM pg_indexes
WHERE tablename IN ('agent_metrics', 'system_metrics');
```

## Next Steps

1. Read [User Guide](./DASHBOARD_USER_GUIDE.md)
2. Review [API Reference](./DASHBOARD_API.md)
3. Check [Troubleshooting](./DASHBOARD_TROUBLESHOOTING.md)

## Support

For issues:

1. Check logs: `tail -f logs/app.log`
2. Review [Troubleshooting](./DASHBOARD_TROUBLESHOOTING.md)
3. Open issue: https://github.com/synkra/aiox-core/issues

---

**Last Updated:** 2026-03-13
**Maintainer:** DevOps Team
