# Testing

## Commands

Run `npm run docs:check`, `npm run lint`, `npm run type-check`, `npm test`, `npm run test:e2e`, `npm run build`, and `npm audit --omit=dev --audit-level=high`. The current verified result is 55 passing Vitest tests across 10 files, passing lint/type-check/build/E2E, and zero high-severity production audit findings.

## Layers

Unit tests isolate OTP policy, AuthService, credits, lead normalization, scoring, and JWT middleware. Integration tests mount auth, search/AI, and SuperAdmin routers with controlled doubles. E2E smoke validates public landing content, pricing, auth boundary, and protected search denial against a local server without real email, payment, or AI calls.

## Gaps

A full browser runner is still required for authenticated navigation, multi-city controls, session expiry, lead management, accessibility, and realistic error states. Complete SuperAdmin mutation isolation/injection tests, public middleware tests, migration rehearsal, secret scanning, and load tests remain release gates.
