# Whole-Application Documentation Plan

## Goal

Create clear, accurate, maintainable documentation for the entire CodieLead SaaS application, aligned with the quality principles represented by [codiemarket.com/qc](https://codiemarket.com/qc): modular architecture, reusable components, coding standards, performance, responsiveness, security, testing, accessibility, documentation, and reviewability.

The documentation must describe the repository as it actually exists, distinguish implemented behavior from planned behavior, preserve all existing API and environment-variable contracts, and make the application understandable to a new developer, operator, security reviewer, and product maintainer.

## Current-state assumptions

The reference QC page describes quality categories and review expectations but does not publish a literal repository tree. The implementation will therefore align CodieLead with those principles rather than copy an unavailable exact folder hierarchy.

The current application uses Next.js 16 App Router with React and TypeScript, a custom Node.js/Express server, Drizzle ORM, TiDB/MySQL, Vitest, an ESLint CLI flat configuration, and feature/atomic-design entrypoints layered over existing components. The documentation must state that the feature architecture is staged through public entrypoints and that some physical legacy component locations remain intentionally stable.

The documentation must not claim unconditional production readiness. It must clearly report the passing automated gates, the current high-severity dependency audit result, and the remaining operational and security gates recorded in the production-readiness report.

## Deliverables

### 1. Root README rewrite

Replace the concise/stale README with an onboarding and operations index containing the product overview, supported workflows, architecture summary, prerequisites, installation, environment setup, local development, production build/start, command reference, route map, feature map, test commands, security practices, deployment prerequisites, troubleshooting, contribution workflow, and links to detailed documents.

The README must update the stale Next.js 15 wording, document the current Next.js/App Router/custom-server arrangement, explain that spreadsheet export is spreadsheet-compatible CSV after removal of the vulnerable xlsx package, and link to the production-readiness evidence.

### 2. Documentation directory

Create a structured `docs/` tree with these documents:

- `docs/architecture.md`: system context, request lifecycle, frontend/backend/database boundaries, feature entrypoints, atomic-design layers, App Router mapping, state/data flow, and stateless-scaling assumptions.
- `docs/routes.md`: public and authenticated route behavior, route metadata, redirects, access requirements, and route-to-feature ownership.
- `docs/features.md`: user-facing workflows for ICP search, Smart Search deduplication, multi-city targeting, saved leads, enrichment, campaigns, billing/InstaPay manual receipt flow, integrations, and SuperAdmin capabilities.
- `docs/api.md`: API conventions, authentication headers, error shapes, rate limits, key endpoint groups, SSE search behavior, pricing contract, and compatibility rules. It must distinguish documented routes from routes requiring further contract extraction.
- `docs/data-model.md`: major tables, ownership boundaries, company isolation, identifiers, credits, subscriptions, OTP fields, migrations, and data-retention/security considerations. It must avoid exposing secrets or real customer data.
- `docs/security.md`: threat model, authentication/authorization, OTP controls, tenant isolation, SQL/query safety, XSS handling, headers/CORS/rate limits, secret handling, audit commands, incident response expectations, and explicitly documented residual risks.
- `docs/testing.md`: test pyramid, test file map, fixtures/mocks, commands, unit/integration/E2E scope, deterministic-test rules, CI recommendations, and uncovered scenarios.
- `docs/deployment.md`: environment matrix, build/start commands, custom-server hosting requirements, database migration process, SMTP/AI/Redis/payment/integration prerequisites, health checks, rollback, and staging rehearsal requirements.
- `docs/operations.md`: logging, observability, backups/restores, alerts, scaling toward the 15,000+ concurrent-user target, rate-limit storage, failure modes, maintenance, and incident runbooks.
- `docs/accessibility-and-performance.md`: semantic markup, responsive/mobile-first requirements, metadata/JSON-LD/robots/sitemap/llms.txt, Core Web Vitals targets, image/font guidance, and manual accessibility/performance checks.
- `docs/contributing.md`: branch/PR conventions, spec-kit lifecycle, naming conventions, architectural boundaries, test-before-merge rules, migrations, review checklist, and definition of done.
- `docs/troubleshooting.md`: common local, authentication/OTP, database/schema, build, E2E, email, AI/search, billing, and deployment failures with diagnostic commands and safe remedies.
- `docs/production-readiness.md`: a human-readable release decision linking to the existing test report, exact passing commands, known warnings, remaining blockers, and sign-off checklist.

### 3. Machine-readable and in-app documentation alignment

Update `public/llms.txt` so it accurately reflects Next.js App Router, Express custom-server architecture, current feature names, CSV export behavior, documentation URLs, and the distinction between implemented and pending capabilities.

Update the existing user-facing ICP guide if needed so it links to the canonical feature documentation and does not contradict current search filters, multi-city behavior, deduplication, or export behavior.

If route-level documentation pages are added to the application, keep them separate from private operational documentation and do not expose secrets, internal tokens, private database details, or privileged administrative procedures publicly. The default plan is documentation files in the repository rather than new public app routes.

### 4. Documentation quality controls

Add a documentation index and cross-links. Use a consistent structure for every document: purpose, audience, prerequisites, procedure or reference, expected result, failure modes, security notes, and related documents where applicable.

Add a documentation validation script or CI-friendly command that checks required files, required headings, broken local Markdown links where practical, stale technology references such as `Next.js 15` or `next lint`, and accidental secret-like patterns. Do not make validation depend on external production services.

## Execution phases

1. **Specify and audit:** create the feature-specific spec and task checklist under `.specify/features/whole-app-documentation/`; inventory code, route files, package scripts, environment variable references, database schema, API route registrations, current test evidence, and existing docs.
2. **Information architecture:** finalize document ownership, audience, cross-linking, terminology, and the distinction between current state, verified behavior, and open risk.
3. **Write documentation:** produce the README, architecture/reference documents, operational runbooks, security/test documentation, and updated `llms.txt` from repository evidence rather than assumptions.
4. **Add documentation validation:** implement a deterministic docs-check command and include it in the documented validation workflow without modifying runtime API contracts.
5. **Verify accuracy:** run type-check, ESLint CLI, all Vitest tests, E2E smoke, production build, high-severity dependency audit, docs validation, route smoke, and link/reference checks. Review generated documentation for stale or contradictory claims.
6. **Review and deliver:** update the spec-kit task checklist and readiness report, summarize changed documents, identify any remaining documentation gaps, and commit the completed documentation pass.

## Acceptance criteria

- A new engineer can install, configure, run, test, and build the application using only the README and linked docs.
- Every current Next App Router page and major feature has a documented owner, access rule, purpose, and verification method.
- API, environment, database, authentication, billing, search, deduplication, and multi-city behavior are described without changing contracts.
- Security documentation explicitly covers tenant isolation, JWT/OTP controls, secret handling, SQL safety, residual SuperAdmin mutation risk, moderate dependency advisories, and operational gates.
- Deployment and operations docs do not claim staging, backup, load, observability, or browser-E2E verification unless evidence exists.
- `public/llms.txt` and user-facing guides match the current product and architecture.
- Documentation validation is deterministic and passes locally.
- All existing automated tests continue to pass, the build succeeds, and the repository remains free of generated caches or secrets.

## Risks and decisions

The largest risk is documentation drift because the application contains a custom Express server, legacy-compatible routes, and staged feature barrels. The docs will identify the canonical source files and will prefer verified route/schema evidence over inferred behavior.

A full physical relocation of every component into feature folders is out of scope for this documentation task. The documents will explain the current staged architecture and define the intended ownership boundaries so a later physical migration can be performed incrementally.

Production readiness remains a separate engineering decision. The documentation pass will report the current evidence and residual blockers rather than silently converting known gaps into claims of readiness.
