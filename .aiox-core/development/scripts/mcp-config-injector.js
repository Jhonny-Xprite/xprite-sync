/**
 * @module mcp-config-injector
 * @description Injeta segredos do vault em arquivos de configuração Docker/Env antes do deploy.
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { decrypt } = require('./mcp-vault');

const REGISTRY_PATH = path.join(process.cwd(), 'extensions', 'mcp-registry.json');
const SECRETS_JSON = path.join(process.cwd(), '.aiox/secrets/mcp-secrets.json');

async function injectAndApply() {
    console.log('🛡️  AIOX Secret Injector: Aplicando credenciais seguras...');

    if (!fs.existsSync(REGISTRY_PATH)) {
        console.error('❌ Registry não encontrado. Rode npm run mcp:registry primeiro.');
        return;
    }

    if (!fs.existsSync(SECRETS_JSON)) {
        console.log('💡 Nenhum segredo configurado em .aiox/secrets/mcp-secrets.json. Pulando injeção.');
        return;
    }

    const registry = await fs.readJson(REGISTRY_PATH);
    const encryptedSecrets = await fs.readJson(SECRETS_JSON);

    for (const mcp of registry.mcps) {
        if (!mcp.env) continue;

        const mcpSecrets = encryptedSecrets[mcp.id] || {};
        const injectedEnv = {};

        for (const [key, meta] of Object.entries(mcp.env)) {
            if (meta.secret && mcpSecrets[key]) {
                console.log(`  - Injetando segredo [${key}] para ${mcp.id}...`);
                injectedEnv[key] = decrypt(mcpSecrets[key]);
            }
        }

        // Simulação: Aqui o script geraria um arquivo .env ou Docker Compose Override
        // Para a Story 5.6, validamos que os segredos foram recuperados.
        if (Object.keys(injectedEnv).length > 0) {
            const envFile = path.join(process.cwd(), mcp.localPath, '.env.production');
            let envContent = '';
            for (const [k, v] of Object.entries(injectedEnv)) {
                envContent += `${k}=${v}\n`;
            }
            await fs.writeFile(envFile, envContent, { mode: 0o600 });
            console.log(`✅ Arquivo .env.production gerado em ${mcp.localPath}`);
        }
    }
}

if (require.main === module) {
    injectAndApply().catch(err => console.error(err));
}
