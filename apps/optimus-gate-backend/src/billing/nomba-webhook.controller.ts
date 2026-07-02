import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NombaWebhookService } from '../nomba/nomba-webhook.service';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

@Controller('nomba/webhooks')
export class NombaWebhookController {
  constructor(
    private readonly nombaWebhookService: NombaWebhookService,
    private readonly billingRepository: BillingRepository,
    private readonly billingService: BillingService,
  ) {}

  @Post()
  async handleWebhook(
    @Req() request: RawBodyRequest,
    @Body() payload: Record<string, unknown>,
    @Headers('nomba-signature') signature?: string,
  ) {
    this.nombaWebhookService.verifySignature(
      request.rawBody ?? Buffer.from(JSON.stringify(payload)),
      signature,
    );
    const eventType =
      this.toSafeString(payload.eventType) ??
      this.toSafeString(payload.type) ??
      'unknown';
    const orderReference = this.extractOrderReference(payload);

    await this.billingRepository.createWebhookEvent({
      eventType,
      signature,
      eventReference:
        this.toSafeString(payload.eventId) ??
        this.toSafeString(payload.reference) ??
        '',
      orderReference,
      payload,
    });

    if (orderReference) {
      await this.billingService.verifyCheckoutOrder(orderReference);
    }

    return { received: true };
  }

  private extractOrderReference(payload: Record<string, unknown>) {
    const data = payload.data as Record<string, unknown> | undefined;
    return (
      this.toSafeString(data?.orderReference) ??
      this.toSafeString(payload.orderReference) ??
      this.toSafeString(payload.transactionRef) ??
      ''
    );
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
