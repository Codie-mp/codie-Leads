# CodieLead UX Redesign Implementation Plan

## Architecture decision

Implement the redesign inside the existing Next.js 15 App Router and React component structure. Keep the Express custom server, API routes, Drizzle/TiDB schema, auth context, Zustand lead store, AI search service, and billing services unchanged. The work is a presentation and interaction refactor with only additive frontend helpers where needed.

## Workstreams

### 1. Design system foundation

Create a small set of reusable visual primitives and tokens for the public marketing page and authenticated workspace: page container, section heading, eyebrow, primary/secondary button styles, feature cards, metric cards, empty states, and responsive navigation. Reuse existing Tailwind and icon dependencies; do not add a new component framework unless the current project requires it.

### 2. Marketing page

Refactor `src/views/LandingPage.tsx` into semantic sections that present the B2B outbound workflow. Preserve the `/api/public/pricing-plans` fetch, loading fallback, plan names, plan values, and CTA URL construction. Replace obsolete marketing claims with verified capability language. Ensure the product preview is composed from HTML/CSS and existing icons so it is lightweight and accessible.

### 3. SEO/GEO surface

Update `src/app/page.tsx` metadata and JSON-LD to match the new positioning, remove obsolete provider claims, and add answer-first FAQ content. Preserve organization/product schema while aligning names and URLs. Verify existing `robots`, sitemap, and `llms.txt` outputs and extend them only where required by the redesigned information architecture.

### 4. Authenticated workspace shell

Refactor `src/AppLayout.tsx` navigation into grouped, responsive navigation while retaining the existing view union values, URL query handling, subscription banners, auth behavior, and child component contracts. Improve the dashboard/search onboarding copy and primary-action hierarchy. Keep search invocation exactly compatible with `searchPlaces(query, filters, ...)`.

### 5. Search workflow ergonomics

Refine `SearchForm`, `LocationMap`, and result-state presentation without changing the `SearchFilters` shape or backend endpoint behavior. Make simple ICP search the default, keep advanced filters discoverable, clarify multi-city behavior, and make streaming/loading/empty/error states actionable. Preserve save, export, campaign, and deduplication behavior.

### 6. Quality and regression validation

Run type-checking, Vitest, production build, and route smoke checks. Review responsive layouts at mobile, tablet, and desktop widths. Check keyboard focus, semantic headings, button labels, contrast, metadata, JSON-LD validity, and preservation of backend environment/API contracts.

## Data and contract rules

No environment variable is renamed or removed. No backend route, request key, response key, database field, or service signature is changed. New client code must consume existing values and route names. Any new copy must avoid invented testimonials, customer logos, unsupported metrics, or deliverability guarantees.

## Rollout strategy

Implement in small commits or task groups: foundation, landing page, SEO/GEO, app shell, search ergonomics, then validation. Keep the current preview runnable after each group. Update the feature task artifact after each completed group and record deviations in this plan.
