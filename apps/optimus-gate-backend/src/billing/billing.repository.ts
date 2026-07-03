import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, lte } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import {
  businessCustomers,
  customerPaymentMethods,
  ledgerEntries,
  nombaCheckoutOrders,
  nombaWebhookEvents,
  plans,
  subscriptionInvoices,
  subscriptionPaymentAttempts,
  subscriptions,
} from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';

type Plan = typeof plans.$inferSelect;
type Subscription = typeof subscriptions.$inferSelect;
type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
type SubscriptionPaymentAttempt =
  typeof subscriptionPaymentAttempts.$inferSelect;
type CustomerPaymentMethod = typeof customerPaymentMethods.$inferSelect;
type BusinessCustomer = typeof businessCustomers.$inferSelect;
type NombaCheckoutOrder = typeof nombaCheckoutOrders.$inferSelect;
type NombaWebhookEvent = typeof nombaWebhookEvents.$inferSelect;
type LedgerEntry = typeof ledgerEntries.$inferSelect;

@Injectable()
export class BillingRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  createPlan(input: typeof plans.$inferInsert): Promise<Plan[]> {
    return this.db.insert(plans).values(input).returning();
  }

  findPlanForBusiness(
    businessId: string,
    planId: string,
  ): Promise<Plan | undefined> {
    return this.db.query.plans.findFirst({
      where: and(eq(plans.businessId, businessId), eq(plans.id, planId)),
    });
  }

  listPlansForBusiness(businessId: string): Promise<Plan[]> {
    return this.db
      .select()
      .from(plans)
      .where(eq(plans.businessId, businessId))
      .orderBy(desc(plans.createdAt));
  }

  listBusinessCustomersForBusiness(
    businessId: string,
  ): Promise<BusinessCustomer[]> {
    return this.db
      .select()
      .from(businessCustomers)
      .where(eq(businessCustomers.businessId, businessId))
      .orderBy(desc(businessCustomers.createdAt));
  }

  listSubscriptionsForBusiness(businessId: string): Promise<Subscription[]> {
    return this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.businessId, businessId))
      .orderBy(desc(subscriptions.createdAt));
  }

  listInvoicesForBusiness(businessId: string): Promise<SubscriptionInvoice[]> {
    return this.db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.businessId, businessId))
      .orderBy(desc(subscriptionInvoices.createdAt));
  }

  listPaymentAttemptsForBusiness(
    businessId: string,
  ): Promise<SubscriptionPaymentAttempt[]> {
    return this.db
      .select()
      .from(subscriptionPaymentAttempts)
      .where(eq(subscriptionPaymentAttempts.businessId, businessId))
      .orderBy(desc(subscriptionPaymentAttempts.createdAt));
  }

  listPaymentMethodsForBusiness(
    businessId: string,
  ): Promise<CustomerPaymentMethod[]> {
    return this.db
      .select()
      .from(customerPaymentMethods)
      .where(eq(customerPaymentMethods.businessId, businessId))
      .orderBy(desc(customerPaymentMethods.createdAt));
  }

  listCheckoutOrdersForBusiness(
    businessId: string,
  ): Promise<NombaCheckoutOrder[]> {
    return this.db
      .select()
      .from(nombaCheckoutOrders)
      .where(eq(nombaCheckoutOrders.businessId, businessId))
      .orderBy(desc(nombaCheckoutOrders.createdAt));
  }

  listLedgerEntriesForBusiness(businessId: string): Promise<LedgerEntry[]> {
    return this.db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.businessId, businessId))
      .orderBy(desc(ledgerEntries.createdAt));
  }

  createSubscription(
    input: typeof subscriptions.$inferInsert,
  ): Promise<Subscription[]> {
    return this.db.insert(subscriptions).values(input).returning();
  }

  findSubscriptionForUser(
    userId: string,
    subscriptionId: string,
  ): Promise<Subscription | undefined> {
    return this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.id, subscriptionId),
      ),
    });
  }

  findSubscriptionById(
    subscriptionId: string,
  ): Promise<Subscription | undefined> {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
    });
  }

  findInvoiceById(invoiceId: string): Promise<SubscriptionInvoice | undefined> {
    return this.db.query.subscriptionInvoices.findFirst({
      where: eq(subscriptionInvoices.id, invoiceId),
    });
  }

  findPlanById(planId: string): Promise<Plan | undefined> {
    return this.db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });
  }

  findOpenInvoiceForSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionInvoice | undefined> {
    return this.db.query.subscriptionInvoices.findFirst({
      where: and(
        eq(subscriptionInvoices.subscriptionId, subscriptionId),
        inArray(subscriptionInvoices.status, ['open', 'draft']),
      ),
    });
  }

  createInvoice(
    input: typeof subscriptionInvoices.$inferInsert,
  ): Promise<SubscriptionInvoice[]> {
    return this.db.insert(subscriptionInvoices).values(input).returning();
  }

  createPaymentAttempt(
    input: typeof subscriptionPaymentAttempts.$inferInsert,
  ): Promise<SubscriptionPaymentAttempt[]> {
    return this.db
      .insert(subscriptionPaymentAttempts)
      .values(input)
      .returning();
  }

  updatePaymentAttempt(
    id: string,
    input: Partial<typeof subscriptionPaymentAttempts.$inferInsert>,
  ): Promise<SubscriptionPaymentAttempt[]> {
    return this.db
      .update(subscriptionPaymentAttempts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptionPaymentAttempts.id, id))
      .returning();
  }

  createCheckoutOrder(
    input: typeof nombaCheckoutOrders.$inferInsert,
  ): Promise<NombaCheckoutOrder[]> {
    return this.db.insert(nombaCheckoutOrders).values(input).returning();
  }

  findCheckoutOrderByReference(
    orderReference: string,
  ): Promise<NombaCheckoutOrder | undefined> {
    return this.db.query.nombaCheckoutOrders.findFirst({
      where: eq(nombaCheckoutOrders.orderReference, orderReference),
    });
  }

  updateInvoice(
    id: string,
    input: Partial<typeof subscriptionInvoices.$inferInsert>,
  ): Promise<SubscriptionInvoice[]> {
    return this.db
      .update(subscriptionInvoices)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptionInvoices.id, id))
      .returning();
  }

  updateSubscription(
    id: string,
    input: Partial<typeof subscriptions.$inferInsert>,
  ): Promise<Subscription[]> {
    return this.db
      .update(subscriptions)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
  }

  createPaymentMethod(
    input: typeof customerPaymentMethods.$inferInsert,
  ): Promise<CustomerPaymentMethod[]> {
    return this.db.insert(customerPaymentMethods).values(input).returning();
  }

  findDefaultPaymentMethod(
    businessId: string,
    customerId: string,
  ): Promise<CustomerPaymentMethod | undefined> {
    return this.db.query.customerPaymentMethods.findFirst({
      where: and(
        eq(customerPaymentMethods.businessId, businessId),
        eq(customerPaymentMethods.customerId, customerId),
        eq(customerPaymentMethods.isDefault, true),
        isNull(customerPaymentMethods.revokedAt),
      ),
    });
  }

  createWebhookEvent(
    input: typeof nombaWebhookEvents.$inferInsert,
  ): Promise<NombaWebhookEvent[]> {
    return this.db.insert(nombaWebhookEvents).values(input).returning();
  }

  async findDueSubscriptions(cutoff: Date): Promise<Subscription[]> {
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
