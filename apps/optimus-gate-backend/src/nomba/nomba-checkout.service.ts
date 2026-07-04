import { Inject, Injectable } from '@nestjs/common';
import { NombaHttpService } from './nomba-http.service';
import { NOMBA_CONFIG, type NombaConfig } from './nomba.constants';

export interface CreateNombaCheckoutOrderInput {
  orderReference: string;
  customerId: string;
  customerEmail: string;
  amount: string;
  currency: string;
  callbackUrl?: string;
  tokenizeCard?: boolean;
  metadata?: Record<string, unknown>;
}

export interface NombaCheckoutOrderResponse {
  code: string;
  description?: string;
  data?: {
    checkoutLink?: string;
    orderReference?: string;
    [key: string]: unknown;
  };
}

export interface ChargeTokenizedCardInput {
  orderReference: string;
  customerId: string;
  customerEmail: string;
  amount: string;
  currency: string;
  tokenKey: string;
  callbackUrl?: string;
}

@Injectable()
export class NombaCheckoutService {
  constructor(
    private readonly nombaHttpService: NombaHttpService,
    @Inject(NOMBA_CONFIG) private readonly config: NombaConfig,
  ) {}

  createCheckoutOrder(input: CreateNombaCheckoutOrderInput) {
    return this.nombaHttpService.post<NombaCheckoutOrderResponse>(
      '/v1/checkout/order',
      {
        order: {
          orderReference: input.orderReference,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          amount: input.amount,
          currency: input.currency,
          callbackUrl: input.callbackUrl,
          tokenizeCard: input.tokenizeCard ?? true,
          metadata: input.metadata,
          accountId: this.config.subAccountId,
        },
      },
    );
  }

  chargeTokenizedCard(input: ChargeTokenizedCardInput) {
    return this.nombaHttpService.post<NombaCheckoutOrderResponse>(
      '/v1/checkout/tokenized-card-payment',
      {
        order: {
          orderReference: input.orderReference,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          amount: input.amount,
          currency: input.currency,
          callbackUrl: input.callbackUrl,
          accountId: this.config.subAccountId,
        },
        tokenKey: input.tokenKey,
      },
    );
  }
}
