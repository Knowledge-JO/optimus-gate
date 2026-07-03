# Optimus Gate Brand Plan

## Product position

Optimus Gate is a subscription billing gateway for businesses that need checkout links, recurring billing, retry handling, ledger visibility, API keys, payouts, and refund operations in one dashboard.

The product should feel precise, quiet, technical, and trustworthy. The UI should look like a financial operations console rather than a marketing site.

## Core personality

- Controlled: every screen should make money movement easy to audit.
- Sharp: strong black and white contrast, deliberate spacing, no decorative clutter.
- Operational: tables, statuses, retries, keys, and balances are first-class.
- Developer-aware: API keys, checkout references, ledger entries, and webhooks should feel native.

## Color system

Primary:
- Gate Black: `#000000`
- Paper White: `#ffffff`
- Console Surface: `#f5f5f3`
- Ink: `#111111`

Neutral support:
- Border: `#e7e5df`
- Muted text: `#73716b`
- Soft panel: `#fbfaf7`
- Deep panel: `#181818`

Semantic accents:
- Volt Green `#b9ff66`: success, available balance, healthy automations
- Settlement Blue `#5b8cff`: payouts, bank settlement, informational states
- Signal Amber `#f5b84b`: pending, attention, retries
- Risk Red `#f25f5c`: failed payments, refunds, revoked keys, destructive actions

Color rules:
- Use black/white for structure and hierarchy.
- Use accent color only for state, risk, or money movement.
- Avoid full-page colored backgrounds.
- Tables should stay neutral; status chips carry the state color.

## Typography

Current implementation uses Geist Mono globally by request.

Rules:
- Keep headings compact and confident.
- Use tabular numeric styles for currency, references, and dates.
- Keep dense operational copy smaller and high contrast.

## Layout

- Use a fixed app shell with a black sidebar and white content plane.
- First screen should expose the current operational state immediately.
- Every page should have:
  - concise page title
  - operational subtitle
  - primary action or export action
  - metric strip
  - one dominant working surface: table, queue, ledger, or setup checklist

## Motion

Motion should feel like a terminal/ops console becoming active:
- Page content fades in and rises subtly.
- Metric cards stagger in quickly.
- Rows can fade in with tiny vertical movement.
- Hover states should be restrained: slight translate, border darkening, no bouncing.
- Avoid long, playful, or decorative animation.

Timing:
- Page enter: 0.35s
- Card stagger: 0.05s
- Hover: 0.15s

## Component guidance

- Metric cards: white surface, black typography, colored left rail or dot.
- Status pills: compact, rounded, color-coded with muted background.
- Tables: dense rows, visible references, mono values, strong empty states.
- Forms/dialogs: white, sharp, low-shadow, black primary action.
- Navigation: black sidebar, white active item, muted inactive item.

## Page intent

- Overview: executive operations cockpit for MRR, ledger balance, renewal health, failed attempts.
- Plans: subscription products and checkout readiness.
- Subscribers: customer records, payment method health, lifecycle.
- Subscriptions: recurring contract state, next charge, retry queues.
- Transactions: checkout orders, invoice payments, renewals, references.
- Refunds: refund and reversal operations.
- Payouts: settlements from available ledger balance.
- Subaccounts: split settlement accounts and allocation rules.
- Onboarding: business readiness and go-live checklist.
