# Whole-Application Documentation Specification

## Problem

CodieLead’s existing documentation is too concise and contains stale architecture references. A new engineer, operator, security reviewer, or product maintainer cannot reliably understand the full application, its routes, feature boundaries, API contracts, database behavior, testing evidence, deployment prerequisites, or unresolved production risks from the current README and scattered notes.

The reference quality-control guidance at [codiemarket.com/qc](https://codiemarket.com/qc) emphasizes coding standards, modular architecture, performance, responsiveness, security, testing, accessibility, documentation, and reviewability. CodieLead needs a documentation system that makes those qualities explicit and verifiable.

## Users and outcomes

A new developer must be able to install and run CodieLead, understand the Next.js App Router and Express custom-server relationship, locate feature code, identify API and data boundaries, run all validation commands, and contribute safely.

An operator must be able to configure environments, deploy the custom server, understand migrations and health checks, diagnose common failures, and distinguish verified operational behavior from prerequisites that still require staging or production validation.

A security reviewer must be able to understand authentication, OTP controls, tenant isolation, database/query safety, rate limiting, secret handling, dependency audit status, residual risks, and incident-response expectations without receiving secrets or private customer data.

A product maintainer must be able to understand search, deduplication, multi-city targeting, saved leads, enrichment, campaigns, billing/InstaPay, integrations, and SuperAdmin behavior with clear ownership and source-file references.

AI and search crawlers must receive an accurate machine-readable product description that matches the current architecture, feature names, route behavior, and export behavior.

## Requirements

1. The root README must become a reliable documentation index covering product purpose, supported workflows, architecture, prerequisites, environment setup, development, build/start, route map, feature map, commands, security, deployment, troubleshooting, contribution, and production-readiness status.
2. The repository must contain a cross-linked `docs/` set for architecture, routes, features, API, data model, security, testing, deployment, operations, accessibility/performance, contributing, troubleshooting, and production readiness.
3. Documentation must describe the current Next.js App Router routes and preserve the distinction between route entrypoints and the Express API server.
4. Documentation must describe the feature-based and atomic-design entrypoints as a staged architecture over stable existing modules; it must not falsely claim that every component has already been physically relocated.
5. Documentation must describe existing public API contracts, authentication headers, error conventions, rate-limit behavior, SSE search, pricing, database ownership, credits, subscriptions, OTP fields, and migration behavior without modifying those contracts.
6. Documentation must include security, privacy, tenant-isolation, dependency-audit, and incident-response guidance, and must clearly expose residual risks rather than hiding them.
7. Documentation must describe current testing evidence and uncovered scenarios, including the 55 passing Vitest tests, E2E smoke scope, build/lint/audit commands, remaining browser E2E work, SuperAdmin mutation hardening, staging, observability, backup/restore, and load-test gates.
8. Documentation must update `public/llms.txt` and the ICP guide where needed so machine-readable and user-facing product guidance does not contradict the current implementation.
9. A deterministic documentation validation command must verify required files/headings, stale references, local links where practical, and obvious secret-like patterns without contacting production services.
10. The documentation must never include real credentials, tokens, private customer data, or unsupported claims about production readiness.

## Non-goals

This feature does not physically relocate every existing component, redesign runtime behavior, change backend variables or API contracts, add public documentation routes, perform production deployment, or certify capacity for 15,000 concurrent users.

## Acceptance criteria

The complete documentation set allows a new engineer to follow setup, development, testing, build, deployment, and troubleshooting procedures without relying on tribal knowledge. Every current route and major feature has a documented owner and access rule. The docs validation command passes, stale claims are removed, links are cross-referenced, machine-readable guidance is current, and all existing automated validation remains green.
