# Optimus Gate Frontend

Next.js dashboard for Optimus Gate, a subscription billing and checkout platform. The frontend handles merchant authentication, plan management, subscriber and subscription views, API-key settings, and dashboard checkout-link creation.

This app lives inside the `optimus-gate/optimus-gate` monorepo at:

```txt
apps/optimus-gate-frontend
```

## Stack

- Next.js 16 App Router
- React 19
- Server Components, Server Actions, Suspense, and streamed dashboard sections
- Tailwind CSS v4
- Radix UI primitives
- `motion` for dashboard animation
- Backend integration through server-side fetches in `lib/api`

## Main Areas

- `app/(auth)` - login, signup, forgot password, and reset password pages.
- `app/(dashboard)` - protected dashboard routes.
- `components/auth` - modular authentication UI.
- `components/dashboard` - dashboard cards, tables, skeletons, plan catalog modal, and forms.
- `components/layout` - dashboard shell, sidebar, header, logout confirmation.
- `lib/auth` - auth API client, cookies, and server actions.
- `lib/api` - authenticated backend API client, dashboard reads, and mutation actions.

## Backend Dependency

The frontend expects the NestJS backend to be running separately, usually on port `4000`.

Create a local `.env.local` or `.env` file:

```env
OPTIMUS_GATE_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_OPTIMUS_GATE_BACKEND_URL=http://localhost:4000
```

`OPTIMUS_GATE_BACKEND_URL` is used by server-side calls. `NEXT_PUBLIC_OPTIMUS_GATE_BACKEND_URL` is kept only for cases where public configuration is needed.

## Getting Started

Install dependencies from the monorepo root:

```bash
npm install
```

Run only the frontend:

```bash
cd apps/optimus-gate-frontend
npm run dev
```

Or run from the monorepo root with Turbo:

```bash
npm run dev -- --filter=optimus-gate
```

Open:

```txt
http://localhost:3000
```

## API Integration Pattern

Server-side API calls are centralized in `lib/api/backend.ts`.

- `backendFetch()` returns a typed result object: `{ ok: true, data }` or `{ ok: false, error }`.
- Dashboard list reads use `readOrEmpty()` in `lib/api/dashboard.ts` so backend read failures render empty states instead of crashing the shell.
- Mutations are server actions in `lib/api/actions.ts`.
- Next cache tags are grouped in `apiTags` and revalidated after mutations.

Current dashboard integrations include:

- dashboard stats
- plans
- subscribers
- subscriptions
- transactions
- refunds
- payouts
- onboarding checklist
- API keys
- checkout-link creation from a plan

## Auth Flow

Auth pages call backend auth endpoints through server actions. Successful login/signup stores access and refresh tokens in HTTP-only cookies. Protected dashboard routes call `/auth/me` from the server layout and redirect to `/login` when the session is missing or invalid.

## Development Commands

```bash
npm run dev
npm run lint
npm run build
```

For type checking, use:

```bash
npx tsc --noEmit --incremental false
```

## Notes

- The dashboard is designed around a black-and-white operational console style.
- The active font is Geist Mono.
- Subaccount navigation is currently commented out in `lib/navItem.ts`.
- Production builds with `next/font/google` require network access to fetch the configured Google font during build.
