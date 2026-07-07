import {
  boolean,
  integer,
  index,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { businesses, businessCustomers } from './businesses.schema';
import { users } from './users.schema';

export const billingIntervalEnum = pgEnum('billing_interval', [
  'day',
  'week',
  'month',
  'year',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'incomplete',
  'active',
  'past_due',
  'suspended',
  'canceled',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'open',
  'paid',
  'failed',
  'void',
  'uncollectible',
]);

export const paymentAttemptStatusEnum = pgEnum('payment_attempt_status', [
  'pending',
  'processing',
  'succeeded',
  'failed',
  'requires_action',
]);

export const refundStatusEnum = pgEnum('refund_status', [
  'pending',
  'processing',
  'succeeded',
  'failed',
]);

export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
  'tokenized_card',
]);

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  interval: billingIntervalEnum('interval').notNull().default('month'),
  intervalCount: integer('interval_count').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customerPaymentMethods = pgTable(
  'customer_payment_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    businessCustomerId: uuid('business_customer_id')
      .notNull()
      .references(() => businessCustomers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 40 }).notNull().default('nomba'),
    type: paymentMethodTypeEnum('type').notNull().default('tokenized_card'),
    tokenKey: varchar('token_key', { length: 255 }).notNull(),
    customerId: varchar('customer_id', { length: 120 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('customer_payment_methods_business_token_unique').on(
      table.businessId,
      table.tokenKey,
    ),
    index('customer_payment_methods_business_id_idx').on(table.businessId),
    index('customer_payment_methods_user_id_idx').on(table.userId),
    index('customer_payment_methods_customer_id_idx').on(table.customerId),
  ],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    businessCustomerId: uuid('business_customer_id')
      .notNull()
      .references(() => businessCustomers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id),
    paymentMethodId: uuid('payment_method_id').references(
      () => customerPaymentMethods.id,
    ),
    status: subscriptionStatusEnum('status').notNull().default('incomplete'),
    customerId: varchar('customer_id', { length: 120 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    currentPeriodStart: timestamp('current_period_start', {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('subscriptions_business_id_idx').on(table.businessId),
    index('subscriptions_user_id_idx').on(table.userId),
    index('subscriptions_plan_id_idx').on(table.planId),
    index('subscriptions_status_idx').on(table.status),
  ],
);

export const subscriptionInvoices = pgTable(
  'subscription_invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    businessCustomerId: uuid('business_customer_id')
      .notNull()
      .references(() => businessCustomers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    status: invoiceStatusEnum('status').notNull().default('open'),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    periodStart: timestamp('period_start', { withTimezone: true }),
    periodEnd: timestamp('period_end', { withTimezone: true }),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('subscription_invoices_business_id_idx').on(table.businessId),
    index('subscription_invoices_business_customer_id_idx').on(
      table.businessCustomerId,
    ),
    index('subscription_invoices_user_id_idx').on(table.userId),
    index('subscription_invoices_subscription_id_idx').on(table.subscriptionId),
    index('subscription_invoices_status_idx').on(table.status),
  ],
);

export const subscriptionPaymentAttempts = pgTable(
  'subscription_payment_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => subscriptionInvoices.id, { onDelete: 'cascade' }),
    paymentMethodId: uuid('payment_method_id').references(
      () => customerPaymentMethods.id,
    ),
    status: paymentAttemptStatusEnum('status').notNull().default('pending'),
    provider: varchar('provider', { length: 40 }).notNull().default('nomba'),
    providerReference: varchar('provider_reference', { length: 160 }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    failureReason: text('failure_reason'),
    rawResponse: jsonb('raw_response').$type<Record<string, unknown>>(),
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('subscription_payment_attempts_business_id_idx').on(table.businessId),
    index('subscription_payment_attempts_invoice_id_idx').on(table.invoiceId),
    index('subscription_payment_attempts_reference_idx').on(
      table.providerReference,
    ),
    index('subscription_payment_attempts_status_idx').on(table.status),
  ],
);

export const subscriptionRefunds = pgTable(
  'subscription_refunds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    businessCustomerId: uuid('business_customer_id')
      .notNull()
      .references(() => businessCustomers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => subscriptionInvoices.id, { onDelete: 'cascade' }),
    paymentAttemptId: uuid('payment_attempt_id')
      .notNull()
      .references(() => subscriptionPaymentAttempts.id, {
        onDelete: 'cascade',
      }),
    status: refundStatusEnum('status').notNull().default('pending'),
    provider: varchar('provider', { length: 40 }).notNull().default('nomba'),
    providerReference: varchar('provider_reference', { length: 180 }).notNull(),
    originalTransactionId: varchar('original_transaction_id', {
      length: 180,
    }).notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    reason: text('reason'),
    idempotencyKey: varchar('idempotency_key', { length: 220 }),
    accountNumber: varchar('account_number', { length: 30 }),
    bankCode: varchar('bank_code', { length: 30 }),
    rawResponse: jsonb('raw_response').$type<Record<string, unknown>>(),
    ledgerDebitedAt: timestamp('ledger_debited_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('subscription_refunds_business_id_idx').on(table.businessId),
    index('subscription_refunds_payment_attempt_id_idx').on(
      table.paymentAttemptId,
    ),
    index('subscription_refunds_status_idx').on(table.status),
    index('subscription_refunds_provider_reference_idx').on(
      table.providerReference,
    ),
    uniqueIndex('subscription_refunds_idempotency_key_unique').on(
      table.idempotencyKey,
    ),
  ],
);
