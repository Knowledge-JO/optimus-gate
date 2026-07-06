# Optimus Gateway TODO

## Current Product Direction

Optimus Gate is an infrastructure layer on top of Nomba. Nomba is the payment rail, while Optimus Gate owns the business/customer/subscription model, API keys, and internal ledger.

The current direction is:

- Use tokenized card checkout as the primary subscription entry point.
- Use Nomba tokenized card charges for automatic recurring renewals.
- Do not create Nomba subaccounts per Optimus business.
- Route funds through the single Nomba account/subaccount controlled by Optimus Gate.
- Attribute each transaction to the correct Optimus business internally using API key identity and `orderReference`.
- Let each business dashboard see its own internal balance from Optimus Gate ledger records.
- Treat Nomba balance as treasury/reconciliation, not as the source of per-business balances.

## Architecture Shift

The platform should model three separate actors:

- Optimus dashboard users: people who sign up to manage a business.
- Businesses: merchant accounts inside Optimus Gate, each with API keys, plans, subscriptions, customers, and ledger.
- Business customers: end users of those businesses. They do not need Optimus Gate accounts.

API keys should belong to businesses, not only users:

- `api_keys.businessId`
- `api_keys.createdByUserId`

Subscriptions, invoices, payment attempts, Nomba checkout orders, webhook events, and ledger entries should all be attributable to `businessId`.

Nomba configuration is platform-level:

- `NOMBA_ACCOUNT_ID`
- `NOMBA_SUB_ACCOUNT_ID`
- `NOMBA_CLIENT_ID`
- `NOMBA_CLIENT_SECRET`
- `NOMBA_WEBHOOK_SECRET`

Every payment uses Optimus Gate's Nomba credentials/account context, while Optimus Gate stores who the money belongs to internally.

## Recommended Direction

1. Add `businesses`.
2. Move API keys from `userId` ownership to `businessId` ownership, while preserving `createdByUserId`.
3. Add `business_customers` for end users of SaaS/business integrations.
4. Add `businessId` to plans, subscriptions, invoices, payment attempts, Nomba checkout orders, payment methods, and webhook processing.
5. Add ledger tables and make dashboard balances come from ledger entries.
6. On successful verified payments, credit the business ledger idempotently.
7. On refunds/reversals, debit or hold ledger balances idempotently.
8. Use Nomba transaction verification as the external source of truth and Optimus ledger as the business balance source of truth.
9. Build payout/withdrawal later as ledger debit plus Nomba transfer from the central account.
10. Support business payout bank accounts and central-sub-account bank transfers, while enforcing Optimus ledger balance ownership.

## Tokenized Card Subscription Flow

First payment:

1. Business calls Optimus API with its API key.
2. Optimus identifies `businessId`.
3. Optimus creates/loads `business_customer`.
4. Optimus creates subscription, invoice, and payment attempt.
5. Optimus creates Nomba checkout order with `tokenizeCard: true`.
6. Customer pays on Nomba checkout.
7. Nomba webhook arrives.
8. Optimus verifies webhook signature and stores event.
9. Optimus verifies transaction by `orderReference`.
10. Optimus marks payment attempt succeeded and invoice paid.
11. Optimus stores `tokenKey` as the customer's default payment method.
12. Optimus activates subscription.
13. Optimus credits the business ledger.

Renewal payment:

1. Scheduler finds due subscriptions.
2. Optimus creates renewal invoice and payment attempt.
3. Optimus generates a new unique `orderReference`.
4. Optimus charges the stored Nomba `tokenKey`.
5. Nomba sends payment webhook.
6. Optimus stores webhook and verifies transaction by `orderReference`.
7. On success, Optimus marks invoice paid, extends subscription, and credits the business ledger.
8. On failure, Optimus marks attempt failed/pending and enters retry/grace flow.

## Implementation Status

- Done: developer API key schema, dashboard API key endpoints, hashed key storage, API key guard.
- Done: public `/v1` API key entry point for starting subscription checkout and checking checkout orders.
- Done: modular Drizzle schemas for API keys, billing, Nomba checkout orders, and webhook events.
- Done: provider-based Nomba client setup, token service, HTTP wrapper, checkout service, transaction service, and webhook signature service.
- Done: provider-based queue setup for renewal jobs.
- Done: renewal scheduler and BullMQ processor skeleton.
- Done: renewal charge flow using stored tokenized card payment methods.
- Done: introduced `businesses`, moved API keys and billing ownership to `businessId`, and added idempotent ledger accounting.
- Still needs product hardening: webhook event idempotency constraints, richer tests, retry policy tuning, dashboard views, cancellation semantics, plan change/proration rules, and production reconciliation tooling.

