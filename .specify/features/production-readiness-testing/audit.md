# Production-Readiness Testing Audit

## Current evidence

The repository currently has only three test files: scoring utility coverage, OTP policy coverage, and two redesigned footer/auth CTA assertions. The package exposes `vitest`, `type-check`, `build`, and `lint` scripts, but no browser E2E runner or integration test harness.

## Highest-risk areas

| Surface | Risk | Required coverage |
|---|---|---|
| `AuthService` | OTP replay/expiry, resend abuse, account enumeration, inactive-company login, token claims, password reset state transitions | Unit tests with mocked DB/email and controlled time |
| `auth` router | Boundary validation, error status mapping, Retry-After behavior, purpose validation | Route-level tests |
| Auth middleware | Forged/expired/malformed bearer tokens, role/permission escalation | Middleware unit tests |
| `gemini` routes | Subscription gate, credit charging, SSE completion, deduplication, external-provider failure | Integration tests with service/provider doubles |
| `superAdmin` router | Privilege boundary, cross-company access, interpolated SQL paths, mass assignment | Negative integration/security tests |
| Browser journey | Landing CTAs, registration/login/OTP states, authenticated navigation, search and multi-city controls | Disposable-server E2E |
| Runtime/config | Helmet/CORS/rate limits, secret fallback, external dependency behavior | Runtime and configuration checks |

## Known limitations to report

A full production-readiness claim cannot be made from sandbox tests alone until a disposable TiDB/Redis/SMTP/AI environment, dependency and secret scans, migration rehearsal, backup/restore rehearsal, observability checks, and realistic load testing are executed in CI or staging. These will be tracked as residual operational prerequisites rather than hidden behind passing unit tests.
