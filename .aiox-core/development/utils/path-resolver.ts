/**
 * @module path-resolver
 * @description Resolve caminhos Windows para o correspondente no mountpoint Linux do container.
 */

export interface PathMapping {
  windowsRoot: string;
  linuxRoot: string;
}

const DEFAULT_MAPPINGS: PathMapping[] = [
  { windowsRoot: 'd:\\', linuxRoot: '/data/' },
  { windowsRoot: 'c:\\', linuxRoot: '/c/' },
];

/**
 * Converte um path Windows para o mountpoint Linux configurado.
 * @param pathString O path original vindo do Host Windows.
 * @returns O path traduzido para o Container Linux.
 */
export function resolveWindowsToLinux(pathString: string): string {
  if (!pathString) return pathString;

  let resolved = pathString.toLowerCase();

  for (const mapping of DEFAULT_MAPPINGS) {
    if (resolved.startsWith(mapping.windowsRoot.toLowerCase())) {
      const relativePart = pathString.slice(mapping.windowsRoot.length).replace(/\\/g, '/');
      return `${mapping.linuxRoot}${relativePart}`;
    }
  }

  // Fallback: se não começar com roots conhecidos, apenas troca barras
  return pathString.replace(/\\/g, '/');
}

/**
 * Middleware para processar payloads JSON-RPC e traduzir paths em argumentos.
 * @param payload O objeto JSON-RPC (call_tool arguments).
 */
export function resolvePathsInPayload(payload: any): any {
  if (!payload || typeof payload !== 'object') return payload;

  const newPayload = { ...payload };

  for (const key in newPayload) {
    const value = newPayload[key];
    if (typeof value === 'string' && (value.includes(':\\') || value.includes('\\'))) {
      newPayload[key] = resolveWindowsToLinux(value);
    } else if (typeof value === 'object') {
      newPayload[key] = resolvePathsInPayload(value);
    }
  }

  return newPayload;
}
