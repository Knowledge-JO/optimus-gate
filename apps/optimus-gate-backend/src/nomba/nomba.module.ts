import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { nombaProviders } from './nomba.providers';
import { NombaAuthService } from './nomba-auth.service';
import { NombaCheckoutService } from './nomba-checkout.service';
import { NombaHttpService } from './nomba-http.service';
import { NombaTransactionService } from './nomba-transaction.service';
import { NombaWebhookService } from './nomba-webhook.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ...nombaProviders,
    NombaAuthService,
    NombaHttpService,
    NombaCheckoutService,
    NombaTransactionService,
    NombaWebhookService,
  ],
  exports: [NombaCheckoutService, NombaTransactionService, NombaWebhookService],
})
export class NombaModule {}
