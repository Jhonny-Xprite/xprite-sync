# AIOX Dashboard — API Reference

Complete API documentation for the AIOX Dashboard backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require valid JWT token in `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Health Check

### GET /health

Check API and service health status.

**Request:**

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-13T10:00:00Z",
  "services": {
    "cache": "ok",
    "realtime": "ok",
    "database": "ok"
  },
  "correlationId": "trace-123456"
}
```

**Status Codes:**
- `200 OK` - All services healthy
- `503 Service Unavailable` - One or more services down

---

## Agent Metrics

### GET /metrics

Retrieve agent metrics.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | string | Filter by agent ID (optional) |
| `status` | string | Filter by status: running, idle, error, paused (optional) |
| `limit` | integer | Max results (default: 100) |
| `offset` | integer | Pagination offset (default: 0) |

**Request:**

```bash
curl "http://localhost:3000/api/metrics?agentId=agent-1&limit=50"
```

**Response:**

```json
{
  "data": [
    {
      "agentId": "agent-1",
      "status": "running",
      "latency_ms": 45,
      "success_rate": 98.5,
      "error_count": 2,
      "processed_count": 1000,
      "memory_usage_mb": 128,
      "cpu_percentage": 25.5,
      "timestamp": "2026-03-13T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Status Codes:**
- `200 OK` - Metrics retrieved
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing/invalid token

### POST /metrics

Submit new agent metrics.

**Request Body:**

```json
{
  "agentId": "agent-1",
  "status": "running",
  "latency_ms": 45,
  "success_rate": 98.5,
  "error_count": 2,
  "processed_count": 1000,
  "memory_usage_mb": 128,
  "cpu_percentage": 25.5
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "agentId": "agent-1",
    "status": "running",
    "latency_ms": 45,
    "success_rate": 98.5,
    "error_count": 2,
    "processed_count": 1000,
    "memory_usage_mb": 128,
    "cpu_percentage": 25.5
  }'
```

**Response:**

```json
{
  "message": "Metrics accepted for processing",
  "correlationId": "trace-123456"
}
```

**Status Codes:**
- `202 Accepted` - Metrics queued for processing
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing/invalid token

---

## System Metrics

### GET /system-metrics

Retrieve system-level infrastructure metrics.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Max results (default: 100) |
| `offset` | integer | Pagination offset (default: 0) |

**Request:**

```bash
curl "http://localhost:3000/api/system-metrics?limit=50"
```

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2026-03-13T10:00:00Z",
      "cpu_percentage": 45.2,
      "memory_percentage": 62.8,
      "memory_used_gb": 15.7,
      "disk_used_gb": 250,
      "network_in_mbps": 125,
      "network_out_mbps": 98,
      "db_connections": 12,
      "api_requests_per_sec": 450,
      "api_error_rate": 0.5
    }
  ],
  "total": 500,
  "limit": 50,
  "offset": 0
}
```

---

## Workflow Logs

### GET /workflows

Retrieve workflow execution logs.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: success, failed, running, pending (optional) |
| `from` | ISO8601 | Start date range (optional) |
| `to` | ISO8601 | End date range (optional) |
| `limit` | integer | Max results (default: 100) |

**Request:**

```bash
curl "http://localhost:3000/api/workflows?status=failed&limit=50"
```

**Response:**

```json
{
  "data": [
    {
      "id": "wf-123456",
      "name": "Daily Sync",
      "status": "failed",
      "started_at": "2026-03-13T10:00:00Z",
      "ended_at": "2026-03-13T10:05:30Z",
      "duration_ms": 330000,
      "error": "Database connection timeout",
      "trace_id": "trace-789012"
    }
  ],
  "total": 250,
  "limit": 50,
  "offset": 0
}
```

---

## Cache Management

### GET /cache-stats

Retrieve current cache statistics.

**Request:**

```bash
curl http://localhost:3000/api/cache-stats
```

**Response:**

```json
{
  "hits": 15000,
  "misses": 4500,
  "errors": 10,
  "hitRate": 76.9,
  "timestamp": "2026-03-13T10:00:00Z"
}
```

### DELETE /cache

Clear all cache entries.

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/cache \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "message": "Cache cleared",
  "timestamp": "2026-03-13T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - Cache cleared
- `401 Unauthorized` - Missing/invalid token

---

## Real-time Updates

### WebSocket: /ws/metrics

Subscribe to real-time metrics updates.

**Connection:**

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/metrics');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Agent metric update:', update);
};
```

**Message Format:**

```json
{
  "type": "agent_metric_update",
  "data": {
    "agentId": "agent-1",
    "teamId": "default",
    "status": "running",
    "latency_ms": 45,
    "success_rate": 98.5,
    "error_count": 2,
    "processed_count": 1000,
    "memory_usage_mb": 128,
    "cpu_percentage": 25.5
  },
  "timestamp": "2026-03-13T10:00:00Z"
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid query parameters",
    "details": {
      "agentId": "agentId must be a non-empty string"
    }
  },
  "correlationId": "trace-123456"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API rate limits (per IP, per minute):

| Endpoint | Limit |
|----------|-------|
| `/metrics` | 1000 req/min |
| `/system-metrics` | 500 req/min |
| `/workflows` | 500 req/min |
| `/health` | Unlimited |

**Response Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1647249600
```

---

## Pagination

List endpoints support cursor-based pagination:

```bash
curl "http://localhost:3000/api/metrics?limit=50&offset=0"
```

**Response:**

```json
{
  "data": [...],
  "total": 1000,
  "limit": 50,
  "offset": 0,
  "hasMore": true,
  "nextOffset": 50
}
```

---

## Tracing & Correlation IDs

All API responses include a `correlationId` header for distributed tracing:

```
X-Trace-ID: trace-123456789
```

Use this ID to track request flow through logs and traces:

```bash
# View logs for correlation ID
grep "trace-123456789" logs/app.log

# Query traces in Jaeger
curl http://localhost:16686/api/traces?traceID=trace-123456789
```

---

## Versioning

Current API version: **v1**

The API supports versioning via header:

```
Accept: application/vnd.aiox.v1+json
```

---

## Code Examples

### Python

```python
import requests

response = requests.get(
    'http://localhost:3000/api/metrics',
    headers={'Authorization': f'Bearer {token}'},
    params={'agentId': 'agent-1', 'limit': 50}
)

metrics = response.json()
print(f"Retrieved {len(metrics['data'])} metrics")
```

### JavaScript

```javascript
const response = await fetch(
  'http://localhost:3000/api/metrics?agentId=agent-1&limit=50',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const { data } = await response.json();
console.log(`Retrieved ${data.length} metrics`);
```

### cURL

```bash
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/api/metrics?agentId=agent-1"
```

---

## Changelog

### v1.0.0 (2026-03-13)

- Initial API release
- Agent metrics endpoints
- System metrics endpoints
- WebSocket real-time updates
- Cache management endpoints

---

**Last Updated:** 2026-03-13
**Maintainer:** Backend Team
