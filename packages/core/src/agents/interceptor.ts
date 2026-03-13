/**
 * AgentInterceptor
 *
 * Intercepts agent execution to collect metrics without modifying agent logic.
 * Implements the interceptor pattern for transparent instrumentation.
 *
 * Story: 3.4 - Agent Metrics & Observability
 */

/**
 * Metrics collected during agent execution
 */
export interface AgentExecutionMetrics {
  agentId: string;
  agentName: string;
  teamId: string;
  status: 'running' | 'completed' | 'failed' | 'error';
  startTime: number; // Unix timestamp (ms)
  endTime?: number; // Unix timestamp (ms)
  duration_ms?: number;
  success: boolean;
  errorMessage?: string;
  errorStack?: string;
  errorType?: string;

  // Performance metrics
  latency_ms?: number;
  memoryBefore?: number; // Memory in MB before execution
  memoryAfter?: number; // Memory in MB after execution
  memory_used_mb?: number; // Memory delta

  // Business metrics
  inputCount?: number; // Items processed
  outputCount?: number; // Items produced
  processed_count?: number;
  error_count?: number;
  success_count?: number;
  success_rate?: number; // 0-1

  // Resource usage
  cpu_percentage?: number;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Callbacks for metric events
 */
export interface InterceptorCallbacks {
  onStart?: (metrics: Partial<AgentExecutionMetrics>) => void;
  onSuccess?: (metrics: AgentExecutionMetrics) => void;
  onError?: (metrics: AgentExecutionMetrics) => void;
  onComplete?: (metrics: AgentExecutionMetrics) => void;
}

/**
 * AgentInterceptor - Base class for agent instrumentation
 *
 * Wraps agent execution to transparently collect metrics
 */
export abstract class AgentInterceptor {
  protected agentId: string;
  protected agentName: string;
  protected teamId: string;
  protected callbacks: InterceptorCallbacks;
  protected metricsBuffer: AgentExecutionMetrics[] = [];

  constructor(
    agentId: string,
    agentName: string,
    teamId: string,
    callbacks?: InterceptorCallbacks
  ) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.teamId = teamId;
    this.callbacks = callbacks || {};
  }

  /**
   * Wrap an agent execution function with metrics collection
   */
  protected async intercept<TInput, TOutput>(
    fn: (input: TInput) => Promise<TOutput>,
    input: TInput,
    context?: Record<string, any>
  ): Promise<TOutput> {
    const startTime = Date.now();
    const memoryBefore = this.getMemoryUsage();

    const metrics: Partial<AgentExecutionMetrics> = {
      agentId: this.agentId,
      agentName: this.agentName,
      teamId: this.teamId,
      status: 'running',
      startTime,
      memoryBefore,
      success: false,
      error_count: 0,
      success_count: 0,
    };

    // Call start callback
    this.callbacks.onStart?.(metrics);

    try {
      // Execute the actual agent function
      const output = await fn(input);

      // Success metrics
      const endTime = Date.now();
      const memoryAfter = this.getMemoryUsage();

      const completeMetrics: AgentExecutionMetrics = {
        ...metrics,
        status: 'completed',
        endTime,
        duration_ms: endTime - startTime,
        memoryAfter,
        memory_used_mb: memoryAfter - (memoryBefore || 0),
        success: true,
        success_count: 1,
        success_rate: 1.0,
        latency_ms: endTime - startTime,
      } as AgentExecutionMetrics;

      // Call success callback
      this.callbacks.onSuccess?.(completeMetrics);
      this.callbacks.onComplete?.(completeMetrics);

      // Buffer metrics for batch processing
      this.metricsBuffer.push(completeMetrics);

      return output;
    } catch (error: any) {
      // Error metrics
      const endTime = Date.now();
      const memoryAfter = this.getMemoryUsage();

      const errorMetrics: AgentExecutionMetrics = {
        ...metrics,
        status: 'error',
        endTime,
        duration_ms: endTime - startTime,
        memoryAfter,
        memory_used_mb: memoryAfter - (memoryBefore || 0),
        success: false,
        error_count: 1,
        success_rate: 0.0,
        latency_ms: endTime - startTime,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.constructor.name,
      } as AgentExecutionMetrics;

      // Call error callback
      this.callbacks.onError?.(errorMetrics);
      this.callbacks.onComplete?.(errorMetrics);

      // Buffer metrics for batch processing
      this.metricsBuffer.push(errorMetrics);

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Get current memory usage in MB
   */
  protected getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      return Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
    }
    return 0;
  }

  /**
   * Get buffered metrics and clear buffer
   */
  getMetricsBuffer(): AgentExecutionMetrics[] {
    const buffer = [...this.metricsBuffer];
    this.metricsBuffer = [];
    return buffer;
  }

  /**
   * Check if buffer has metrics
   */
  hasMetrics(): boolean {
    return this.metricsBuffer.length > 0;
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.metricsBuffer.length;
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.metricsBuffer = [];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageLatency: number;
    averageMemoryUsed: number;
  } {
    const metrics = this.metricsBuffer;

    if (metrics.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageLatency: 0,
        averageMemoryUsed: 0,
      };
    }

    const successful = metrics.filter((m) => m.success);
    const failed = metrics.filter((m) => !m.success);
    const totalLatency = metrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0);
    const totalMemory = metrics.reduce((sum, m) => sum + (m.memory_used_mb || 0), 0);

    return {
      totalExecutions: metrics.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      averageLatency: totalLatency / metrics.length,
      averageMemoryUsed: totalMemory / metrics.length,
    };
  }
}

/**
 * Implementation helper for synchronous agents
 */
export abstract class SyncAgentInterceptor extends AgentInterceptor {
  protected interceptSync<TInput, TOutput>(
    fn: (input: TInput) => TOutput,
    input: TInput
  ): TOutput {
    const startTime = Date.now();
    const memoryBefore = this.getMemoryUsage();

    const metrics: Partial<AgentExecutionMetrics> = {
      agentId: this.agentId,
      agentName: this.agentName,
      teamId: this.teamId,
      status: 'running',
      startTime,
      memoryBefore,
      success: false,
      error_count: 0,
      success_count: 0,
    };

    this.callbacks.onStart?.(metrics);

    try {
      const output = fn(input);

      const endTime = Date.now();
      const memoryAfter = this.getMemoryUsage();

      const completeMetrics: AgentExecutionMetrics = {
        ...metrics,
        status: 'completed',
        endTime,
        duration_ms: endTime - startTime,
        memoryAfter,
        memory_used_mb: memoryAfter - (memoryBefore || 0),
        success: true,
        success_count: 1,
        success_rate: 1.0,
        latency_ms: endTime - startTime,
      } as AgentExecutionMetrics;

      this.callbacks.onSuccess?.(completeMetrics);
      this.callbacks.onComplete?.(completeMetrics);
      this.metricsBuffer.push(completeMetrics);

      return output;
    } catch (error: any) {
      const endTime = Date.now();
      const memoryAfter = this.getMemoryUsage();

      const errorMetrics: AgentExecutionMetrics = {
        ...metrics,
        status: 'error',
        endTime,
        duration_ms: endTime - startTime,
        memoryAfter,
        memory_used_mb: memoryAfter - (memoryBefore || 0),
        success: false,
        error_count: 1,
        success_rate: 0.0,
        latency_ms: endTime - startTime,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: error.constructor.name,
      } as AgentExecutionMetrics;

      this.callbacks.onError?.(errorMetrics);
      this.callbacks.onComplete?.(errorMetrics);
      this.metricsBuffer.push(errorMetrics);

      throw error;
    }
  }
}
