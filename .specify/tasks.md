# Tasks: GTM Maps Lite Integration

## Phase 1: Setup & Backend Integration

- [ ] **Task 1.1: Create feature branch**
  - Action: Create and checkout branch `feat/gtm-maps-lite-nextjs`.

- [ ] **Task 1.2: Port Gemini Service Logic**
  - Action: Copy `gemini-server.ts` from the ZIP to `src/server/services/geminiService.ts` (or similar).
  - Details: Ensure it uses the existing `@google/genai` package and handles the streaming logic correctly.

- [ ] **Task 1.3: Update Express Routes**
  - Action: Update `src/server/routes/gemini.ts` to include the new endpoints (`/search`, `/keywords`, `/niches`, `/enrich`) from the prototype's `server.ts`.
  - Details: Ensure the `/search` endpoint correctly sets headers for Server-Sent Events (`text/event-stream`).

## Phase 2: Frontend State & Utilities

- [ ] **Task 2.1: Update Zustand Store**
  - Action: Apply the diffs to `src/store/useLeadStore.ts`.
  - Details: Add `updateCategory` and fix the `fetchData` JSON parsing.

- [ ] **Task 2.2: Add Error Handler**
  - Action: Copy `src/lib/errorHandler.ts` from the ZIP to the repo.

- [ ] **Task 2.3: Update Frontend Gemini Service**
  - Action: Apply the diffs to `src/services/gemini.ts`.
  - Details: Update the `SearchFilters` interface and the API call wrappers.

## Phase 3: UI Component Migration

- [ ] **Task 3.1: Copy New Components**
  - Action: Copy `CategoryManagerModal.tsx` from the ZIP to `src/components/`.

- [ ] **Task 3.2: Update Search Components**
  - Action: Apply diffs to `SearchForm.tsx`.
  - Details: Ensure any routing uses `next/link` or Next.js router if applicable (though it appears to be mostly state-driven).

- [ ] **Task 3.3: Update ScrapeView**
  - Action: Apply diffs to `ScrapeView.tsx`.
  - Details: Integrate the new error handling and updated UI elements.

- [ ] **Task 3.4: Update DashboardView**
  - Action: Apply diffs to `DashboardView.tsx`.
  - Details: Apply the styling changes (purple to blue).

## Phase 4: SEO/GEO & Finalization

- [ ] **Task 4.1: Add llms.txt**
  - Action: Create `public/llms.txt` with a brief description of the Codie-Leads application for AI crawlers.

- [ ] **Task 4.2: Add ICP Guide**
  - Action: Copy `PERFECT_ICP_GUIDE.md` from the ZIP to a suitable location (e.g., `public/docs/` or as a new Next.js page if it should be public).

- [ ] **Task 4.3: Type Checking & Linting**
  - Action: Run `npm run lint` (`tsc --noEmit`) and fix any strict-mode errors introduced by the new code.

- [ ] **Task 4.4: Commit and Push**
  - Action: Commit all changes and push the branch to origin.
