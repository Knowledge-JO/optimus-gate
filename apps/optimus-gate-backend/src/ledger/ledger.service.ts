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
    type?: 'payment_credit' | 'renewal_credit' | 'payout_reversal_credit';
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

  async debitBusinessAvailable(input: {
    businessId: string;
    amount: string;
    currency: string;
    idempotencyKey: string;
    sourceType: string;
    sourceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    type?: 'payout_debit' | 'refund_debit' | 'reversal_debit';
  }) {
    const account = await this.ledgerRepository.getOrCreateAccount({
      businessId: input.businessId,
      type: 'business_available',
      currency: input.currency,
    });

    return this.ledgerRepository.createEntry({
      businessId: input.businessId,
      ledgerAccountId: account.id,
      type: input.type ?? 'payout_debit',
      amount: input.amount,
      currency: input.currency,
      idempotencyKey: input.idempotencyKey,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      description: input.description,
      metadata: input.metadata ?? {},
    });
  }

  async getBusinessAvailableBalance(businessId: string, currency = 'NGN') {
    const entries = await this.ledgerRepository.listEntriesForBusiness(
      businessId,
      currency,
    );

    return entries.reduce((sum, entry) => {
      const amount = Number(entry.amount);
      const normalizedAmount = Number.isFinite(amount) ? amount : 0;

      if (entry.type.endsWith('_debit')) {
        return sum - normalizedAmount;
      }

      return sum + normalizedAmount;
    }, 0);
  }
}
