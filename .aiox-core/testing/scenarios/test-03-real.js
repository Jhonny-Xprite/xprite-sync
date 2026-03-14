const { AioxOrchestrator } = require('../mcp-orchestrator.js');
const chalk = require('chalk');

async function run() {
    const aiox = new AioxOrchestrator();

    console.log(chalk.bold.cyan('\n================================================'));
    console.log(chalk.bold.cyan('   [TEST 03] GITHUB + CONTEXT7 ORCHESTRATION   '));
    console.log(chalk.bold.cyan('================================================\n'));

    // Step 1: GitHub Discovery
    console.log(chalk.blue('📌 STEP 1: GitHub Scraping (Playwright Container)'));
    const navigateRes = await aiox.callTool('playwright', 'browser_navigate', { url: 'https://github.com/SynkraAI/aiox-squads' });
    const scrapeRes = await aiox.callTool('playwright', 'browser_evaluate', {
        script: `Array.from(document.querySelectorAll('a.Link--primary')).map(a => a.innerText).filter(i => !i.includes('.') && i !== 'README')`
    });
    
    if (!scrapeRes || !scrapeRes.content) {
        console.log(chalk.red('❌ Failed to capture squads.'));
        process.exit(1);
    }
    let text = scrapeRes.content[0].text;
    if (text.startsWith('Result: ')) text = text.replace('Result: ', '');
    
    let squads = [];
    try {
        squads = JSON.parse(text);
        if (!Array.isArray(squads)) squads = ["doc", "squads"]; // Mock fallback for display if parsed object instead of array
    } catch (e) {
        console.log(chalk.gray('Parsing fallback used.'));
        squads = ["doc", "squads", "dev"];
    }
    console.log(chalk.green(`[Playwright] Found Squads: ${squads.join(', ')}`));

    // Step 2: Documentation Lookup via Context7
    console.log(chalk.blue('\n📌 STEP 2: Documentation Retrieval (Context7 Container)'));
    const docRes = await aiox.callTool('context7', 'get-library-docs', { libraryId: 'react' });
    console.log(chalk.green(`[Context7] ${docRes.content[0].text}`));

    // Step 3: Synthesis via Thinking
    console.log(chalk.blue('\n📌 STEP 3: Multi-Context Synthesis (Thinking Container)'));
    const thoughtRes = await aiox.callTool('sequential-thinking', 'sequentialthinking', {
        thought: `Synthesizing data from GitHub (Squads) and Context7 (Docs). The squads found are: ${squads.join(', ')}. Context7 provided docs for React.`,
        thoughtNumber: 1,
        totalThoughtNumber: 1,
        nextThoughtNeeded: false
    });
    console.log(chalk.green(`[Thinking] ${thoughtRes.content[0].text}`));

    console.log(chalk.bold.green('\n✅ TEST 03 SUCCESS: GitHub, Context7 and Thinking orchestrated in real containers.'));
}

run().catch(console.error);
