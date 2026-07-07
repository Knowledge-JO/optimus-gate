import { Body, Controller, Headers, Post } from '@nestjs/common';
import { NombaWebhookService } from '../nomba/nomba-webhook.service';
import { PayoutsService } from '../payouts/payouts.service';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';

@Controller('/webhook')
export class NombaWebhookController {
  constructor(
    private readonly nombaWebhookService: NombaWebhookService,
    private readonly billingRepository: BillingRepository,
    private readonly billingService: BillingService,
    private readonly payoutsService: PayoutsService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('nomba-signature') signature?: string,
    @Headers('nomba-sig-value') signatureValue?: string,
    @Headers('nomba-timestamp') timestamp?: string,
  ) {
    console.log('[Nomba webhook] Received webhook', {
      eventType:
        this.toSafeString(payload.event_type) ??
        this.toSafeString(payload.eventType) ??
        this.toSafeString(payload.type) ??
        'unknown',
      requestId:
        this.toSafeString(payload.requestId) ??
        this.toSafeString(payload.request_id),
      hasNombaSignature: Boolean(signature),
      hasNombaSigValue: Boolean(signatureValue),
      hasNombaTimestamp: Boolean(timestamp),
      payload,
    });

    this.nombaWebhookService.verifySignature(
      payload,
      signature ?? signatureValue,
      timestamp,
    );
    const eventType =
      this.toSafeString(payload.event_type) ??
      this.toSafeString(payload.eventType) ??
      this.toSafeString(payload.type) ??
      'unknown';
    const orderReference = this.extractOrderReference(payload);
    const checkoutOrder = orderReference
      ? await this.billingRepository.findCheckoutOrderByReference(
          orderReference,
        )
      : undefined;

    const webhookEvent = {
      ...(checkoutOrder?.businessId
        ? { businessId: checkoutOrder.businessId }
        : {}),
      eventType,
      signature: signature ?? signatureValue,
      eventReference:
        this.toSafeString(payload.eventId) ??
        this.toSafeString(payload.event_id) ??
        this.toSafeString(payload.eventReference) ??
        this.toSafeString(payload.requestId) ??
        this.toSafeString(payload.request_id) ??
        this.toSafeString(payload.reference) ??
        undefined,
      orderReference,
      payload,
    };

    const { event, created } =
      await this.billingRepository.createWebhookEventIdempotently(webhookEvent);

    if (!created && event.processedAt) {
      return { received: true, duplicate: true };
    }

    if (event.orderReference && checkoutOrder) {
      await this.billingService.verifyCheckoutOrder(
        event.orderReference,
        payload,
      );
    } else if (eventType.startsWith('payout_')) {
      await this.payoutsService.handleNombaPayoutWebhook(eventType, payload);
    }

    await this.billingRepository.markWebhookEventProcessed(event.id);

    return { received: true, duplicate: !created };
  }

  private extractOrderReference(payload: Record<string, unknown>) {
    const data = payload.data as Record<string, unknown> | undefined;
    const order = data?.order as Record<string, unknown> | undefined;
    const transaction = data?.transaction as
      Record<string, unknown> | undefined;

    return (
      this.toSafeString(data?.orderReference) ??
      this.toSafeString(order?.orderReference) ??
      this.toSafeString(transaction?.orderReference) ??
      this.toSafeString(payload.orderReference) ??
      this.toSafeString(payload.transactionRef) ??
      this.toSafeString(payload.transactionReference) ??
      this.toOptimusOrderReference(transaction?.merchantTxRef) ??
      ''
    );
  }

  private toOptimusOrderReference(value: unknown) {
    const reference = this.toSafeString(value);

    if (reference?.startsWith('og_')) {
      return reference;
    }

    return undefined;
  }

  private toSafeString(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return undefined;
  }
}
