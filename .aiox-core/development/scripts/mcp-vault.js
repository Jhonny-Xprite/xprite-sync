/**
 * @module mcp-vault
 * @description Gestão segura de segredos para MCPs (API Keys, Tokens).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
const VAULT_FILE = path.join(process.cwd(), '.aiox/secrets/mcp-vault.enc');
const MASTER_KEY_PATH = path.join(process.cwd(), '.aiox/secrets/master.key');

/**
 * Garante que a estrutura de diretórios do vault existe.
 */
function ensureVaultEnv() {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Obtém ou gera a Master Key (não deve ser commitada).
 */
function getMasterKey() {
    if (fs.existsSync(MASTER_KEY_PATH)) {
        return fs.readFileSync(MASTER_KEY_PATH, 'utf8').trim();
    }
    const key = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(MASTER_KEY_PATH, key, { mode: 0o600 });
    console.log('[Vault] Nova Master Key gerada em .aiox/secrets/master.key. ADICIONE AO .gitignore!');
    return key;
}

/**
 * Criptografa um dado.
 * @param {string} text - O segredo em texto puro.
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(getMasterKey(), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Descriptografa um dado.
 * @param {string} text - O segredo criptografado (iv:data).
 */
function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = Buffer.from(getMasterKey(), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// CLI Integration
if (require.main === module) {
    ensureVaultEnv();
    const args = process.argv.slice(2);
    const action = args[0];
    const value = args[1];

    if (action === '--encrypt' && value) {
        console.log(encrypt(value));
    } else if (action === '--decrypt' && value) {
        console.log(decrypt(value));
    } else {
        console.log('Usage: node mcp-vault.js --encrypt <text> | --decrypt <enc>');
    }
}

module.exports = { encrypt, decrypt };
