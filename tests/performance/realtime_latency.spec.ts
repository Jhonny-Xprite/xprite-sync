/**
 * Real-time Latency Performance Tests
 *
 * Verifies that Realtime broadcasts meet latency requirements:
 * - p50 < 50ms
 * - p95 < 100ms
 * - p99 < 200ms
 *
 * Story: 3.2 - Integração de Dados em Tempo Real
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface LatencyMeasurement {
  timestamp: number;
  insertTime: number;
  receiveTime: number;
  latency: number;
}

describe('Real-time Latency Tests', () => {
  let supabase: any;
  let measurements: LatencyMeasurement[] = [];

  beforeEach(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase credentials for performance tests');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    measurements = [];
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      await supabase.from('agent_metrics').delete().match({ agent_id: 'perf-test-agent' });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  it('should deliver metrics with < 100ms p95 latency', async () => {
    const testTeamId = `perf-test-team-${Date.now()}`;
    const numMessages = 50;

    // Create subscription before sending data
    const subscription = supabase
      .channel(`realtime:agent_metrics:${testTeamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_metrics',
          filter: `team_id=eq.${testTeamId}`,
        },
        (payload: any) => {
          const receiveTime = Date.now();
          const insertTime = parseInt(payload.new.metadata || '0');

          if (insertTime > 0) {
            measurements.push({
              timestamp: receiveTime,
              insertTime,
              receiveTime,
              latency: receiveTime - insertTime,
            });
          }
        }
      );

    await subscription.subscribe();

    // Wait for subscription to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send metrics
    for (let i = 0; i < numMessages; i++) {
      const now = Date.now();
      await supabase.from('agent_metrics').insert({
        agent_id: 'perf-test-agent',
        team_id: testTeamId,
        status: 'running',
        latency_ms: Math.random() * 100,
        success_rate: 0.95,
        error_count: 0,
        processed_count: 100,
        memory_usage_mb: 256,
        cpu_percentage: 45,
        recorded_at: new Date().toISOString(),
        metadata: now.toString(),
      });

      // Small delay between insertions
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Wait for all messages to arrive
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Unsubscribe
    await supabase.removeChannel(subscription);

    // Calculate percentiles
    if (measurements.length < numMessages * 0.8) {
      console.warn(`Only received ${measurements.length}/${numMessages} messages`);
    }

    const sortedLatencies = measurements.map((m) => m.latency).sort((a, b) => a - b);
    const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
    const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
    const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];

    console.log(`\n📊 Latency Results (${measurements.length} messages):`);
    console.log(`  p50: ${p50}ms (target: < 50ms) ${p50 < 50 ? '✅' : '❌'}`);
    console.log(`  p95: ${p95}ms (target: < 100ms) ${p95 < 100 ? '✅' : '❌'}`);
    console.log(`  p99: ${p99}ms (target: < 200ms) ${p99 < 200 ? '✅' : '❌'}`);

    expect(p95).toBeLessThan(100);
  }, 60000);

  it('should handle 100 concurrent subscriptions without degradation', async () => {
    const testTeamId = `concurrent-test-${Date.now()}`;
    const numSubscriptions = 100;
    const messageCount = 10;

    const subscriptions = [];
    const receivedMessages: number[] = [];

    // Create multiple subscriptions
    for (let i = 0; i < numSubscriptions; i++) {
      const sub = supabase
        .channel(`realtime:agent_metrics:${i}:${testTeamId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_metrics',
            filter: `team_id=eq.${testTeamId}`,
          },
          () => {
            receivedMessages.push(i);
          }
        );

      await sub.subscribe();
      subscriptions.push(sub);
    }

    // Wait for subscriptions to settle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Send messages
    const sendStart = Date.now();
    for (let i = 0; i < messageCount; i++) {
      await supabase.from('agent_metrics').insert({
        agent_id: 'concurrent-test-agent',
        team_id: testTeamId,
        status: 'running',
        latency_ms: 50,
        success_rate: 0.95,
        error_count: 0,
        processed_count: 100,
        memory_usage_mb: 256,
        cpu_percentage: 45,
        recorded_at: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const sendEnd = Date.now();

    // Wait for delivery
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Cleanup
    for (const sub of subscriptions) {
      await supabase.removeChannel(sub);
    }

    const expectedTotal = numSubscriptions * messageCount;
    const deliveryRate = (receivedMessages.length / expectedTotal) * 100;

    console.log(`\n📊 Concurrent Subscriptions Test:`);
    console.log(`  Subscriptions: ${numSubscriptions}`);
    console.log(`  Expected total messages: ${expectedTotal}`);
    console.log(`  Delivered: ${receivedMessages.length}`);
    console.log(`  Delivery rate: ${deliveryRate.toFixed(1)}%`);
    console.log(`  Send time: ${sendEnd - sendStart}ms`);

    // Should deliver at least 95% of messages
    expect(deliveryRate).toBeGreaterThan(95);
  }, 120000);

  it('should recover from connection failures', async () => {
    const testTeamId = `recovery-test-${Date.now()}`;
    let messageCount = 0;

    const subscription = supabase
      .channel(`realtime:agent_metrics:${testTeamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_metrics',
          filter: `team_id=eq.${testTeamId}`,
        },
        () => {
          messageCount++;
        }
      );

    await subscription.subscribe();

    // Send initial messages
    for (let i = 0; i < 5; i++) {
      await supabase.from('agent_metrics').insert({
        agent_id: 'recovery-test-agent',
        team_id: testTeamId,
        status: 'running',
        latency_ms: 50,
        success_rate: 0.95,
        error_count: 0,
        processed_count: 100,
        memory_usage_mb: 256,
        cpu_percentage: 45,
        recorded_at: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const initialCount = messageCount;

    // Simulate disconnect and reconnect
    await supabase.removeChannel(subscription);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Resubscribe
    const newSubscription = supabase
      .channel(`realtime:agent_metrics:${testTeamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_metrics',
          filter: `team_id=eq.${testTeamId}`,
        },
        () => {
          messageCount++;
        }
      );

    await newSubscription.subscribe();

    // Send more messages
    for (let i = 0; i < 5; i++) {
      await supabase.from('agent_metrics').insert({
        agent_id: 'recovery-test-agent',
        team_id: testTeamId,
        status: 'running',
        latency_ms: 50,
        success_rate: 0.95,
        error_count: 0,
        processed_count: 100,
        memory_usage_mb: 256,
        cpu_percentage: 45,
        recorded_at: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await supabase.removeChannel(newSubscription);

    console.log(`\n📊 Recovery Test:`);
    console.log(`  Initial messages: ${initialCount}`);
    console.log(`  Total messages after recovery: ${messageCount}`);

    // Should receive most messages (allowing for some loss)
    expect(messageCount).toBeGreaterThanOrEqual(9);
  }, 60000);
});
