# CodieLead UX Redesign Tasks

## Phase 1 — Specification and audit

- [x] **1.1 Confirm project constitution and existing migration plan**
  - Re-read `.specify/constitution.md`, `.specify/plan.md`, and `.specify/tasks.md`.
- [x] **1.2 Audit landing, app shell, and SEO contracts**
  - Record current CTA routes, view identifiers, search service signature, pricing endpoint, metadata, and JSON-LD.
- [x] **1.3 Research B2B SaaS and sales-engagement patterns**
  - Save source-backed notes in `research-notes.md`.

## Phase 2 — Design system and landing page

- [x] **2.1 Establish redesign tokens and reusable marketing primitives**
  - Create consistent container, typography, button, card, badge, and responsive navigation styles using existing Tailwind conventions.
- [x] **2.2 Refactor the landing-page hero and navigation**
  - Make the B2B outbound promise explicit; preserve sign-in and register/billing destinations.
- [x] **2.3 Add the workflow and product-preview sections**
  - Show ICP → discover → qualify → activate with a lightweight, accessible UI composition.
- [x] **2.4 Rework pricing, use cases, objections, and final CTA**
  - Preserve DB-backed pricing fetch and fallback behavior, existing plan values, and query parameters.
- [x] **2.5 Update footer links and marketing copy**
  - Remove obsolete claims and nonfunctional or misleading product language.

## Phase 3 — SEO/GEO

- [x] **3.1 Update home metadata and canonical positioning**
  - Align title, description, Open Graph intent, and landing copy with B2B AI lead discovery/outreach.
- [x] **3.2 Update JSON-LD and FAQ answers**
  - Preserve valid Organization/SoftwareApplication/FAQPage structure and remove obsolete Gemini references.
- [x] **3.3 Verify robots, sitemap, and `llms.txt`**
  - Ensure public marketing routes remain crawlable and answer-extractable.

## Phase 4 — Authenticated UX

- [x] **4.1 Refactor the desktop and mobile app navigation**
  - Group existing views into Workspace, Organize, and Manage without changing view IDs or query handling.
- [x] **4.2 Improve dashboard onboarding and next-action hierarchy**
  - Surface recent searches, lead inventory, campaigns, and one clear starting action using existing data.
- [x] **4.3 Refine search form and multi-city disclosure**
  - Preserve `SearchFilters` and `searchPlaces(query, filters, ...)`; improve defaults and explanation.
- [x] **4.4 Improve result loading, empty, error, and mobile action states**
  - Preserve results, save, export, campaign, and deduplication behavior.

## Phase 5 — Validation

- [x] **5.1 Run type checking and existing tests**
- [x] **5.2 Add or update interaction tests for primary CTA and navigation behavior**
- [x] **5.3 Run production build and route smoke checks**
- [x] **5.4 Review responsive, keyboard, semantic, contrast, and reduced-motion behavior**
- [x] **5.5 Verify backend variables, API routes, and payload contracts are unchanged**

## Phase 6 — Delivery

- [x] **6.1 Update this task file and feature plan with implementation results**
- [x] **6.2 Commit and push the redesign branch**
- [x] **6.3 Restart and deliver the verified preview**
