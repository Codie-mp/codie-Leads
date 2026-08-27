# Production-Readiness Testing and Security Plan

## Architecture

Extend the existing Vitest toolchain and add a browser E2E runner only if it can execute safely against the local Next.js/Express server. Prefer dependency-light tests that mock database, email, Redis, AI, and payment boundaries. Keep test fixtures isolated, deterministic, and free of live customer data.

## Test layers

### Unit layer

Test pure policies and service branches in isolation. Highest priority is `AuthService`: password verification, JWT claims and expiry configuration, registration bootstrap, duplicate email handling, unverified login behavior, company suspension, OTP mismatch/expiry, resend cooldown/window limits, reset-password verification, and invite acceptance. Add focused coverage for lead deduplication identifiers, search filter normalization, credit arithmetic, and permission maps where those modules exist.

### Integration layer

Mount Express routers with controlled service/database doubles and verify HTTP status, JSON shape, validation failures, authorization, rate-limit headers, and error normalization. Cover auth routes, protected Gemini/search routes, SuperAdmin routes, and health/public pricing routes. Assert that malformed and injection-shaped strings are treated as data and never become executable SQL or privileged mutations.

### E2E layer

Run against a disposable local server with test-only controlled dependencies or a seeded test database. Cover public landing page navigation and CTAs, registration validation, login and OTP error states, authenticated workspace navigation, search form submission, multi-city interaction, deduplication-visible empty/result states, and logout/session-expiry behavior. Do not use real email, AI, payment, or production databases.

### Security layer

Create regression cases for missing/invalid/expired JWTs, role escalation attempts, cross-company object access, CSRF-sensitive state changes where cookies are used, reflected/stored XSS payloads in user-controlled fields, SQL-injection-shaped identifiers, mass assignment of admin fields, OTP brute-force/replay, email enumeration, rate-limit bypass through headers or alternate routes, and unsafe error leakage. Review Helmet/CORS/rate-limiting configuration and document limitations.

## Release-blocking findings

The SuperAdmin security boundary test reached the real TiDB instance and exposed a schema drift defect: the runtime `subscriptions` table lacks the `status` column used by platform statistics and approval flows, while `schema.ts` contains both a modern and legacy definition for the same table. This must be remediated through an additive, idempotent migration and regression-tested before production readiness can be claimed.

## Testability changes allowed

Add test seams, dependency injection, environment-controlled adapters, stable `data-testid` or accessible-role selectors, and test scripts/configuration. Do not rename or remove production environment variables or alter public request/response contracts.

## Quality gate

The final report must distinguish passing automated evidence from blocked infrastructure checks. Required commands are type-check, lint or documented lint limitation, unit/integration suite, E2E suite, production build, and route smoke checks. Load, dependency scanning, secret scanning, database migration rehearsal, backup/restore, and deployment verification must be explicitly listed as remaining operational checks if not executable in the sandbox.
