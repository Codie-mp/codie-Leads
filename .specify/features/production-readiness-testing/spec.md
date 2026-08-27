# Production-Readiness Testing and Security Specification

## Objective

Establish an executable quality gate for CodieLead that validates critical business logic, API behavior, authorization boundaries, input handling, persistence invariants, and the highest-value user journeys before production deployment.

## In Scope

The test program must cover authentication and OTP lifecycle behavior, role and permission enforcement, protected AI/search routes, Smart Search deduplication, multi-city filtering, lead persistence and export behavior, billing and credit invariants, SuperAdmin operations, public route contracts, and the landing-to-registration journey.

The program must include deterministic unit tests, route-level integration tests using isolated mocks or test fixtures, browser-level E2E tests against a disposable local server, and security regression tests for unauthorized access, privilege escalation, malformed input, rate-limit behavior, token failures, and injection-shaped payloads.

## Non-Goals

This work must not change existing API paths, request keys, response keys, database schema contracts, environment variable names, or production business rules merely to make tests pass. Load testing for the 15,000-user capacity claim is a separate performance initiative unless the existing environment supports a safe disposable load target.

## Acceptance Criteria

1. A documented test matrix maps critical risks to automated tests and explicit residual risks.
2. Unit tests cover normal, boundary, failure, replay, expiry, and persistence-failure cases for authentication and core services.
3. Integration tests verify route validation, auth middleware, authorization, structured errors, rate limits, and protected search behavior.
4. Security tests demonstrate that unauthenticated users, ordinary users, and cross-company users cannot access or mutate privileged resources.
5. E2E tests exercise public landing navigation, registration validation, login/OTP states, search onboarding, and key authenticated navigation using a disposable test mode or controlled mocks.
6. Type-checking, linting where supported, unit/integration tests, production build, and E2E smoke tests are runnable from package scripts.
7. Test output identifies any blocked cases caused by unavailable external services such as TiDB, SMTP, Redis, AI providers, or payment systems.
8. No secrets, live customer data, or destructive production operations are used by the test suite.

## Production Gate

The platform may be described as test-ready only when all executable checks pass, security-critical failures are absent, and every blocked or untested area is documented with an owner and mitigation. It must not be described as fully production-ready solely because unit tests pass; external infrastructure, observability, deployment, backup/restore, and load-test evidence remain operational prerequisites.
