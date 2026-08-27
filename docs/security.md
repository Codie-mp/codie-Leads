# Security

## Threat model

Relevant threats include credential theft, OTP brute force/replay, JWT forgery/expiry errors, role escalation, cross-company access, SQL injection, XSS in lead/user content, CSRF for cookie state changes, rate-limit bypass, provider compromise, unsafe uploads, and sensitive error leakage.

## Controls

Authentication uses hashed passwords, signed access/refresh tokens, active-company checks, and OTP expiry/cooldown/window limits. Authorization middleware rejects missing, malformed, expired, forged, or insufficient-role tokens. Server queries must be parameterized and ownership-scoped. Helmet, CORS, rate limits, structured errors, and secret-free logs are required baseline controls.

## Verification

Run `npm run lint`, `npm run type-check`, `npm test`, `npm run test:e2e`, `npm audit --omit=dev --audit-level=high`, and secret scanning in CI. Current tests cover auth, OTP, JWT, credits, deduplication, protected search/SSE, and SuperAdmin authorization boundaries.

## Residual risk

Several SuperAdmin mutation paths still require complete parameterization and injection-shaped negative tests. Full browser E2E, staging migration rehearsal, backup/restore, observability, and load testing remain open. The high-severity production audit is clear; four moderate advisories remain for maintenance.

## Incident response

Contain compromised credentials, rotate affected secrets, disable impacted integrations, preserve sanitized logs, assess tenant scope, patch and test, rehearse rollback, and notify affected parties according to legal and contractual obligations. Never paste secrets into issues or chat.
