import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './billing.service';

@Injectable()
export class BillingScheduler {
  constructor(private readonly billingService: BillingService) {}

  @Cron(CronExpression.EVERY_HOUR)
  enqueueDueRenewals() {
    return this.billingService.enqueueDueRenewals();
  }
}
