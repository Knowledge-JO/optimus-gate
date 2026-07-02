import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';

@Injectable()
export class NombaWebhookService {
  constructor(@Inject(NOMBA_CONFIG) private readonly config: NombaConfig) {}

  verifySignature(rawBody: Buffer, signature?: string) {
    if (!this.config.webhookSecret || !signature) {
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
      throw new UnauthorizedException('Invalid Nomba webhook signature');
    }
  }
}
