# Deployment

## Build and start

Use `npm ci`, configure environment variables, run `npm run build`, and start with `npm start`. The build creates Next output and bundles the custom Express server. Hosting must support a persistent Node process, health checks, graceful restarts, TLS termination, and horizontal scaling.

## Environment matrix

Development may use local `.env.local`; staging and production require managed secrets, isolated TiDB databases, separate SMTP/AI/Redis/storage credentials, and restricted administrative access. Never reuse production data or credentials in tests.

## Database

Run reviewed, idempotent migrations during deployment or a controlled pre-deploy step. Rehearse migrations on a staging clone, verify rollback/forward recovery, and confirm schema synchronization before serving traffic.

## Rollback

Use immutable builds, retain the previous known-good version, stop promotion on failed health checks, preserve logs, and roll back application/database changes only with a rehearsed compatible procedure. Blue-green or rolling deployment is preferred.
