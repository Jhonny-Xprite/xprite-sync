/**
 * Configuration Health Checks
 * Validates .aiox-core/core-config.yaml structure and essential settings
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

describe('Configuration Validation', () => {
  const projectRoot = path.join(__dirname, '../../');
  const configPath = path.join(projectRoot, '.aiox-core/core-config.yaml');

  let config;

  beforeAll(() => {
    const content = fs.readFileSync(configPath, 'utf-8');
    config = YAML.parse(content);
  });

  it('should have valid YAML syntax', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('should have required root properties', () => {
    const requiredProps = ['project', 'user_profile', 'ide', 'devLoadAlwaysFiles', 'devStoryLocation'];
    requiredProps.forEach(prop => {
      expect(config).toHaveProperty(prop);
    });
  });

  it('should have valid project configuration', () => {
    expect(config.project).toHaveProperty('type');
    expect(config.project).toHaveProperty('version');
    expect(config.project.type).toMatch(/greenfield|brownfield/);
  });

  it('should have valid user profile', () => {
    expect(config.user_profile).toBeDefined();
    expect(['advanced', 'bob']).toContain(config.user_profile);
  });

  it('should have valid IDE configuration', () => {
    expect(config.ide).toHaveProperty('selected');
    expect(Array.isArray(config.ide.selected)).toBe(true);
    expect(config.ide.selected.length).toBeGreaterThan(0);
  });

  it('should have valid devLoadAlwaysFiles configuration', () => {
    expect(Array.isArray(config.devLoadAlwaysFiles)).toBe(true);
    expect(config.devLoadAlwaysFiles.length).toBeGreaterThan(0);

    // Configuration is valid as long as array is defined and has items
    // Files may not exist if fallback is being used
    expect(config.devLoadAlwaysFiles.every(f => typeof f === 'string')).toBe(true);
  });

  it('should have valid story location', () => {
    expect(config.devStoryLocation).toBeDefined();
    const storyPath = path.join(projectRoot, config.devStoryLocation);
    expect(fs.existsSync(storyPath)).toBe(true);
    expect(fs.statSync(storyPath).isDirectory()).toBe(true);
  });

  it('should have valid CodeRabbit integration configuration', () => {
    expect(config.coderabbit).toBeDefined();
    expect(config.coderabbit).toHaveProperty('enabled');
    expect(config.coderabbit).toHaveProperty('cli');
    expect(config.coderabbit.cli).toHaveProperty('installPath');
    expect(config.coderabbit.cli).toHaveProperty('timeout');
  });

  it('should have valid framework protection settings', () => {
    expect(config.boundary).toBeDefined();
    expect(config.boundary).toHaveProperty('frameworkProtection');
    expect(typeof config.boundary.frameworkProtection).toBe('boolean');
  });

  it('should have framework protected paths configured', () => {
    expect(config.boundary.protected).toBeDefined();
    expect(Array.isArray(config.boundary.protected)).toBe(true);
    expect(config.boundary.protected.length).toBeGreaterThan(0);
  });

  it('should have valid lazy loading configuration', () => {
    expect(config.lazyLoading).toBeDefined();
    expect(config.lazyLoading).toHaveProperty('enabled');
    if (config.lazyLoading.enabled) {
      expect(config.lazyLoading).toHaveProperty('heavySections');
      expect(Array.isArray(config.lazyLoading.heavySections)).toBe(true);
    }
  });

  it('should have valid MCP configuration', () => {
    expect(config.mcp).toBeDefined();
    expect(config.mcp).toHaveProperty('enabled');
    expect(typeof config.mcp.enabled).toBe('boolean');
  });

  it('should have decision logging enabled', () => {
    expect(config.decisionLogging).toBeDefined();
    expect(config.decisionLogging).toHaveProperty('enabled');
    expect(config.decisionLogging.enabled).toBe(true);
  });
});
