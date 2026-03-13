# AIOX Dashboard — Troubleshooting Guide

Common issues and solutions for AIOX Dashboard.

## Dashboard Not Loading

### Symptom
Browser shows blank page or "Failed to load" error.

### Diagnosis
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check network requests (Network tab)

### Solutions

**1. API Connection Issue**
```bash
curl http://localhost:3000/api/health
```

If API is down:
```bash
npm run dev:api
```

**2. Browser Cache Issue**
- Chrome: Ctrl+Shift+Delete → Clear all
- Safari: Develop → Clear Caches
- Firefox: Ctrl+Shift+Delete → Everything
- Force reload: Ctrl+Shift+R (Windows/Linux), Cmd+Shift+R (Mac)

**3. Port Conflict**
```bash
lsof -i :5173
kill -9 <PID>
PORT=5174 npm run dev:dashboard
```

---

## Metrics Not Updating

### Symptom
Dashboard shows old data, no real-time updates, "no data" message.

### Solutions

**1. Redis Connection Failed**
```bash
redis-cli ping
redis-server
docker run -d -p 6379:6379 redis:latest
```

**2. Database Connection Issue**
```bash
grep SUPABASE_ .env | grep -v "^#"
```

**3. Cache Issues**
```bash
curl http://localhost:3000/api/cache-stats
curl -X DELETE http://localhost:3000/api/cache
```

---

## High Latency / Slow Performance

### Solutions

**1. Check Cache Hit Rate**
```bash
curl http://localhost:3000/api/cache-stats
```
If < 70%, increase TTL values in packages/api/src/services/cache.ts

**2. Monitor Redis Memory**
```bash
redis-cli info memory
redis-cli FLUSHDB
```

**3. Browser Performance**
- Disable auto-refresh or set to 30s
- Enable compact view
- Reduce history limit to 100 entries

---

## Real-time Updates Not Working

### Solutions

**1. WebSocket Connection**
```bash
curl http://localhost:3000/api/health
npm run dev:api
```

**2. Firewall Issues**
- Disable VPN temporarily
- Check corporate firewall rules
- Use different network

---

## Authentication / Token Errors

### Solutions

**1. Invalid Token Format**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/metrics
```

**2. CORS Issues**
```bash
curl -i http://localhost:3000/api/health | grep -i access-control
```

---

## Disk Space Issues

**1. Clear Old Logs**
```bash
find logs -name "*.log" -mtime +30 -delete
gzip logs/*.log
```

**2. Check Disk Usage**
```bash
du -sh * | sort -hr | head -10
find . -type f -size +100M -exec ls -lh {} \;
```

---

## Memory Leaks

Monitor memory usage:
```bash
node --inspect packages/api/src/index.ts
# Open Chrome DevTools → chrome://inspect
# Take heap snapshots over time
```

---

## Debugging Commands

```bash
DEBUG=aiox:* npm run dev:api
netstat -tlnp | grep 3000
curl -v http://localhost:3000/api/metrics
watch -n 1 'curl http://localhost:3000/api/cache-stats'
redis-cli KEYS "cache:*"
redis-cli FLUSHDB
tail -f logs/app.log
```

---

## Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Service not running | Start: `npm run dev:api` |
| `ETIMEDOUT` | Network unreachable | Check network, restart |
| `ENOTFOUND` | DNS/hostname error | Verify .env hostname |
| `401 Unauthorized` | Invalid token | Regenerate token |
| `429 Too Many Requests` | Rate limited | Increase limit |
| `500 Internal Error` | Server error | Check logs |

---

## Getting More Help

1. Check logs: `tail -f logs/app.log`
2. Enable debug: `DEBUG=* npm run dev:api`
3. Review [Setup Guide](./DASHBOARD_SETUP.md)
4. Check [API Reference](./DASHBOARD_API.md)

---

**Last Updated:** 2026-03-13
**Version:** 1.0.0
