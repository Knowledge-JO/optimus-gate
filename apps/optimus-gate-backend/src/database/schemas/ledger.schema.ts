import {
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

export const ledgerAccountTypeEnum = pgEnum('ledger_account_type', [
  'business_available',
  'business_pending',
]);

export const ledgerEntryTypeEnum = pgEnum('ledger_entry_type', [
  'payment_credit',
  'renewal_credit',
  'refund_debit',
  'reversal_debit',
  'payout_debit',
  'adjustment',
]);

export const ledgerAccounts = pgTable(
  'ledger_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    type: ledgerAccountTypeEnum('type').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('ledger_accounts_business_type_currency_unique').on(
      table.businessId,
      table.type,
      table.currency,
    ),
    index('ledger_accounts_business_id_idx').on(table.businessId),
  ],
);

export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    ledgerAccountId: uuid('ledger_account_id')
      .notNull()
      .references(() => ledgerAccounts.id, { onDelete: 'restrict' }),
    type: ledgerEntryTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
    idempotencyKey: varchar('idempotency_key', { length: 220 }).notNull(),
    sourceType: varchar('source_type', { length: 80 }).notNull(),
    sourceId: uuid('source_id'),
    description: text('description'),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('ledger_entries_idempotency_key_unique').on(
      table.idempotencyKey,
    ),
    index('ledger_entries_business_id_idx').on(table.businessId),
    index('ledger_entries_account_id_idx').on(table.ledgerAccountId),
    index('ledger_entries_source_idx').on(table.sourceType, table.sourceId),
  ],
);
