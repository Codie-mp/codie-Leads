# CodieLead

CodieLead is an AI-assisted B2B prospecting workspace. It turns an ideal customer profile into searchable, deduplicated, outreach-ready lead lists with multi-city targeting, enrichment, campaigns, billing, and administrative controls.

## Quick start

Prerequisites are Node.js 20+, npm, and a reachable TiDB/MySQL-compatible database. Copy the required variables into `.env.local`, install dependencies, and start the development server:

```bash
npm install
npm run dev
```

The local application is normally available at `http://localhost:3000`. Never commit `.env`, tokens, passwords, database credentials, SMTP credentials, or AI keys.

## Environment

Database variables are `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT`. Authentication requires long random `JWT_SECRET` and `JWT_REFRESH_SECRET` values. AI/search configuration uses the provider variables configured for the deployment. OTP delivery uses either `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`, or `GMAIL_USER` and `GMAIL_APP_PASSWORD`; SMTP variables take precedence. Optional integrations include Redis, S3/R2, HubSpot, and payment configuration. Consult `docs/deployment.md` for the full environment matrix.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development custom server. |
| `npm run build` | Next.js production build plus Express bundle. |
| `npm start` | Run the bundled production server. |
| `npm run lint` | ESLint CLI using the flat configuration. |
| `npm run type-check` | Strict TypeScript validation. |
| `npm test` | Vitest unit and integration suite. |
| `npm run test:e2e` | Dependency-light local HTTP smoke journey. |
| `npm audit --omit=dev --audit-level=high` | Production dependency security gate. |
| `npm run docs:check` | Validate required docs, links, stale references, and secret-like patterns. |

## Architecture and routes

Next.js App Router pages live in `src/app`; the custom Node/Express server owns `/api/*` and delegates page rendering to Next. Feature entrypoints are under `src/features/{auth,search,leads,campaigns,billing,admin,shared}`. Atomic UI entrypoints are under `src/components/ui/{atoms,molecules,organisms}`. Detailed ownership is in [`docs/architecture.md`](docs/architecture.md) and [`docs/routes.md`](docs/routes.md).

Current page routes are `/`, `/login`, `/register`, `/accept-invite`, `/app`, `/superadmin`, `/privacy`, and `/terms`. Search and AI behavior is protected by authentication and active-subscription checks. SuperAdmin access requires the SuperAdmin authorization boundary.

## Product workflows

Users define an ICP, optionally choose filters and multiple cities, run Smart Search or ICP scraping, review deduplicated results, save leads, enrich them, export spreadsheet-compatible CSV or JSON, and add selected leads to campaigns. Billing supports plans and the current manual receipt-based InstaPay process. See [`docs/features.md`](docs/features.md).

## Security, testing, and release status

Authentication uses JWT access/refresh tokens, hashed passwords, OTP expiry and resend limits, active-company checks, and tenant-scoped data access. All critical automated gates currently pass, including 55 Vitest tests across 10 files, lint, type-check, E2E smoke, production build, and the high-severity production audit. The product is not yet unconditionally production-ready because browser-level authenticated E2E, remaining SuperAdmin mutation hardening, staging migration rehearsal, observability, backup/restore, and load testing remain. See [`docs/production-readiness.md`](docs/production-readiness.md).

## Documentation map

Start with [`docs/index.md`](docs/index.md). The documentation is intentionally explicit about verified behavior, assumptions, and open risks. Contributions follow the spec-kit process described in [`docs/contributing.md`](docs/contributing.md).
