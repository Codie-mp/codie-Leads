# Technical Plan: GTM Maps Lite Integration

## 1. Architecture Overview

The integration involves porting React components and Express API routes from the prototype into the Next.js/Express architecture of Codie-Leads.

*   **Frontend (Next.js)**: New components will be added to `src/components`. Existing views (e.g., `ScrapeView`, `DashboardView`) will be updated to incorporate the new features. We will use Client Components (`"use client"`) where state and interactivity (like streaming search results) are required, but ensure that any public-facing landing pages remain Server Components for SEO.
*   **Backend (Express)**: The Gemini streaming search logic from the prototype's `server.ts` will be ported to the existing Express backend, likely under `src/server/routes/gemini.ts`.
*   **State Management**: The Zustand store (`src/store/useLeadStore.ts`) will be updated to handle the new state requirements.

## 2. Component Migration Strategy

The following components from the ZIP will be copied to `src/components/` and adapted for Next.js:

*   `SearchForm.tsx`: Needs to ensure compatibility with Next.js routing if it handles navigation.
*   `ResultsTable.tsx` & `ResultsSkeleton.tsx`: UI components for displaying data.
*   `CategoryManagerModal.tsx`: New UI component.
*   `ScrapeView.tsx`: Will be updated to use the new `SearchForm` and handle the streaming response from the backend.
*   `DashboardView.tsx`: Minor UI updates based on the diff (e.g., color changes from purple to blue).

## 3. Backend API Migration Strategy

The prototype's `server.ts` contains several `/api/gemini/*` endpoints. These need to be integrated into the Express server in `src/server/routes/gemini.ts`.

*   `POST /api/gemini/search`: The core streaming endpoint. It uses `GoogleGenAI` with `googleMaps` and `googleSearch` tools. This logic (`searchPlaces` from `gemini-server.ts`) will be moved to the backend service layer and exposed via this route. It must handle `text/event-stream` responses correctly.
*   `POST /api/gemini/keywords`, `POST /api/gemini/niches`, `POST /api/gemini/enrich`: Supporting endpoints that need to be ported.

## 4. State Management Updates

The `useLeadStore.ts` needs to be updated based on the diff:
*   Add `updateCategory` action.
*   Fix the `fetchData` JSON parsing logic.

## 5. SEO & GEO Considerations

*   The `ScrapeView` is an internal tool, so traditional SEO is less critical here. However, any public-facing documentation (like the ICP guide) should be rendered server-side.
*   We will add an `llms.txt` file to the `public` directory to satisfy the GEO requirement, providing a summary of the application for AI crawlers.

## 6. Dependencies

We need to ensure the following dependencies from the prototype are present in the `package.json`:
*   `@google/genai` (Already present)
*   `sonner` (For toast notifications, already present)
*   `lucide-react` (Already present)
