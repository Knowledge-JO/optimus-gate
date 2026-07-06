import { Injectable } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';

export interface NombaCheckoutRefundResponse {
  code?: string;
  description?: string;
  message?: string;
  data?: {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

@Injectable()
export class NombaRefundService {
  constructor(private readonly nombaHttpService: NombaHttpService) {}

  refundCheckoutTransaction(input: {
    transactionId: string;
    amount?: number;
    accountNumber?: string;
    bankCode?: string;
  }) {
    return this.nombaHttpService.post<NombaCheckoutRefundResponse>(
      '/v1/checkout/refund',
      {
        transactionId: input.transactionId,
        ...(input.amount ? { amount: input.amount } : {}),
        ...(input.accountNumber ? { accountNumber: input.accountNumber } : {}),
        ...(input.bankCode ? { bankCode: input.bankCode } : {}),
      },
    );
  }
}
