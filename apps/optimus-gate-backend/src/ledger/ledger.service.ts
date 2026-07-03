import { Injectable } from '@nestjs/common';
import { LedgerRepository } from './ledger.repository';

@Injectable()
export class LedgerService {
  constructor(private readonly ledgerRepository: LedgerRepository) {}

  async creditBusinessAvailable(input: {
    businessId: string;
    amount: string;
    currency: string;
    idempotencyKey: string;
    sourceType: string;
    sourceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    type?: 'payment_credit' | 'renewal_credit';
  }) {
    const account = await this.ledgerRepository.getOrCreateAccount({
      businessId: input.businessId,
      type: 'business_available',
      currency: input.currency,
    });

    return this.ledgerRepository.createEntry({
      businessId: input.businessId,
      ledgerAccountId: account.id,
      type: input.type ?? 'payment_credit',
      amount: input.amount,
      currency: input.currency,
      idempotencyKey: input.idempotencyKey,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      description: input.description,
      metadata: input.metadata ?? {},
    });
  }
}
