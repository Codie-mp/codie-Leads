# CodieLead Architecture Alignment

## Reference interpretation

The reference quality-control page at [codiemarket.com/qc](https://codiemarket.com/qc) describes modular, reusable code, small components, consistent naming, configuration-driven behavior, responsive design, security, testing, accessibility, documentation, and reviewability. It does not publish a literal repository tree. CodieLead therefore adopts those principles through explicit feature boundaries and atomic-design barrels while preserving the existing implementation modules and backend contracts.

## App Router boundary

All URL and route entrypoints remain under `src/app`. The current routes are `/`, `/login`, `/register`, `/accept-invite`, `/app`, `/superadmin`, `/privacy`, and `/terms`, with generated `robots.txt`, `sitemap.xml`, and `not-found` handling. Route files remain thin adapters that export metadata and render a feature-owned page.

## Feature boundaries

| Feature | Entry point | Primary responsibilities |
|---|---|---|
| Authentication | `src/features/auth/index.ts` | Login, registration, invite acceptance, and protected-route behavior. |
| Search | `src/features/search/index.ts` | Search form, intent search, map targeting, ICP scraping, and result loading states. |
| Leads | `src/features/leads/index.ts` | Result tables, saved leads, Kanban, lead intelligence, and campaign assignment. |
| Campaigns | `src/features/campaigns/index.ts` | Campaign management, outreach drafting, and lead-to-campaign flows. |
| Billing | `src/features/billing/index.ts` | Billing and CRM integration surfaces. |
| Administration | `src/features/admin/index.ts` | SuperAdmin dashboard and operational controls. |
| Shared workspace | `src/features/shared/index.ts` | Dashboard, settings, team, notifications, and onboarding. |

## Atomic design barrels

The existing reusable UI is exposed through `src/components/ui/atoms`, `src/components/ui/molecules`, and `src/components/ui/organisms`. These barrels provide a gradual migration seam: new feature code can import from atomic or feature entrypoints, while existing component internals continue to use stable paths until each module is independently migrated and regression-tested.

## Compatibility rules

Feature barrels are import boundaries only; they do not rename components, alter API request or response shapes, move database code, or change environment variables. The backend remains under `src/server`, route handlers remain Express-compatible, and Next App Router pages remain under `src/app`. This staged approach avoids a high-risk all-at-once file move while making the intended architecture explicit and enforceable for future work.

## Validation

The alignment was validated with ESLint CLI, TypeScript strict checking, 55 Vitest tests across 10 files, the local E2E smoke journey, the Next.js production build, `npm audit --omit=dev --audit-level=high`, and `git diff --check`.
