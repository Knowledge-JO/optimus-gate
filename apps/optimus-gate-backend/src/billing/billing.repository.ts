import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import {
  businessPayoutBankAccounts,
  businessPayouts,
  businessCustomers,
  customerPaymentMethods,
  ledgerEntries,
  nombaCheckoutOrders,
  nombaReconciliationRuns,
  nombaWebhookEvents,
  plans,
  subscriptionInvoices,
  subscriptionPaymentAttempts,
  subscriptionRefunds,
  subscriptions,
} from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';

type Plan = typeof plans.$inferSelect;
type Subscription = typeof subscriptions.$inferSelect;
type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
type SubscriptionPaymentAttempt =
  typeof subscriptionPaymentAttempts.$inferSelect;
type SubscriptionRefund = typeof subscriptionRefunds.$inferSelect;
type CustomerPaymentMethod = typeof customerPaymentMethods.$inferSelect;
type BusinessCustomer = typeof businessCustomers.$inferSelect;
type NombaCheckoutOrder = typeof nombaCheckoutOrders.$inferSelect;
type NombaWebhookEvent = typeof nombaWebhookEvents.$inferSelect;
type NombaReconciliationRun = typeof nombaReconciliationRuns.$inferSelect;
type LedgerEntry = typeof ledgerEntries.$inferSelect;
type BusinessPayoutBankAccount = typeof businessPayoutBankAccounts.$inferSelect;
type BusinessPayout = typeof businessPayouts.$inferSelect;

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

  listRefundsForBusiness(businessId: string): Promise<SubscriptionRefund[]> {
    return this.db
      .select()
      .from(subscriptionRefunds)
      .where(eq(subscriptionRefunds.businessId, businessId))
      .orderBy(desc(subscriptionRefunds.createdAt));
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

  listPayoutBankAccountsForBusiness(
    businessId: string,
  ): Promise<BusinessPayoutBankAccount[]> {
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

  listBusinessPayoutsForBusiness(
    businessId: string,
  ): Promise<BusinessPayout[]> {
    return this.db
      .select()
      .from(businessPayouts)
      .where(eq(businessPayouts.businessId, businessId))
      .orderBy(desc(businessPayouts.createdAt));
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

  findSubscriptionForBusiness(
    businessId: string,
    subscriptionId: string,
  ): Promise<Subscription | undefined> {
    return this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.businessId, businessId),
        eq(subscriptions.id, subscriptionId),
      ),
    });
  }

  findInvoiceById(invoiceId: string): Promise<SubscriptionInvoice | undefined> {
    return this.db.query.subscriptionInvoices.findFirst({
      where: eq(subscriptionInvoices.id, invoiceId),
    });
  }

  findPaymentAttemptForBusiness(
    businessId: string,
    paymentAttemptId: string,
  ): Promise<SubscriptionPaymentAttempt | undefined> {
    return this.db.query.subscriptionPaymentAttempts.findFirst({
      where: and(
        eq(subscriptionPaymentAttempts.businessId, businessId),
        eq(subscriptionPaymentAttempts.id, paymentAttemptId),
      ),
    });
  }

  findPaymentAttemptByReferenceForBusiness(
    businessId: string,
    providerReference: string,
  ): Promise<SubscriptionPaymentAttempt | undefined> {
    return this.db.query.subscriptionPaymentAttempts.findFirst({
      where: and(
        eq(subscriptionPaymentAttempts.businessId, businessId),
        eq(subscriptionPaymentAttempts.providerReference, providerReference),
      ),
    });
  }

  findPaymentAttemptByMerchantTxRef(
    merchantTxRef: string,
  ): Promise<SubscriptionPaymentAttempt | undefined> {
    return this.db.query.subscriptionPaymentAttempts.findFirst({
      where: or(
        eq(subscriptionPaymentAttempts.merchantTxRef, merchantTxRef),
        sql`${subscriptionPaymentAttempts.rawResponse}->'data'->>'merchantTxRef' = ${merchantTxRef}`,
        sql`${subscriptionPaymentAttempts.rawResponse}->'verificationPayment'->>'merchantTxRef' = ${merchantTxRef}`,
        sql`${subscriptionPaymentAttempts.rawResponse}->'webhookPayment'->>'merchantTxRef' = ${merchantTxRef}`,
      ),
      orderBy: (attempts, { desc }) => [desc(attempts.createdAt)],
    });
  }

  listRefundsForPaymentAttempt(
    businessId: string,
    paymentAttemptId: string,
  ): Promise<SubscriptionRefund[]> {
    return this.db
      .select()
      .from(subscriptionRefunds)
      .where(
        and(
          eq(subscriptionRefunds.businessId, businessId),
          eq(subscriptionRefunds.paymentAttemptId, paymentAttemptId),
        ),
      );
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

  async createRefundIdempotently(
    input: typeof subscriptionRefunds.$inferInsert,
  ): Promise<{ refund: SubscriptionRefund; created: boolean }> {
    if (!input.idempotencyKey) {
      const [refund] = await this.db
        .insert(subscriptionRefunds)
        .values(input)
        .returning();

      return { refund, created: true };
    }

    const [refund] = await this.db
      .insert(subscriptionRefunds)
      .values(input)
      .onConflictDoNothing({
        target: subscriptionRefunds.idempotencyKey,
      })
      .returning();

    if (refund) {
      return { refund, created: true };
    }

    const existing = await this.db.query.subscriptionRefunds.findFirst({
      where: eq(subscriptionRefunds.idempotencyKey, input.idempotencyKey),
    });

    if (!existing) {
      throw new Error('Unable to load existing refund');
    }

    return { refund: existing, created: false };
  }

  updateRefund(
    id: string,
    input: Partial<typeof subscriptionRefunds.$inferInsert>,
  ): Promise<SubscriptionRefund[]> {
    return this.db
      .update(subscriptionRefunds)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(subscriptionRefunds.id, id))
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

  async upsertPaymentMethodByTokenKey(
    input: typeof customerPaymentMethods.$inferInsert,
  ): Promise<CustomerPaymentMethod> {
    const [paymentMethod] = await this.db
      .insert(customerPaymentMethods)
      .values(input)
      .onConflictDoUpdate({
        target: [
          customerPaymentMethods.businessId,
          customerPaymentMethods.tokenKey,
        ],
        set: {
          businessCustomerId: input.businessCustomerId,
          userId: input.userId,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          isDefault: input.isDefault ?? false,
          metadata: input.metadata ?? {},
          revokedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return paymentMethod;
  }

  unsetDefaultPaymentMethods(businessId: string, customerId: string) {
    return this.db
      .update(customerPaymentMethods)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(
        and(
          eq(customerPaymentMethods.businessId, businessId),
          eq(customerPaymentMethods.customerId, customerId),
          eq(customerPaymentMethods.isDefault, true),
          isNull(customerPaymentMethods.revokedAt),
        ),
      )
      .returning();
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

  async createWebhookEventIdempotently(
    input: typeof nombaWebhookEvents.$inferInsert,
  ): Promise<{ event: NombaWebhookEvent; created: boolean }> {
    if (!input.eventReference) {
      const [event] = await this.createWebhookEvent(input);

      if (!event) {
        throw new Error('Unable to create webhook event');
      }

      return { event, created: true };
    }

    const [event] = await this.db
      .insert(nombaWebhookEvents)
      .values(input)
      .onConflictDoNothing({
        target: nombaWebhookEvents.eventReference,
      })
      .returning();

    if (event) {
      return { event, created: true };
    }

    const existing = await this.db.query.nombaWebhookEvents.findFirst({
      where: eq(nombaWebhookEvents.eventReference, input.eventReference),
    });

    if (!existing) {
      throw new Error('Unable to load existing webhook event');
    }

    return { event: existing, created: false };
  }

  markWebhookEventProcessed(id: string): Promise<NombaWebhookEvent[]> {
    return this.db
      .update(nombaWebhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(nombaWebhookEvents.id, id))
      .returning();
  }

  findLastSuccessfulNombaReconciliationRun(): Promise<
    NombaReconciliationRun | undefined
  > {
    return this.db.query.nombaReconciliationRuns.findFirst({
      where: eq(nombaReconciliationRuns.status, 'succeeded'),
      orderBy: (runs, { desc }) => [desc(runs.dateTo)],
    });
  }

  async createNombaReconciliationRun(
    input: typeof nombaReconciliationRuns.$inferInsert,
  ): Promise<NombaReconciliationRun> {
    const [run] = await this.db
      .insert(nombaReconciliationRuns)
      .values(input)
      .returning();

    if (!run) {
      throw new Error('Unable to create Nomba reconciliation run');
    }

    return run;
  }

  updateNombaReconciliationRun(
    id: string,
    input: Partial<typeof nombaReconciliationRuns.$inferInsert>,
  ): Promise<NombaReconciliationRun[]> {
    return this.db
      .update(nombaReconciliationRuns)
      .set(input)
      .where(eq(nombaReconciliationRuns.id, id))
      .returning();
  }

  async findDueSubscriptions(cutoff: Date): Promise<Subscription[]> {
    return this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          inArray(subscriptions.status, ['active', 'past_due']),
          eq(subscriptions.cancelAtPeriodEnd, false),
          lte(subscriptions.currentPeriodEnd, cutoff),
        ),
      );
  }

  async findSubscriptionsDueForPeriodEndCancellation(
    cutoff: Date,
  ): Promise<Subscription[]> {
    return this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          inArray(subscriptions.status, ['active', 'past_due']),
          eq(subscriptions.cancelAtPeriodEnd, true),
          lte(subscriptions.currentPeriodEnd, cutoff),
        ),
      );
  }
}
