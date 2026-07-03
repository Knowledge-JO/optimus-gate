import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const businessStatusEnum = pgEnum('business_status', [
  'active',
  'disabled',
]);

export const businessMemberRoleEnum = pgEnum('business_member_role', [
  'owner',
  'admin',
  'developer',
  'viewer',
]);

export const businesses = pgTable(
  'businesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    status: businessStatusEnum('status').notNull().default('active'),
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
    uniqueIndex('businesses_slug_unique').on(table.slug),
    index('businesses_owner_user_id_idx').on(table.ownerUserId),
  ],
);

export const businessMembers = pgTable(
  'business_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: businessMemberRoleEnum('role').notNull().default('owner'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('business_members_business_user_unique').on(
      table.businessId,
      table.userId,
    ),
    index('business_members_user_id_idx').on(table.userId),
  ],
);

export const businessCustomers = pgTable(
  'business_customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id, { onDelete: 'cascade' }),
    externalCustomerId: varchar('external_customer_id', {
      length: 160,
    }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 180 }),
    phone: varchar('phone', { length: 60 }),
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
    uniqueIndex('business_customers_business_external_unique').on(
      table.businessId,
      table.externalCustomerId,
    ),
    index('business_customers_business_id_idx').on(table.businessId),
    index('business_customers_email_idx').on(table.email),
  ],
);
