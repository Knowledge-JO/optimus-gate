import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { ApiKeysService } from '../api-keys/api-keys.service';
import type { AuthenticatedApiKey } from '../api-keys/api-keys.types';
import { BusinessesService } from '../businesses/businesses.service';
import { LedgerService } from '../ledger/ledger.service';
import { NombaCheckoutService } from '../nomba/nomba-checkout.service';
import { NombaRefundService } from '../nomba/nomba-refund.service';
import {
  NombaTransactionService,
  type NombaTransactionVerificationData,
} from '../nomba/nomba-transaction.service';
import { RENEWAL_QUEUE } from '../queues/queues.constants';
import { BillingRepository } from './billing.repository';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { StartSubscriptionCheckoutDto } from './dto/start-subscription-checkout.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly billingRepository: BillingRepository,
    private readonly businessesService: BusinessesService,
    private readonly ledgerService: LedgerService,
    private readonly nombaCheckoutService: NombaCheckoutService,
    private readonly nombaRefundService: NombaRefundService,
    private readonly nombaTransactionService: NombaTransactionService,
    @InjectQueue(RENEWAL_QUEUE) private readonly renewalQueue: Queue,
  ) {}

  async getDashboardStats(userId: string) {
    const data = await this.getDashboardDataset(userId);
    const activeSubscriptions = data.subscriptions.filter(
      (subscription) => subscription.status === 'active',
    );
    const attempts = data.paymentAttempts;
    const succeededAttempts = attempts.filter(
      (attempt) => attempt.status === 'succeeded',
    );
    const successRate = attempts.length
      ? Math.round((succeededAttempts.length / attempts.length) * 100)
      : 0;
    const availableBalance = this.calculateLedgerBalance(data.ledgerEntries);
    const pastDueValue = data.subscriptions
      .filter((subscription) => subscription.status === 'past_due')
      .reduce((sum, subscription) => {
        const plan = data.plans.find((item) => item.id === subscription.planId);
        return sum + this.toNumber(plan?.amount);
      }, 0);

    return [
      {
        label: 'Active subscriptions',
        value: String(activeSubscriptions.length),
        tone: 'black',
      },
      {
        label: 'Available balance',
        value: this.formatNaira(availableBalance),
        tone: 'green',
      },
      {
        label: 'Past due value',
        value: this.formatNaira(pastDueValue),
        tone: pastDueValue > 0 ? 'red' : 'amber',
      },
      {
        label: 'Payment success',
        value: `${successRate}%`,
        tone: successRate >= 80 ? 'blue' : 'amber',
      },
    ];
  }

  async listDashboardPlans(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.plans.map((plan) => {
      const planSubscriptions = data.subscriptions.filter(
        (subscription) => subscription.planId === plan.id,
      );
      const subscriptionIds = new Set(
        planSubscriptions.map((subscription) => subscription.id),
      );
      const revenue = data.invoices
        .filter(
          (invoice) =>
            invoice.status === 'paid' &&
            subscriptionIds.has(invoice.subscriptionId),
        )
        .reduce((sum, invoice) => sum + this.toNumber(invoice.amount), 0);

      return {
        id: plan.id,
        name: plan.name,
        code: plan.id.slice(0, 8),
        currency: plan.currency,
        description: plan.description,
        amount: this.toNumber(plan.amount),
        interval: plan.interval,
        subscriptions: planSubscriptions.length,
        revenue,
        status: plan.isActive ? 'active' : 'inactive',
      };
    });
  }

  async listDashboardSubscribers(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.customers.map((customer) => {
      const customerSubscriptions = data.subscriptions
        .filter(
          (subscription) => subscription.businessCustomerId === customer.id,
        )
        .sort(
          (first, second) =>
            second.createdAt.getTime() - first.createdAt.getTime(),
        );
      const currentSubscription = customerSubscriptions[0];
      const currentPlan = currentSubscription
        ? data.plans.find((plan) => plan.id === currentSubscription.planId)
        : undefined;
      const lifetimeValue = data.invoices
        .filter(
          (invoice) =>
            invoice.businessCustomerId === customer.id &&
            invoice.status === 'paid',
        )
        .reduce((sum, invoice) => sum + this.toNumber(invoice.amount), 0);
      const hasPaymentMethod = data.paymentMethods.some(
        (method) =>
          method.businessCustomerId === customer.id &&
          method.isDefault &&
          !method.revokedAt,
      );

      return {
        id: customer.id,
        name: customer.name ?? customer.email,
        email: customer.email,
        plan: currentPlan?.name ?? 'No plan',
        lifetimeValue,
        paymentMethod: hasPaymentMethod ? 'Card on file' : 'No payment method',
        status: currentSubscription?.status ?? 'inactive',
      };
    });
  }

  async listDashboardSubscriptions(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.subscriptions.map((subscription) => {
      const plan = data.plans.find((item) => item.id === subscription.planId);
      const customer = data.customers.find(
        (item) => item.id === subscription.businessCustomerId,
      );
      const attempts = data.paymentAttempts.filter(
        (attempt) => attempt.subscriptionId === subscription.id,
      );

      return {
        id: subscription.id,
        code: subscription.id.slice(0, 8),
        customer: customer?.name ?? subscription.customerEmail,
        customerEmail: subscription.customerEmail,
        plan: plan?.name ?? 'No plan',
        amount: this.toNumber(plan?.amount),
        nextCharge:
          subscription.currentPeriodEnd?.toISOString() ?? 'Not scheduled',
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt?.toISOString() ?? null,
        attempts: attempts.length,
        status: subscription.status,
      };
    });
  }

  async listDashboardTransactions(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.paymentAttempts.map((attempt) => {
      const subscription = data.subscriptions.find(
        (item) => item.id === attempt.subscriptionId,
      );
      const customer = subscription
        ? data.customers.find(
            (item) => item.id === subscription.businessCustomerId,
          )
        : undefined;

      return {
        id: attempt.id,
        reference: attempt.providerReference,
        customer:
          customer?.name ?? subscription?.customerEmail ?? 'Unknown customer',
        type: attempt.providerReference.includes('renewal')
          ? 'renewal'
          : 'checkout',
        provider: attempt.provider,
        amount: this.toNumber(attempt.amount),
        date: attempt.createdAt.toISOString(),
        status: attempt.status,
      };
    });
  }

  async listDashboardRefunds(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.refunds.map((refund) => {
      const attempt = data.paymentAttempts.find(
        (item) => item.id === refund.paymentAttemptId,
      );
      const subscription = data.subscriptions.find(
        (item) => item.id === refund.subscriptionId,
      );
      const customer = subscription
        ? data.customers.find(
            (item) => item.id === subscription.businessCustomerId,
          )
        : undefined;

      return {
        id: refund.id,
        reference: refund.providerReference,
        transaction: refund.originalTransactionId,
        paymentReference: attempt?.providerReference,
        customer:
          customer?.name ?? subscription?.customerEmail ?? 'Unknown customer',
        reason: refund.reason ?? 'Refund',
        amount: this.toNumber(refund.amount),
        currency: refund.currency,
        status: refund.status,
      };
    });
  }

  async listDashboardPayouts(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return data.ledgerEntries
      .filter((entry) => entry.type === 'payout_debit')
      .map((entry) => ({
        id: entry.id,
        batch: entry.idempotencyKey,
        account: 'Business settlement',
        amount: this.toNumber(entry.amount),
        entries: 1,
        eta: entry.createdAt.toISOString(),
        status: 'settled',
      }));
  }

  async listDashboardSubaccounts(userId: string) {
    await this.businessesService.getDefaultBusinessForUser(userId);

    return [];
  }

  async getOnboardingChecklist(userId: string) {
    const data = await this.getDashboardDataset(userId);

    return [
      {
        id: 'business-profile',
        title: 'Business profile',
        description: `${data.business.name} is ready to receive billing configuration.`,
        status: 'completed',
      },
      {
        id: 'api-key',
        title: 'Create API key',
        description:
          'Generate a scoped key for checkout and subscription APIs.',
        status: data.apiKeys.length > 0 ? 'completed' : 'pending',
      },
      {
        id: 'billing-plan',
        title: 'Create billing plan',
        description:
          'Add at least one subscription plan for checkout sessions.',
        status: data.plans.length > 0 ? 'completed' : 'pending',
      },
      {
        id: 'first-subscription',
        title: 'Start first subscription',
        description: 'Create a subscription through the public checkout API.',
        status: data.subscriptions.length > 0 ? 'completed' : 'pending',
      },
      {
        id: 'first-payment',
        title: 'Receive first payment',
        description: 'Confirm a successful checkout or renewal payment.',
        status: data.paymentAttempts.some(
          (attempt) => attempt.status === 'succeeded',
        )
          ? 'completed'
          : 'pending',
      },
      {
        id: 'ledger',
        title: 'Ledger activity',
        description: 'Confirm billing credits or payout debits in the ledger.',
        status: data.ledgerEntries.length > 0 ? 'completed' : 'pending',
      },
    ];
  }

  async createPlan(userId: string, dto: CreatePlanDto) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const [plan] = await this.billingRepository.createPlan({
      businessId: business.id,
      userId,
      name: dto.name,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency ?? 'NGN',
      interval: dto.interval ?? 'month',
    });

    return plan;
  }

  async createRefund(userId: string, dto: CreateRefundDto) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const currency = (dto.currency ?? 'NGN').toUpperCase();

    if (currency !== 'NGN') {
      throw new BadRequestException('Only NGN refunds are supported');
    }

    if (!dto.paymentAttemptId && !dto.providerReference) {
      throw new BadRequestException(
        'Provide either paymentAttemptId or providerReference',
      );
    }

    if (
      (dto.accountNumber && !dto.bankCode) ||
      (!dto.accountNumber && dto.bankCode)
    ) {
      throw new BadRequestException(
        'Provide both accountNumber and bankCode for transfer refunds',
      );
    }

    const attempt = dto.paymentAttemptId
      ? await this.billingRepository.findPaymentAttemptForBusiness(
          business.id,
          dto.paymentAttemptId,
        )
      : await this.billingRepository.findPaymentAttemptByReferenceForBusiness(
          business.id,
          this.toSafeString(dto.providerReference),
        );

    if (!attempt) {
      throw new NotFoundException('Payment attempt not found');
    }

    if (attempt.status !== 'succeeded') {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (attempt.currency !== currency) {
      throw new BadRequestException('Refund currency must match payment');
    }

    const invoice = await this.billingRepository.findInvoiceById(
      attempt.invoiceId,
    );

    if (!invoice || invoice.status !== 'paid') {
      throw new BadRequestException('Only paid invoices can be refunded');
    }

    const verification =
      await this.nombaTransactionService.verifyByOrderReference(
        attempt.providerReference,
      );

    if (verification.code !== '00' || verification.data?.status !== 'SUCCESS') {
      throw new BadRequestException(
        verification.description ?? 'Original payment could not be verified',
      );
    }

    const priorRefunds =
      await this.billingRepository.listRefundsForPaymentAttempt(
        business.id,
        attempt.id,
      );
    const committedRefundAmount = priorRefunds
      .filter((refund) => refund.status !== 'failed')
      .reduce((sum, refund) => sum + this.toNumber(refund.amount), 0);
    const originalAmount = this.toNumber(attempt.amount);
    const remainingAmount = this.roundAmount(
      originalAmount - committedRefundAmount,
    );
    const requestedAmount = dto.amount
      ? this.parsePositiveAmount(dto.amount)
      : remainingAmount;

    if (remainingAmount <= 0) {
      throw new BadRequestException('Payment has already been fully refunded');
    }

    if (requestedAmount > remainingAmount) {
      throw new BadRequestException(
        'Refund amount exceeds remaining refundable amount',
      );
    }

    await this.assertSufficientBusinessBalance(
      business.id,
      requestedAmount,
      currency,
    );

    const transactionId =
      this.toSafeString(dto.transactionId) ||
      this.extractNombaTransactionId(verification.data) ||
      this.extractNombaTransactionId(attempt.rawResponse) ||
      attempt.providerReference;
    const scopedIdempotencyKey = dto.idempotencyKey
      ? `${business.id}:${dto.idempotencyKey}`
      : undefined;
    const providerReference = `og_refund_${randomUUID()}`;
    const { refund, created } =
      await this.billingRepository.createRefundIdempotently({
        businessId: business.id,
        businessCustomerId: invoice.businessCustomerId,
        userId,
        subscriptionId: attempt.subscriptionId,
        invoiceId: attempt.invoiceId,
        paymentAttemptId: attempt.id,
        status: 'pending',
        provider: 'nomba',
        providerReference,
        originalTransactionId: transactionId,
        amount: requestedAmount.toFixed(2),
        currency,
        reason: dto.reason,
        idempotencyKey: scopedIdempotencyKey,
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
      });

    if (!created) {
      return this.formatRefund(refund);
    }

    const shouldSendAmountToNomba =
      Boolean(dto.amount) || committedRefundAmount > 0;

    try {
      const response =
        await this.nombaRefundService.refundCheckoutTransaction({
          transactionId,
          amount: shouldSendAmountToNomba ? requestedAmount : undefined,
          accountNumber: dto.accountNumber,
          bankCode: dto.bankCode,
        });

      if (response.code !== '00' || response.data?.success === false) {
        await this.billingRepository.updateRefund(refund.id, {
          status: 'failed',
          rawResponse: this.toRecord(response),
        });

        throw new BadRequestException(
          response.description ??
            response.data?.message ??
            'Nomba refund failed',
        );
      }

      await this.ledgerService.debitBusinessAvailable({
        businessId: business.id,
        amount: requestedAmount.toFixed(2),
        currency,
        idempotencyKey: `refund:${refund.id}:debit`,
        sourceType: 'subscription_refund',
        sourceId: refund.id,
        description: dto.reason ?? `Refund for payment ${attempt.id}`,
        metadata: {
          paymentAttemptId: attempt.id,
          invoiceId: invoice.id,
          subscriptionId: attempt.subscriptionId,
          providerReference: refund.providerReference,
          originalTransactionId: transactionId,
          transferRefund: Boolean(dto.accountNumber && dto.bankCode),
        },
        type: 'refund_debit',
      });

      const [updatedRefund] = await this.billingRepository.updateRefund(
        refund.id,
        {
          status: 'succeeded',
          rawResponse: this.toRecord(response),
          ledgerDebitedAt: new Date(),
        },
      );

      return this.formatRefund(updatedRefund);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const [pendingRefund] = await this.billingRepository.updateRefund(
        refund.id,
        {
          status: 'processing',
          rawResponse: {
            error: this.getErrorMessage(error),
          },
        },
      );

      return {
        ...this.formatRefund(pendingRefund),
        warning: 'Refund submission could not be confirmed with Nomba',
      };
    }
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string,
    dto: CancelSubscriptionDto = {},
  ) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const subscription =
      await this.billingRepository.findSubscriptionForBusiness(
        business.id,
        subscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'canceled') {
      return {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt?.toISOString() ?? null,
        currentPeriodEnd:
          subscription.currentPeriodEnd?.toISOString() ?? null,
      };
    }

    const cancelAtPeriodEnd = dto.cancelAtPeriodEnd ?? true;
    const [updated] = await this.billingRepository.updateSubscription(
      subscription.id,
      cancelAtPeriodEnd && subscription.currentPeriodEnd
        ? {
            cancelAtPeriodEnd: true,
          }
        : {
            status: 'canceled',
            cancelAtPeriodEnd: false,
            canceledAt: new Date(),
          },
    );

    return {
      id: updated.id,
      status: updated.status,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      canceledAt: updated.canceledAt?.toISOString() ?? null,
      currentPeriodEnd: updated.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  async startSubscriptionCheckout(
    apiKey: AuthenticatedApiKey,
    dto: StartSubscriptionCheckoutDto,
  ) {
    const plan = await this.billingRepository.findPlanForBusiness(
      apiKey.businessId,
      dto.planId,
    );

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const businessCustomer =
      await this.businessesService.upsertBusinessCustomer({
        businessId: apiKey.businessId,
        externalCustomerId: dto.customerId,
        email: dto.customerEmail,
        name: dto.customerName,
        phone: dto.customerPhone,
        metadata: {},
      });
    const periodStart = new Date();
    const periodEnd = this.addBillingInterval(periodStart, plan.interval);
    const [subscription] = await this.billingRepository.createSubscription({
      businessId: apiKey.businessId,
      businessCustomerId: businessCustomer.id,
      userId: apiKey.createdByUserId,
      planId: plan.id,
      status: 'incomplete',
      customerId: dto.customerId,
      customerEmail: dto.customerEmail,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });
    const [invoice] = await this.billingRepository.createInvoice({
      businessId: apiKey.businessId,
      businessCustomerId: businessCustomer.id,
      userId: apiKey.createdByUserId,
      subscriptionId: subscription.id,
      status: 'open',
      amount: plan.amount,
      currency: plan.currency,
      dueAt: new Date(),
      periodStart,
      periodEnd,
    });
    const orderReference = `og_${randomUUID()}`;
    const [attempt] = await this.billingRepository.createPaymentAttempt({
      businessId: apiKey.businessId,
      userId: apiKey.createdByUserId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      status: 'processing',
      providerReference: orderReference,
      amount: invoice.amount,
      currency: invoice.currency,
    });
    const nombaResponse = await this.nombaCheckoutService.createCheckoutOrder({
      orderReference,
      customerId: dto.customerId,
      customerEmail: dto.customerEmail,
      amount: invoice.amount,
      currency: invoice.currency,
      callbackUrl: dto.callbackUrl,
      tokenizeCard: true,
      metadata: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        paymentAttemptId: attempt.id,
      },
    });

    if (nombaResponse.code !== '00') {
      await this.billingRepository.updatePaymentAttempt(attempt.id, {
        status: 'failed',
        failureReason: nombaResponse.description ?? 'Nomba checkout failed',
        rawResponse: this.toRecord(nombaResponse),
      });
      throw new BadRequestException(
        nombaResponse.description ?? 'Unable to create checkout order',
      );
    }

    const [checkoutOrder] = await this.billingRepository.createCheckoutOrder({
      businessId: apiKey.businessId,
      userId: apiKey.createdByUserId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      paymentAttemptId: attempt.id,
      orderReference,
      checkoutLink: nombaResponse.data?.checkoutLink,
      status: 'pending',
      rawResponse: this.toRecord(nombaResponse),
    });

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      paymentAttemptId: attempt.id,
      orderReference,
      checkoutLink: checkoutOrder.checkoutLink,
    };
  }

  async startSubscriptionCheckoutForUser(
    userId: string,
    dto: StartSubscriptionCheckoutDto,
  ) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);

    return this.startSubscriptionCheckout(
      {
        id: `jwt:${userId}`,
        businessId: business.id,
        createdByUserId: userId,
        environment: 'test',
        scopes: ['subscriptions:create', 'subscriptions:read'],
      },
      dto,
    );
  }

  async verifyCheckoutOrder(orderReference: string) {
    const checkoutOrder =
      await this.billingRepository.findCheckoutOrderByReference(orderReference);

    if (!checkoutOrder?.paymentAttemptId || !checkoutOrder.invoiceId) {
      throw new NotFoundException('Checkout order not found');
    }

    const verification =
      await this.nombaTransactionService.verifyByOrderReference(orderReference);
    const invoice = await this.billingRepository.findInvoiceById(
      checkoutOrder.invoiceId,
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (
      verification.code !== '00' ||
      verification.data?.status !== 'SUCCESS' ||
      !this.transactionMatchesInvoice(
        verification.data,
        invoice,
        orderReference,
      )
    ) {
      await this.billingRepository.updatePaymentAttempt(
        checkoutOrder.paymentAttemptId,
        {
          status: 'failed',
          failureReason:
            verification.description ?? verification.data?.status ?? 'Failed',
          rawResponse: this.toRecord(verification),
        },
      );
      return { status: 'failed', verification };
    }

    await this.billingRepository.updatePaymentAttempt(
      checkoutOrder.paymentAttemptId,
      {
        status: 'succeeded',
        rawResponse: this.toRecord(verification),
      },
    );
    await this.billingRepository.updateInvoice(checkoutOrder.invoiceId, {
      status: 'paid',
      paidAt: new Date(),
    });

    if (checkoutOrder.subscriptionId) {
      await this.billingRepository.updateSubscription(
        checkoutOrder.subscriptionId,
        {
          status: 'active',
        },
      );
    }

    if (
      checkoutOrder.subscriptionId &&
      verification.data?.tokenKey &&
      verification.data.orderReference
    ) {
      const existingPaymentMethod =
        await this.billingRepository.findDefaultPaymentMethod(
          checkoutOrder.businessId,
          this.toSafeString(verification.data.customerId),
        );

      if (!existingPaymentMethod) {
        await this.billingRepository.createPaymentMethod({
          businessId: checkoutOrder.businessId,
          businessCustomerId: invoice.businessCustomerId,
          userId: checkoutOrder.userId,
          provider: 'nomba',
          type: 'tokenized_card',
          tokenKey: verification.data.tokenKey,
          customerId: this.toSafeString(verification.data.customerId),
          customerEmail: this.toSafeString(verification.data.customerEmail),
          isDefault: true,
          metadata: this.toRecord(verification.data),
        });
      }
    }

    await this.ledgerService.creditBusinessAvailable({
      businessId: checkoutOrder.businessId,
      amount: invoice.amount,
      currency: invoice.currency,
      idempotencyKey: `payment:${checkoutOrder.paymentAttemptId}:credit`,
      sourceType: 'subscription_payment_attempt',
      sourceId: checkoutOrder.paymentAttemptId,
      description: `Payment received for invoice ${invoice.id}`,
      metadata: {
        orderReference,
        invoiceId: invoice.id,
        subscriptionId: checkoutOrder.subscriptionId,
      },
      type: 'payment_credit',
    });

    return { status: 'succeeded', verification };
  }

  verifyCheckoutOrders(orderReferences: string[]) {
    return Promise.all(
      orderReferences.map(async (orderReference) => ({
        orderReference,
        ...(await this.verifyCheckoutOrder(orderReference)),
      })),
    );
  }

  async enqueueDueRenewals() {
    const canceled = await this.cancelDueSubscriptionsAtPeriodEnd();
    const dueSubscriptions = await this.billingRepository.findDueSubscriptions(
      new Date(Date.now() + 60 * 60 * 1000),
    );

    for (const subscription of dueSubscriptions) {
      await this.renewalQueue.add(
        'charge-renewal',
        {
          subscriptionId: subscription.id,
        },
        {
          jobId: `renewal:${subscription.id}:${subscription.currentPeriodEnd?.toISOString()}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60_000,
          },
        },
      );
    }

    return { queued: dueSubscriptions.length, canceled };
  }

  async chargeRenewal(subscriptionId: string) {
    const subscription =
      await this.billingRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'canceled' || subscription.cancelAtPeriodEnd) {
      return { subscriptionId, status: 'canceled' };
    }

    const plan = await this.billingRepository.findPlanById(subscription.planId);

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const paymentMethod = await this.billingRepository.findDefaultPaymentMethod(
      subscription.businessId,
      subscription.customerId,
    );

    if (!paymentMethod) {
      await this.billingRepository.updateSubscription(subscription.id, {
        status: 'past_due',
      });
      return { subscriptionId, status: 'missing_payment_method' };
    }

    const openInvoice =
      await this.billingRepository.findOpenInvoiceForSubscription(
        subscription.id,
      );
    const periodStart = subscription.currentPeriodEnd ?? new Date();
    const periodEnd = this.addBillingInterval(periodStart, plan.interval);
    const invoice =
      openInvoice ??
      (
        await this.billingRepository.createInvoice({
          userId: subscription.userId,
          businessId: subscription.businessId,
          businessCustomerId: subscription.businessCustomerId,
          subscriptionId: subscription.id,
          status: 'open',
          amount: plan.amount,
          currency: plan.currency,
          dueAt: new Date(),
          periodStart,
          periodEnd,
        })
      )[0];
    const orderReference = `og_renewal_${randomUUID()}`;
    const [attempt] = await this.billingRepository.createPaymentAttempt({
      userId: subscription.userId,
      businessId: subscription.businessId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      paymentMethodId: paymentMethod.id,
      status: 'processing',
      providerReference: orderReference,
      amount: invoice.amount,
      currency: invoice.currency,
    });
    const chargeResponse = await this.nombaCheckoutService.chargeTokenizedCard({
      orderReference,
      customerId: subscription.customerId,
      customerEmail: subscription.customerEmail,
      amount: invoice.amount,
      currency: invoice.currency,
      tokenKey: paymentMethod.tokenKey,
    });

    if (chargeResponse.code !== '00') {
      await this.billingRepository.updatePaymentAttempt(attempt.id, {
        status: 'failed',
        failureReason: chargeResponse.description ?? 'Renewal charge failed',
        rawResponse: this.toRecord(chargeResponse),
      });
      await this.billingRepository.updateSubscription(subscription.id, {
        status: 'past_due',
      });
      return { subscriptionId, status: 'failed' };
    }

    const verification =
      await this.nombaTransactionService.verifyByOrderReference(orderReference);

    if (verification.code !== '00' || verification.data?.status !== 'SUCCESS') {
      await this.billingRepository.updatePaymentAttempt(attempt.id, {
        status: 'pending',
        rawResponse: this.toRecord(verification),
      });
      return { subscriptionId, status: 'pending_verification' };
    }

    await this.billingRepository.updatePaymentAttempt(attempt.id, {
      status: 'succeeded',
      rawResponse: this.toRecord(verification),
    });
    await this.billingRepository.updateInvoice(invoice.id, {
      status: 'paid',
      paidAt: new Date(),
    });
    await this.billingRepository.updateSubscription(subscription.id, {
      status: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });
    await this.ledgerService.creditBusinessAvailable({
      businessId: subscription.businessId,
      amount: invoice.amount,
      currency: invoice.currency,
      idempotencyKey: `renewal:${attempt.id}:credit`,
      sourceType: 'subscription_payment_attempt',
      sourceId: attempt.id,
      description: `Renewal payment received for invoice ${invoice.id}`,
      metadata: {
        orderReference,
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
      },
      type: 'renewal_credit',
    });

    return { subscriptionId, status: 'succeeded' };
  }

  private async cancelDueSubscriptionsAtPeriodEnd() {
    const dueCancellations =
      await this.billingRepository.findSubscriptionsDueForPeriodEndCancellation(
        new Date(),
      );

    for (const subscription of dueCancellations) {
      await this.billingRepository.updateSubscription(subscription.id, {
        status: 'canceled',
        cancelAtPeriodEnd: false,
        canceledAt: new Date(),
      });
    }

    return dueCancellations.length;
  }

  private async getDashboardDataset(userId: string) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const [
      plans,
      customers,
      subscriptions,
      invoices,
      paymentAttempts,
      paymentMethods,
      checkoutOrders,
      ledgerEntries,
      refunds,
      apiKeys,
    ] = await Promise.all([
      this.billingRepository.listPlansForBusiness(business.id),
      this.billingRepository.listBusinessCustomersForBusiness(business.id),
      this.billingRepository.listSubscriptionsForBusiness(business.id),
      this.billingRepository.listInvoicesForBusiness(business.id),
      this.billingRepository.listPaymentAttemptsForBusiness(business.id),
      this.billingRepository.listPaymentMethodsForBusiness(business.id),
      this.billingRepository.listCheckoutOrdersForBusiness(business.id),
      this.billingRepository.listLedgerEntriesForBusiness(business.id),
      this.billingRepository.listRefundsForBusiness(business.id),
      this.apiKeysService.list(userId),
    ]);

    return {
      apiKeys,
      business,
      checkoutOrders,
      customers,
      invoices,
      ledgerEntries,
      paymentAttempts,
      paymentMethods,
      plans,
      refunds,
      subscriptions,
    };
  }

  private calculateLedgerBalance(
    entries: Array<{ amount: string; type: string }>,
  ) {
    return entries.reduce((sum, entry) => {
      const amount = this.toNumber(entry.amount);

      if (entry.type.endsWith('_debit')) {
        return sum - amount;
      }

      return sum + amount;
    }, 0);
  }

  private formatNaira(value: number) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private toNumber(value: string | number | null | undefined) {
    if (typeof value === 'number') {
      return value;
    }

    if (!value) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private parsePositiveAmount(value: string) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    return this.roundAmount(parsed);
  }

  private roundAmount(value: number) {
    return Math.round(value * 100) / 100;
  }

  private async assertSufficientBusinessBalance(
    businessId: string,
    amount: number,
    currency: string,
  ) {
    const balance = await this.ledgerService.getBusinessAvailableBalance(
      businessId,
      currency,
    );

    if (amount > balance) {
      throw new BadRequestException('Insufficient Optimus ledger balance');
    }
  }

  private formatRefund(refund: {
    id: string;
    providerReference: string;
    originalTransactionId: string;
    amount: string;
    currency: string;
    status: string;
    reason: string | null;
    accountNumber: string | null;
    bankCode: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: refund.id,
      providerReference: refund.providerReference,
      transaction: refund.originalTransactionId,
      amount: this.toNumber(refund.amount),
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      transferRefund: Boolean(refund.accountNumber && refund.bankCode),
      createdAt: refund.createdAt.toISOString(),
      updatedAt: refund.updatedAt.toISOString(),
    };
  }

  private extractNombaTransactionId(value: unknown) {
    const record = this.toRecord(value);
    const data = this.toRecord(record.data);
    const transaction = this.toRecord(record.transaction);
    const nestedTransaction = this.toRecord(data.transaction);

    return (
      this.toSafeString(record.transactionId) ||
      this.toSafeString(record.id) ||
      this.toSafeString(transaction.transactionId) ||
      this.toSafeString(transaction.id) ||
      this.toSafeString(data.transactionId) ||
      this.toSafeString(data.id) ||
      this.toSafeString(nestedTransaction.transactionId) ||
      this.toSafeString(nestedTransaction.id)
    );
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }

  private transactionMatchesInvoice(
    data: NombaTransactionVerificationData | undefined,
    invoice: { amount: string; currency: string },
    orderReference: string,
  ) {
    if (!data) {
      return false;
    }

    const responseOrderReference = this.toSafeString(data.orderReference);
    const responseAmount = this.toSafeString(data.amount);
    const responseCurrency = this.toSafeString(data.currency);

    return (
      (!responseOrderReference || responseOrderReference === orderReference) &&
      (!responseAmount || responseAmount === invoice.amount) &&
      (!responseCurrency || responseCurrency === invoice.currency)
    );
  }

  private addBillingInterval(start: Date, interval: string) {
    const end = new Date(start);

    if (interval === 'year') {
      end.setFullYear(end.getFullYear() + 1);
      return end;
    }

    if (interval === 'week') {
      end.setDate(end.getDate() + 7);
      return end;
    }

    if (interval === 'day') {
      end.setDate(end.getDate() + 1);
      return end;
    }

    end.setMonth(end.getMonth() + 1);
    return end;
  }

  private toSafeString(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return '';
  }

  private toRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }
}
