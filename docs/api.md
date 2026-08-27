# API Reference

## Conventions

API requests use JSON where applicable and authenticated requests send `Authorization: Bearer <accessToken>`. Responses use stable JSON keys and normalized errors; do not rename keys without a compatibility review. Validation belongs at the route boundary. Protected search/AI routes also enforce an active company subscription, except SuperAdmin bypasses where explicitly implemented.

## Endpoint groups

`/api/auth` handles registration, login, OTP verification/resend, password reset, refresh, and invite acceptance. `/api/gemini` handles keywords, niches, enrichment, ICP scrape, generation, and streaming search. `/api/leads`, `/api/campaigns`, `/api/categories`, `/api/billing`, `/api/company-admin`, `/api/notifications`, `/api/extension`, `/api/keys`, `/api/public`, and `/api/superadmin` provide their corresponding domains. Route source files under `src/server/routes` are authoritative.

## Search and SSE

`POST /api/gemini/search` returns `text/event-stream`. Events use `data: {"places":[...]}` for incremental results and a final `data: {"done":true,"places":[...]}` event. Errors are emitted as SSE data and the stream closes. `POST /api/gemini/scrape` returns `{ results: [...] }`; credit failure returns HTTP 402.

## Public pricing

The landing page consumes `/api/public/pricing-plans`. Preserve its response shape and fallback behavior when changing pricing UI.

## Errors and limits

Auth routes return validation/status errors and may include `Retry-After` for OTP resend throttling. Avoid leaking whether an email exists or exposing stack traces, tokens, SQL, or provider credentials. For a complete endpoint contract, inspect the relevant router and add tests before documenting new fields.
