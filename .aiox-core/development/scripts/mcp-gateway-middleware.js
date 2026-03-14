/**
 * @module mcp-gateway-middleware
 * @description Middleware centralizado para interceptar chamadas ao MCP Gateway e traduzir caminhos.
 */

// Nota: Em um ambiente de produção, este estaria integrado ao servidor Express/Fastify do Gateway.
// Aqui implementamos a lógica de transformação que o Gateway consome.

const path = require('path');

/**
 * Traduz caminhos Windows para Linux (Mountpoint do container).
 * @param {string} winPath 
 * @returns {string}
 */
function translatePath(winPath) {
    if (!winPath || typeof winPath !== 'string') return winPath;
    
    // Suporte a D:\ -> /data/ e C:\ -> /c/
    let result = winPath;
    if (winPath.toLowerCase().startsWith('d:\\')) {
        result = winPath.replace(/^d:\\/i, '/data/').replace(/\\/g, '/');
    } else if (winPath.toLowerCase().startsWith('c:\\')) {
        result = winPath.replace(/^c:\\/i, '/c/').replace(/\\/g, '/');
    } else {
        result = winPath.replace(/\\/g, '/');
    }
    return result;
}

/**
 * Intercepta o request do cliente e limpa caminhos antes de enviar ao Container Linux.
 * @param {Object} mcpRequest - O request original do MCP.
 */
function processMcpRequest(mcpRequest) {
    if (mcpRequest.method === 'call_tool') {
        const args = mcpRequest.params.arguments;
        if (args) {
            Object.keys(args).forEach(key => {
                const val = args[key];
                if (typeof val === 'string' && (val.includes(':\\') || val.includes('\\'))) {
                    console.log(`[Middleware] Traduzindo path no argumento '${key}': ${val}`);
                    args[key] = translatePath(val);
                }
            });
        }
    }
    return mcpRequest;
}

module.exports = { processMcpRequest, translatePath };
