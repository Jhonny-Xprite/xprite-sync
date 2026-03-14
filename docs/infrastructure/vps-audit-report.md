# AIOX VPS & Local Audit Report
**Date:** 2026-03-14
**Status:** COMPLETE ✅

## 1. Local Infrastructure (Docker Desktop)
- **Bloat Detection:** Found 15+ orphaned images (`<none>`) totaling ~4.5GB.
- **Action:** Manual prune executed. Orphaned Playwright and Exa images removed to make space for standardized versions.
- **Catalog Audit:** `docker-mcp.yaml` found at `C:\Users\Jhonn\.docker\mcp\catalogs\`. 
  - **Issues:** Several tools (Zerodha, Wix) lack valid API keys in the system.
  - **Recommendation:** Migrate these to `extensions/mcps` in Wave 6.

## 2. Remote Infrastructure (VPS - Hostinger)
- **Orchestration:** Easypanel active.
- **Active Services:**
  - n8n (Stable)
  - Plane (Full Stack)
  - Chatwoot / Evolution API
- **Health Metrics:**
  - RAM: 62% usage.
  - Disk: 58% usage (Available ~40GB).
- **Security:** SSH Executor module verified and functional.

## 3. Zombie Container Mapping
- **Local:** No functional MCP containers were running.
- **VPS:** No orphaned containers found; all identified as managed by Easypanel.

## 4. Exclusion List (Approved for Removal)
- [x] Untagged images (`docker image prune`).
- [x] Legacy MCP folders in `tmp/`.
- [ ] Legacy `.env` files with redundant keys (Pending migration to Vault).

## 5. Deployment Recommendations
- All new MCPs MUST use the `mcr.microsoft.com/playwright` base for browser tools to avoid dependency conflicts.
- Vault integration is MANDATORY for all `exa` and legacy search tools.
