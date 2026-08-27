# Architecture

## Purpose and audience

This document explains where application behavior belongs and how a request travels through CodieLead. It is for engineers maintaining the Next.js frontend, Express API, Drizzle data layer, and deployment.

## System boundary

The browser renders Next.js pages and client components. `src/app` contains App Router route adapters. `src/features` provides capability-oriented public entrypoints. Existing reusable UI remains in `src/components`; atomic barrels provide a staged migration seam. `src/server/routes` contains Express handlers, `src/server/services` contains business logic, and `src/db` contains schema and database access. TiDB is the MySQL-compatible persistence layer. External boundaries include AI/search, SMTP, Redis, S3/R2, CRM, and payment services.

## Request flow

A page request enters Next.js and resolves a file-system route. An API request enters the custom Express server, passes security/auth/subscription middleware, validates input, invokes a service, reads or writes TiDB through Drizzle/mysql2, and returns a stable JSON or SSE response. Client stores and service adapters consume those responses without owning server secrets.

## App Router and features

Routes remain in `src/app`; feature ownership is mapped in [`routes.md`](routes.md). Feature barrels are deliberate public boundaries, not a claim that every legacy file has been physically moved. Atoms are foundational controls such as Logo and Modal; molecules combine small controls such as loading/category/notification elements; organisms are composite search, leads, campaign, billing, and admin surfaces.

## Scalability assumptions

The app should remain stateless across horizontally scaled Node instances. Sessions and rate limits must not depend on process memory; use shared persistence where configured. Static and cacheable content should be CDN-served. Database connections require bounded pools, deliberate indexes, and migration review. The 15,000-concurrent-user target is a requirement, not a verified capacity claim; realistic load testing remains outstanding.

## Security notes

Do not place secrets in client components. Tenant identity comes from authenticated claims and server-side ownership checks. API contracts and environment variable names are compatibility boundaries. Review [`security.md`](security.md) before changing routes, queries, auth, or integrations.
