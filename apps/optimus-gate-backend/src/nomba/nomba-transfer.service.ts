import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';

export interface NombaBankListResponse {
  code?: string;
  description?: string;
  data?:
    | Array<{ code?: string; name?: string; [key: string]: unknown }>
    | {
        results?: Array<{ code?: string; name?: string; [key: string]: unknown }>;
        [key: string]: unknown;
      };
  [key: string]: unknown;
}

export interface NombaBankLookupResponse {
  code?: string;
  description?: string;
  data?: {
    accountNumber?: string;
    accountName?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface NombaBankTransferResponse {
  code?: string;
  description?: string;
  message?: string;
  status?: boolean | string;
  data?: {
    id?: string;
    status?: string;
    amount?: string | number;
    fee?: string | number;
    meta?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

@Injectable()
export class NombaTransferService {
  constructor(
    private readonly nombaHttpService: NombaHttpService,
    @Inject(NOMBA_CONFIG) private readonly config: NombaConfig,
  ) {}

  fetchBanks() {
    return this.nombaHttpService.get<NombaBankListResponse>(
      '/v1/transfers/banks',
    );
  }

  lookupBankAccount(input: { accountNumber: string; bankCode: string }) {
    return this.nombaHttpService.post<NombaBankLookupResponse>(
      '/v1/transfers/bank/lookup',
      {
        accountNumber: input.accountNumber,
        bankCode: input.bankCode,
      },
    );
  }

  transferToBankFromCentralSubAccount(input: {
    amount: number;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    merchantTxRef: string;
    senderName?: string;
    narration?: string;
  }) {
    if (!this.config.subAccountId) {
      throw new BadRequestException('Nomba sub-account is not configured');
    }

    return this.nombaHttpService.post<NombaBankTransferResponse>(
      `/v2/transfers/bank/${this.config.subAccountId}`,
      {
        amount: input.amount,
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        bankCode: input.bankCode,
        merchantTxRef: input.merchantTxRef,
        senderName: input.senderName,
        narration: input.narration,
      },
    );
  }
}
