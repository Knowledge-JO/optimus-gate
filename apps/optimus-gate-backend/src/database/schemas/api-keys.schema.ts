import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const apiKeyEnvironmentEnum = pgEnum('api_key_environment', [
  'test',
  'live',
]);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
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
    index('api_keys_user_id_idx').on(table.userId),
    index('api_keys_prefix_idx').on(table.prefix),
  ],
);
