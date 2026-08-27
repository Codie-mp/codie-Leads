# Technical Plan: Next.js App Router Migration

## 1. Architecture Strategy: Custom Server vs. Monorepo

Since we must keep the Express backend and introduce a Next.js frontend, we have two primary architectural choices:

1.  **Next.js Custom Server**: Integrate Express directly into Next.js using a custom `server.ts` file.
2.  **Monorepo / Separate Processes**: Keep the Next.js frontend and Express backend as separate processes, potentially managed by a tool like Turborepo or just concurrently via `npm-run-all`.

**Decision: Next.js Custom Server**
Given the existing codebase structure where the Express server also serves the Vite SPA in production (via `vite.middlewares` in dev and static files in prod), adapting this to a Next.js Custom Server is the most direct path. We will replace the Vite middleware with Next.js request handling.

## 2. Project Structure Reorganization

We will restructure the repository to support Next.js:

*   `app/`: New Next.js App Router directory.
*   `src/components/`: Existing React components (will need `"use client"` directives added where state/effects are used).
*   `src/server/`: Existing Express backend (remains largely unchanged).
*   `src/store/`: Existing Zustand stores.
*   `src/lib/`: Existing utilities and schemas.

## 3. Step-by-Step Implementation Plan

### Step 1: Dependencies and Config
*   Remove Vite and related dependencies (`vite`, `@vitejs/plugin-react`, etc.).
*   Install Next.js dependencies (`next`, `react`, `react-dom`).
*   Update `tsconfig.json` to support Next.js (`"jsx": "preserve"`, Next.js specific plugins).
*   Create `next.config.mjs`.

### Step 2: Server Integration
*   Update `src/server/index.ts`.
*   Remove Vite middleware logic.
*   Initialize Next.js app (`next({ dev })`).
*   Create a catch-all route in Express (`app.all('*', (req, res) => handle(req, res))`) to pass non-API requests to Next.js.

### Step 3: Routing Migration (`app/` directory)
*   Analyze `src/App.tsx` (the current React Router setup).
*   Create corresponding directories and `page.tsx` files in `app/`.
    *   `app/page.tsx` (Landing Page)
    *   `app/dashboard/page.tsx` (Dashboard)
    *   `app/scrape/page.tsx` (Scrape View)
    *   etc.
*   Create `app/layout.tsx` to handle the global HTML structure, providers (like AuthProvider if it exists), and global styles.

### Step 4: Component Adaptation
*   Add `"use client"` to components that use `useState`, `useEffect`, or Zustand (`useStore`).
*   Replace `Link` from `react-router-dom` with `Link` from `next/link`.
*   Replace `useNavigate` with `useRouter` from `next/navigation`.

### Step 5: SEO and GEO Implementation
*   Implement `generateMetadata` in `app/layout.tsx` and specific `page.tsx` files.
*   Add a static `app/robots.txt` and `app/sitemap.ts`.
*   Ensure `public/llms.txt` is accessible.
*   Implement JSON-LD structured data on the landing page.

### Step 6: Build and Run Scripts
*   Update `package.json` scripts:
    *   `"dev"`: Run the custom Express server (which starts Next.js in dev mode).
    *   `"build"`: Run `next build` AND compile the Express server.
    *   `"start"`: Run the compiled Express server (which serves the built Next.js app).

## 4. Risk Mitigation

*   **Zustand Hydration**: Zustand can cause hydration mismatches in SSR if not handled carefully. We will ensure the store is only hydrated on the client or use a provider pattern if necessary.
*   **Express/Next.js Port Conflicts**: By using a custom server, both run on the same port, avoiding CORS issues and simplifying deployment.
