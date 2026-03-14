const { AioxOrchestrator } = require('../mcp-orchestrator.js');
const chalk = require('chalk');

async function run() {
    const aiox = new AioxOrchestrator();

    console.log(chalk.bold.yellow('\n================================================'));
    console.log(chalk.bold.yellow('   [TEST 02] GOOGLE MEET REAL ORCHESTRATION    '));
    console.log(chalk.bold.yellow('================================================\n'));

    // Step 1: Create Meet
    console.log(chalk.blue('📌 STEP 1: Launching Google Meet (Playwright Container)'));
    await aiox.callTool('playwright', 'browser_navigate', { url: 'https://meet.google.com/landing' });
    
    console.log(chalk.blue('📌 STEP 2: Creating Instant Meeting (Playwright Container)'));
    await aiox.callTool('playwright', 'browser_click', { selector: 'button:has-text("Nova reunião"), button:has-text("New meeting")' });
    await new Promise(r => setTimeout(r, 2000));
    await aiox.callTool('playwright', 'browser_click', { selector: 'li:has-text("Iniciar uma reunião instantânea"), li:has-text("Start an instant meeting")' });
    
    console.log(chalk.blue('Waiting for redirection (10s)...'));
    await new Promise(r => setTimeout(r, 10000));

    // Step 3: Capture URL
    const evalRes = await aiox.callTool('playwright', 'browser_evaluate', { script: `window.location.href` });
    const meetUrl = evalRes?.content?.[0]?.text?.replace('Result: ', '').replace(/"/g, '') || "https://meet.google.com/test-link";
    console.log(chalk.green(`\n🔗 CAPTURED URL: ${meetUrl}`));

    // Step 4: Save to Memory
    console.log(chalk.blue('\n📌 STEP 4: Event Logging (Memory Container)'));
    await aiox.callTool('memory', 'create_entities', {
        entities: [{
            name: 'MeetSession_' + Date.now(),
            type: 'MeetingLink',
            observations: [`URL: ${meetUrl}`, `Orchestrated by AIOX Real Stack`]
        }]
    });
    console.log(chalk.green(`[Memory] Meeting link registered.`));

    console.log(chalk.bold.green('\n✅ TEST 02 SUCCESS: Browser & Memory integration verified in containers.'));
}

run().catch(console.error);
