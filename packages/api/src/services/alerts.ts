/**
 * AlertsService
 *
 * Monitors agent metrics and triggers alerts on failures and anomalies.
 *
 * Story: 3.4 - Agent Metrics & Observability
 */

import { createClient } from '@supabase/supabase-js';

export interface AlertRule {
  id: string;
  name: string;
  condition: 'agent_failure' | 'high_latency' | 'low_success_rate' | 'memory_spike';
  threshold?: number;
  teamId: string;
  enabled: boolean;
  notificationChannels: ('email' | 'slack' | 'webhook')[];
}

export interface Alert {
  id: string;
  ruleId: string;
  agentId: string;
  teamId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

/**
 * AlertsService - Monitoring and alerting for agent metrics
 */
export class AlertsService {
  private supabaseUrl: string;
  private supabaseServiceKey: string;
  private supabase: any;

  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
  }

  /**
   * Register an alert rule
   */
  registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    console.log(`📋 Registered alert rule: ${rule.name}`);
  }

  /**
   * Check metrics against alert rules
   */
  async checkMetrics(metrics: {
    agentId: string;
    teamId: string;
    status: string;
    latency_ms: number;
    success_rate: number;
    memory_usage_mb: number;
  }): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];

    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled || rule.teamId !== metrics.teamId) continue;

      let shouldAlert = false;
      let severity: 'info' | 'warning' | 'critical' = 'info';
      let message = '';

      // Check conditions
      if (rule.condition === 'agent_failure' && metrics.status === 'error') {
        shouldAlert = true;
        severity = 'critical';
        message = `Agent ${metrics.agentId} encountered a failure`;
      } else if (rule.condition === 'high_latency' && rule.threshold) {
        if (metrics.latency_ms > rule.threshold) {
          shouldAlert = true;
          severity = 'warning';
          message = `Agent ${metrics.agentId} latency (${metrics.latency_ms}ms) exceeds threshold (${rule.threshold}ms)`;
        }
      } else if (rule.condition === 'low_success_rate' && rule.threshold) {
        if (metrics.success_rate < rule.threshold) {
          shouldAlert = true;
          severity = 'critical';
          message = `Agent ${metrics.agentId} success rate (${(metrics.success_rate * 100).toFixed(1)}%) below threshold (${(rule.threshold * 100).toFixed(1)}%)`;
        }
      } else if (rule.condition === 'memory_spike' && rule.threshold) {
        if (metrics.memory_usage_mb > rule.threshold) {
          shouldAlert = true;
          severity = 'warning';
          message = `Agent ${metrics.agentId} memory usage (${metrics.memory_usage_mb}MB) exceeds threshold (${rule.threshold}MB)`;
        }
      }

      if (shouldAlert) {
        const alert: Alert = {
          id: `${ruleId}-${metrics.agentId}-${Date.now()}`,
          ruleId,
          agentId: metrics.agentId,
          teamId: metrics.teamId,
          severity,
          message,
          timestamp: new Date().toISOString(),
          resolved: false,
        };

        triggeredAlerts.push(alert);
        this.activeAlerts.set(alert.id, alert);

        // Persist alert
        await this.persistAlert(alert);

        // Send notifications
        await this.notifyChannels(rule, alert);

        console.log(`🚨 Alert triggered: [${severity.toUpperCase()}] ${message}`);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Persist alert to database
   */
  private async persistAlert(alert: Alert): Promise<void> {
    try {
      const { error } = await this.supabase.from('alerts').insert({
        rule_id: alert.ruleId,
        agent_id: alert.agentId,
        team_id: alert.teamId,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        resolved: alert.resolved,
      });

      if (error) {
        console.error('Failed to persist alert:', error);
      }
    } catch (error) {
      console.error('Error in persistAlert:', error);
    }
  }

  /**
   * Send notifications to configured channels
   */
  private async notifyChannels(rule: AlertRule, alert: Alert): Promise<void> {
    for (const channel of rule.notificationChannels) {
      try {
        switch (channel) {
          case 'email':
            await this.notifyEmail(rule, alert);
            break;
          case 'slack':
            await this.notifySlack(rule, alert);
            break;
          case 'webhook':
            await this.notifyWebhook(rule, alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to notify via ${channel}:`, error);
      }
    }
  }

  /**
   * Send email notification
   */
  private async notifyEmail(rule: AlertRule, alert: Alert): Promise<void> {
    console.log(`📧 Email notification: [${alert.severity}] ${alert.message}`);
    // TODO: Implement email service integration
  }

  /**
   * Send Slack notification
   */
  private async notifySlack(rule: AlertRule, alert: Alert): Promise<void> {
    console.log(`💬 Slack notification: [${alert.severity}] ${alert.message}`);
    // TODO: Implement Slack webhook integration
  }

  /**
   * Send webhook notification
   */
  private async notifyWebhook(rule: AlertRule, alert: Alert): Promise<void> {
    console.log(`🔗 Webhook notification: [${alert.severity}] ${alert.message}`);
    // TODO: Implement custom webhook integration
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.activeAlerts.delete(alertId);

      // Update in database
      try {
        await this.supabase
          .from('alerts')
          .update({ resolved: true })
          .eq('id', alertId);
      } catch (error) {
        console.error('Failed to resolve alert:', error);
      }
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(teamId?: string): Alert[] {
    let alerts = Array.from(this.activeAlerts.values());
    if (teamId) {
      alerts = alerts.filter((a) => a.teamId === teamId);
    }
    return alerts;
  }

  /**
   * Get alert summary
   */
  getAlertSummary(teamId?: string) {
    const alerts = this.getActiveAlerts(teamId);
    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
    };
  }
}

// Singleton instance
let alertsServiceInstance: AlertsService | null = null;

export function getAlertsService(): AlertsService {
  if (!alertsServiceInstance) {
    alertsServiceInstance = new AlertsService();
  }
  return alertsServiceInstance;
}
