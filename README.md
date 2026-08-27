# CodieLead

CodieLead is an AI-powered B2B lead-generation SaaS built with Next.js 15, an Express custom server, Drizzle ORM, and TiDB/MySQL.

## Run locally

**Prerequisites:** Node.js 20 or newer and a reachable TiDB/MySQL database.

```bash
npm install
npm run dev
```

The application runs on `http://localhost:3000` by default.

## Required environment variables

Create a local `.env` or `.env.local` file. Do not commit it.

```dotenv
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=4000
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
```

The AI search configuration should be supplied according to the active provider configuration used by the deployment.

## OTP email delivery

Registration, unverified login, verification-code resend, and password reset require working SMTP credentials. The server no longer reports success when email delivery is unconfigured or rejected.

For Gmail, create an App Password for the sending account and configure:

```dotenv
GMAIL_USER=sender@example.com
GMAIL_APP_PASSWORD=16-character-app-password
```

For another SMTP provider, configure:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sender@example.com
SMTP_PASSWORD=provider-password
SMTP_FROM=CodieLead <sender@example.com>
```

`SMTP_*` values take precedence over the Gmail variables. `SMTP_SECURE=true` or port `465` enables TLS mode. The server logs a delivery failure and returns an error to the client when the provider rejects a message; OTP codes are never logged.

## OTP protection

OTP requests are protected in two layers. Each account has a 60-second cooldown between sends, and no account may request more than three codes in a rolling 15-minute window. The counters are persisted in the `users` table, so restarting the server does not reset the protection. The client displays the remaining resend cooldown and honors the server-provided retry interval.

## Production build

```bash
npm run build
npm start
```

The build creates the Next.js production output and bundles the Express server into `dist/server.cjs`. The runtime must provide the environment variables above and use a persistent Node.js hosting service that supports a custom server.

## Validation

```bash
npm run type-check
npm test
```
