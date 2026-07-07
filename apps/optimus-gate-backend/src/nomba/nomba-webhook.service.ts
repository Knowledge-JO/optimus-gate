import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';

type NombaWebhookPayload = Record<string, unknown>;

@Injectable()
export class NombaWebhookService {
  constructor(@Inject(NOMBA_CONFIG) private readonly config: NombaConfig) {}

  verifySignature(
    payload: NombaWebhookPayload,
    signature?: string,
    timestamp?: string,
  ) {
    if (!this.config.webhookSecret || !signature || !timestamp) {
      console.log(
        '[Nomba webhook] No signature or timestamp for webhook',
        JSON.stringify(
          {
            hasWebhookSecret: Boolean(this.config.webhookSecret),
            hasSignature: Boolean(signature),
            hasTimestamp: Boolean(timestamp),
            context: this.getWebhookLogContext(payload),
          },
          null,
          2,
        ),
      );

      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }

    const hashingPayload = this.buildSignaturePayload(
      payload,
      timestamp.trim(),
    );
    const expected = this.generateSignatureFromHashingPayload(hashingPayload);
    const expectedBuffer = Buffer.from(expected.toLowerCase());
    const signatureBuffer = Buffer.from(signature.trim().toLowerCase());

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.log(
        '[Nomba webhook] Invalid webhook signature',
        JSON.stringify(
          {
            context: this.getWebhookLogContext(payload),
            hashingPayload,
            expectedSignature: expected,
            receivedSignature: signature.trim(),
            timestamp: timestamp.trim(),
          },
          null,
          2,
        ),
      );

      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }

    console.log(
      '[Nomba webhook] Valid webhook signature',
      JSON.stringify(
        {
          context: this.getWebhookLogContext(payload),
          timestamp: timestamp.trim(),
        },
        null,
        2,
      ),
    );
  }

  generateSignature(payload: NombaWebhookPayload, timestamp: string) {
    return this.generateSignatureFromHashingPayload(
      this.buildSignaturePayload(payload, timestamp.trim()),
    );
  }

  private generateSignatureFromHashingPayload(hashingPayload: string) {
    return createHmac('sha256', this.config.webhookSecret)
      .update(hashingPayload)
      .digest('base64');
  }

  private buildSignaturePayload(
    payload: NombaWebhookPayload,
    timestamp: string,
  ) {
    const data = this.toRecord(payload.data);
    const merchant = this.toRecord(data?.merchant);
    const transaction = this.toRecord(data?.transaction);
    let responseCode = this.toSafeString(transaction?.responseCode);

    if (responseCode.toLowerCase() === 'null') {
      responseCode = '';
    }

    return [
      this.toSafeString(payload.event_type),
      this.toSafeString(payload.requestId),
      this.toSafeString(merchant?.userId),
      this.toSafeString(merchant?.walletId),
      this.toSafeString(transaction?.transactionId),
      this.toSafeString(transaction?.type),
      this.toSafeString(transaction?.time),
      responseCode,
      timestamp,
    ].join(':');
  }

  private toRecord(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
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

    return '';
  }

  private getWebhookLogContext(payload: NombaWebhookPayload) {
    const data = this.toRecord(payload.data);
    const merchant = this.toRecord(data?.merchant);
    const transaction = this.toRecord(data?.transaction);

    return {
      eventType: this.toSafeString(payload.event_type),
      requestId: this.toSafeString(payload.requestId),
      userId: this.toSafeString(merchant?.userId),
      walletId: this.toSafeString(merchant?.walletId),
      transactionId: this.toSafeString(transaction?.transactionId),
      transactionType: this.toSafeString(transaction?.type),
      transactionTime: this.toSafeString(transaction?.time),
    };
  }
}
