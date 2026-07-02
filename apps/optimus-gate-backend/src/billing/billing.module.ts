import { Module } from '@nestjs/common';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { DatabaseModule } from '../database/database.module';
import { NombaModule } from '../nomba/nomba.module';
import { QueuesModule } from '../queues/queues.module';
import { BillingController } from './billing.controller';
import { BillingRepository } from './billing.repository';
import { BillingScheduler } from './billing.scheduler';
import { BillingService } from './billing.service';
import { DashboardBillingController } from './dashboard-billing.controller';
import { NombaWebhookController } from './nomba-webhook.controller';
import { RenewalProcessor } from './processors/renewal.processor';

@Module({
  imports: [ApiKeysModule, DatabaseModule, NombaModule, QueuesModule],
  controllers: [
    BillingController,
    DashboardBillingController,
    NombaWebhookController,
  ],
  providers: [
    BillingRepository,
    BillingService,
    BillingScheduler,
    RenewalProcessor,
  ],
})
export class BillingModule {}
