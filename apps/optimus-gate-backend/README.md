# Optimus Gate Backend

NestJS API for Optimus Gate. The backend owns authentication, businesses, API keys, billing plans, subscription checkout, renewal charging, Nomba integration, ledger entries, and dashboard read models consumed by the frontend.

This app lives inside the monorepo at:

```txt
apps/optimus-gate-backend
```

## Stack

- NestJS 11
- PostgreSQL
- Drizzle ORM and Drizzle Kit
- Passport JWT authentication
- API-key authentication for public checkout APIs
- BullMQ and Redis for scheduled renewal work
- Nomba checkout and transaction verification
- Jest for tests

## Main Modules

- `auth` - signup, login, refresh, logout, password reset, and `/auth/me`.
- `businesses` - default merchant business and customer records.
- `api-keys` - scoped merchant API keys for external integrations.
- `billing` - plans, subscriptions, invoices, payment attempts, checkout orders, dashboard billing routes, webhook handling, and renewals.
- `ledger` - available/pending account entries for credits, refunds, reversals, payouts, and adjustments.
- `nomba` - Nomba auth, checkout, transaction verification, and webhook signature helpers.
- `queues` - Redis/BullMQ queue setup and renewal processor wiring.
- `database` - Drizzle schemas and database provider.

## Environment

Create an `.env` file in `apps/optimus-gate-backend`.

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/optimus_gate

JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=Optimus Gate <notifications@yourdomain.com>
SMTP_SECURE=false
APP_FRONTEND_URL=http://localhost:3000

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# or
REDIS_URL=redis://127.0.0.1:6379

NOMBA_BASE_URL=https://api.nomba.com
NOMBA_ACCOUNT_ID=
TEST_NOMBA_CLIENT_ID=
TEST_NOMBA_PRIVATE_KEY=
NOMBA_WEBHOOK_SECRET=
```

The app has development fallbacks for several values, but real database, JWT, Redis, and Nomba values should be set for meaningful billing flows.

## Getting Started

Install dependencies from the monorepo root:

```bash
npm install
```

Run the backend:

```bash
cd apps/optimus-gate-backend
npm run start:dev
```

By default the API listens on:

```txt
http://localhost:4000
```

## Database

Drizzle reads schemas from:

```txt
src/database/schemas/*.schema.ts
```

Useful commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
npm run db:seed
```

The default local connection used by Drizzle is:

```txt
postgresql://postgres:postgres@localhost:5432/optimus_gate
```

Set `DATABASE_URL` to override it.

## Auth

JWT auth is used for dashboard and merchant-owner routes. Refresh tokens are stored and validated by the backend.

Important routes:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

## API Keys

API keys are used by external checkout integrations. A created key is returned once; only its hash and public prefix are stored.

Routes:

- `POST /api-keys`
- `GET /api-keys`
- `PATCH /api-keys/:id`
- `POST /api-keys/:id/revoke`

## Billing and Checkout

Dashboard billing routes use JWT auth:

- `GET /billing/dashboard/stats`
- `GET /billing/plans`
- `POST /billing/plans`
- `GET /billing/subscribers`
- `GET /billing/subscriptions`
- `GET /billing/transactions`
- `GET /billing/refunds`
- `GET /billing/payouts`
- `GET /billing/subaccounts`
- `GET /billing/onboarding/checklist`

Public checkout routes are under `/v1`. The subscription checkout creation route accepts either a merchant API key or a dashboard JWT:

- `POST /v1/checkout/subscriptions/start`
- `GET /v1/checkout/orders/:orderReference`

The frontend uses the JWT path to create a checkout link from a plan modal. External customers or third-party integrations should use API-key auth.

## Webhooks and Renewals

Nomba webhooks are received at:

```txt
POST /webhook
```

The backend preserves raw request bodies for webhook verification while still parsing JSON for the rest of the API.

Renewal processing is queued through BullMQ. Redis must be available when running renewal workers or scheduled renewal flows.

## Development Commands

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

Lint and type checks:

```bash
npx eslint "{src,apps,libs,test}/**/*.ts"
npx tsc --noEmit --incremental false
```

The package script `npm run lint` runs ESLint with `--fix`.

## Frontend Integration

The frontend should point to this service with:

```env
OPTIMUS_GATE_BACKEND_URL=http://localhost:4000
```

The frontend dashboard calls backend routes from server components and server actions, so access tokens are kept in HTTP-only cookies and are not exposed to browser-side JavaScript.
