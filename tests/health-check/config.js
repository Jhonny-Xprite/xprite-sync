/**
 * Health Check Test Configuration
 * Centralizes configuration for health-check test suite
 */

const path = require('path');

module.exports = {
  // Project root directory
  projectRoot: path.join(__dirname, '../../'),

  // Framework directories
  framework: {
    coreDir: '.aiox-core',
    developmentDir: '.aiox-core/development',
    agentsDir: '.aiox-core/development/agents',
    tasksDir: '.aiox-core/development/tasks',
    templatesDir: '.aiox-core/development/templates',
    checklistsDir: '.aiox-core/development/checklists',
    workflowsDir: '.aiox-core/development/workflows',
    infraDir: '.aiox-core/infrastructure',
    dataDir: '.aiox-core/data'
  },

  // Documentation directories
  docs: {
    storiesDir: 'docs/stories',
    prdDir: 'docs/prd',
    architectureDir: 'docs/architecture'
  },

  // Required agents (12 total)
  agents: [
    'po.md',
    'qa.md',
    'dev.md',
    'pm.md',
    'architect.md',
    'sm.md',
    'aiox-master.md',
    'analyst.md',
    'data-engineer.md',
    'ux-design-expert.md',
    'devops.md',
    'squad-creator.md'
  ],

  // Test execution timeouts
  timeouts: {
    agentParsing: 5000,      // 5s to parse all agent YAML
    pathValidation: 3000,    // 3s for path checks
    dependencyCheck: 5000,   // 5s for dependency resolution
    configValidation: 2000   // 2s for config check
  },

  // Coverage thresholds
  coverage: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },

  // Performance thresholds
  performance: {
    maxExecutionTime: 30000, // 30 seconds total
    maxTestTime: 3000        // 3 seconds per test
  },

  // Log output
  logging: {
    verbose: false,
    logPath: path.join(__dirname, '../../.aiox/test-logs/health-check')
  },

  /**
   * Get full path for a relative framework path
   * @param {string} relativePath - Relative path from .aiox-core
   * @returns {string} Full absolute path
   */
  getFrameworkPath(relativePath) {
    return path.join(this.projectRoot, this.framework.coreDir, relativePath);
  },

  /**
   * Get full path for a docs path
   * @param {string} relativePath - Relative path from docs/
   * @returns {string} Full absolute path
   */
  getDocsPath(relativePath) {
    return path.join(this.projectRoot, 'docs', relativePath);
  }
};
