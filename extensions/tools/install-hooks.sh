#!/bin/bash

# ==============================================================================
# INSTALL GIT HOOKS
# ==============================================================================
# This script installs pre-commit hooks into the local .git/hooks directory.
# It should be run after `git init` or `git clone`.
#
# Usage: ./scripts/install-hooks.sh
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get project root
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
HOOKS_SOURCE_DIR="$PROJECT_ROOT/.git-hooks"
HOOKS_TARGET_DIR="$PROJECT_ROOT/.git/hooks"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Installing Git Hooks                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .git directory exists
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo -e "${RED}❌ ERROR: .git directory not found${NC}"
  echo -e "${YELLOW}Please run 'git init' or 'git clone' first${NC}"
  exit 1
fi

# Check if hooks source directory exists
if [ ! -d "$HOOKS_SOURCE_DIR" ]; then
  echo -e "${RED}❌ ERROR: .git-hooks directory not found at $HOOKS_SOURCE_DIR${NC}"
  exit 1
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p "$HOOKS_TARGET_DIR"

# Copy hooks
echo -e "${YELLOW}Installing hooks...${NC}"
echo ""

INSTALLED_COUNT=0

# Install pre-commit hook
if [ -f "$HOOKS_SOURCE_DIR/pre-commit" ]; then
  cp "$HOOKS_SOURCE_DIR/pre-commit" "$HOOKS_TARGET_DIR/pre-commit"
  chmod +x "$HOOKS_TARGET_DIR/pre-commit"
  echo -e "${GREEN}✅ pre-commit hook installed${NC}"
  INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
else
  echo -e "${RED}⚠️  pre-commit hook not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Installed $INSTALLED_COUNT hook(s)${NC}"
echo ""
echo -e "${BLUE}Hook Information:${NC}"
echo "  Location: $HOOKS_TARGET_DIR"
echo "  Log file: .git/logs/health-check.log"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Make your changes"
echo "  2. Stage files: git add ."
echo "  3. Commit: git commit -m 'your message'"
echo "  4. The pre-commit hook will run automatically"
echo ""
echo -e "${YELLOW}To bypass hooks (not recommended):${NC}"
echo "  git commit --no-verify"
echo ""
