const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const chalk = require('chalk');

const ajv = new Ajv({ allErrors: true });
const rootDir = process.cwd();
const mcpsDir = path.join(rootDir, 'extensions', 'mcps');
const schemaPath = path.join(rootDir, '.aiox-core', 'schemas', 'mcp-config.schema.json');
const registryOutPath = path.join(rootDir, 'extensions', 'mcp-registry.json');

async function validateAndRegister() {
  console.log(chalk.blue('🔍 AIOX MCP Registry: Scanning extensions/mcps...'));

  if (!fs.existsSync(schemaPath)) {
    console.error(chalk.red(`❌ Schema not found at ${schemaPath}`));
    process.exit(1);
  }

  const schema = await fs.readJson(schemaPath);
  const validate = ajv.compile(schema);

  if (!fs.existsSync(mcpsDir)) {
    console.error(chalk.yellow('⚠️ No mcps directory found at extensions/mcps'));
    await fs.writeJson(registryOutPath, { mcps: [], updatedAt: new Date().toISOString() }, { spaces: 2 });
    return;
  }

  const mcpFolders = await fs.readdir(mcpsDir);
  const registry = {
    mcps: [],
    updatedAt: new Date().toISOString()
  };

  let errorCount = 0;

  for (const folder of mcpFolders) {
    const configPath = path.join(mcpsDir, folder, 'mcp-config.yaml');
    
    if (!fs.existsSync(configPath)) {
      console.log(chalk.gray(`- Skipping ${folder}: No mcp-config.yaml found.`));
      continue;
    }

    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(configContent);

      const valid = validate(config);
      if (!valid) {
        console.error(chalk.red(`❌ Validation failed for MCP: ${folder}`));
        validate.errors.forEach(err => {
          console.error(chalk.gray(`  - ${err.instancePath} ${err.message}`));
        });
        errorCount++;
        continue;
      }

      registry.mcps.push({
        ...config,
        localPath: path.relative(rootDir, path.join(mcpsDir, folder))
      });
      console.log(chalk.green(`✅ Registered: ${chalk.bold(folder)} (v${config.version})`));
    } catch (error) {
      console.error(chalk.red(`❌ Error processing MCP ${folder}: ${error.message}`));
      errorCount++;
    }
  }

  await fs.writeJson(registryOutPath, registry, { spaces: 2 });
  
  console.log('\n--- Status ---');
  console.log(`Registered: ${chalk.green(registry.mcps.length)}`);
  console.log(`Errors: ${chalk.red(errorCount)}`);
  console.log(`Output: ${chalk.cyan('extensions/mcp-registry.json')}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

validateAndRegister();
