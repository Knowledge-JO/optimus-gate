import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  apiKeys,
  businessCustomers,
  businessMembers,
  businesses,
  customerPaymentMethods,
  ledgerAccounts,
  ledgerEntries,
  nombaCheckoutOrders,
  nombaWebhookEvents,
  plans,
  subscriptionInvoices,
  subscriptionPaymentAttempts,
  subscriptions,
  users,
} from '../src/database/schemas';
import * as schema from '../src/database/schemas';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/optimus_gate';

const ids = {
  user: '11111111-1111-4111-8111-111111111111',
  business: '22222222-2222-4222-8222-222222222222',
  member: '33333333-3333-4333-8333-333333333333',
  availableLedger: '44444444-4444-4444-8444-444444444444',
  pendingLedger: '55555555-5555-4555-8555-555555555555',
  planStarter: '66666666-6666-4666-8666-666666666661',
  planGrowth: '66666666-6666-4666-8666-666666666662',
  planScale: '66666666-6666-4666-8666-666666666663',
  customerAda: '77777777-7777-4777-8777-777777777771',
  customerTobi: '77777777-7777-4777-8777-777777777772',
  customerMina: '77777777-7777-4777-8777-777777777773',
  paymentMethodAda: '88888888-8888-4888-8888-888888888881',
  paymentMethodTobi: '88888888-8888-4888-8888-888888888882',
  subAda: '99999999-9999-4999-8999-999999999991',
  subTobi: '99999999-9999-4999-8999-999999999992',
  subMina: '99999999-9999-4999-8999-999999999993',
  invoiceAdaPaid: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  invoiceAdaOpen: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  invoiceTobiFailed: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  invoiceMinaOpen: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  attemptAdaPaid: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  attemptAdaRenewal: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  attemptTobiFailed: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
  attemptMinaCheckout: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
  checkoutAda: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
  checkoutMina: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
  ledgerPayment: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
  ledgerRenewal: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
  webhookAda: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
  webhookRenewal: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
};

const demoPassword = 'Password123!';
const demoApiKey = 'og_test_seedkey1_demo_7CspM2mzV8kRvcB9jM7VaQ';
const demoApiKeyPrefix = 'og_test_seedkey1';

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function daysAgo(days: number) {
  return daysFromNow(-days);
}

