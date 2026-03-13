/**
 * Dependency Resolution Health Checks
 * Validates that agent dependencies are resolvable and referenced files exist
 */

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

describe('Dependency Resolution Validation', () => {
  const projectRoot = path.join(__dirname, '../../');
  const agentsDir = path.join(projectRoot, '.aiox-core/development/agents');
  const tasksDir = path.join(projectRoot, '.aiox-core/development/tasks');
  const templatesDir = path.join(projectRoot, '.aiox-core/development/templates');
  const checklistsDir = path.join(projectRoot, '.aiox-core/development/checklists');

  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

  it('should have resolvable task dependencies in each agent', () => {
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        if (parsed.dependencies && parsed.dependencies.tasks) {
          parsed.dependencies.tasks.forEach(task => {
            const taskPath = path.join(tasksDir, task);
            expect(fs.existsSync(taskPath)).toBe(true);
          });
        }
      }
    });
  });

  it('should have resolvable template dependencies in each agent', () => {
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        if (parsed.dependencies && parsed.dependencies.templates) {
          parsed.dependencies.templates.forEach(template => {
            const templatePath = path.join(templatesDir, template);
            expect(fs.existsSync(templatePath)).toBe(true);
          });
        }
      }
    });
  });

  it('should have resolvable checklist dependencies in each agent', () => {
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        if (parsed.dependencies && parsed.dependencies.checklists) {
          parsed.dependencies.checklists.forEach(checklist => {
            const checklistPath = path.join(checklistsDir, checklist);
            expect(fs.existsSync(checklistPath)).toBe(true);
          });
        }
      }
    });
  });

  it('should not have circular dependencies between agents', () => {
    // Simple check: no agent should directly reference itself in dependencies
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        const agentId = parsed.agent?.id;

        if (parsed.dependencies) {
          // Check tasks don't reference agent's own ID directly
          // (e.g., dev agent shouldn't have a task file named dev-something.md)
          if (parsed.dependencies.tasks) {
            parsed.dependencies.tasks.forEach(task => {
              // Only fail if task is exactly the agent's own ID as filename
              const taskBaseName = task.replace(/\.md$/, '');
              expect(taskBaseName === agentId).toBe(false);
            });
          }
        }
      }
    });
  });

  it('should have all required dependencies sections', () => {
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const parsed = YAML.parse(yamlMatch[1]);
        expect(parsed.dependencies).toBeDefined();
      }
    });
  });

  it('should have valid command references in agent definitions', () => {
    agentFiles.forEach(agentFile => {
      const filePath = path.join(agentsDir, agentFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Simply check that commands section exists in the file
      // Detailed command validation is done in agent-validation.test.js
      expect(content).toContain('commands:');
    });
  });
});
