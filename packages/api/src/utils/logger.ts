import pino, { Logger as PinoLogger } from 'pino';
import { getCorrelationId, getSpanContext } from '../tracing';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  spanId?: string;
  traceId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Custom logger that integrates with OpenTelemetry tracing
 */
export class Logger {
  private pino: PinoLogger;
  private context: string;

  constructor(context: string, options?: any) {
    this.context = context;

    // Create Pino logger with structured JSON output
    this.pino = pino(
      {
        name: context,
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transport: process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                singleLine: false,
              },
            }
          : undefined,
      },
      pino.destination(1) // stdout
    );
  }

  /**
   * Build log object with trace context
   */
  private buildLogObject(data?: any): Record<string, any> {
    const logObj: Record<string, any> = {
      component: this.context,
    };

    // Add trace context
    const spanContext = getSpanContext();
    if (spanContext) {
      logObj.traceId = spanContext.traceId;
      logObj.spanId = spanContext.spanId;
    } else {
      logObj.correlationId = getCorrelationId();
    }

    // Add custom data
    if (data) {
      Object.assign(logObj, data);
    }

    return logObj;
  }

  /**
   * Sanitize sensitive data from objects
   */
  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'creditCard', 'ssn'];
    const cloned = Array.isArray(obj) ? [...obj] : { ...obj };

    Object.keys(cloned).forEach((key) => {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        cloned[key] = '[REDACTED]';
      } else if (typeof cloned[key] === 'object') {
        cloned[key] = this.sanitize(cloned[key]);
      }
    });

    return cloned;
  }

  debug(message: string, data?: any): void {
    this.pino.debug(this.buildLogObject(this.sanitize(data)), message);
  }

  info(message: string, data?: any): void {
    this.pino.info(this.buildLogObject(this.sanitize(data)), message);
  }

  warn(message: string, data?: any): void {
    this.pino.warn(this.buildLogObject(this.sanitize(data)), message);
  }

  error(message: string, error?: Error | any, data?: any): void {
    const logObj = this.buildLogObject(this.sanitize(data));

    if (error instanceof Error) {
      logObj.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      logObj.error = this.sanitize(error);
    }

    this.pino.error(logObj, message);
  }

  /**
   * Log with custom context override
   */
  withContext(contextData: LogContext) {
    return {
      debug: (message: string, data?: any) =>
        this.debug(message, { ...contextData, ...data }),
      info: (message: string, data?: any) =>
        this.info(message, { ...contextData, ...data }),
      warn: (message: string, data?: any) =>
        this.warn(message, { ...contextData, ...data }),
      error: (message: string, error?: Error | any, data?: any) =>
        this.error(message, error, { ...contextData, ...data }),
    };
  }

  /**
   * Get the underlying Pino logger for advanced usage
   */
  getPino(): PinoLogger {
    return this.pino;
  }
}

// Singleton instance for global logging
let globalLogger: Logger | null = null;

export function getGlobalLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger('AIOX');
  }
  return globalLogger;
}

/**
 * Create a child logger (for nested components)
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