async function main() {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    await assertRequiredTables(db);
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const apiKeyHash = await bcrypt.hash(demoApiKey, 12);

    await db
      .insert(users)
      .values({
        id: ids.user,
        email: 'demo@optimusgate.local',
        passwordHash,
        firstName: 'Demo',
        lastName: 'Merchant',
        isEmailVerified: true,
        role: 'merchant',
        permissions: [
          'dashboard:read',
          'plans:manage',
          'subscriptions:manage',
          'api_keys:manage',
        ],
        createdAt: daysAgo(90),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash,
          firstName: 'Demo',
          lastName: 'Merchant',
          isEmailVerified: true,
          role: 'merchant',
          permissions: [
            'dashboard:read',
            'plans:manage',
            'subscriptions:manage',
            'api_keys:manage',
          ],
          updatedAt: new Date(),
        },
      });

    await db
      .insert(businesses)
      .values({
        id: ids.business,
        ownerUserId: ids.user,
        name: 'Optimus Demo SaaS',
        slug: 'optimus-demo-saas',
        status: 'active',
        metadata: {
          industry: 'SaaS',
          supportEmail: 'support@optimus-demo.test',
          settlementModel: 'central_nomba_sub_account_internal_ledger',
        },
        createdAt: daysAgo(88),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: businesses.slug,
        set: {
          ownerUserId: ids.user,
          name: 'Optimus Demo SaaS',
          status: 'active',
          metadata: {
            industry: 'SaaS',
            supportEmail: 'support@optimus-demo.test',
            settlementModel: 'central_nomba_sub_account_internal_ledger',
          },
          updatedAt: new Date(),
        },
      });

    await db
      .insert(businessMembers)
      .values({
        id: ids.member,
        businessId: ids.business,
        userId: ids.user,
        role: 'owner',
        createdAt: daysAgo(88),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [businessMembers.businessId, businessMembers.userId],
        set: {
          role: 'owner',
          updatedAt: new Date(),
        },
      });

    const existingApiKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.prefix, demoApiKeyPrefix),
    });

    if (existingApiKey) {
      await db
        .update(apiKeys)
        .set({
          businessId: ids.business,
          userId: ids.user,
          createdByUserId: ids.user,
          name: 'Demo frontend test key',
          keyHash: apiKeyHash,
          scopes: ['subscriptions:create', 'subscriptions:read'],
          environment: 'test',
          revokedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(apiKeys.id, existingApiKey.id));
    } else {
      await db.insert(apiKeys).values({
        businessId: ids.business,
        userId: ids.user,
        createdByUserId: ids.user,
        name: 'Demo frontend test key',
        prefix: demoApiKeyPrefix,
        keyHash: apiKeyHash,
        scopes: ['subscriptions:create', 'subscriptions:read'],
        environment: 'test',
        createdAt: daysAgo(80),
        updatedAt: new Date(),
      });
    }

    await db
      .insert(plans)
      .values([
        {
          id: ids.planStarter,
          businessId: ids.business,
          userId: ids.user,
          name: 'Starter',
          description: 'Entry subscription for early customers.',
          amount: '5000.00',
          currency: 'NGN',
          interval: 'month',
          intervalCount: 1,
          isActive: true,
          metadata: { features: ['3 projects', 'Email support'] },
          createdAt: daysAgo(70),
          updatedAt: new Date(),
        },
        {
          id: ids.planGrowth,
          businessId: ids.business,
          userId: ids.user,
          name: 'Growth',
          description: 'Popular plan for growing teams.',
          amount: '15000.00',
          currency: 'NGN',
          interval: 'month',
          intervalCount: 1,
          isActive: true,
          metadata: { features: ['20 projects', 'Priority support'] },
          createdAt: daysAgo(68),
          updatedAt: new Date(),
        },
        {
          id: ids.planScale,
          businessId: ids.business,
          userId: ids.user,
          name: 'Scale',
          description: 'Annual plan for larger teams.',
          amount: '150000.00',
          currency: 'NGN',
          interval: 'year',
          intervalCount: 1,
          isActive: true,
          metadata: { features: ['Unlimited projects', 'Dedicated support'] },
          createdAt: daysAgo(66),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          businessId: ids.business,
          userId: ids.user,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(businessCustomers)
      .values([
        {
          id: ids.customerAda,
          businessId: ids.business,
          externalCustomerId: 'cus_demo_ada',
          email: 'ada@example.com',
          name: 'Ada Okafor',
          phone: '+2348010000001',
          metadata: { source: 'seed', company: 'Ada Studio' },
          createdAt: daysAgo(44),
          updatedAt: new Date(),
        },
        {
          id: ids.customerTobi,
          businessId: ids.business,
          externalCustomerId: 'cus_demo_tobi',
          email: 'tobi@example.com',
          name: 'Tobi Balogun',
          phone: '+2348010000002',
          metadata: { source: 'seed', company: 'Tobi Labs' },
          createdAt: daysAgo(30),
          updatedAt: new Date(),
        },
        {
          id: ids.customerMina,
          businessId: ids.business,
          externalCustomerId: 'cus_demo_mina',
          email: 'mina@example.com',
          name: 'Mina Bello',
          phone: '+2348010000003',
          metadata: { source: 'seed', company: 'Mina Retail' },
          createdAt: daysAgo(3),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: [
          businessCustomers.businessId,
          businessCustomers.externalCustomerId,
        ],
        set: {
          metadata: { source: 'seed' },
          updatedAt: new Date(),
        },
      });

    await db
      .insert(customerPaymentMethods)
      .values([
        {
          id: ids.paymentMethodAda,
          businessId: ids.business,
          businessCustomerId: ids.customerAda,
          userId: ids.user,
          provider: 'nomba',
          type: 'tokenized_card',
          tokenKey: 'tok_seed_ada_4242',
          customerId: 'cus_demo_ada',
          customerEmail: 'ada@example.com',
          isDefault: true,
          metadata: {
            brand: 'visa',
            last4: '4242',
            expMonth: '12',
            expYear: '2030',
          },
          createdAt: daysAgo(44),
          updatedAt: new Date(),
        },
        {
          id: ids.paymentMethodTobi,
          businessId: ids.business,
          businessCustomerId: ids.customerTobi,
          userId: ids.user,
          provider: 'nomba',
          type: 'tokenized_card',
          tokenKey: 'tok_seed_tobi_1881',
          customerId: 'cus_demo_tobi',
          customerEmail: 'tobi@example.com',
          isDefault: true,
          metadata: {
            brand: 'mastercard',
            last4: '1881',
            expMonth: '08',
            expYear: '2029',
          },
          createdAt: daysAgo(30),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: customerPaymentMethods.id,
        set: {
          isDefault: true,
          revokedAt: null,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(subscriptions)
      .values([
        {
          id: ids.subAda,
          businessId: ids.business,
          businessCustomerId: ids.customerAda,
          userId: ids.user,
          planId: ids.planGrowth,
          paymentMethodId: ids.paymentMethodAda,
          status: 'active',
          customerId: 'cus_demo_ada',
          customerEmail: 'ada@example.com',
          currentPeriodStart: daysAgo(10),
          currentPeriodEnd: daysFromNow(20),
          cancelAtPeriodEnd: false,
          metadata: { source: 'seed', seats: 8 },
          createdAt: daysAgo(44),
          updatedAt: new Date(),
        },
        {
          id: ids.subTobi,
          businessId: ids.business,
          businessCustomerId: ids.customerTobi,
          userId: ids.user,
          planId: ids.planStarter,
          paymentMethodId: ids.paymentMethodTobi,
          status: 'past_due',
          customerId: 'cus_demo_tobi',
          customerEmail: 'tobi@example.com',
          currentPeriodStart: daysAgo(33),
          currentPeriodEnd: daysAgo(3),
          cancelAtPeriodEnd: false,
          metadata: { source: 'seed', failedRenewals: 1 },
          createdAt: daysAgo(30),
          updatedAt: new Date(),
        },
        {
          id: ids.subMina,
          businessId: ids.business,
          businessCustomerId: ids.customerMina,
          userId: ids.user,
          planId: ids.planScale,
          status: 'incomplete',
          customerId: 'cus_demo_mina',
          customerEmail: 'mina@example.com',
          currentPeriodStart: daysAgo(1),
          currentPeriodEnd: daysFromNow(364),
          cancelAtPeriodEnd: false,
          metadata: { source: 'seed', checkoutState: 'pending' },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          businessId: ids.business,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(subscriptionInvoices)
      .values([
        {
          id: ids.invoiceAdaPaid,
          businessId: ids.business,
          businessCustomerId: ids.customerAda,
          userId: ids.user,
          subscriptionId: ids.subAda,
          status: 'paid',
          amount: '15000.00',
          currency: 'NGN',
          dueAt: daysAgo(10),
          paidAt: daysAgo(10),
          periodStart: daysAgo(10),
          periodEnd: daysFromNow(20),
          metadata: { source: 'seed' },
          createdAt: daysAgo(10),
          updatedAt: new Date(),
        },
        {
          id: ids.invoiceAdaOpen,
          businessId: ids.business,
          businessCustomerId: ids.customerAda,
          userId: ids.user,
          subscriptionId: ids.subAda,
          status: 'open',
          amount: '15000.00',
          currency: 'NGN',
          dueAt: daysFromNow(20),
          periodStart: daysFromNow(20),
          periodEnd: daysFromNow(50),
          metadata: { source: 'seed', reason: 'upcoming renewal' },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
        {
          id: ids.invoiceTobiFailed,
          businessId: ids.business,
          businessCustomerId: ids.customerTobi,
          userId: ids.user,
          subscriptionId: ids.subTobi,
          status: 'failed',
          amount: '5000.00',
          currency: 'NGN',
          dueAt: daysAgo(3),
          periodStart: daysAgo(33),
          periodEnd: daysAgo(3),
          metadata: { source: 'seed', failureReason: 'Insufficient funds' },
          createdAt: daysAgo(3),
          updatedAt: new Date(),
        },
        {
          id: ids.invoiceMinaOpen,
          businessId: ids.business,
          businessCustomerId: ids.customerMina,
          userId: ids.user,
          subscriptionId: ids.subMina,
          status: 'open',
          amount: '150000.00',
          currency: 'NGN',
          dueAt: new Date(),
          periodStart: daysAgo(1),
          periodEnd: daysFromNow(364),
          metadata: { source: 'seed', checkoutState: 'pending' },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: subscriptionInvoices.id,
        set: {
          businessId: ids.business,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(subscriptionPaymentAttempts)
      .values([
        {
          id: ids.attemptAdaPaid,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subAda,
          invoiceId: ids.invoiceAdaPaid,
          paymentMethodId: ids.paymentMethodAda,
          status: 'succeeded',
          provider: 'nomba',
          providerReference: 'og_seed_checkout_ada_001',
          amount: '15000.00',
          currency: 'NGN',
          attemptNumber: 1,
          rawResponse: { code: '00', data: { status: 'SUCCESS' } },
          createdAt: daysAgo(10),
          updatedAt: new Date(),
        },
        {
          id: ids.attemptAdaRenewal,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subAda,
          invoiceId: ids.invoiceAdaOpen,
          paymentMethodId: ids.paymentMethodAda,
          status: 'pending',
          provider: 'nomba',
          providerReference: 'og_seed_renewal_ada_002',
          amount: '15000.00',
          currency: 'NGN',
          attemptNumber: 1,
          nextRetryAt: daysFromNow(20),
          rawResponse: { code: '00', data: { status: 'PENDING' } },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
        {
          id: ids.attemptTobiFailed,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subTobi,
          invoiceId: ids.invoiceTobiFailed,
          paymentMethodId: ids.paymentMethodTobi,
          status: 'failed',
          provider: 'nomba',
          providerReference: 'og_seed_renewal_tobi_001',
          amount: '5000.00',
          currency: 'NGN',
          attemptNumber: 1,
          failureReason: 'Insufficient funds',
          nextRetryAt: daysFromNow(1),
          rawResponse: {
            code: '91',
            description: 'Insufficient funds',
            data: { status: 'FAILED' },
          },
          createdAt: daysAgo(3),
          updatedAt: new Date(),
        },
        {
          id: ids.attemptMinaCheckout,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subMina,
          invoiceId: ids.invoiceMinaOpen,
          status: 'processing',
          provider: 'nomba',
          providerReference: 'og_seed_checkout_mina_001',
          amount: '150000.00',
          currency: 'NGN',
          attemptNumber: 1,
          rawResponse: { code: '00', data: { status: 'PENDING' } },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: subscriptionPaymentAttempts.id,
        set: {
          businessId: ids.business,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(nombaCheckoutOrders)
      .values([
        {
          id: ids.checkoutAda,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subAda,
          invoiceId: ids.invoiceAdaPaid,
          paymentAttemptId: ids.attemptAdaPaid,
          orderReference: 'og_seed_checkout_ada_001',
          checkoutLink: 'https://checkout.nomba.com/seed/ada',
          status: 'paid',
          rawResponse: {
            code: '00',
            data: {
              checkoutLink: 'https://checkout.nomba.com/seed/ada',
              orderReference: 'og_seed_checkout_ada_001',
            },
          },
          createdAt: daysAgo(10),
          updatedAt: new Date(),
        },
        {
          id: ids.checkoutMina,
          businessId: ids.business,
          userId: ids.user,
          subscriptionId: ids.subMina,
          invoiceId: ids.invoiceMinaOpen,
          paymentAttemptId: ids.attemptMinaCheckout,
          orderReference: 'og_seed_checkout_mina_001',
          checkoutLink: 'https://checkout.nomba.com/seed/mina',
          status: 'pending',
          rawResponse: {
            code: '00',
            data: {
              checkoutLink: 'https://checkout.nomba.com/seed/mina',
              orderReference: 'og_seed_checkout_mina_001',
            },
          },
          createdAt: daysAgo(1),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: nombaCheckoutOrders.orderReference,
        set: {
          businessId: ids.business,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(ledgerAccounts)
      .values([
        {
          id: ids.availableLedger,
          businessId: ids.business,
          type: 'business_available',
          currency: 'NGN',
          createdAt: daysAgo(44),
          updatedAt: new Date(),
        },
        {
          id: ids.pendingLedger,
          businessId: ids.business,
          type: 'business_pending',
          currency: 'NGN',
          createdAt: daysAgo(44),
          updatedAt: new Date(),
        },
      ])
      .onConflictDoUpdate({
        target: [
          ledgerAccounts.businessId,
          ledgerAccounts.type,
          ledgerAccounts.currency,
        ],
        set: {
          updatedAt: new Date(),
        },
      });

    await db
      .insert(ledgerEntries)
      .values([
        {
          id: ids.ledgerPayment,
          businessId: ids.business,
          ledgerAccountId: ids.availableLedger,
          type: 'payment_credit',
          amount: '15000.00',
          currency: 'NGN',
          idempotencyKey: `seed:payment:${ids.attemptAdaPaid}`,
          sourceType: 'subscription_payment_attempt',
          sourceId: ids.attemptAdaPaid,
          description: 'Seeded successful checkout payment',
          metadata: {
            orderReference: 'og_seed_checkout_ada_001',
            invoiceId: ids.invoiceAdaPaid,
            subscriptionId: ids.subAda,
          },
          createdAt: daysAgo(10),
        },
        {
          id: ids.ledgerRenewal,
          businessId: ids.business,
          ledgerAccountId: ids.availableLedger,
          type: 'renewal_credit',
          amount: '15000.00',
          currency: 'NGN',
          idempotencyKey: `seed:renewal:${ids.attemptAdaRenewal}`,
          sourceType: 'subscription_payment_attempt',
          sourceId: ids.attemptAdaRenewal,
          description: 'Seeded renewal credit for dashboard totals',
          metadata: {
            orderReference: 'og_seed_renewal_ada_002',
            invoiceId: ids.invoiceAdaOpen,
            subscriptionId: ids.subAda,
          },
          createdAt: daysAgo(1),
        },
      ])
      .onConflictDoUpdate({
        target: ledgerEntries.idempotencyKey,
        set: {
          businessId: ids.business,
          ledgerAccountId: ids.availableLedger,
        },
      });

    await createWebhookEvent(db, {
      id: ids.webhookAda,
      businessId: ids.business,
      eventType: 'payment.success',
      signature: 'seed_signature_payment_success',
      eventReference: 'evt_seed_payment_success_ada',
      orderReference: 'og_seed_checkout_ada_001',
      payload: {
        eventType: 'payment.success',
        eventReference: 'evt_seed_payment_success_ada',
        data: {
          orderReference: 'og_seed_checkout_ada_001',
          amount: '15000.00',
          currency: 'NGN',
          status: 'SUCCESS',
          tokenKey: 'tok_seed_ada_4242',
          customerId: 'cus_demo_ada',
          customerEmail: 'ada@example.com',
        },
      },
      processedAt: daysAgo(10),
      createdAt: daysAgo(10),
    });

    await createWebhookEvent(db, {
      id: ids.webhookRenewal,
      businessId: ids.business,
      eventType: 'payment.failed',
      signature: 'seed_signature_payment_failed',
      eventReference: 'evt_seed_payment_failed_tobi',
      orderReference: 'og_seed_renewal_tobi_001',
      payload: {
        eventType: 'payment.failed',
        eventReference: 'evt_seed_payment_failed_tobi',
        data: {
          orderReference: 'og_seed_renewal_tobi_001',
          amount: '5000.00',
          currency: 'NGN',
          status: 'FAILED',
          customerId: 'cus_demo_tobi',
          customerEmail: 'tobi@example.com',
        },
      },
      processedAt: daysAgo(3),
      createdAt: daysAgo(3),
    });

    console.log('Seed completed.');
    console.log('Dashboard login: demo@optimusgate.local / Password123!');
    console.log(`Demo API key: ${demoApiKey}`);
  } finally {
    await pool.end();
  }
}

async function assertRequiredTables(
  db: ReturnType<typeof drizzle<typeof schema>>,
) {
  try {
    await db.execute(sql.raw("select 1 from businesses limit 1"));
    await db.execute(sql.raw("select 1 from business_customers limit 1"));
    await db.execute(sql.raw("select 1 from ledger_accounts limit 1"));
    await db.execute(sql.raw("select 1 from ledger_entries limit 1"));
  } catch (error) {
    throw new Error(
      'Database schema is not migrated. Run "npm run db:migrate" before "npm run db:seed".',
      { cause: error },
    );
  }
}

async function createWebhookEvent(
  db: ReturnType<typeof drizzle<typeof schema>>,
  input: typeof nombaWebhookEvents.$inferInsert,
) {
  const existing = input.eventReference
    ? await db.query.nombaWebhookEvents.findFirst({
        where: eq(nombaWebhookEvents.eventReference, input.eventReference),
      })
    : undefined;

  if (existing) {
    await db
      .update(nombaWebhookEvents)
      .set({
        businessId: input.businessId,
        eventType: input.eventType,
        signature: input.signature,
        orderReference: input.orderReference,
        payload: input.payload,
        processedAt: input.processedAt,
      })
      .where(eq(nombaWebhookEvents.id, existing.id));
    return;
  }

  await db.insert(nombaWebhookEvents).values(input);
}

main().catch((error: unknown) => {
  console.error('Seed failed.');
  console.error(error);
  process.exitCode = 1;
});
