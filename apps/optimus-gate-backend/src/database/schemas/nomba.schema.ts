import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  subscriptionInvoices,
  subscriptionPaymentAttempts,
  subscriptions,
} from './billing.schema';
import { users } from './users.schema';

export const nombaCheckoutOrders = pgTable(
  'nomba_checkout_orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, {
      onDelete: 'cascade',
    }),
    invoiceId: uuid('invoice_id').references(() => subscriptionInvoices.id, {
      onDelete: 'cascade',
    }),
    paymentAttemptId: uuid('payment_attempt_id').references(
      () => subscriptionPaymentAttempts.id,
      { onDelete: 'set null' },
    ),
    orderReference: varchar('order_reference', { length: 160 })
      .notNull()
      .unique(),
    checkoutLink: varchar('checkout_link', { length: 1000 }),
    status: varchar('status', { length: 80 }).notNull().default('pending'),
    rawResponse: jsonb('raw_response').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('nomba_checkout_orders_user_id_idx').on(table.userId),
    index('nomba_checkout_orders_reference_idx').on(table.orderReference),
  ],
);

export const nombaWebhookEvents = pgTable(
  'nomba_webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: varchar('event_type', { length: 120 }).notNull(),
    signature: varchar('signature', { length: 512 }),
    eventReference: varchar('event_reference', { length: 160 }),
    orderReference: varchar('order_reference', { length: 160 }),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('nomba_webhook_events_type_idx').on(table.eventType),
    index('nomba_webhook_events_order_reference_idx').on(table.orderReference),
  ],
);
