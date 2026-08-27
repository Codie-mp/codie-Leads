# Routes

## Page routes

| Route | Owner | Access | Purpose |
|---|---|---|---|
| `/` | Marketing/shared | Public | B2B prospecting landing page, pricing, FAQ, and CTA. |
| `/login` | `features/auth` | Public | Sign in, verification, reset, and resend flows. |
| `/register` | `features/auth` | Public | Registration flow rendered by LoginPage. |
| `/accept-invite` | `features/auth` | Public tokenized flow | Accept workspace invitation. |
| `/app` | Shared workspace | Authenticated | Search, leads, campaigns, settings, billing, and dashboard. |
| `/superadmin` | `features/admin` | SuperAdmin | Platform administration and operational controls. |
| `/privacy` | Public content | Public | Privacy policy. |
| `/terms` | Public content | Public | Terms of service. |

Generated resources include `/robots.txt`, `/sitemap.xml`, and the root not-found page. Metadata is defined at route level where applicable; private routes use no-index directives.

## API routing

Express owns `/api/auth`, `/api/gemini`, `/api/leads`, `/api/campaigns`, `/api/billing`, `/api/categories`, `/api/company-admin`, `/api/superadmin`, `/api/public`, `/api/notifications`, `/api/extension`, `/api/keys`, `/api/webhooks`, and versioned API surfaces. The exact handler source is the canonical contract; see [`api.md`](api.md).

## Verification

Route verification is covered by Vitest routing/auth tests, `scripts/e2e-smoke.ts`, production build generation, and local route smoke checks. Full browser journeys and authenticated multi-city interaction remain planned coverage.
