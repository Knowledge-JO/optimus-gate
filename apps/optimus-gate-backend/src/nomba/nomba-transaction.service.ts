import { Injectable } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';

export interface NombaTransactionVerificationResponse {
  code: string;
  description?: string;
  data?: {
    status?: string;
    amount?: string;
    currency?: string;
    orderReference?: string;
    tokenKey?: string;
    [key: string]: unknown;
  };
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
