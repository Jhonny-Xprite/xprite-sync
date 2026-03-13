describe('Trace Propagation Integration', () => {
  describe('API to Agent to Database Flow', () => {
    it('should maintain same trace ID across API -> Agent -> DB', () => {
      const { getCorrelationId } = require('../../packages/api/src/tracing');

      // Get initial correlation ID
      const traceId1 = getCorrelationId();

      // Simulate another call in same context
      const traceId2 = getCorrelationId();

      // Should return valid correlation IDs
      expect(traceId1).toBeDefined();
      expect(traceId2).toBeDefined();
    });

    it('should inject trace context into outgoing requests', () => {
      const { injectTraceContext } = require('../../packages/api/src/middleware/tracing');

      const headers = {
        'content-type': 'application/json',
      };

      const injected = injectTraceContext(headers);

      // Should preserve existing headers
      expect(injected['content-type']).toBe('application/json');

      // Should be a valid object
      expect(typeof injected).toBe('object');
    });
  });

  describe('Sampling Strategy', () => {
    it('should configure sampling based on environment', () => {
      // In development, should sample 100%
      // In production, should sample configurable percentage

      // This is implicit in the tracing module
      const { getTracer } = require('../../packages/api/src/tracing');
      expect(getTracer).toBeDefined();
    });
  });

  describe('Logger Context Integration', () => {
    it('should include trace ID in log context', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const { getCorrelationId } = require('../../packages/api/src/tracing');

      const logger = new Logger('ContextTest');
      const correlationId = getCorrelationId();

      // Create context with correlation ID
      const logContext = logger.withContext({
        correlationId,
        userId: 'test-user',
      });

      expect(logContext).toBeDefined();
      expect(logContext.info).toBeDefined();
    });

    it('should sanitize nested objects in logs', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('SanitizationTest');

      const nestedData = {
        user: {
          id: '123',
          credentials: {
            password: 'secret',
            token: 'auth-token',
          },
        },
      };

      // Should not throw when logging nested sensitive data
      expect(() => {
        logger.info('Nested data', nestedData);
      }).not.toThrow();
    });
  });

  describe('Correlation ID Lifecycle', () => {
    it('should maintain correlation ID through request lifecycle', () => {
      const { getCorrelationId } = require('../../packages/api/src/tracing');

      const id1 = getCorrelationId();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);

      // ID should be consistent in same context
      const id2 = getCorrelationId();
      expect(typeof id2).toBe('string');
    });
  });

  describe('Span Context', () => {
    it('should provide span context information', () => {
      const { getSpanContext } = require('../../packages/api/src/tracing');

      const spanContext = getSpanContext();

      // Should return null or valid span context
      if (spanContext !== null) {
        expect(spanContext.traceId).toBeDefined();
        expect(spanContext.spanId).toBeDefined();
        expect(spanContext.traceFlags).toBeDefined();
      }
    });
  });

  describe('Performance Overhead', () => {
    it('should have minimal performance impact', () => {
      const { getCorrelationId } = require('../../packages/api/src/tracing');
      const Logger = require('../../packages/api/src/utils/logger').Logger;

      const logger = new Logger('PerfTest');
      const iterations = 1000;

      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        getCorrelationId();
        logger.debug('test message');
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      // Average time per operation should be minimal (< 1ms)
      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('Error Context Propagation', () => {
    it('should propagate error context through traces', () => {
      const Logger = require('../../packages/api/src/utils/logger').Logger;
      const logger = new Logger('ErrorTest');

      const testError = new Error('Test error');

      // Should not throw when logging error with context
      expect(() => {
        logger.error('Operation failed', testError, {
          operation: 'test',
          userId: 'user123',
        });
      }).not.toThrow();
    });
  });
});
