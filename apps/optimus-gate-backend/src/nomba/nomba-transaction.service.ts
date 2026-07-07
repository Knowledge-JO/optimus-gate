import { Injectable } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';

export interface NombaTransactionVerificationResponse {
  code: string;
  description?: string;
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
  customerId?: string | number;
  customerEmail?: string;
}

@Injectable()
export class NombaTransactionService {
  constructor(private readonly nombaHttpService: NombaHttpService) {}

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
}
