# Project Constitution: Codie-Leads

## 1. Core Principles

This project is a B2B SaaS application designed to handle 15,000+ concurrent active users. It must be fast, accessible, scalable under real production load, and maximally discoverable by both traditional search engines and generative AI/answer engines (GEO).

## 2. Technical Stack

*   **Frontend**: Next.js (App Router), React Server Components by default, TypeScript strict mode. Client Components only where interactivity requires it.
*   **Backend**: Node.js + Express (REST or RESTish API), TypeScript, layered architecture.
*   **Database**: SQL via TiDB (MySQL-compatible, distributed NewSQL).
*   **ORM**: Drizzle ORM (configured for MySQL/TiDB compatibility).

## 3. SEO & GEO Requirements

*   **Traditional SEO**: Server-rendered content for indexable pages, `generateMetadata` for route-level metadata, JSON-LD structured data, clean URL structure, `sitemap.xml`, and `robots.txt`. Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms.
*   **Generative Engine Optimization (GEO)**: Structure content with clear question-style headings, concise definitional answers, and TL;DR summaries. Expose an `llms.txt`. Ensure content is accessible without JavaScript execution where possible (prioritize SSR/SSG).

## 4. Architecture & Code Quality

*   **TypeScript Strict Mode**: Enforced everywhere.
*   **Separation of Concerns**: Clear boundaries between UI components, business logic, data access, and API contracts.
*   **Statelessness**: The application must be stateless to support horizontal autoscaling.
*   **Error Handling & Logging**: Consistent structured logging and error handling.
*   **Environment Configuration**: Environment-based config (`.env`), no hardcoded secrets.

## 5. Spec-Kit Workflow

No code is written without prior specification, planning, and task breakdown using the spec-kit methodology. The `plan.md` and `tasks.md` are the source of truth for all implementation work.
