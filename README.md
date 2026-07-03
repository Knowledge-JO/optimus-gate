# Optimus Gate

Optimus Gate is a subscription billing and checkout platform for merchants. The monorepo contains a Next.js dashboard frontend and a NestJS backend API that handles authentication, API keys, billing plans, subscription checkout, Nomba payment flows, ledger entries, and dashboard read models.

## Repository Layout

```txt
.
├── apps
│   ├── optimus-gate-frontend   # Next.js dashboard
│   └── optimus-gate-backend    # NestJS API
├── packages
│   ├── eslint-config           # shared ESLint config package
│   └── typescript-config       # shared TypeScript config package
├── package.json                # workspace and Turbo scripts
└── turbo.json                  # task pipeline
```

## Applications

### Frontend

Path:

```txt
apps/optimus-gate-frontend
```

The frontend is a Next.js App Router dashboard. It includes:

- auth pages
- protected dashboard shell
- dashboard metrics and operational tables
- plan creation and plan details modal
- checkout-link creation from a plan
- API-key settings
- server-side backend API integration with caching, Suspense, and skeleton loading states

Default local URL:

```txt
http://localhost:3000
```

### Backend

Path:

```txt
apps/optimus-gate-backend
```

The backend is a NestJS API. It includes:

- auth and session refresh
- default business creation
- API-key management
- plan, subscriber, subscription, transaction, refund, payout, onboarding, and stats endpoints
- subscription checkout and checkout-order verification
- Nomba integration and webhook handling
- ledger accounting
- BullMQ renewal processing
- PostgreSQL schemas through Drizzle ORM

Default local URL:

```txt
http://localhost:4000
```

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL
- Redis for renewal queue processing
- Nomba credentials for real checkout/payment flows

## Setup

Install dependencies at the monorepo root:

```bash
npm install
```

Create environment files for each app.

Frontend:

```txt
apps/optimus-gate-frontend/.env.local
```

```env
OPTIMUS_GATE_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_OPTIMUS_GATE_BACKEND_URL=http://localhost:4000
```

Backend:

```txt
apps/optimus-gate-backend/.env
```

```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/optimus_gate
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
NOMBA_BASE_URL=https://api.nomba.com
NOMBA_ACCOUNT_ID=
TEST_NOMBA_CLIENT_ID=
TEST_NOMBA_PRIVATE_KEY=
NOMBA_WEBHOOK_SECRET=
```

## Running Locally

Run both apps through Turbo:

```bash
npm run dev
```

Run apps individually:

```bash
cd apps/optimus-gate-backend
npm run start:dev
```

```bash
cd apps/optimus-gate-frontend
npm run dev
```

Open the frontend at:

```txt
http://localhost:3000
```

The frontend expects the backend at:

```txt
http://localhost:4000
```

## Database

The backend uses Drizzle ORM.

```bash
cd apps/optimus-gate-backend
npm run db:generate
npm run db:migrate
```

Optional:

```bash
npm run db:studio
npm run db:seed
```

## Main Backend Routes

Auth:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

API keys:

- `POST /api-keys`
- `GET /api-keys`
- `PATCH /api-keys/:id`
- `POST /api-keys/:id/revoke`

Dashboard billing:

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

Checkout:

- `POST /v1/checkout/subscriptions/start`
- `GET /v1/checkout/orders/:orderReference`

Webhook:

- `POST /webhook`

## Workspace Commands

From the root:

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run check-types
```

Run a command for one app with Turbo filters:

```bash
npm run dev -- --filter=optimus-gate
npm run build -- --filter=optimus-gate-backend
```

Useful app-level checks:

```bash
cd apps/optimus-gate-frontend
npm run lint
npx tsc --noEmit --incremental false
```

```bash
cd apps/optimus-gate-backend
npx eslint "{src,apps,libs,test}/**/*.ts"
npx tsc --noEmit --incremental false
```

## Development Notes

- The frontend uses server-side API calls so auth tokens stay in HTTP-only cookies.
- Dashboard list reads return empty states when backend reads fail, while mutations surface backend error messages in the UI.
- The checkout start endpoint accepts either API-key auth or dashboard JWT auth.
- The backend preserves raw body handling for `/webhook` while parsing JSON normally elsewhere.
- Subaccount navigation in the frontend is currently commented out until the settlement-account model is completed.
