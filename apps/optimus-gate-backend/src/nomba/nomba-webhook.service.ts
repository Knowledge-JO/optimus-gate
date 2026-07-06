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
      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }

    const expected = createHmac('sha256', this.config.webhookSecret)
      .update(this.buildSignaturePayload(payload, timestamp.trim()))
      .digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature.trim());

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }
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
}
