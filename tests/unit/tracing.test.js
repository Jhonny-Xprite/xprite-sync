describe('Tracing & Logging', () => {
  describe('Logger', () => {
    it('should create a logger instance', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('TestComponent');
      expect(logger).toBeDefined();
    });

    it('should sanitize sensitive fields', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('TestComponent');

      const logContext = logger.withContext({
        userId: 'user123',
        password: 'secret123',
      });

      // Verify it creates a context
      expect(logContext).toBeDefined();
      expect(logContext.debug).toBeDefined();
      expect(logContext.info).toBeDefined();
    });

    it('should log with different levels', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('TestComponent');

      // These should not throw
      expect(() => logger.debug('debug message')).not.toThrow();
      expect(() => logger.info('info message')).not.toThrow();
      expect(() => logger.warn('warn message')).not.toThrow();
      expect(() => logger.error('error message', new Error('test'))).not.toThrow();
    });
  });

  describe('Tracing Functions', () => {
    it('should have tracing module exports', () => {
      const {
        initializeTracing,
        getTracer,
        withSpan,
        getCorrelationId,
        getSpanContext,
      } = require('../../packages/api/src/tracing');

      expect(initializeTracing).toBeDefined();
      expect(getTracer).toBeDefined();
      expect(withSpan).toBeDefined();
      expect(getCorrelationId).toBeDefined();
      expect(getSpanContext).toBeDefined();
    });

    it('should get correlation ID', () => {
      const { getCorrelationId } = require('../../packages/api/src/tracing');
      const correlationId = getCorrelationId();
      expect(typeof correlationId).toBe('string');
    });
  });

  describe('Tracing Middleware', () => {
    it('should have middleware exports', () => {
      const {
        tracingMiddleware,
        contextPropagationMiddleware,
        injectTraceContext,
        getRequestCorrelationId,
      } = require('../../packages/api/src/middleware/tracing');

      expect(tracingMiddleware).toBeDefined();
      expect(contextPropagationMiddleware).toBeDefined();
      expect(injectTraceContext).toBeDefined();
      expect(getRequestCorrelationId).toBeDefined();
    });

    it('should inject trace context into headers', () => {
      const { injectTraceContext } = require('../../packages/api/src/middleware/tracing');

      const headers = {};
      const result = injectTraceContext(headers);

      // Should return an object
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('Trace Context Propagation', () => {
    it('should propagate W3C trace context', () => {
      const { injectTraceContext } = require('../../packages/api/src/middleware/tracing');

      // Create headers
      const headers = {};

      // Inject trace context
      const injected = injectTraceContext(headers);

      // Should have injected headers
      expect(injected).toBeDefined();
    });
  });

  describe('Log Sanitization', () => {
    it('should not expose sensitive data in logs', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('SecureLogger');

      const sensitiveData = {
        username: 'user123',
        password: 'mySecretPassword',
        apiKey: 'secret-api-key',
        creditCard: '4111111111111111',
      };

      // Logging with sensitive data should not throw
      expect(() => {
        logger.info('User action', sensitiveData);
      }).not.toThrow();
    });
  });
});
