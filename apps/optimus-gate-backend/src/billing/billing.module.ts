import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { DatabaseModule } from '../database/database.module';
import { LedgerModule } from '../ledger/ledger.module';
import { NombaModule } from '../nomba/nomba.module';
import { QueuesModule } from '../queues/queues.module';
import { UsersModule } from '../users/users.module';
import { BillingController } from './billing.controller';
import { BillingRepository } from './billing.repository';
import { BillingScheduler } from './billing.scheduler';
import { BillingService } from './billing.service';
import { DashboardBillingController } from './dashboard-billing.controller';
import { ApiKeyOrJwtAuthGuard } from './guards/api-key-or-jwt-auth.guard';
import { NombaWebhookController } from './nomba-webhook.controller';
import { RenewalProcessor } from './processors/renewal.processor';

@Module({
  imports: [
    ApiKeysModule,
    BusinessesModule,
    DatabaseModule,
    JwtModule.register({}),
    LedgerModule,
    NombaModule,
    QueuesModule,
    UsersModule,
  ],
  controllers: [
    BillingController,
    DashboardBillingController,
    NombaWebhookController,
  ],
  providers: [
    BillingRepository,
    BillingService,
    BillingScheduler,
    ApiKeyOrJwtAuthGuard,
    RenewalProcessor,
  ],
})
export class BillingModule {}
