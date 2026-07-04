# Specification: GTM Maps Lite Feature Merge

## 1. What are we building?

We are merging the "GTM Maps Lite" feature set from an external, Remix-based prototype into the core Codie-Leads Next.js application. This feature provides a colorful, lightweight tool for Go-To-Market (GTM) Engineers to discover and export public business data using Google Maps grounding via the Gemini AI model.

## 2. Why are we building it?

The current Codie-Leads application needs enhanced lead discovery capabilities. The prototype demonstrated a highly effective, AI-driven approach to finding leads using natural language Ideal Customer Profiles (ICPs) and Google Search Grounding. By integrating this into the core app, we empower users to generate high-quality, enriched leads directly within the platform, improving the core value proposition of the SaaS.

## 3. Key Features to Integrate

The following capabilities from the prototype must be integrated into the Next.js application:

1.  **AI-Powered Intent Search**: A search interface (`SearchForm`) that accepts natural language ICP queries and filters (rating, price level, keywords, location limits).
2.  **Streaming Lead Discovery**: Integration with the Gemini API to stream lead results back to the client in real-time, parsing markdown tables into structured lead data (`ScrapeView`, `gemini-server.ts`).
3.  **Google Maps Grounding**: Utilizing Gemini's Google Search and Google Maps grounding tools to find accurate business information, including exact Google Maps URLs, ratings, and contact details.
4.  **Results Visualization**: Displaying the discovered leads in a tabular format (`ResultsTable`) with options to export to CSV/Excel.
5.  **Enhanced Error Handling**: Improved user feedback for API limits, timeouts, and configuration errors (`errorHandler.ts`).
6.  **Category Management**: A modal interface (`CategoryManagerModal`) for organizing saved leads.
7.  **ICP Generation Guide**: Providing users with the `PERFECT_ICP_GUIDE.md` content to help them write effective search queries.

## 4. Constraints & Out of Scope

*   **Framework**: The prototype was built in Remix (or Vite SPA). The integration MUST be implemented using Next.js App Router (React Server Components, `page.tsx`, etc.).
*   **Database**: The prototype used SQLite (`better-sqlite3`). The core app uses TiDB (MySQL). All database interactions must use the existing Drizzle ORM setup connected to TiDB.
*   **SEO/GEO**: The integration must adhere to the strict SEO and GEO requirements outlined in the constitution, prioritizing SSR for indexable content.
