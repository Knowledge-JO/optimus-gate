import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import type { AuthenticatedApiKey } from '../api-keys/api-keys.types';
import { NombaCheckoutService } from '../nomba/nomba-checkout.service';
import { NombaTransactionService } from '../nomba/nomba-transaction.service';
import { RENEWAL_QUEUE } from '../queues/queues.constants';
import { BillingRepository } from './billing.repository';
import { CreatePlanDto } from './dto/create-plan.dto';
import { StartSubscriptionCheckoutDto } from './dto/start-subscription-checkout.dto';

@Injectable()
export class BillingService {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly nombaCheckoutService: NombaCheckoutService,
    private readonly nombaTransactionService: NombaTransactionService,
    @InjectQueue(RENEWAL_QUEUE) private readonly renewalQueue: Queue,
  ) {}

  async createPlan(userId: string, dto: CreatePlanDto) {
    const [plan] = await this.billingRepository.createPlan({
      userId,
      name: dto.name,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency ?? 'NGN',
      interval: dto.interval ?? 'month',
    });

    return plan;
  }

  async startSubscriptionCheckout(
    apiKey: AuthenticatedApiKey,
    dto: StartSubscriptionCheckoutDto,
  ) {
    const plan = await this.billingRepository.findPlanForUser(
      apiKey.userId,
      dto.planId,
    );

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const periodStart = new Date();
    const periodEnd = this.addBillingInterval(periodStart, plan.interval);
    const [subscription] = await this.billingRepository.createSubscription({
      userId: apiKey.userId,
      planId: plan.id,
      status: 'incomplete',
      customerId: dto.customerId,
      customerEmail: dto.customerEmail,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });
    const [invoice] = await this.billingRepository.createInvoice({
      userId: apiKey.userId,
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
      userId: apiKey.userId,
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
        rawResponse: nombaResponse as unknown as Record<string, unknown>,
      });
      throw new BadRequestException(
        nombaResponse.description ?? 'Unable to create checkout order',
      );
    }

    const [checkoutOrder] = await this.billingRepository.createCheckoutOrder({
      userId: apiKey.userId,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      paymentAttemptId: attempt.id,
      orderReference,
      checkoutLink: nombaResponse.data?.checkoutLink,
      status: 'pending',
      rawResponse: nombaResponse as unknown as Record<string, unknown>,
    });

    return {
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      paymentAttemptId: attempt.id,
      orderReference,
      checkoutLink: checkoutOrder.checkoutLink,
    };
  }

  async verifyCheckoutOrder(orderReference: string) {
    const checkoutOrder =
      await this.billingRepository.findCheckoutOrderByReference(orderReference);

    if (!checkoutOrder?.paymentAttemptId || !checkoutOrder.invoiceId) {
      throw new NotFoundException('Checkout order not found');
    }

    const verification =
      await this.nombaTransactionService.verifyByOrderReference(orderReference);

    if (verification.code !== '00' || verification.data?.status !== 'SUCCESS') {
      await this.billingRepository.updatePaymentAttempt(
        checkoutOrder.paymentAttemptId,
        {
          status: 'failed',
          failureReason:
            verification.description ?? verification.data?.status ?? 'Failed',
          rawResponse: verification as unknown as Record<string, unknown>,
        },
      );
      return { status: 'failed', verification };
    }

    await this.billingRepository.updatePaymentAttempt(
      checkoutOrder.paymentAttemptId,
      {
        status: 'succeeded',
        rawResponse: verification as unknown as Record<string, unknown>,
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
      const subscription =
        await this.billingRepository.findCheckoutOrderByReference(
          verification.data.orderReference,
        );
      if (subscription) {
        await this.billingRepository.createPaymentMethod({
          userId: checkoutOrder.userId,
          provider: 'nomba',
          type: 'tokenized_card',
          tokenKey: verification.data.tokenKey,
          customerId: this.toSafeString(verification.data.customerId),
          customerEmail: this.toSafeString(verification.data.customerEmail),
          isDefault: true,
          metadata: verification.data,
        });
      }
    }

    return { status: 'succeeded', verification };
  }

  async enqueueDueRenewals() {
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

    return { queued: dueSubscriptions.length };
  }

  async chargeRenewal(subscriptionId: string) {
    const subscription =
      await this.billingRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const plan = await this.billingRepository.findPlanById(subscription.planId);

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const paymentMethod = await this.billingRepository.findDefaultPaymentMethod(
      subscription.userId,
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
        rawResponse: chargeResponse as unknown as Record<string, unknown>,
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
        rawResponse: verification as unknown as Record<string, unknown>,
      });
      return { subscriptionId, status: 'pending_verification' };
    }

    await this.billingRepository.updatePaymentAttempt(attempt.id, {
      status: 'succeeded',
      rawResponse: verification as unknown as Record<string, unknown>,
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

    return { subscriptionId, status: 'succeeded' };
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
}
