import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';
import { NombaHttpService } from './nomba-http.service';

export interface NombaTransactionVerificationResponse {
  code: string;
  description?: string;
  status?: boolean;
  data?: NombaTransactionVerificationData;
}

export interface NombaTransactionVerificationData extends Record<
  string,
  unknown
> {
  status?: string;
  amount?: string;
  currency?: string;
  id?: string;
  transactionId?: string;
  orderReference?: string;
  merchantTxRef?: string;
  onlineCheckoutAmount?: string;
  onlineCheckoutCardPan?: string;
  onlineCheckoutCardPanLast4Digits?: string;
  onlineCheckoutCardType?: string;
  onlineCheckoutCurrency?: string;
  onlineCheckoutCustomerEmail?: string;
  onlineCheckoutOrderId?: string;
  onlineCheckoutOrderReference?: string;
  onlineCheckoutTokenExpiryMonth?: string;
  onlineCheckoutTokenExpiryYear?: string;
  onlineCheckoutTokenKey?: string;
  onlineCheckoutTransactionCompletedDate?: string;
  onlineCheckoutTransactionDate?: string;
  customerId?: string | number;
  customerEmail?: string;
}

export interface FetchNombaAccountTransactionsInput {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
}

export interface NombaAccountTransactionsResponse {
  code: string;
  description?: string;
  status?: boolean;
  data?: {
    results?: NombaAccountTransaction[];
    cursor?: string;
    [key: string]: unknown;
  };
}

export interface NombaAccountTransaction extends Record<string, unknown> {
  id?: string;
  status?: string;
  amount?: string | number;
  source?: string;
  type?: string;
  gatewayMessage?: string;
  customerBillerId?: string;
  timeCreated?: string;
  timeUpdated?: string;
  currency?: string;
  walletCurrency?: string;
  walletBalance?: string | number;
  paymentVendorReference?: string;
  billingVendorReference?: string;
  userId?: string;
  merchantTxRef?: string;
  onlineCheckoutOrderReference?: string;
  onlineCheckoutAmount?: string;
  onlineCheckoutCurrency?: string;
  onlineCheckoutCustomerEmail?: string;
}

@Injectable()
export class NombaTransactionService {
  constructor(
    private readonly nombaHttpService: NombaHttpService,
    @Inject(NOMBA_CONFIG) private readonly config: NombaConfig,
  ) {}

  verifyByOrderReference(orderReference: string) {
    return this.nombaHttpService.get<NombaTransactionVerificationResponse>(
      '/v1/transactions/accounts/single',
      {
        params: {
          orderReference,
        },
      },
    );
  }

  fetchAccountTransactions(input: FetchNombaAccountTransactionsInput = {}) {
    if (!this.config.subAccountId) {
      throw new BadRequestException('Nomba sub-account is not configured');
    }

    return this.nombaHttpService.get<NombaAccountTransactionsResponse>(
      `/v1/transactions/accounts/${this.config.subAccountId}`,
      {
        params: {
          ...(input.dateFrom ? { dateFrom: input.dateFrom } : {}),
          ...(input.dateTo ? { dateTo: input.dateTo } : {}),
          ...(input.limit ? { limit: input.limit } : {}),
          ...(input.cursor ? { cursor: input.cursor } : {}),
        },
      },
    );
  }
}
