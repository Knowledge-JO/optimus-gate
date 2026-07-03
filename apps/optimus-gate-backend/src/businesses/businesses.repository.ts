import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import {
  businessCustomers,
  businessMembers,
  businesses,
} from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';

type Business = typeof businesses.$inferSelect;
type BusinessMember = typeof businessMembers.$inferSelect;
type BusinessCustomer = typeof businessCustomers.$inferSelect;

@Injectable()
export class BusinessesRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  createBusiness(input: typeof businesses.$inferInsert): Promise<Business[]> {
    return this.db.insert(businesses).values(input).returning();
  }

  createMember(
    input: typeof businessMembers.$inferInsert,
  ): Promise<BusinessMember[]> {
    return this.db.insert(businessMembers).values(input).returning();
  }

  findDefaultBusinessForUser(userId: string): Promise<Business | undefined> {
    return this.db.query.businesses.findFirst({
      where: eq(businesses.ownerUserId, userId),
    });
  }

  findBusinessForUser(userId: string, businessId: string): Promise<Business[]> {
    return this.db
      .select({
        id: businesses.id,
        ownerUserId: businesses.ownerUserId,
        name: businesses.name,
        slug: businesses.slug,
        status: businesses.status,
        metadata: businesses.metadata,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
      })
      .from(businesses)
      .innerJoin(
        businessMembers,
        and(
          eq(businessMembers.businessId, businesses.id),
          eq(businessMembers.userId, userId),
        ),
      )
      .where(eq(businesses.id, businessId))
      .limit(1);
  }

  async upsertBusinessCustomer(
    input: typeof businessCustomers.$inferInsert,
  ): Promise<BusinessCustomer> {
    const [customer] = await this.db
      .insert(businessCustomers)
      .values(input)
      .onConflictDoUpdate({
        target: [
          businessCustomers.businessId,
          businessCustomers.externalCustomerId,
        ],
        set: {
          email: input.email,
          name: input.name,
          phone: input.phone,
          metadata: input.metadata,
          updatedAt: new Date(),
        },
      })
      .returning();

    return customer;
  }
}
