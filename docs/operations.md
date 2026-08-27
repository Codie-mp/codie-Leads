# Operations

Monitor request rate, p50/p95/p99 latency, 4xx/5xx rate, auth failures, OTP delivery failures, credit-charge failures, SSE duration, database pool saturation, Redis health, queue/provider errors, and memory/CPU. Use correlation IDs and centralized structured logs; never log OTPs, passwords, tokens, or provider secrets.

Backups require encrypted storage, retention, access control, and periodic restore drills. Alerts should cover health failure, error-rate spikes, database connectivity, exhausted credits/provider failures, and certificate/secret expiry. Capacity for 15,000+ active concurrent users is not verified until realistic k6/Artillery/Locust journeys validate it with horizontal scaling and CDN/cache configuration.

Common runbooks include degraded AI/search, SMTP outage, Redis outage, database schema mismatch, suspicious auth activity, tenant-isolation incident, failed migration, and rollback. See [`troubleshooting.md`](troubleshooting.md).
