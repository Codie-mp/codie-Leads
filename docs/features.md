# Features

## Prospecting

Search accepts a natural-language query or ICP. Smart Search streams place results through SSE and passes existing company lead names/domains to deduplication. ICP scraping charges three credits per requested lead, applies rating/price/keyword filters, and removes database duplicates before returning results.

## Geography and lead management

Multi-city targeting is represented in search filters and the location map. Users can review, sort, filter, save, bulk-save, enrich, tag, categorize, export spreadsheet-compatible CSV or JSON, and manage leads in list or Kanban views. Lead ownership is company-scoped.

## Outreach and campaigns

Campaigns organize selected leads and support outreach drafting with AI personalization. Production integrations must be configured explicitly; UI simulations are not evidence of external delivery.

## Billing and InstaPay

Billing exposes plan/subscription state and credit balances. InstaPay is currently manual receipt-based because an automated provider contract is unavailable; approval and credit grant operations are privileged and must be audited.

## Administration

SuperAdmin surfaces include platform statistics, companies, users, subscriptions, credit packages, AI models, activity, API keys, and R2 account controls. SuperAdmin operations require separate authorization and must preserve cross-company isolation.

## Integrations

Optional integrations include SMTP/email, Redis, S3/R2 storage, HubSpot/CRM, AI/search providers, webhooks, and browser-extension lead intake. Each integration is failure-prone and must be treated as an external boundary.
