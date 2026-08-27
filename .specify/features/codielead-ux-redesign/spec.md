# CodieLead UX and Landing-Page Redesign Specification

## Problem

CodieLead currently has the capabilities needed for B2B lead discovery, but the public positioning and in-product flow do not make the path from ideal customer profile to usable outreach list obvious enough. The landing page reads as a broad lead-generation tool, the primary call to action is split between trial and demo behavior, and the authenticated shell presents too many destinations with equal visual weight. A first-time user should understand the product in seconds, start an ICP search without training, recognize why a lead is useful for cold outreach, and move naturally from discovery to saved leads or campaigns.

## Product promise

CodieLead helps B2B teams turn an ICP into a clean, deduplicated, outreach-ready prospect list. It combines AI-assisted search, Google Maps and web-grounded business discovery, multi-city targeting, enrichment, and campaign preparation in one workspace.

## Goals

1. Make the public landing page clearly communicate the B2B outbound use case, target buyer, workflow, and expected outcome.
2. Establish one dominant conversion path: start a free workspace, with sign-in and plan-specific billing behavior preserved.
3. Show the product in action through an authentic, lightweight interface preview rather than decorative gradients or generic imagery.
4. Make the authenticated experience task-oriented: discover, qualify, organize, and activate.
5. Reduce search friction by presenting the ICP, location, and result-quality controls in a progressive-disclosure flow.
6. Preserve every existing backend variable, API endpoint, query-string contract, database field, and service signature.
7. Improve semantic SEO/GEO through concise answer-first content, current provider language, metadata, JSON-LD, internal links, and accessible server-rendered marketing copy.
8. Keep all experiences mobile-first, keyboard accessible, and resilient when pricing or search data is loading or unavailable.

## Non-goals

This redesign will not replace the Express backend, change AI-provider configuration, rename database columns, alter authentication or billing APIs, introduce a new CRM integration, or claim unsupported email/contact verification capabilities. It will not invent customer logos, testimonials, performance metrics, or deliverability claims without verified source data.

## Target audiences

| Audience | Primary job | Main pain point | Desired outcome |
|---|---|---|---|
| Founder-led B2B seller | Find a focused local or vertical prospect list quickly | Prospecting is manual and inconsistent | A usable list in minutes |
| Agency or SDR team | Repeat ICP searches across cities and campaigns | Duplicate data and fragmented tools | Clean lists with repeatable workflows |
| GTM operator | Enrich, segment, and hand off leads | Search results are disconnected from activation | Leads that are ready to save, export, or campaign |

## User journeys

### New visitor to first search

A visitor lands on the page, immediately understands that CodieLead finds B2B prospects for outbound, sees a concise three-step workflow, reviews a product preview, and selects **Start free**. The CTA must route to the existing `/register?plan=...` contract when a plan is selected.

### First-time workspace search

A new user sees a single guided search surface with an ICP prompt, example queries, location mode, and optional filters. The first action should not require understanding every advanced filter. Search continues to call the existing `searchPlaces(query, filters, ...)` service contract.

### Search to activation

After results stream in, the user can understand why a result matches, see deduplication and data-quality signals where available, select leads, save/export them, or move them to campaigns using existing actions and stores. No backend response shape is changed.

### Returning user

A returning user lands on a concise dashboard showing recent searches, lead inventory, campaign progress, and one primary next action. Existing view identifiers remain valid: `dashboard`, `search`, `scrape`, `saved`, `campaigns`, `settings`, and `billing`.

## Landing-page information architecture

1. **Navigation:** logo, Product, How it works, Pricing, Sign in, and one primary Start free CTA.
2. **Hero:** category eyebrow, outcome-led headline, concrete subheading, primary CTA, secondary product-tour anchor, and trust microcopy that does not make unsupported claims.
3. **Workflow:** Define ICP → Find the right businesses → Activate outreach.
4. **Product proof:** a lightweight, real UI composition showing the search brief, multi-city controls, streaming results, fit signals, and action bar.
5. **Pain-point sections:** poor targeting, duplicate lists, and slow handoff, each paired with the CodieLead workflow that resolves it.
6. **Use-case strip:** agencies, local B2B sellers, and lean sales teams.
7. **Pricing:** database-backed plans with a robust loading state and existing plan query parameters preserved.
8. **FAQ:** answer-first questions about what CodieLead is, how AI search works, how multi-city search works, what data is returned, and how leads move into campaigns.
9. **Final CTA and footer:** one consistent destination and useful internal links.

## Authenticated information architecture

The app shell will use a mobile-first sidebar or compact navigation drawer with grouped destinations:

- **Workspace:** Overview, Find leads, ICP scraper.
- **Organize:** Saved leads, Campaigns.
- **Manage:** Billing, Settings.

The desktop view may use a collapsible sidebar, while mobile uses a drawer and a persistent primary action. Existing view state values and route query parameters must remain compatible.

## Visual direction

The visual language should feel like a focused revenue workspace rather than a generic AI experiment: warm off-white canvas, ink typography, electric blue as the action color, a restrained signal-green for qualified/success states, and amber only for attention states. Use a clear 12-column desktop grid, generous whitespace, compact data cards, subtle borders, and limited motion. Use real interface fragments with labels and annotations; avoid excessive blur, full-screen gradients, stock imagery, and unexplained decorative 3D elements.

## UX requirements

- Every primary screen has one clear primary action.
- Search exposes the simple path first and advanced filters second.
- Multi-city mode must visibly show selected cities, allow removal, and explain how it changes search coverage.
- Loading, empty, error, and partial-stream states must be explicit and actionable.
- Result actions remain visible on mobile through a sticky or context-aware action bar.
- Destructive actions require clear confirmation; bulk actions show selection counts.
- Focus states, contrast, labels, and keyboard behavior must meet WCAG 2.2 AA intent.
- Avoid unsupported “guaranteed” outcomes; use precise language such as “find,” “enrich,” “organize,” and “prepare.”

## Backend preservation contract

The redesign must not change environment variable names, Express route paths, request payload keys, response keys, Drizzle schema names, auth token storage names, billing query strings, or existing service signatures. Frontend refactors may introduce presentation components and view-model helpers, but data fetching and mutation behavior must continue to use existing APIs.

## Acceptance criteria

- A new visitor can state what CodieLead does and who it serves after viewing the hero.
- All landing-page primary CTAs preserve existing register/billing destinations.
- The landing page uses current Kimi/AI-neutral language and no obsolete Gemini claims.
- Pricing remains functional when the public pricing endpoint is delayed, empty, or unavailable.
- The authenticated shell is responsive and presents a clear discover-to-activate path.
- Search, multi-city selection, save/export, campaigns, billing, and settings remain operational.
- SEO metadata, JSON-LD, sitemap, robots, and `llms.txt` remain valid and aligned with the new messaging.
- Type checking, existing tests, new interaction tests, and production build pass.
