import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';

@Injectable()
export class NombaWebhookService {
  constructor(@Inject(NOMBA_CONFIG) private readonly config: NombaConfig) {}

  verifySignature(rawBody: Buffer, signature?: string) {
    if (!this.config.webhookSecret || !signature) {
      console.log('Of course webhook was not verified');
      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }

    const expected = createHmac('sha256', this.config.webhookSecret)
      .update(rawBody)
      .digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.log('of course Webhook signature is invalid');
      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }
  }
}
