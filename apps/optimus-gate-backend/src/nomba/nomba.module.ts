import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { nombaProviders } from './nomba.providers';
import { NombaAuthService } from './nomba-auth.service';
import { NombaCheckoutService } from './nomba-checkout.service';
import { NombaHttpService } from './nomba-http.service';
import { NombaRefundService } from './nomba-refund.service';
import { NombaTransactionService } from './nomba-transaction.service';
import { NombaTransferService } from './nomba-transfer.service';
import { NombaWebhookService } from './nomba-webhook.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ...nombaProviders,
    NombaAuthService,
    NombaHttpService,
    NombaCheckoutService,
    NombaRefundService,
    NombaTransactionService,
    NombaTransferService,
    NombaWebhookService,
  ],
  exports: [
    NombaCheckoutService,
    NombaRefundService,
    NombaTransactionService,
    NombaTransferService,
    NombaWebhookService,
  ],
})
export class NombaModule {}
