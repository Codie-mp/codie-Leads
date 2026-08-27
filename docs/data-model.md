# Data Model

## Ownership

The principal tenancy boundary is the company/workspace. Users belong to companies; leads, campaigns, categories, transactions, subscriptions, activity, and integration records must be scoped to the authenticated company unless an explicitly authorized SuperAdmin operation is being performed.

## Major entities

| Entity | Responsibility |
|---|---|
| `companies` | Workspace identity, active state, plan, and credit balance. |
| `users` | Identity, role, verification, OTP/reset state, and invitation state. |
| `leads` | Company-owned prospect records and normalized deduplication fields. |
| `campaigns` | Outreach grouping and steps. |
| `subscriptions` | Plan, status, approval, expiry, and receipt workflow. |
| Credit transactions | Auditable grants, charges, and deductions. |
| Activity/integration records | Operational trace and external-service configuration. |

## Invariants

Passwords are hashed. OTP values expire and are cleared after successful use. Credits cannot become negative through normal deductions; charges and transaction history must remain auditable. Lead deduplication normalizes names and domains and is company-specific. Schema changes require reviewed, idempotent migrations; legacy compatibility synchronization exists for deployed databases.

## Privacy and retention

Do not place secrets or full credentials in logs or fixtures. Define retention and deletion policies before production launch, including account deletion, lead deletion, activity records, receipts, and backups. Use least-privilege database credentials and encrypted transport.
