import { Request, Response, NextFunction } from 'express';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { getTracer, getCorrelationId } from '../tracing';
import { Logger } from '../utils/logger';

const logger = new Logger('TracingMiddleware');
const propagator = new W3CTraceContextPropagator();

/**
 * Express middleware to trace HTTP requests
 * Creates a root span for each incoming request and propagates context
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tracer = getTracer('aiox-dashboard-api');

  // Extract incoming trace context from request headers
  const propagatedContext = propagator.extract(context.active(), req.headers);

  // Create a root span for this HTTP request
  const span = tracer.startSpan(
    `${req.method} ${req.path}`,
    {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.target': req.path,
        'http.host': req.hostname,
        'http.client_ip': req.ip,
      },
    },
    propagatedContext
  );

  // Run the request handler within the span context
  context.with(trace.setSpan(context.active(), span), () => {
    // Add correlation ID to request for downstream use
    (req as any).correlationId = getCorrelationId();

    // Set trace context header in response (for client visibility)
    res.setHeader('X-Trace-ID', (req as any).correlationId);

    // Intercept response to record final status
    const originalSend = res.send.bind(res);
    res.send = function (data: any) {
      // Record HTTP status code
      span.setAttributes({
        'http.status_code': res.statusCode,
      });

      // Set span status based on HTTP status code
      if (res.statusCode >= 400) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      // End the span
      span.end();

      // Log request completion
      logger.info(`${req.method} ${req.path} → ${res.statusCode}`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - (req as any).startTime,
      });

      return originalSend(data);
    };

    // Record start time
    (req as any).startTime = Date.now();

    next();
  });
}

/**
 * Express middleware to extract and propagate trace context from headers
 * Should be placed early in the middleware chain
 */
export function contextPropagationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const propagator = new W3CTraceContextPropagator();

  // Extract context from incoming request
  const extractedContext = propagator.extract(context.active(), req.headers);

  // Set context for all downstream operations in this request
  context.with(extractedContext, () => {
    next();
  });
}

/**
 * Inject trace context into outgoing HTTP requests
 * Use this when making calls to other services
 */
export function injectTraceContext(headers: Record<string, string>): Record<string, string> {
  const propagator = new W3CTraceContextPropagator();
  propagator.inject(context.active(), headers, {
    set: (header: string, value: string) => {
      headers[header] = value;
    },
  });

  return headers;
}

/**
 * Correlation ID extractor for request tracking
 */
export function getRequestCorrelationId(req: Request): string {
  return (req as any).correlationId || getCorrelationId();
}