## 1. Implement Businesses and Developer API Keys

- [x] Add `businesses` table.
- [x] Add default business creation during dashboard signup or onboarding.
- [x] Add business membership/ownership model.
- [x] Move API key ownership to `businessId`.
- [x] Keep `createdByUserId` for audit.
- [x] Add API key generation for authenticated dashboard users managing a business.
- [x] Store only hashed API keys in the database.
- [x] Show the raw API key only once at creation.
- [x] Add key metadata: name, prefix, scopes, environment, last used time, revoked time.
- [x] Add dashboard endpoints for creating, listing, updating, and revoking API keys.
- [x] Add an API key guard for public integration endpoints.
- [x] Support `Authorization: Bearer og_test_xxx` and `x-api-key: og_test_xxx`.
- [x] Track API key usage with `lastUsedAt`.
- [ ] Add rate limiting by API key.

## 2. Define Public Integration API

- [x] Protect dashboard endpoints with JWT.
- [x] Protect merchant integration endpoints with API keys.
- [x] Resolve `businessId` from the API key on every public request.
- [x] Add versioned public endpoints under `/v1`.
- [x] Start with subscription checkout creation and status lookup.

## 3. Add Internal Ledger

- [x] Add `ledger_accounts`.
- [x] Add `ledger_entries`.
- [ ] Add `business_balances` view/query helper if needed.
- [x] Credit business ledger only after Nomba transaction verification succeeds.
- [x] Debit or hold ledger on refund or reversal.
- [x] Debit ledger for payouts before Nomba transfer and reverse on clear rejection.
- [x] Make ledger writes idempotent by payment attempt, webhook event, or transaction reference.

## 4. Install Scheduling and Queue Libraries

- [x] Use `@nestjs/schedule` for cron renewal scans.
- [x] Use `@nestjs/bullmq`, `bullmq`, and `ioredis` for background payment jobs and retries.
- [x] Use `@nestjs/config` and `joi` for environment validation.
- [x] Use `@nestjs/axios` and `axios` for Nomba HTTP calls.

## 5. Create Billing Database Schemas

- [x] `businesses`
- [x] `business_members`
- [x] `business_customers`
- [x] `plans`
- [x] `subscriptions`
- [x] `subscription_invoices`
- [x] `subscription_payment_attempts`
- [x] `customer_payment_methods`
- [x] `nomba_checkout_orders`
- [x] `subscription_refunds`
- [x] `nomba_webhook_events`
- [x] `api_keys`
- [x] `ledger_accounts`
- [x] `ledger_entries`
- [ ] Optional: `subscription_events`

## 6. Create Nomba Integration Module

- [x] `NombaModule`
- [x] Nomba config provider. A dedicated `NombaConfigService` class is not created yet.
- [x] `NombaAuthService`
- [x] `NombaHttpService`
- [x] `NombaCheckoutService`
- [x] `NombaTransactionService`
- [x] `NombaWebhookService`
- [x] Keep external client initialization in provider files.

## 7. Create Initial Checkout Flow

- [x] External frontend calls Optimus public API with API key.
- [x] Backend identifies the business from the API key.
- [x] Backend creates/loads business customer from external customer details.
- [x] Backend creates subscription in `incomplete` / `pending_payment`.
- [x] Backend creates first invoice.
- [x] Backend creates payment attempt.
- [x] Backend calls Nomba create checkout order with `tokenizeCard: true`.
- [x] Backend stores `orderReference`, `checkoutLink`, Nomba response, and payment attempt ID.
- [x] Backend returns `checkoutLink` to the external frontend.

## 8. Handle Nomba Webhook

- [x] Add raw body support for webhook signature verification.
- [x] Verify `nomba-signature` with `NOMBA_WEBHOOK_SECRET`.
- [x] Store webhook body in `nomba_webhook_events`.
- [x] Make webhook processing idempotent.
- [x] Match webhook to `orderReference` / transaction reference.
- [x] Trigger transaction verification before updating subscription state.

## 9. Verify First Payment

