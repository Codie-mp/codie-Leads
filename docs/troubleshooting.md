# Troubleshooting

If local startup fails, verify Node 20+, `npm install`, port 3000, and database connectivity. If auth fails, check JWT secrets, user/company state, and token expiry. If OTPs do not arrive, verify SMTP precedence, credentials, TLS/port, sender authorization, and provider logs; OTP values are never logged.

If SuperAdmin statistics report unknown columns, run the application’s idempotent schema synchronization against the intended database and inspect migration logs. If search fails, check active subscription, credit balance, AI provider configuration, SSE handling, and rate limits. If saved leads fail, inspect tenant ownership, database errors, and deduplication identifiers.

If the build fails, run `npm run type-check`, remove only disposable `.next`/`dist` output, inspect the first compiler error, and rerun. If E2E returns 500, confirm the local server is fresh and schema synchronization completed. If deployment fails, check the custom-server start command, secrets, health endpoint, TLS/proxy forwarding, and database allowlist.
