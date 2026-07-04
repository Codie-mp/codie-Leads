# Specification: Next.js App Router Migration

## 1. What are we building?

We are migrating the entire Codie-Leads frontend from a Vite Single Page Application (SPA) using `react-router-dom` to a Next.js App Router application. The backend will remain an Express application, but the repository structure will be adapted to support both the Next.js frontend and the Express backend, potentially sharing types and configurations.

## 2. Why are we building it?

The current Vite SPA architecture is fundamentally incompatible with the project's strict SEO and GEO (Generative Engine Optimization) requirements. SPAs render content entirely on the client side, which means traditional search engines and AI crawlers often see a blank page or have to execute heavy JavaScript to index the content. 

By migrating to Next.js App Router, we gain:
1.  **Server-Side Rendering (SSR) & Static Site Generation (SSG)**: Content is fully rendered on the server, ensuring instant visibility to all crawlers.
2.  **React Server Components (RSC)**: Reduced client-side JavaScript bundle sizes, leading to faster load times (better Core Web Vitals).
3.  **Built-in SEO Tools**: Native support for metadata generation, sitemaps, and robots.txt.
4.  **Route-based Code Splitting**: Improved performance by only loading the code necessary for the current route.

## 3. Scope of Migration

The migration encompasses the following areas:

1.  **Project Initialization**: Setting up the Next.js App Router environment (`app/` directory).
2.  **Routing Translation**: Converting `react-router-dom` routes (`src/App.tsx`) to Next.js file-system based routing (`app/page.tsx`, `app/dashboard/page.tsx`, etc.).
3.  **Component Adaptation**: 
    *   Identifying which components can remain React Server Components (RSCs) and which must become Client Components (`"use client"`).
    *   Replacing `react-router-dom` hooks (`useNavigate`, `useLocation`) with Next.js equivalents (`useRouter`, `usePathname` from `next/navigation`).
4.  **State Management**: Adapting the Zustand store (`useLeadStore.ts`) to work correctly in a Next.js environment (ensuring it's only initialized on the client side where necessary).
5.  **API Integration**: Ensuring the Next.js frontend can seamlessly communicate with the existing Express backend.
6.  **SEO/GEO Implementation**: Adding route-level metadata, JSON-LD structured data, and ensuring the `llms.txt` and `PERFECT_ICP_GUIDE.md` are correctly served.

## 4. Constraints & Out of Scope

*   **Backend Rewrite**: The Express backend will NOT be rewritten into Next.js API routes (`app/api/...`). The Express server is already robust and handles complex tasks (like streaming and TiDB connections). We will maintain a separate Express backend process.
*   **Database Schema Changes**: No changes will be made to the Drizzle schema or TiDB database structure during this migration.
*   **Feature Additions**: No new product features will be added during this migration; the goal is feature parity with the current Vite SPA.
