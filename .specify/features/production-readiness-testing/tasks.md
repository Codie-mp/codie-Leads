# Production-Readiness Testing and Security Tasks

## Phase 1 — Audit and test harness

- [x] **1.1 Inventory critical routes, services, contracts, and current coverage**
- [x] **1.2 Add isolated test configuration, fixtures, and safe environment defaults**
- [x] **1.3 Define the test matrix and record external-infrastructure blockers**

## Phase 2 — Unit coverage

- [x] **2.1 Expand OTP policy boundary and clock-based tests**
- [x] **2.2 Cover AuthService registration, login, verification, reset, resend, and invite branches**
- [x] **2.3 Cover JWT claims, invalid credentials, inactive companies, and token failure behavior**
- [x] **2.4 Cover lead deduplication, multi-city filter normalization, credit invariants, and permission helpers**

## Phase 3 — Integration and security coverage

- [x] **3.1 Test auth route validation, error normalization, and rate-limit responses**
- [x] **3.2 Test protected search/AI routes, subscription guards, credits, streaming, and deduplication**
- [ ] **3.3 Test SuperAdmin authorization, cross-company isolation, malformed input, and injection-shaped payloads**
  - Partial: global auth boundary is covered and company-detail identifiers are parameterized; remaining mutation paths still require remediation and negative tests.
- [ ] **3.4 Test public pricing, health, CORS, Helmet, and non-leaky error responses**

## Phase 4 — E2E coverage

- [x] **4.1 Add a disposable-server E2E smoke harness**
  - HTTP journey smoke is implemented; a full Playwright/Cypress browser harness remains pending.
- [x] **4.2 Test landing navigation, CTA destinations, registration validation, and auth error states**
  - Covered by the HTTP E2E smoke runner; browser-level authenticated coverage remains pending.
- [ ] **4.3 Test authenticated navigation, search onboarding, multi-city controls, and session expiry**
- [ ] **4.4 Test critical lead-management actions without external production services**

## Phase 5 — Execution and hardening

- [x] **5.1 Add package scripts and CI-friendly commands for each test layer**
- [ ] **5.2 Run type-check, lint, unit/integration, E2E, build, and route smoke checks**
  - Type-check, tests, E2E, build, and route smoke pass; lint is blocked by deprecated interactive `next lint`.
- [ ] **5.3 Run dependency, secret, migration, and configuration security checks where available**
  - Dependency audit reports 12 vulnerabilities, including 9 high severity; remediation is pending.
- [x] **5.4 Document failures, residual risk, and production prerequisites**
- [x] **5.5 Commit and push the test program and report**
