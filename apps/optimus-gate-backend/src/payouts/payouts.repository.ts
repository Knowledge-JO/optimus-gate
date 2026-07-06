import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import type { DrizzleDatabase } from '../database/database.types';
import {
  businessPayoutBankAccounts,
  businessPayouts,
} from '../database/schemas';

type BusinessPayoutBankAccount =
  typeof businessPayoutBankAccounts.$inferSelect;
type BusinessPayout = typeof businessPayouts.$inferSelect;

@Injectable()
export class PayoutsRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  listBankAccounts(businessId: string): Promise<BusinessPayoutBankAccount[]> {
    return this.db
      .select()
      .from(businessPayoutBankAccounts)
      .where(
        and(
          eq(businessPayoutBankAccounts.businessId, businessId),
          isNull(businessPayoutBankAccounts.deletedAt),
        ),
      )
      .orderBy(
        desc(businessPayoutBankAccounts.isDefault),
        desc(businessPayoutBankAccounts.createdAt),
      );
  }

  findBankAccount(
    businessId: string,
    id: string,
  ): Promise<BusinessPayoutBankAccount | undefined> {
    return this.db.query.businessPayoutBankAccounts.findFirst({
      where: and(
        eq(businessPayoutBankAccounts.businessId, businessId),
        eq(businessPayoutBankAccounts.id, id),
        isNull(businessPayoutBankAccounts.deletedAt),
      ),
    });
  }

  findDefaultBankAccount(
    businessId: string,
  ): Promise<BusinessPayoutBankAccount | undefined> {
    return this.db.query.businessPayoutBankAccounts.findFirst({
      where: and(
        eq(businessPayoutBankAccounts.businessId, businessId),
        eq(businessPayoutBankAccounts.isDefault, true),
        isNull(businessPayoutBankAccounts.deletedAt),
      ),
    });
  }

  async upsertBankAccount(
    input: typeof businessPayoutBankAccounts.$inferInsert,
  ): Promise<BusinessPayoutBankAccount> {
    const [bankAccount] = await this.db
      .insert(businessPayoutBankAccounts)
      .values(input)
      .onConflictDoUpdate({
        target: [
          businessPayoutBankAccounts.businessId,
          businessPayoutBankAccounts.bankCode,
          businessPayoutBankAccounts.accountNumber,
        ],
        set: {
          userId: input.userId,
          bankName: input.bankName,
          accountName: input.accountName,
          isDefault: input.isDefault ?? false,
          metadata: input.metadata ?? {},
          deletedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return bankAccount;
  }

  unsetDefaultBankAccounts(businessId: string) {
    return this.db
      .update(businessPayoutBankAccounts)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(
        and(
          eq(businessPayoutBankAccounts.businessId, businessId),
          isNull(businessPayoutBankAccounts.deletedAt),
        ),
      )
      .returning();
  }

  setDefaultBankAccount(
    businessId: string,
    id: string,
  ): Promise<BusinessPayoutBankAccount[]> {
    return this.db
      .update(businessPayoutBankAccounts)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(
        and(
          eq(businessPayoutBankAccounts.businessId, businessId),
          eq(businessPayoutBankAccounts.id, id),
          isNull(businessPayoutBankAccounts.deletedAt),
        ),
      )
      .returning();
  }

  deleteBankAccount(
    businessId: string,
    id: string,
  ): Promise<BusinessPayoutBankAccount[]> {
    return this.db
      .update(businessPayoutBankAccounts)
      .set({ deletedAt: new Date(), isDefault: false, updatedAt: new Date() })
      .where(
        and(
          eq(businessPayoutBankAccounts.businessId, businessId),
          eq(businessPayoutBankAccounts.id, id),
          isNull(businessPayoutBankAccounts.deletedAt),
        ),
      )
      .returning();
  }

  listPayouts(businessId: string): Promise<BusinessPayout[]> {
    return this.db
      .select()
      .from(businessPayouts)
      .where(eq(businessPayouts.businessId, businessId))
      .orderBy(desc(businessPayouts.createdAt));
  }

  findPayoutByProviderReference(
    providerReference: string,
  ): Promise<BusinessPayout | undefined> {
    return this.db.query.businessPayouts.findFirst({
      where: eq(businessPayouts.providerReference, providerReference),
    });
  }

  async createPayoutIdempotently(
    input: typeof businessPayouts.$inferInsert,
  ): Promise<{ payout: BusinessPayout; created: boolean }> {
    if (!input.idempotencyKey) {
      const [payout] = await this.db
        .insert(businessPayouts)
        .values(input)
        .returning();

      return { payout, created: true };
    }

    const [payout] = await this.db
      .insert(businessPayouts)
      .values(input)
      .onConflictDoNothing({
        target: businessPayouts.idempotencyKey,
      })
      .returning();

    if (payout) {
      return { payout, created: true };
    }

    const existing = await this.db.query.businessPayouts.findFirst({
      where: eq(businessPayouts.idempotencyKey, input.idempotencyKey),
    });

    if (!existing) {
      throw new Error('Unable to load existing payout');
    }

    return { payout: existing, created: false };
  }

  updatePayout(
    id: string,
    input: Partial<typeof businessPayouts.$inferInsert>,
  ): Promise<BusinessPayout[]> {
    return this.db
      .update(businessPayouts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(businessPayouts.id, id))
      .returning();
  }
}
