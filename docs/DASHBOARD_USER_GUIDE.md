# AIOX Dashboard — User Guide

Complete walkthrough of AIOX Dashboard features and workflows.

## Overview

The AIOX Dashboard provides real-time monitoring and visualization of:

- **Agent Metrics:** Agent status, latency, success rates
- **System Metrics:** CPU, memory, disk, network usage
- **Workflow Logs:** Execution history and performance
- **Real-time Updates:** Live data feeds via Supabase Realtime

## Getting Started

### Accessing the Dashboard

1. Open browser: http://localhost:5173
2. Dashboard loads with current agent status

### Main Interface Sections

#### 1. Agent Metrics Panel

**Location:** Left sidebar

**Shows:**
- Agent ID and Name
- Status: Running | Idle | Error | Paused
- Latency (p50, p95, p99 in ms)
- Success Rate (%)
- Memory Usage (MB)
- CPU Percentage (%)

**Actions:**
- Click agent to view detailed metrics
- Filter by status using dropdown
- Search by agent name

#### 2. System Health Panel

**Location:** Top center

**Displays:**
- CPU Usage (gauge)
- Memory Usage (gauge)
- Disk Usage (bar chart)
- Network I/O (line chart)

**Refresh Rate:** Updates every 10 seconds

#### 3. Workflow Logs Panel

**Location:** Right sidebar

**Shows:**
- Recent workflow executions
- Execution duration
- Status (Success | Failed | In Progress)
- Error details (if failed)

**Features:**
- Click row to view full log
- Filter by date range
- Search by workflow name

#### 4. Real-time Metrics Widget

**Location:** Bottom panel

**Displays:**
- Last 10 metrics in scrollable view
- Connection status badge
- Auto-refresh when new data arrives

## Common Workflows

### Monitor Agent Performance

1. Open **Agent Metrics Panel**
2. Select specific agent from list
3. Review latency and success metrics
4. Check memory/CPU trends

### Check System Health

1. Navigate to **System Health Panel**
2. Review resource gauges
3. Check for any alerts (red indicators)
4. Click metric for historical view

### Investigate Failed Workflow

1. Go to **Workflow Logs Panel**
2. Find failed workflow (red status icon)
3. Click to expand details
4. Review error message and stack trace
5. Check correlation ID for distributed tracing

### Export Metrics

1. Click **Export** button (if available)
2. Select time range
3. Choose format (CSV, JSON)
4. Download file

## Performance Tips

### For Large Deployments

- **Disable auto-refresh** if dashboard becomes sluggish
- **Use date filters** to reduce data volume
- **Archive old logs** (>30 days) regularly

### For Real-time Monitoring

- **Enable cache** in settings
- **Set refresh rate** to 5 seconds (default: 10s)
- **Use filters** to reduce visible metrics

### Mobile Viewing

- Dashboard is responsive to 320px+ width
- Tap agent row to expand details
- Scroll horizontally for additional metrics

## Settings & Configuration

### Dashboard Settings

Click **⚙️ Settings** (top right):

#### Performance

- **Auto-refresh:** Enable/disable
- **Refresh interval:** 5s, 10s, 30s, 60s
- **Cache:** Enable/disable
- **History limit:** Last 100, 500, 1000 entries

#### Display

- **Theme:** Light/Dark mode
- **Compact view:** Reduce spacing
- **Show grid:** Display background grid

#### Notifications

- **Alerts:** Enable/disable
- **Alert threshold:** CPU >80%, Memory >85%, Disk >90%
- **Sound:** Enable/disable notification sound

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + /` | Open help |
| `⌘/Ctrl + K` | Search agents |
| `⌘/Ctrl + N` | Create new dashboard |
| `⌘/Ctrl + S` | Save current view |
| `Esc` | Close modals |
| `←/→` | Navigate panels |

## Alerts & Thresholds

### Default Alert Rules

| Metric | Threshold | Severity |
|--------|-----------|----------|
| CPU Usage | >80% | Warning |
| Memory Usage | >85% | Warning |
| Disk Usage | >90% | Critical |
| Agent Error Rate | >5% | Warning |
| Latency p95 | >500ms | Info |

### Customizing Alerts

1. Go to **⚙️ Settings > Alerts**
2. Enable/disable rule
3. Adjust threshold value
4. Click **Save**

## Troubleshooting

### Dashboard Not Loading

1. Check browser console (F12)
2. Verify API is running: `curl http://localhost:3000/api/health`
3. Clear cache: `Ctrl+Shift+Delete` (Chrome), `Cmd+Shift+Delete` (Mac)
4. Refresh page: `Ctrl+R` or `Cmd+R`

### Metrics Not Updating

1. Verify Redis is running: `redis-cli ping`
2. Check real-time connection: Open DevTools > Network tab
3. Verify Supabase connection in browser console
4. Check API logs: `tail -f logs/app.log`

### Cache Not Working

1. Check cache stats: `curl http://localhost:3000/api/cache-stats`
2. Verify hit rate >70%
3. Review cache invalidation events
4. Clear cache: Settings > Cache > Clear

## Data Export & Analysis

### Export Metrics

1. Click **Export** button
2. Select date range
3. Choose format (CSV recommended)
4. Download file

### CSV Format

```csv
timestamp,agentId,status,latency_ms,success_rate,memory_usage_mb,cpu_percentage
2026-03-13T10:00:00Z,agent-1,running,45,98.5,128,25.5
2026-03-13T10:01:00Z,agent-1,running,52,99.1,130,26.2
```

## Integration with Other Tools

### Splunk Integration

1. Download metrics CSV
2. Import to Splunk via `inputs.conf`
3. Create searches and alerts

### Datadog Integration

Configure API key in settings to enable Datadog export.

### Custom Webhooks

Setup custom webhook endpoint in Settings > Integrations for real-time data push.

## Privacy & Security

### Data Retention

- **Real-time metrics:** 24 hours
- **Daily aggregates:** 90 days
- **Logs:** 30 days (configurable)

### PII Protection

The dashboard automatically redacts:
- Passwords (displayed as `[REDACTED]`)
- API keys
- Personal identification data

### Access Control

- Authentication required to access dashboard
- Role-based access control (admin, viewer, editor)
- Audit logs track all actions

## Best Practices

1. **Regular Monitoring:** Check dashboard daily for anomalies
2. **Set Alerts:** Configure thresholds for your SLA
3. **Archive Logs:** Remove old logs to keep database performant
4. **Review Trends:** Analyze metrics weekly for capacity planning
5. **Test Alerts:** Periodically verify alert notifications work

## Advanced Features

### Custom Dashboards

1. Create new dashboard: **+** button
2. Add widgets (drag & drop)
3. Configure filters
4. Save dashboard
5. Share via link (Settings > Share)

### Distributed Tracing

Click **Trace ID** in log entry to view complete request trace:

- Request path through services
- Latency breakdown per service
- Database query details
- Error context (if any)

### Performance Profiling

Access **Performance** tab to view:

- Agent execution timeline
- Memory allocation graph
- CPU usage timeline
- Request timeline

---

## Need Help?

- **Common Issues:** See [Troubleshooting](./DASHBOARD_TROUBLESHOOTING.md)
- **API Reference:** See [API Documentation](./DASHBOARD_API.md)
- **Setup Help:** See [Setup Guide](./DASHBOARD_SETUP.md)

**Last Updated:** 2026-03-13
**Version:** 1.0.0
