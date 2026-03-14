const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');

program
  .name('mcp-generator')
  .description('AIOX MCP Scaffolding Tool')
  .requiredOption('-n, --name <name>', 'Name of the MCP (kebab-case)')
  .option('-t, --template <template>', 'Template to use (node-ts, python)', 'node-ts')
  .option('-d, --description <description>', 'Description of the MCP', 'An AIOX Managed MCP Server')
  .parse(process.argv);

const options = program.opts();
const mcpName = options.name.toLowerCase();
const templateName = options.template;
const description = options.description;

const rootDir = process.cwd();
const templateDir = path.join(rootDir, '.aiox-core', 'templates', 'mcps', templateName);
const targetDir = path.join(rootDir, 'extensions', 'mcps', mcpName);

async function generate() {
  console.log(chalk.blue(`🚀 Generating MCP: ${chalk.bold(mcpName)} using template ${chalk.bold(templateName)}...`));

  if (!fs.existsSync(templateDir)) {
    console.error(chalk.red(`❌ Error: Template '${templateName}' not found in ${templateDir}`));
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`❌ Error: Directory already exists at ${targetDir}`));
    process.exit(1);
  }

  try {
    // 1. Copy template
    await fs.copy(templateDir, targetDir);

    // 2. Walk and replace placeholders
    const replaceInFiles = async (dir) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await replaceInFiles(filePath);
        } else {
          let content = await fs.readFile(filePath, 'utf8');
          content = content.replace(/{{name}}/g, mcpName);
          content = content.replace(/{{description}}/g, description);
          await fs.writeFile(filePath, content, 'utf8');
        }
      }
    };

    await replaceInFiles(targetDir);

    console.log(chalk.green(`\n✅ Successfully generated MCP at: ${chalk.cyan(targetDir)}`));
    console.log(chalk.yellow(`\nNext steps:`));
    console.log(`  1. cd extensions/mcps/${mcpName}`);
    if (templateName === 'node-ts') {
      console.log(`  2. npm install`);
      console.log(`  3. npm run build`);
    } else {
      console.log(`  2. pip install -r requirements.txt`);
    }
  } catch (error) {
    console.error(chalk.red(`❌ Failed to generate MCP: ${error.message}`));
    process.exit(1);
  }
}

generate();
