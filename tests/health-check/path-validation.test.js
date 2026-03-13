/**
 * Framework Path Health Checks
 * Validates critical .aiox-core/ directory structure exists
 */

const fs = require('fs');
const path = require('path');

describe('Framework Path Validation', () => {
  const projectRoot = path.join(__dirname, '../../');

  const criticalPaths = [
    '.aiox-core',
    '.aiox-core/core',
    '.aiox-core/development',
    '.aiox-core/development/agents',
    '.aiox-core/development/tasks',
    '.aiox-core/development/templates',
    '.aiox-core/development/checklists',
    '.aiox-core/development/workflows',
    '.aiox-core/development/scripts',
    '.aiox-core/infrastructure',
    '.aiox-core/data',
    '.aiox-core/core/config',
    'docs/stories',
    'docs/prd',
    'docs/architecture',
    'tests'
  ];

  const criticalFiles = [
    '.aiox-core/constitution.md',
    '.aiox-core/core-config.yaml',
    '.aiox-core/core/config/config-resolver.js',
    '.claude/CLAUDE.md',
    'jest.config.js',
    'package.json'
  ];

  it('should have all critical directories', () => {
    criticalPaths.forEach(dirPath => {
      const fullPath = path.join(projectRoot, dirPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isDirectory()).toBe(true);
    });
  });

  it('should have all critical files', () => {
    criticalFiles.forEach(filePath => {
      const fullPath = path.join(projectRoot, filePath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isFile()).toBe(true);
    });
  });

  it('should have valid core-config.yaml structure', () => {
    const configPath = path.join(projectRoot, '.aiox-core/core-config.yaml');
    const content = fs.readFileSync(configPath, 'utf-8');

    // Check for essential YAML keys
    expect(content).toContain('project:');
    expect(content).toContain('type:');
    expect(content).toContain('devLoadAlwaysFiles:');
    expect(content).toContain('devStoryLocation:');
  });

  it('should have constitution.md with non-negotiable principles', () => {
    const constitutionPath = path.join(projectRoot, '.aiox-core/constitution.md');
    const content = fs.readFileSync(constitutionPath, 'utf-8');

    expect(content).toContain('NON-NEGOTIABLE');
  });

  it('should have agent directory with agent files', () => {
    const agentsDir = path.join(projectRoot, '.aiox-core/development/agents');
    const files = fs.readdirSync(agentsDir);

    expect(files.length).toBeGreaterThan(10);
    expect(files.some(f => f.endsWith('.md'))).toBe(true);
  });

  it('should have task directory with task files', () => {
    const tasksDir = path.join(projectRoot, '.aiox-core/development/tasks');
    const files = fs.readdirSync(tasksDir);

    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.endsWith('.md'))).toBe(true);
  });

  it('should have stories directory structure', () => {
    const storiesDir = path.join(projectRoot, 'docs/stories');
    const files = fs.readdirSync(storiesDir);

    expect(files.length).toBeGreaterThan(0);
  });

  it('should use relative paths (no hardcoded absolute paths in config)', () => {
    // Verify config files don't have hardcoded absolute paths
    const configPath = path.join(projectRoot, '.aiox-core/core-config.yaml');
    const content = fs.readFileSync(configPath, 'utf-8');

    // Check that paths in config are relative (not absolute Windows/Unix paths)
    expect(content).not.toMatch(/C:\\.*\.md/);
    expect(content).not.toMatch(/D:\\.*\.md/);
    expect(content).not.toMatch(/\/home\/.*\.md/);
    expect(content).not.toMatch(/\/Users\/.*\.md/);
  });
});
