import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import { ledgerAccounts, ledgerEntries } from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';

@Injectable()
export class LedgerRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async getOrCreateAccount(input: typeof ledgerAccounts.$inferInsert) {
    const existing = await this.db.query.ledgerAccounts.findFirst({
      where: and(
        eq(ledgerAccounts.businessId, input.businessId),
        eq(ledgerAccounts.type, input.type),
        eq(ledgerAccounts.currency, input.currency ?? 'NGN'),
      ),
    });

    if (existing) {
      return existing;
    }

    const [account] = await this.db
      .insert(ledgerAccounts)
      .values(input)
      .onConflictDoNothing()
      .returning();

    if (account) {
      return account;
    }

    const created = await this.db.query.ledgerAccounts.findFirst({
      where: and(
        eq(ledgerAccounts.businessId, input.businessId),
        eq(ledgerAccounts.type, input.type),
        eq(ledgerAccounts.currency, input.currency ?? 'NGN'),
      ),
    });

    if (!created) {
      throw new Error('Unable to create ledger account');
    }

    return created;
  }

  async createEntry(input: typeof ledgerEntries.$inferInsert) {
    const [entry] = await this.db
      .insert(ledgerEntries)
      .values(input)
      .onConflictDoNothing({
        target: ledgerEntries.idempotencyKey,
      })
      .returning();

    if (entry) {
      return entry;
    }

    return this.db.query.ledgerEntries.findFirst({
      where: eq(ledgerEntries.idempotencyKey, input.idempotencyKey),
    });
  }
}
