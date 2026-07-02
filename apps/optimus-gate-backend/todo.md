# Optimus Gateway TODO

## Implementation Status

- Done: developer API key schema, dashboard API key endpoints, hashed key storage, API key guard.
- Done: public `/v1` API key entry point for starting subscription checkout and checking checkout orders.
- Done: modular Drizzle schemas for API keys, billing, Nomba checkout orders, and webhook events.
- Done: provider-based Nomba client setup, token service, HTTP wrapper, checkout service, transaction service, and webhook signature service.
- Done: provider-based queue setup for renewal jobs.
- Done: renewal scheduler and BullMQ processor skeleton.
- Done: renewal charge flow using stored tokenized card payment methods.
- Still needs product hardening: webhook event idempotency constraints, richer tests, retry policy tuning, dashboard views, cancellation semantics, plan change/proration rules, and production reconciliation tooling.

## 1. Implement Developer API Keys

- Add API key generation for authenticated dashboard users.
- Store only hashed API keys in the database.
- Show the raw API key only once at creation.
- Add key metadata: name, prefix, scopes, environment, last used time, revoked time.
- Add dashboard endpoints for creating, listing, updating, and revoking API keys.
- Add an API key guard for public integration endpoints.
- Support `Authorization: Bearer og_test_xxx` and `x-api-key: og_test_xxx`.
- Track API key usage and prepare for rate limiting by key.

## 2. Define Public Integration API

- Protect dashboard endpoints with JWT.
- Protect merchant integration endpoints with API keys.
- Add versioned public endpoints under `/v1`.
- Start with subscription checkout creation and status lookup.

## 3. Install Scheduling and Queue Libraries

- Use `@nestjs/schedule` for cron renewal scans.
- Use `@nestjs/bullmq`, `bullmq`, and `ioredis` for background payment jobs and retries.
- Use `@nestjs/config` and `joi` for environment validation.
- Use `@nestjs/axios` and `axios` for Nomba HTTP calls.

## 4. Create Billing Database Schemas

- `plans`
- `subscriptions`
- `subscription_invoices`
- `subscription_payment_attempts`
- `customer_payment_methods`
- `nomba_checkout_orders`
- `nomba_webhook_events`
- `api_keys`
- Optional: `subscription_events`

## 5. Create Nomba Integration Module

- `NombaModule`
- `NombaConfigService`
- `NombaAuthService`
- `NombaHttpService`
- `NombaCheckoutService`
- `NombaTransactionService`
- `NombaWebhookService`
- Keep external client initialization in provider files.

## 6. Create Initial Checkout Flow

- External frontend calls Optimus public API with API key.
- Backend identifies the merchant/user from the API key.
- Backend creates subscription in `incomplete` / `pending_payment`.
- Backend creates first invoice.
- Backend creates payment attempt.
- Backend calls Nomba create checkout order with `tokenizeCard: true`.
- Backend stores `orderReference`, `checkoutLink`, Nomba response, and payment attempt ID.
- Backend returns `checkoutLink` to the external frontend.

## 7. Handle Nomba Webhook

- Add raw body support for webhook signature verification.
- Verify `nomba-signature` with `NOMBA_WEBHOOK_SECRET`.
- Store webhook body in `nomba_webhook_events`.
- Make webhook processing idempotent.
- Match webhook to `orderReference` / transaction reference.
- Trigger transaction verification before updating subscription state.

## 8. Verify First Payment

- Call Nomba transaction verification endpoint.
- Confirm response `code === "00"`.
- Confirm transaction status is `SUCCESS`.
- Confirm amount, currency, and order reference match the invoice.
- Mark payment attempt `succeeded`.
- Mark invoice `paid`.
- Activate subscription.
- Set subscription period start/end.
- Extract and store `tokenKey` if returned.

## 9. Store Tokenized Payment Method

- Store Nomba `tokenKey` against the subscription/customer.
- Mark as default payment method.
- Never expose `tokenKey` in API responses.
- Avoid logging `tokenKey`.

## 10. Create Renewal Scheduler

- Use `@nestjs/schedule`.
- Cron job finds subscriptions due for renewal.
- Conditions: active/past due, period ending within renewal window, no open renewal invoice.
- Create renewal invoice.
- Create payment attempt.
- Enqueue payment charge job.

## 11. Create Renewal Payment Job

- Use a BullMQ processor.
- Load subscription, invoice, and customer payment method.
- Generate a new `orderReference`.
- Call Nomba tokenized card charge endpoint `/v1/checkout/tokenized-card-payment`.
- Store raw Nomba response.
- Verify transaction after charge.
- If pending/unclear, leave attempt pending for webhook/requery.

## 12. Verify Renewal Payment

- Verify with Nomba transaction endpoint.
- On success: mark attempt succeeded, mark invoice paid, extend subscription period, reset retry counters.
- On failure: mark attempt failed, schedule retry, and possibly move subscription to `past_due`.

## 13. Implement Retry and Grace Period

- Define retry policy.
- Example retries: 1 hour, 24 hours, 3 days.
- Keep subscription active during grace period if desired.
- After max retries: mark invoice failed/uncollectible and subscription suspended/canceled.

## 14. Add Cancellation

- Support immediate cancellation.
- Support cancellation at period end.
- Stop future renewals.
- Preserve historical invoices and payment attempts.

## 15. Add Plan Changes

- Add upgrade/downgrade logic.
- Decide proration rules.
- Create immediate invoice for upgrades if needed.
- Apply downgrades at next billing cycle if desired.

## 16. Add Admin and Reconciliation Tools

- Requery payment by order reference.
- Manually sync invoice/payment state from Nomba.
- View webhook history.
- View payment attempts and failure reasons.
- View API key usage.

## 17. Add Tests

- API key generation and hashing.
- API key guard.
- API key revocation.
- Checkout creation through API key.
- Webhook signature verification.
- Idempotent webhook processing.
- First payment activation.
- Renewal scheduler due-subscription selection.
- Renewal tokenized charge job.
- Failed renewal retries.
- Max retry suspension/cancellation.
