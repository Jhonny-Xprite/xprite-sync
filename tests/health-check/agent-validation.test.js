/**
 * Agent Definition Health Checks
 * Validates that all 12 required agents are present and correctly defined
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

describe('Agent Definition Validation', () => {
  const agentsDir = path.join(__dirname, '../../.aiox-core/development/agents');

  const requiredAgents = [
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
  ];

  it('should have all 12 required agent files', () => {
    const files = fs.readdirSync(agentsDir);
    requiredAgents.forEach(agent => {
      expect(files).toContain(agent);
    });
  });

  it('should have valid YAML in each agent file', () => {
    requiredAgents.forEach(agent => {
      const filePath = path.join(agentsDir, agent);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract YAML block
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
      if (yamlMatch) {
        expect(() => {
          YAML.parse(yamlMatch[1]);
        }).not.toThrow();
      }
    });
  });

  it('should have required agent fields in each definition', () => {
    const agentFields = ['agent', 'persona_profile', 'commands', 'dependencies'];

    requiredAgents.forEach(agent => {
      const filePath = path.join(agentsDir, agent);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        agentFields.forEach(field => {
          expect(parsed).toHaveProperty(field);
        });
      }
    });
  });

  it('should have valid agent name and id', () => {
    requiredAgents.forEach(agent => {
      const filePath = path.join(agentsDir, agent);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        expect(parsed.agent).toHaveProperty('name');
        expect(parsed.agent).toHaveProperty('id');
        expect(parsed.agent.name).toBeTruthy();
        expect(parsed.agent.id).toBeTruthy();
      }
    });
  });

  it('should have at least one command per agent', () => {
    requiredAgents.forEach(agent => {
      const filePath = path.join(agentsDir, agent);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        expect(parsed.commands).toBeDefined();
        if (Array.isArray(parsed.commands)) {
          expect(parsed.commands.length).toBeGreaterThan(0);
        } else {
          // Commands might be defined inline in a list format
          expect(parsed.commands).toBeTruthy();
        }
      }
    });
  });

  it('should have proper persona profile with archetype and zodiac', () => {
    requiredAgents.forEach(agent => {
      const filePath = path.join(agentsDir, agent);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        expect(parsed.persona_profile).toHaveProperty('archetype');
        expect(parsed.persona_profile).toHaveProperty('zodiac');
        expect(parsed.persona_profile.archetype).toBeTruthy();
        expect(parsed.persona_profile.zodiac).toBeTruthy();
      }
    });
  });
});