- [x] Call Nomba transaction verification endpoint.
- [x] Confirm response `code === "00"`.
- [x] Confirm transaction status is `SUCCESS`.
- [x] Confirm amount, currency, and order reference match the invoice.
- [x] Mark payment attempt `succeeded`.
- [x] Mark invoice `paid`.
- [x] Activate subscription.
- [x] Set subscription period start/end.
- [x] Extract and store `tokenKey` if returned.
- [x] Credit business ledger.

## 10. Store Tokenized Payment Method

- [x] Store Nomba `tokenKey` against the subscription/customer.
- [x] Mark as default payment method.
- [x] Never expose `tokenKey` in API responses.
- [x] Avoid logging `tokenKey`.

## 11. Create Renewal Scheduler

- [x] Use `@nestjs/schedule`.
- [x] Cron job finds subscriptions due for renewal.
- [x] Conditions: active/past due, period ending within renewal window.
- [ ] Condition: no open renewal invoice already exists during scheduler selection.
- [x] Create renewal invoice.
- [x] Create payment attempt.
- [x] Enqueue payment charge job.

## 12. Create Renewal Payment Job

- [x] Use a BullMQ processor.
- [x] Load subscription, invoice, and customer payment method.
- [x] Generate a new `orderReference`.
- [x] Call Nomba tokenized card charge endpoint `/v1/checkout/tokenized-card-payment`.
- [x] Store raw Nomba response.
- [x] Verify transaction after charge.
- [x] If pending/unclear, leave attempt pending for webhook/requery.

## 13. Verify Renewal Payment

- [x] Verify with Nomba transaction endpoint.
- [x] On success: mark attempt succeeded, mark invoice paid, extend subscription period.
- [x] On success: credit business ledger.
- [ ] On success: reset retry counters.
- [x] On failure: mark attempt failed/pending and possibly move subscription to `past_due`.
- [ ] On failure: schedule product-level retry policy.

## 14. Implement Retry and Grace Period

- [ ] Define retry policy.
- [ ] Example retries: 1 hour, 24 hours, 3 days.
- [ ] Keep subscription active during grace period if desired.
- [ ] After max retries: mark invoice failed/uncollectible and subscription suspended/canceled.

## 15. Add Cancellation

- [x] Support immediate cancellation.
- [x] Support cancellation at period end.
- [x] Stop future renewals.
- [x] Preserve historical invoices and payment attempts.

## 16. Add Plan Changes

- [ ] Add upgrade/downgrade logic.
- [ ] Decide proration rules.
- [ ] Create immediate invoice for upgrades if needed.
- [ ] Apply downgrades at next billing cycle if desired.

## 17. Add Admin and Reconciliation Tools

- [x] Requery payment by order reference.
- [x] Manually sync invoice/payment state from Nomba by order reference.
- [ ] View webhook history.
- [ ] View payment attempts and failure reasons.
- [x] View API key usage via API key list metadata.
- [ ] View business ledger and balances.
- [ ] Compare Nomba treasury balance to aggregate Optimus ledger liabilities.

## 18. Business Payouts

- [x] Fetch Nigerian banks and bank codes from Nomba for the dashboard UI.
- [x] Verify bank account number and bank code before saving payout account.
- [x] Save multiple payout bank accounts per business.
- [x] Soft-delete saved payout bank accounts.
- [x] Set exactly one default payout bank account per business.
- [x] Process payouts through the central Optimus-owned Nomba sub-account.
- [x] Debit Optimus business ledger idempotently for payouts.
- [x] Reverse payout ledger debit when Nomba clearly rejects the transfer.
- [x] Reconcile payout success, failure, and refund statuses from Nomba webhooks.
- [ ] Add scheduled payout requery for long-running pending payouts.
- [ ] Add DB-level per-business balance locking for simultaneous payout requests.
- [ ] Add dashboard controls for payout retries and failure review.

## 18. Add Tests

- [ ] API key generation and hashing.
- [ ] API key guard.
- [ ] API key revocation.
- [ ] Checkout creation through API key.
- [ ] Business ownership and API key resolution.
- [ ] Ledger credit/debit idempotency.
- [ ] Webhook signature verification.
- [x] Idempotent webhook processing.
- [ ] First payment activation.
- [ ] Renewal scheduler due-subscription selection.
- [ ] Renewal tokenized charge job.
- [ ] Failed renewal retries.
- [ ] Max retry suspension/cancellation.
