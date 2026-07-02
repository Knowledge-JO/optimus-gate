import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { RENEWAL_QUEUE } from '../../queues/queues.constants';
import { BillingService } from '../billing.service';

@Processor(RENEWAL_QUEUE)
export class RenewalProcessor extends WorkerHost {
  constructor(private readonly billingService: BillingService) {
    super();
  }

  process(job: Job<{ subscriptionId: string }>) {
    return this.billingService.chargeRenewal(job.data.subscriptionId);
  }
}
