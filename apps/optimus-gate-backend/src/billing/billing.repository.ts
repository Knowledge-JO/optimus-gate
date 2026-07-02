import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import {
  customerPaymentMethods,
  nombaCheckoutOrders,
  nombaWebhookEvents,
  plans,
  subscriptionInvoices,
  subscriptionPaymentAttempts,
  subscriptions,
} from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';

@Injectable()
export class BillingRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  createPlan(input: typeof plans.$inferInsert) {
    return this.db.insert(plans).values(input).returning();
  }

  findPlanForUser(userId: string, planId: string) {
    return this.db.query.plans.findFirst({
      where: and(eq(plans.userId, userId), eq(plans.id, planId)),
    });
  }

  createSubscription(input: typeof subscriptions.$inferInsert) {
    return this.db.insert(subscriptions).values(input).returning();
  }

  findSubscriptionForUser(userId: string, subscriptionId: string) {
    return this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.id, subscriptionId),
      ),
    });
  }

  findSubscriptionById(subscriptionId: string) {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
    });
  }

  findPlanById(planId: string) {
    return this.db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });
  }

  findOpenInvoiceForSubscription(subscriptionId: string) {
    return this.db.query.subscriptionInvoices.findFirst({
      where: and(
        eq(subscriptionInvoices.subscriptionId, subscriptionId),
        inArray(subscriptionInvoices.status, ['open', 'draft']),
      ),
    });
  }

  createInvoice(input: typeof subscriptionInvoices.$inferInsert) {
    return this.db.insert(subscriptionInvoices).values(input).returning();
  }

  createPaymentAttempt(input: typeof subscriptionPaymentAttempts.$inferInsert) {
    return this.db
      .insert(subscriptionPaymentAttempts)
      .values(input)
      .returning();
  }

  updatePaymentAttempt(
    id: string,
    input: Partial<typeof subscriptionPaymentAttempts.$inferInsert>,
  ) {
    return this.db
      .update(subscriptionPaymentAttempts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptionPaymentAttempts.id, id))
      .returning();
  }

  createCheckoutOrder(input: typeof nombaCheckoutOrders.$inferInsert) {
    return this.db.insert(nombaCheckoutOrders).values(input).returning();
  }

  findCheckoutOrderByReference(orderReference: string) {
    return this.db.query.nombaCheckoutOrders.findFirst({
      where: eq(nombaCheckoutOrders.orderReference, orderReference),
    });
  }

  updateInvoice(
    id: string,
    input: Partial<typeof subscriptionInvoices.$inferInsert>,
  ) {
    return this.db
      .update(subscriptionInvoices)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptionInvoices.id, id))
      .returning();
  }

  updateSubscription(
    id: string,
    input: Partial<typeof subscriptions.$inferInsert>,
  ) {
    return this.db
      .update(subscriptions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
  }

  createPaymentMethod(input: typeof customerPaymentMethods.$inferInsert) {
    return this.db.insert(customerPaymentMethods).values(input).returning();
  }

  findDefaultPaymentMethod(userId: string, customerId: string) {
    return this.db.query.customerPaymentMethods.findFirst({
      where: and(
        eq(customerPaymentMethods.userId, userId),
        eq(customerPaymentMethods.customerId, customerId),
        eq(customerPaymentMethods.isDefault, true),
        isNull(customerPaymentMethods.revokedAt),
      ),
    });
  }

  createWebhookEvent(input: typeof nombaWebhookEvents.$inferInsert) {
    return this.db.insert(nombaWebhookEvents).values(input).returning();
  }

  async findDueSubscriptions(cutoff: Date) {
    return this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          inArray(subscriptions.status, ['active', 'past_due']),
          lte(subscriptions.currentPeriodEnd, cutoff),
        ),
      );
  }
}
