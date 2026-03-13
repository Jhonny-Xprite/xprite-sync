export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  debug(message: string, data?: any): void {
    console.log(`[${this.timestamp()}] [${this.context}] [DEBUG] ${message}`, data || '');
  }

  info(message: string, data?: any): void {
    console.log(`[${this.timestamp()}] [${this.context}] [INFO] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.timestamp()}] [${this.context}] [WARN] ${message}`, data || '');
  }

  error(message: string, error?: Error | any, data?: any): void {
    const errorInfo = error instanceof Error ? error.message : String(error);
    console.error(
      `[${this.timestamp()}] [${this.context}] [ERROR] ${message}`,
      errorInfo,
      data || ''
    );
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
