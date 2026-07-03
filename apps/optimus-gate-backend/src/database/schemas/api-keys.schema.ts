import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { businesses } from './businesses.schema';
import { users } from './users.schema';

export const apiKeyEnvironmentEnum = pgEnum('api_key_environment', [
  'test',
  'live',
]);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    prefix: varchar('prefix', { length: 32 }).notNull(),
    keyHash: varchar('key_hash', { length: 255 }).notNull(),
    scopes: jsonb('scopes').$type<string[]>().notNull().default([]),
    environment: apiKeyEnvironmentEnum('environment').notNull().default('test'),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('api_keys_business_id_idx').on(table.businessId),
    index('api_keys_user_id_idx').on(table.userId),
    index('api_keys_created_by_user_id_idx').on(table.createdByUserId),
    index('api_keys_prefix_idx').on(table.prefix),
  ],
);
