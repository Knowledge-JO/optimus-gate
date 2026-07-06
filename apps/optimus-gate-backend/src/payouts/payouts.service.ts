import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { BusinessesService } from '../businesses/businesses.service';
import { LedgerService } from '../ledger/ledger.service';
import {
  NombaBankTransferResponse,
  NombaTransferService,
} from '../nomba/nomba-transfer.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { LookupBankAccountDto } from './dto/lookup-bank-account.dto';
import { SavePayoutBankAccountDto } from './dto/save-payout-bank-account.dto';
import { PayoutsRepository } from './payouts.repository';

type PayoutStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly businessesService: BusinessesService,
    private readonly ledgerService: LedgerService,
    private readonly nombaTransferService: NombaTransferService,
    private readonly payoutsRepository: PayoutsRepository,
  ) {}

  async listBanks() {
    const response = await this.nombaTransferService.fetchBanks();
    const data = response.data;
    const banks = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];

    return {
      code: response.code,
      description: response.description,
      banks: banks
        .map((bank) => ({
          code: this.toSafeString(bank.code),
          name: this.toSafeString(bank.name),
        }))
        .filter((bank) => bank.code && bank.name),
    };
  }

  async lookupBankAccount(userId: string, dto: LookupBankAccountDto) {
    await this.businessesService.getDefaultBusinessForUser(userId);
    const response = await this.verifyBankAccount(dto);

    return {
      code: response.code,
      description: response.description,
      bankCode: dto.bankCode,
      accountNumber: response.data?.accountNumber ?? dto.accountNumber,
      accountName: response.data?.accountName,
    };
  }

  async listBankAccounts(userId: string) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);

    return this.payoutsRepository.listBankAccounts(business.id);
  }

  async saveBankAccount(userId: string, dto: SavePayoutBankAccountDto) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const lookup = await this.verifyBankAccount(dto);
    const existingAccounts = await this.payoutsRepository.listBankAccounts(
      business.id,
    );
    const shouldSetDefault = dto.isDefault || existingAccounts.length === 0;

    if (shouldSetDefault) {
      await this.payoutsRepository.unsetDefaultBankAccounts(business.id);
    }

    return this.payoutsRepository.upsertBankAccount({
      businessId: business.id,
      userId,
      bankCode: dto.bankCode,
      bankName: dto.bankName,
      accountNumber: lookup.data?.accountNumber ?? dto.accountNumber,
      accountName: this.toSafeString(lookup.data?.accountName),
      isDefault: shouldSetDefault,
      metadata: {
        lookup,
      },
    });
  }

  async deleteBankAccount(userId: string, bankAccountId: string) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const bankAccount = await this.payoutsRepository.findBankAccount(
      business.id,
      bankAccountId,
    );

    if (!bankAccount) {
      throw new NotFoundException('Payout bank account not found');
    }

    const [deleted] = await this.payoutsRepository.deleteBankAccount(
      business.id,
      bankAccountId,
    );

    if (bankAccount.isDefault) {
      const [nextDefault] = await this.payoutsRepository.listBankAccounts(
        business.id,
      );

      if (nextDefault) {
        await this.payoutsRepository.setDefaultBankAccount(
          business.id,
          nextDefault.id,
        );
      }
    }

    return deleted;
  }

  async setDefaultBankAccount(userId: string, bankAccountId: string) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const bankAccount = await this.payoutsRepository.findBankAccount(
      business.id,
      bankAccountId,
    );

    if (!bankAccount) {
      throw new NotFoundException('Payout bank account not found');
    }

    await this.payoutsRepository.unsetDefaultBankAccounts(business.id);
    const [updated] = await this.payoutsRepository.setDefaultBankAccount(
      business.id,
      bankAccountId,
    );

    return updated;
  }

  async listPayouts(userId: string) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const payouts = await this.payoutsRepository.listPayouts(business.id);

    return payouts.map((payout) => ({
      id: payout.id,
      amount: this.toNumber(payout.amount),
      currency: payout.currency,
      status: payout.status,
      providerReference: payout.providerReference,
      nombaTransactionId: payout.nombaTransactionId,
      bankAccount: this.toRecord(payout.metadata).bankAccount,
      failureReason: payout.failureReason,
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt.toISOString(),
    }));
  }

  async createPayout(userId: string, dto: CreatePayoutDto) {
    const business =
      await this.businessesService.getDefaultBusinessForUser(userId);
    const currency = (dto.currency ?? 'NGN').toUpperCase();

    if (currency !== 'NGN') {
      throw new BadRequestException('Only NGN payouts are supported');
    }

    const bankAccount = dto.bankAccountId
      ? await this.payoutsRepository.findBankAccount(
          business.id,
          dto.bankAccountId,
        )
      : await this.payoutsRepository.findDefaultBankAccount(business.id);

    if (!bankAccount) {
      throw new BadRequestException('Select a payout bank account');
    }

    const amount = this.parseAmount(dto.amount);
    const scopedIdempotencyKey = dto.idempotencyKey
      ? `${business.id}:${dto.idempotencyKey}`
      : undefined;
    const providerReference = `og_payout_${randomUUID()}`;

    if (!scopedIdempotencyKey) {
      await this.assertSufficientBalance(business.id, amount, currency);
    }

    const { payout, created } =
      await this.payoutsRepository.createPayoutIdempotently({
        businessId: business.id,
        userId,
        bankAccountId: bankAccount.id,
        amount: amount.toFixed(2),
        currency,
        status: 'pending',
        providerReference,
        idempotencyKey: scopedIdempotencyKey,
        metadata: {
          clientIdempotencyKey: dto.idempotencyKey,
          bankAccount: this.bankAccountSnapshot(bankAccount),
        },
      });

    if (!created) {
      return this.formatPayout(payout);
    }

    await this.assertSufficientBalance(business.id, amount, currency);
    await this.debitLedgerForPayout(payout.id, business.id, amount, currency);
    await this.payoutsRepository.updatePayout(payout.id, {
      ledgerDebitedAt: new Date(),
      status: 'processing',
    });

    try {
      const response =
        await this.nombaTransferService.transferToBankFromCentralSubAccount({
          amount,
          accountNumber: bankAccount.accountNumber,
          accountName: bankAccount.accountName,
          bankCode: bankAccount.bankCode,
          merchantTxRef: payout.providerReference,
          senderName: dto.senderName ?? business.name,
          narration:
            dto.narration ??
            `Payout to ${bankAccount.accountName}`.slice(0, 120),
        });

      return this.handleTransferResponse(
        payout.id,
        business.id,
        amount,
        currency,
        response,
      );
    } catch (error) {
      return this.handleTransferError(
        payout.id,
        business.id,
        amount,
        currency,
        error,
      );
    }
  }

  async handleNombaPayoutWebhook(
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const providerReference = this.extractPayoutReference(payload);

    if (!providerReference) {
      return { status: 'ignored', reason: 'missing_payout_reference' };
    }

    const payout =
      await this.payoutsRepository.findPayoutByProviderReference(
        providerReference,
      );

    if (!payout) {
      return { status: 'ignored', reason: 'payout_not_found' };
    }

    const transaction = this.toRecord(this.toRecord(payload.data).transaction);
    const nombaTransactionId =
      this.toSafeString(transaction.transactionId) ||
      this.toSafeString(transaction.id) ||
      payout.nombaTransactionId ||
      undefined;

    if (eventType === 'payout_success') {
      const [updated] = await this.payoutsRepository.updatePayout(payout.id, {
        status: 'succeeded',
        nombaTransactionId,
        rawResponse: payload,
      });

      return this.formatPayout(updated);
    }

    if (eventType === 'payout_failed' || eventType === 'payout_refund') {
      await this.reverseLedgerForPayout(
        payout.id,
        payout.businessId,
        this.toNumber(payout.amount),
        payout.currency,
        payload,
      );
      const [updated] = await this.payoutsRepository.updatePayout(payout.id, {
        status: eventType === 'payout_refund' ? 'refunded' : 'failed',
        nombaTransactionId,
        failureReason:
          this.toSafeString(transaction.responseCodeMessage) ||
          this.toSafeString(transaction.responseMessage) ||
          eventType,
        rawResponse: payload,
      });

      return this.formatPayout(updated);
    }

    return { status: 'ignored', reason: 'unsupported_payout_event' };
  }

  private extractPayoutReference(payload: Record<string, unknown>) {
    const data = this.toRecord(payload.data);
    const transaction = this.toRecord(data.transaction);

    return (
      this.toSafeString(transaction.merchantTxRef) ||
      this.toSafeString(transaction.merchantTxReference) ||
      this.toSafeString(data.merchantTxRef) ||
      this.toSafeString(payload.merchantTxRef) ||
      this.toSafeString(payload.reference)
    );
  }

  private async verifyBankAccount(input: {
    accountNumber: string;
    bankCode: string;
  }) {
    const response = await this.nombaTransferService.lookupBankAccount(input);

    if (response.code !== '00' || !response.data?.accountName) {
      throw new BadRequestException(
        response.description ?? 'Unable to verify bank account',
      );
    }

    return response;
  }

  private async assertSufficientBalance(
    businessId: string,
    amount: number,
    currency: string,
  ) {
    const balance = await this.ledgerService.getBusinessAvailableBalance(
      businessId,
      currency,
    );

    if (amount > balance) {
      throw new BadRequestException('Insufficient Optimus ledger balance');
    }
  }

  private debitLedgerForPayout(
    payoutId: string,
    businessId: string,
    amount: number,
    currency: string,
  ) {
    return this.ledgerService.debitBusinessAvailable({
      businessId,
      amount: amount.toFixed(2),
      currency,
      idempotencyKey: `payout:${payoutId}:debit`,
      sourceType: 'business_payout',
      sourceId: payoutId,
      description: `Payout ${payoutId}`,
      type: 'payout_debit',
    });
  }

  private reverseLedgerForPayout(
    payoutId: string,
    businessId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.ledgerService.creditBusinessAvailable({
      businessId,
      amount: amount.toFixed(2),
      currency,
      idempotencyKey: `payout:${payoutId}:reversal`,
      sourceType: 'business_payout',
      sourceId: payoutId,
      description: `Payout ${payoutId} reversed`,
      type: 'payout_reversal_credit',
      metadata: metadata ?? {},
    });
  }

  private async handleTransferResponse(
    payoutId: string,
    businessId: string,
    amount: number,
    currency: string,
    response: NombaBankTransferResponse,
  ) {
    const nombaStatus = this.toSafeString(response.data?.status).toUpperCase();
    const acceptedStatus = this.toAcceptedPayoutStatus(nombaStatus, response);

    if (acceptedStatus) {
      const [updated] = await this.payoutsRepository.updatePayout(payoutId, {
        status: acceptedStatus,
        nombaTransactionId: this.toSafeString(response.data?.id),
        rawResponse: this.toRecord(response),
      });

      return this.formatPayout(updated);
    }

    await this.reverseLedgerForPayout(payoutId, businessId, amount, currency, {
      response,
    });
    const [failed] = await this.payoutsRepository.updatePayout(payoutId, {
      status: 'failed',
      failureReason:
        response.description ?? response.message ?? nombaStatus ?? 'Failed',
      rawResponse: this.toRecord(response),
    });

    return this.formatPayout(failed);
  }

  private async handleTransferError(
    payoutId: string,
    businessId: string,
    amount: number,
    currency: string,
    error: unknown,
  ) {
    const response = isAxiosError(error) ? error.response : undefined;
    const responseBody = this.toRecord(response?.data);

    if (error instanceof BadRequestException) {
      await this.reverseLedgerForPayout(
        payoutId,
        businessId,
        amount,
        currency,
        {
          message: error.message,
        },
      );
      const [failed] = await this.payoutsRepository.updatePayout(payoutId, {
        status: 'failed',
        failureReason: error.message,
        rawResponse: {
          message: error.message,
        },
      });

      return this.formatPayout(failed);
    }

    if (response && response.status < 500) {
      await this.reverseLedgerForPayout(
        payoutId,
        businessId,
        amount,
        currency,
        responseBody,
      );
      const [failed] = await this.payoutsRepository.updatePayout(payoutId, {
        status: 'failed',
        failureReason:
          this.toSafeString(responseBody.description) ||
          this.toSafeString(responseBody.message) ||
          'Nomba rejected payout',
        rawResponse: responseBody,
      });

      return this.formatPayout(failed);
    }

    const [processing] = await this.payoutsRepository.updatePayout(payoutId, {
      status: 'processing',
      failureReason: 'Payout outcome is unknown and needs requery',
      rawResponse: {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: responseBody,
      },
    });

    return this.formatPayout(processing);
  }

  private toAcceptedPayoutStatus(
    nombaStatus: string,
    response: NombaBankTransferResponse,
  ): PayoutStatus | undefined {
    if (nombaStatus === 'SUCCESS') {
      return 'succeeded';
    }

    if (
      ['NEW', 'PENDING', 'PENDING_BILLING', 'PROCESSING'].includes(nombaStatus)
    ) {
      return 'processing';
    }

    if (this.toSafeString(response.code) === '201') {
      return 'processing';
    }

    if (
      ['00', '200'].includes(this.toSafeString(response.code)) &&
      response.data?.id
    ) {
      return 'processing';
    }

    return undefined;
  }

  private parseAmount(value: string) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payout amount must be greater than zero');
    }

    return amount;
  }

  private bankAccountSnapshot(bankAccount: {
    id: string;
    bankCode: string;
    bankName: string | null;
    accountNumber: string;
    accountName: string;
  }) {
    return {
      id: bankAccount.id,
      bankCode: bankAccount.bankCode,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountName: bankAccount.accountName,
    };
  }

  private formatPayout(payout: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    providerReference: string;
    nombaTransactionId: string | null;
    failureReason: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: payout.id,
      amount: this.toNumber(payout.amount),
      currency: payout.currency,
      status: payout.status,
      providerReference: payout.providerReference,
      nombaTransactionId: payout.nombaTransactionId,
      bankAccount: this.toRecord(payout.metadata).bankAccount,
      failureReason: payout.failureReason,
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt.toISOString(),
    };
  }

  private toNumber(value: string | number | null | undefined) {
    if (typeof value === 'number') {
      return value;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private toSafeString(value: unknown) {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return '';
  }
}
