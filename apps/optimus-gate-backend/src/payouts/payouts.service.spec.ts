import { BadRequestException } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

describe('PayoutsService', () => {
  const business = {
    id: 'business-id',
    name: 'Optimus Merchant',
  };
  const bankAccount = {
    id: 'bank-account-id',
    businessId: business.id,
    userId: 'user-id',
    bankCode: '058',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Ada Lovelace',
    isDefault: true,
    metadata: {},
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  function createService() {
    const businessesService = {
      getDefaultBusinessForUser: jest.fn().mockResolvedValue(business),
    };
    const ledgerService = {
      getBusinessAvailableBalance: jest.fn().mockResolvedValue(10_000),
      debitBusinessAvailable: jest.fn().mockResolvedValue({}),
      creditBusinessAvailable: jest.fn().mockResolvedValue({}),
    };
    const nombaTransferService = {
      fetchBanks: jest.fn(),
      lookupBankAccount: jest.fn().mockResolvedValue({
        code: '00',
        description: 'Success',
        data: {
          accountNumber: bankAccount.accountNumber,
          accountName: bankAccount.accountName,
        },
      }),
      transferToBankFromCentralSubAccount: jest.fn(),
    };
    const payoutsRepository = {
      listBankAccounts: jest.fn().mockResolvedValue([]),
      findBankAccount: jest.fn().mockResolvedValue(bankAccount),
      findDefaultBankAccount: jest.fn().mockResolvedValue(bankAccount),
      upsertBankAccount: jest.fn().mockResolvedValue(bankAccount),
      unsetDefaultBankAccounts: jest.fn().mockResolvedValue([]),
      setDefaultBankAccount: jest.fn(),
      deleteBankAccount: jest.fn(),
      listPayouts: jest.fn().mockResolvedValue([]),
      createPayoutIdempotently: jest.fn(),
      updatePayout: jest.fn(),
    };

    return {
      businessesService,
      ledgerService,
      nombaTransferService,
      payoutsRepository,
      service: new PayoutsService(
        businessesService as never,
        ledgerService as never,
        nombaTransferService as never,
        payoutsRepository as never,
      ),
    };
  }

  it('verifies and saves the first payout bank account as default', async () => {
    const { payoutsRepository, service } = createService();

    await service.saveBankAccount('user-id', {
      accountNumber: bankAccount.accountNumber,
      bankCode: bankAccount.bankCode,
      bankName: bankAccount.bankName,
    });

    expect(payoutsRepository.unsetDefaultBankAccounts).toHaveBeenCalledWith(
      business.id,
    );
    expect(payoutsRepository.upsertBankAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId: business.id,
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
        isDefault: true,
      }),
    );
  });

  it('reverses the ledger debit when local payout configuration is invalid', async () => {
    const {
      ledgerService,
      nombaTransferService,
      payoutsRepository,
      service,
    } = createService();
    const payout = {
      id: '11111111-1111-4111-8111-111111111111',
      businessId: business.id,
      userId: 'user-id',
      bankAccountId: bankAccount.id,
      amount: '5000.00',
      currency: 'NGN',
      status: 'pending',
      provider: 'nomba',
      providerReference: 'og_payout_reference',
      nombaTransactionId: null,
      idempotencyKey: null,
      failureReason: null,
      rawResponse: null,
      ledgerDebitedAt: null,
      metadata: {
        bankAccount,
      },
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
    const failedPayout = {
      ...payout,
      status: 'failed',
      failureReason: 'Nomba sub-account is not configured',
      updatedAt: new Date('2026-01-01T00:00:01Z'),
    };
    payoutsRepository.createPayoutIdempotently.mockResolvedValue({
      payout,
      created: true,
    });
    payoutsRepository.updatePayout
      .mockResolvedValueOnce([{ ...payout, status: 'processing' }])
      .mockResolvedValueOnce([failedPayout]);
    nombaTransferService.transferToBankFromCentralSubAccount.mockRejectedValue(
      new BadRequestException('Nomba sub-account is not configured'),
    );

    const result = await service.createPayout('user-id', {
      amount: '5000',
    });

    expect(ledgerService.debitBusinessAvailable).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `payout:${payout.id}:debit`,
        type: 'payout_debit',
      }),
    );
    expect(ledgerService.creditBusinessAvailable).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: `payout:${payout.id}:reversal`,
        type: 'payout_reversal_credit',
      }),
    );
    expect(result.status).toBe('failed');
  });
});
