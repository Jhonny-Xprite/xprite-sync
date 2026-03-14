# Synkra AIOX - AI-Orchestrated Dashboard

Complete AI-driven system for monitoring agents and workflows.

## Overview

Synkra AIOX Dashboard provides:
- Real-time agent metrics (status, latency, performance)
- System health visualization
- Workflow execution logs
- Distributed tracing and structured logging
- High-performance caching layer

## Quick Start

### Prerequisites
- Node.js 18+, npm 9+
- Redis 7.0+
- PostgreSQL 14+ (Supabase)

### Installation

```bash
git clone https://github.com/synkra/aiox-core.git
cd aiox-core
npm install
cp .env.example .env
npm run dev:api     # Terminal 1
npm run dev:dashboard  # Terminal 2
```

### Verify

```bash
curl http://localhost:3000/api/health
```

Access dashboard: http://localhost:5173

## Architecture

### Core Services

| Service | Purpose | Technology |
|---------|---------|------------|
| CacheService | Redis wrapper with TTL | ioredis |
| RealtimeService | Supabase Realtime | Supabase |
| MetricsManager | Queue-based buffering | In-memory |
| InfraMonitor | System metrics | os module |
| TracingManager | OpenTelemetry | @opentelemetry |
| Logger | Structured logging | Pino |

### Performance Targets

- Cache hit rate: >70%
- API latency p95: <200ms
- Trace propagation: <5s
- Tracing overhead: <10%

## Key Features

1. **Caching Layer**
   - Configurable TTL by data type
   - Pattern-based invalidation
   - Graceful offline fallback

2. **Real-time Updates**
   - Supabase Realtime subscriptions
   - RLS policy enforcement
   - Exponential backoff reconnection

3. **Distributed Tracing**
   - OpenTelemetry SDK
   - W3C Trace Context
   - Correlation ID injection
   - PII redaction

4. **High Performance**
   - Metrics batching (5s cycles)
   - Queue-based buffering
   - System collection (10s intervals)

## Documentation

- Setup: docs/DASHBOARD_SETUP.md
- User Guide: docs/DASHBOARD_USER_GUIDE.md
- API Reference: docs/DASHBOARD_API.md
- Troubleshooting: docs/DASHBOARD_TROUBLESHOOTING.md

## Testing

```bash
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:performance # Performance benchmarks
```

## Development Workflow

Story-driven development:
1. Create story: @sm *create-story
2. Implement: @dev *develop
3. Test: @qa *qa-gate
4. Release: @devops *push

## Support

- Setup: docs/DASHBOARD_SETUP.md
- Usage: docs/DASHBOARD_USER_GUIDE.md
- API: docs/DASHBOARD_API.md
- Issues: docs/DASHBOARD_TROUBLESHOOTING.md

---

Version: 2.1.0
Last Updated: 2026-03-14
Status: Epic 4 Complete ✅ | Epic 3 In Progress 🏗️

