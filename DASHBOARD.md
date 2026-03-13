# 📊 AIOX Dashboard Setup & Developer Guide

**Version:** 1.0
**Last Updated:** 2026-03-13
**Maintained by:** @dev (Dex) & @devops (Gage)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Development Workflow](#development-workflow)
5. [Build & Deployment](#build--deployment)
6. [Troubleshooting](#troubleshooting)
7. [Architecture](#architecture)
8. [Contributing](#contributing)

---

## Overview

The **AIOX Dashboard** is the observability interface for the Synkra AIOX orchestration platform. It provides real-time monitoring of:

- **AI Agent Status** - Execution state, performance metrics, and error tracking
- **System Metrics** - CPU, memory, disk, database health
- **Workflow Monitoring** - Task execution, progress, and audit logs
- **Real-time Updates** - WebSocket/Realtime integration for live data

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AIOX Dashboard                        │
│  (React + Vite + Tailwind CSS + Real-time Updates)     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐      ┌──────────────────┐         │
│  │  Monitor API    │──────│  Backend Service │         │
│  │ (http://...)    │      │  (Node.js/Hono)  │         │
│  └─────────────────┘      └──────────────────┘         │
│           │                         │                    │
│           └──────────┬──────────────┘                   │
│                      │                                   │
│              ┌─────────────────┐                        │
│              │ Supabase RealTime│ (WebSocket)           │
│              │ - Metrics Stream │                       │
│              │ - Agent Updates  │                       │
│              │ - System Health  │                       │
│              └─────────────────┘                        │
│                      │                                   │
│          ┌───────────┴────────────┐                     │
│          │                        │                     │
│    ┌──────────────┐       ┌──────────────┐            │
│    │  PostgreSQL  │       │ Redis Cache  │            │
│    └──────────────┘       └──────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0+ or **yarn** 1.22+
- **Git** with submodule support
- Supabase project credentials
- Backend API running locally

### 2. One-Command Setup

```bash
# From project root
npm run dashboard:install

# Copy and configure environment
cp packages/dashboard/.env.local packages/dashboard/.env.development.local

# Edit configuration (see section 3 below)
# vim packages/dashboard/.env.development.local

# Start development server
npm run dashboard:dev
```

Dashboard will be available at: **http://localhost:5173** (or next available port)

### 3. Verify Installation

```bash
# Check if dashboard is running
curl http://localhost:5173

# Should return HTML content without errors
```

---

## Environment Configuration

### Development (Local)

**File:** `packages/dashboard/.env.development.local`

```bash
# Backend Services
VITE_MONITOR_URL=http://localhost:4001
VITE_ENGINE_URL=http://localhost:4002

# Real-time Updates (Supabase Realtime or WebSocket)
VITE_RELAY_URL=ws://localhost:8080
VITE_RELAY_HTTP_URL=http://localhost:8080

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: GitHub OAuth (for authentication)
# VITE_AUTH_GITHUB_CLIENT_ID=your-github-client-id
```

**How to get credentials:**

1. **Supabase URL & Anon Key:**
   - Go to https://app.supabase.com
   - Select your project → Settings → API
   - Copy `Project URL` and `Anon public` key

2. **Monitor API URL:**
   - If running locally: `http://localhost:4001`
   - If remote: Contact DevOps team

3. **WebSocket URL:**
   - Local: `ws://localhost:8080` (if relay server running)
   - Remote: `wss://relay.aiox.dev` (production)

### Staging Environment

**File:** `packages/dashboard/.env.staging`

```bash
VITE_MONITOR_URL=https://api-staging.aiox.dev
VITE_ENGINE_URL=https://engine-staging.aiox.dev
VITE_RELAY_URL=wss://relay-staging.aiox.dev
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key-here
```

### Production Environment

**File:** `packages/dashboard/.env.production`

```bash
VITE_MONITOR_URL=https://api.aiox.dev
VITE_ENGINE_URL=https://engine.aiox.dev
VITE_RELAY_URL=wss://relay.aiox.dev
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here
```

---

## Development Workflow

### Starting Development Server

```bash
# From project root
npm run dashboard:dev

# Or from dashboard directory
cd packages/dashboard && npm run dev
```

**Output:**
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h + enter to show help
```

### Making Changes

1. **Edit files** in `packages/dashboard/src/`
2. **Hot reload** - Changes appear automatically in browser
3. **Check console** - Look for errors with F12 DevTools
4. **Test changes** - Verify UI and data flow

### Linting & Formatting

```bash
# Check code style
cd packages/dashboard
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

### Running Tests

```bash
# Run all tests
npm run test:run

# Watch mode (re-run on changes)
npm run test

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

---

## Build & Deployment

### Local Build

```bash
# Development build
npm run dashboard:build

# Output goes to: packages/dashboard/dist/
```

**Build Metrics:**
- Build time: ~23 seconds
- Bundle size: ~2.5 MB (gzipped)
- Output: `dist/` folder ready for deployment

### Staging Build

```bash
npm run dashboard:build:staging

# Environment: staging (from .env.staging)
```

### Production Build

```bash
npm run dashboard:build:prod

# Environment: production (from .env.production)
# Optimized for best performance
```

### Docker Deployment

```bash
# Build Docker image
docker build -t aiox-dashboard:latest packages/dashboard/

# Run container
docker run -p 3000:3000 \
  -e VITE_MONITOR_URL=http://api.aiox.dev \
  -e VITE_SUPABASE_URL=https://project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  aiox-dashboard:latest
```

See `packages/dashboard/Dockerfile` for details.

---

## Troubleshooting

### Issue: "Port 5173 already in use"

**Solution:**
```bash
# Find and kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Or run on different port
npm run dev -- --port 5174
```

### Issue: "Cannot find module '@aios/...'"

**Solution:**
```bash
# Reinstall dependencies
cd packages/dashboard
rm -rf node_modules package-lock.json
npm install
```

### Issue: "WebSocket connection failed"

**Solution:**
- Verify `VITE_RELAY_URL` is correct
- Check if relay server is running: `curl $VITE_RELAY_HTTP_URL/health`
- Check browser console (F12) for errors
- Verify CORS headers on relay server

### Issue: "Supabase connection error"

**Solution:**
- Verify `VITE_SUPABASE_URL` ends with `.supabase.co`
- Verify `VITE_SUPABASE_ANON_KEY` is correct (copy from Supabase console)
- Check Supabase project is active
- Verify network connectivity to Supabase

### Issue: "Build fails with 'tsc' errors"

**Solution:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix type issues or ignore:
# Add errors to tsconfig.json → compilerOptions.noImplicitAny = false

# Rebuild
npm run build
```

### Issue: "Dashboard loads but no data appears"

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Check Network tab for failed requests
3. Verify API endpoints are correct in .env file:
   - `curl $VITE_MONITOR_URL/health`
   - Response should be JSON

4. Check database connectivity:
   - Ensure Supabase project has data
   - Verify RLS policies allow anonymous access

### Issue: "Too many requests / Rate limit"

**Solution:**
- Dashboard caches data with Redis (see Story 3.6)
- Implement request throttling
- Contact DevOps if persistent

---

## Architecture

### Project Structure

```
packages/dashboard/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API & WebSocket services
│   ├── stores/         # State management
│   ├── styles/         # CSS/Tailwind
│   └── types/          # TypeScript types
├── public/             # Static assets
├── dist/              # Production build (generated)
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
├── package.json       # Dependencies & scripts
└── Dockerfile         # Docker image definition
```

### Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18+ | UI framework |
| **Vite** | 5+ | Build tool |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Styling |
| **Supabase JS** | Latest | Real-time database |
| **Vitest** | 4+ | Testing framework |

### Real-time Data Flow

```
1. User opens dashboard
   ↓
2. Dashboard connects to Supabase Realtime
   ↓
3. Subscribes to data streams:
   - agent_metrics
   - system_metrics
   - workflow_logs
   ↓
4. Receives updates in real-time (< 100ms latency)
   ↓
5. UI updates automatically (React re-render)
   ↓
6. Cache layer (Redis) reduces database load
```

---

## Contributing

### Code Standards

- **Language:** TypeScript (strict mode)
- **Style:** ESLint + Prettier
- **Components:** Functional React with hooks
- **Testing:** Vitest with >80% coverage

### Before Submitting Changes

1. **Run tests:** `npm run test:run`
2. **Check linting:** `npm run lint`
3. **Format code:** `npm run format`
4. **Build verification:** `npm run build`
5. **Manual testing:** `npm run dev` and test in browser

### Commit Message Format

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
test: Add tests
chore: Build, deps, CI/CD changes
```

Example:
```
feat: Add agent status indicator [Story 3.1]
```

---

## Support & Resources

- **Dashboard Repository:** https://github.com/SynkraAI/aiox-dashboard
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Internal Wiki:** See `docs/` folder in project root

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **1.0** | 2026-03-13 | Initial setup documentation (Story 3.1) |

---

**Created by:** @dev (Dex)
**Last Updated:** 2026-03-13
**Status:** ✅ COMPLETE
