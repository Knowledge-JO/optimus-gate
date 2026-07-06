import {
  boolean,
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
import { businesses } from './businesses.schema';
import { users } from './users.schema';

export const payoutStatusEnum = pgEnum('payout_status', [
  'pending',
  'processing',
  'succeeded',
  'failed',
  'refunded',
]);

export const businessPayoutBankAccounts = pgTable(
  'business_payout_bank_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bankCode: varchar('bank_code', { length: 20 }).notNull(),
    bankName: varchar('bank_name', { length: 160 }),
    accountNumber: varchar('account_number', { length: 20 }).notNull(),
    accountName: varchar('account_name', { length: 255 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('business_payout_accounts_business_bank_account_unique').on(
      table.businessId,
      table.bankCode,
      table.accountNumber,
    ),
    index('business_payout_accounts_business_id_idx').on(table.businessId),
    index('business_payout_accounts_default_idx').on(
      table.businessId,
      table.isDefault,
    ),
  ],
);

export const businessPayouts = pgTable(
  'business_payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bankAccountId: uuid('bank_account_id').references(
      () => businessPayoutBankAccounts.id,
      { onDelete: 'set null' },
    ),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    status: payoutStatusEnum('status').notNull().default('pending'),
    provider: varchar('provider', { length: 40 }).notNull().default('nomba'),
    providerReference: varchar('provider_reference', { length: 160 })
      .notNull()
      .unique(),
    nombaTransactionId: varchar('nomba_transaction_id', { length: 180 }),
    idempotencyKey: varchar('idempotency_key', { length: 220 }),
    failureReason: text('failure_reason'),
    rawResponse: jsonb('raw_response').$type<Record<string, unknown>>(),
    ledgerDebitedAt: timestamp('ledger_debited_at', { withTimezone: true }),
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
    uniqueIndex('business_payouts_idempotency_key_unique').on(
      table.idempotencyKey,
    ),
    index('business_payouts_business_id_idx').on(table.businessId),
    index('business_payouts_bank_account_id_idx').on(table.bankAccountId),
    index('business_payouts_status_idx').on(table.status),
  ],
);
