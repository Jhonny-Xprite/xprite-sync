---
story:
  id: "3.1"
  epic: "3"
  title: "Setup Inicial - Integração Base do Dashboard"
  status: "Specified"
  created: "2026-03-13"
  created_by: "@sm (River)"

# Story Metadata
metadata:
  type: "infrastructure"
  priority: "P0"
  estimated_effort: "5-8"
  risk_level: "LOW"
  dependencies: []

# ClickUp Integration (Optional)
clickup:
  task_id: ""
  epic_task_id: ""
  list: "Backlog"
  url: ""
  last_sync: ""

---

# Story 3.1: Setup Inicial - Integração Base do Dashboard

## 📖 Story Statement

**As a** Developer working on AIOX observability
**I want to** integrate the Synkra AIOX Dashboard repository into the project
**So that** we have a foundation for implementing real-time monitoring of agents, metrics, and system health.

---

## 🎯 Acceptance Criteria

- [ ] **AC 3.1.1:** Dashboard repository is successfully integrated into the project (either as Git submodule, monorepo, or standalone module)
- [ ] **AC 3.1.2:** All environment variables for dashboard (dev, staging, production) are documented and configured
- [ ] **AC 3.1.3:** Dashboard build pipeline successfully compiles the dashboard locally (build time < 30s)
- [ ] **AC 3.1.4:** Dashboard is accessible at `http://localhost:3000/dashboard` in development environment
- [ ] **AC 3.1.5:** All dashboard dependencies are properly managed (no version conflicts with main project)
- [ ] **AC 3.1.6:** Documentation updated: setup guide for developers and deployment instructions

## Spec Pipeline Artifacts

| Artifact | Path |
|----------|------|
| Specification | [spec.md](./story-3.1/spec/spec.md) |
| Requirements | [requirements.json](./story-3.1/spec/requirements.json) |
| Implementation Plan | [implementation.yaml](./story-3.1/implementation.yaml) |
| Critique | [critique.json](./story-3.1/spec/critique.json) |
| Complexity | [complexity.json](./story-3.1/spec/complexity.json) |
| Research | [research.json](./story-3.1/spec/research.json) |


---

## 📋 Description

This story establishes the foundation for Dashboard integration. It focuses on:

1. **Repository Integration**
   - Fork/clone Synkra AIOX Dashboard repository: https://github.com/SynkraAI/aiox-dashboard
   - Choose integration strategy:
     - Option A: Git submodule (recommended for monorepo)
     - Option B: Monorepo with separate package
     - Option C: Standalone frontend service
   - Ensure no conflicts with existing packages

2. **Environment Configuration**
   - Create `.env.local`, `.env.staging`, `.env.production` for dashboard
   - Required variables:
     - `REACT_APP_API_URL` - Backend API endpoint
     - `REACT_APP_WS_URL` - WebSocket endpoint for real-time updates
     - `REACT_APP_SUPABASE_URL` - Supabase project URL
     - `REACT_APP_SUPABASE_ANON_KEY` - Supabase public key
   - Document all environment variables in README

3. **Build & Run Setup**
   - Install dashboard dependencies (`npm install` or `yarn install`)
   - Configure build scripts in package.json
   - Test local development server startup
   - Verify no console errors on dashboard load

4. **Documentation**
   - Create DASHBOARD.md with setup instructions
   - Document integration strategy chosen
   - Include troubleshooting guide
   - Add dashboard to main README

---

## 🔧 Technical Details

### Stack Requirements
- **Frontend Framework:** React/Vue/Angular (per dashboard repo)
- **Package Manager:** npm or yarn (match project standard)
- **Build Tool:** Vite/Webpack (per dashboard configuration)
- **Node.js:** Version 18+ (recommended)

### Integration Points
- Backend API: Express.js/Fastify endpoints
- WebSocket: Supabase Realtime or separate WebSocket server
- Database: Supabase (shared with main project)
- Authentication: Existing AIOX auth system

### File Structure (Expected)
```
project-root/
├── packages/
│   ├── dashboard/          # OR frontend/ depending on structure
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.js (or similar)
│   ├── api/
│   └── ...
├── docs/
│   └── DASHBOARD.md        # NEW - Setup guide
└── .env.* files
```

---

## 📊 Quality Gates

### Code Review
- ✅ Integration approach reviewed and documented
- ✅ No hardcoded credentials
- ✅ Environment variables properly abstracted
- ✅ Dependencies pinned to specific versions

### Testing
- ✅ Build succeeds locally
- ✅ Dashboard loads without errors
- ✅ No console errors or warnings
- ✅ Development server responds within 3s

### Documentation
- ✅ Setup guide is complete and tested
- ✅ Troubleshooting section covers common issues
- ✅ All environment variables documented
- ✅ Integration strategy clearly explained

---

## 🤖 CodeRabbit Integration

**CodeRabbit Quality Gates:**
- Pre-commit: `coderabbit --prompt-only -t uncommitted`
- Pre-PR: `coderabbit --prompt-only --base master`

**Quality Focus Areas:**
- No hardcoded secrets or credentials
- Consistent code style with project
- Proper error handling in initialization
- Build optimization (no bloat)

---

## 📝 Developer Notes

### Setup Command Reference
```bash
# Clone or add submodule
git submodule add https://github.com/SynkraAI/aiox-dashboard packages/dashboard

# Install dependencies
cd packages/dashboard
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### Key Files to Modify
- `package.json` - Add dashboard build scripts
- `.gitignore` - Ensure node_modules excluded
- Root `.env.example` - Add dashboard variables
- `README.md` - Add dashboard section

### Potential Issues
1. **Dependency conflicts:** Check for overlapping package versions
2. **Port conflicts:** Ensure dashboard port (3000 or configured port) is available
3. **CORS issues:** May need to configure CORS in backend
4. **WebSocket connection:** Verify WS_URL points to correct server

### Resources
- Dashboard GitHub: https://github.com/SynkraAI/aiox-dashboard
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- React Setup: https://react.dev/ (if using React)

---

## ✅ Definition of Done

- [ ] Dashboard repository integrated
- [ ] All AC pass
- [ ] All quality gates pass
- [ ] Documentation complete
- [ ] Code reviewed and approved
- [ ] Ready for next story (3.2)

---

## 🔗 Related Stories

- **Epic:** Epic 3 - Dashboard Integration
- **Next:** Story 3.2 (Real-time Data Flow)
- **Parallel:** Story 3.3 (Schema & RLS)
- **Previous:** Epic 2 (completed)

---

*Story created by @sm (River) - 2026-03-13*
*Last updated: 2026-03-13*
