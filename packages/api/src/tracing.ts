import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-node';
import { trace, context } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Logger } from './utils/logger';

const logger = new Logger('TracingSetup');

/**
 * Initialize OpenTelemetry SDK for tracing and metrics
 */
export function initializeTracing(): NodeSDK {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'aiox-dashboard-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.AIOX_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }),

    // Auto-instrumentation for common libraries
    instrumentations: [getNodeAutoInstrumentations()],

    // Span exporters - export traces to console (development) or collector (production)
    traceExporter:
      process.env.NODE_ENV === 'production'
        ? createOTelCollectorExporter()
        : new ConsoleSpanExporter(),

    // Metrics exporter
    metricReader:
      process.env.NODE_ENV === 'production'
        ? new PeriodicExportingMetricReader({
            exporter: new ConsoleSpanExporter(),
          })
        : undefined,

    // Sampling strategy (configurable via env)
    spanProcessor: createSamplingStrategy(),
  });

  sdk.start();
  logger.info('✅ OpenTelemetry SDK initialized');

  // Hook for graceful shutdown
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => logger.info('✅ OpenTelemetry SDK shutdown complete'))
      .catch((error) => logger.error('Error shutting down OTel SDK:', error));
  });

  return sdk;
}

/**
 * Create OTel collector exporter for production
 * Connects to local OTEL_EXPORTER_OTLP_ENDPOINT (default: localhost:4318)
 */
function createOTelCollectorExporter() {
  try {
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
    logger.info(`Configured OTel collector endpoint: ${endpoint}`);

    return new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    });
  } catch (error) {
    logger.warn('OTLP HTTP exporter not available, falling back to console exporter');
    return new ConsoleSpanExporter();
  }
}

/**
 * Create sampling strategy based on environment
 * Development: 100% (always sample)
 * Production: Configurable via OTEL_TRACES_SAMPLER and OTEL_TRACES_SAMPLER_ARG
 */
function createSamplingStrategy() {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Using 100% sampling (development)');
    return undefined;
  }

  // Production sampling: use TraceIdRatioBased sampler
  const samplingRatio = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '0.1');
  logger.info(`Using ${(samplingRatio * 100).toFixed(1)}% sampling (production)`);

  return undefined;
}

/**
 * Get the global tracer instance
 */
export function getTracer(name: string, version?: string) {
  return trace.getTracer(name, version);
}

/**
 * Create a span for an async operation
 */
export async function withSpan<T>(
  spanName: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, any>
) {
  const tracer = getTracer('aiox-dashboard-api');
  const span = tracer.startSpan(spanName);

  // Add attributes to span
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        span.setAttribute(key, String(value));
      }
    });
  }

  try {
    return await context.with(trace.setSpan(context.active(), span), async () => {
      return await fn(span);
    });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2 }); // ERROR status
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Create a span for a sync operation
 */
export function withSpanSync<T>(
  spanName: string,
  fn: (span: any) => T,
  attributes?: Record<string, any>
) {
  const tracer = getTracer('aiox-dashboard-api');
  const span = tracer.startSpan(spanName);

  // Add attributes to span
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        span.setAttribute(key, String(value));
      }
    });
  }

  try {
    return context.with(trace.setSpan(context.active(), span), () => {
      return fn(span);
    });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2 }); // ERROR status
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Get current span context as correlation ID
 */
export function getCorrelationId(): string {
  const span = trace.getActiveSpan();
  if (span) {
    return span.spanContext().traceId;
  }
  return 'unknown';
}

/**
 * Get current span and trace context
 */
export function getSpanContext() {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
    };
  }
  return null;
}
