# Tasks: Next.js App Router Migration

## Phase 1: Setup & Configuration

- [ ] **Task 1.1: Dependency Updates**
  - Action: Uninstall Vite and related packages. Install `next`, `react`, `react-dom`.
  - Details: Ensure React versions are compatible with Next.js 14+.

- [ ] **Task 1.2: Configuration Files**
  - Action: Create `next.config.mjs`. Update `tsconfig.json` for Next.js compatibility.
  - Details: Configure `tsconfig.json` to include the `.next` directory and use `"jsx": "preserve"`.

## Phase 2: Server Integration

- [ ] **Task 2.1: Update Express Server (`src/server/index.ts`)**
  - Action: Remove Vite middleware. Integrate Next.js custom server logic.
  - Details: Initialize `next({ dev })`, get the request handler, and route all non-`/api` requests to Next.js.

- [ ] **Task 2.2: Update Build Scripts**
  - Action: Modify `package.json` scripts (`dev`, `build`, `start`).
  - Details: Ensure the build process compiles both the Next.js app and the Express server.

## Phase 3: Routing & Layout Migration

- [ ] **Task 3.1: Global Layout (`app/layout.tsx`)
  - Action: Create the root layout. Move global CSS imports and HTML shell structure here.
  - Details: Include any global providers (e.g., Toast providers, Auth contexts) as Client Components if necessary.

- [ ] **Task 3.2: Page Creation**
  - Action: Create `app/page.tsx` (Landing), `app/dashboard/page.tsx`, etc., based on `src/App.tsx` routes.
  - Details: Initially, just render the corresponding existing components within these pages.

## Phase 4: Component Adaptation

- [ ] **Task 4.1: Client Component Directives**
  - Action: Add `"use client"` to all components in `src/components/` that use React state, effects, or Zustand.

- [ ] **Task 4.2: Navigation Updates**
  - Action: Replace all instances of `react-router-dom` with Next.js equivalents (`next/link`, `next/navigation`).
  - Details: Update `useNavigate` to `useRouter`, and `Link` components.

## Phase 5: SEO & GEO

- [ ] **Task 5.1: Metadata Implementation**
  - Action: Add `export const metadata` to `app/layout.tsx` and key pages.

- [ ] **Task 5.2: Sitemap & Robots**
  - Action: Create `app/sitemap.ts` and `app/robots.txt`.

- [ ] **Task 5.3: JSON-LD**
  - Action: Add a structured data script tag to the landing page (`app/page.tsx`).

## Phase 6: Finalization

- [ ] **Task 6.1: Type Checking**
  - Action: Run `npx tsc --noEmit` and resolve any strict mode errors.

- [ ] **Task 6.2: Cleanup**
  - Action: Delete `src/App.tsx`, `index.html` (Vite's entry point), and any other obsolete Vite files.

- [ ] **Task 6.3: Commit and Push**
  - Action: Commit all changes to the feature branch and push.

## Feature Enhancement Continuation — Completed

- [x] **Smart Search: database-backed deduplication**
  - Added `src/server/services/leadService.ts` to load company-scoped lead names and normalized website domains.
  - Updated `/api/gemini/scrape` and `/api/gemini/search` to use authenticated company records rather than relying only on client-supplied exclusions.
  - Deduplication now checks both normalized names and domains.

- [x] **Multi-city search support**
  - Existing multi-city filter data is recognized by the search service and passed through the AI search pipeline.

- [x] **SuperAdmin dashboard wiring**
  - User deletion uses `DELETE /users/:id` while updates continue to use `PUT`.
  - Platform Theming remains available through the existing inline panel and `/platform-settings` API.
  - Activity Logs tab identifier, loader branch, and API timestamp rendering are aligned with `/activity`.
  - Credit Packages and AI Models tabs/modal flows are present and connected to their CRUD endpoints.

- [x] **InstaPay checkout method**
  - Existing billing flow supports InstaPay manual payment submission with receipt URL and SuperAdmin approval queue.
  - Official documentation review confirmed that Egypt's InstaPay public site describes the payment network but does not expose a public merchant checkout API in the available sources; no undocumented API credentials or endpoints were invented.

- [x] **Validation**
  - TypeScript: `npx tsc --noEmit` passed.
  - Vitest: 2 test files and 5 tests passed.
  - Added the Vite 6-compatible `@vitejs/plugin-react@5.0.4` development dependency required by the existing Vitest configuration.

## Notes

The active working branch is `feat/smart-search-multicity-superadmin-instapay`, based on the repository's migrated Next.js branch. Payment automation remains intentionally receipt-based until the merchant account/API contract for InstaPay is supplied by the provider.
