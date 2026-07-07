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

export interface NombaTokenizedCardData {
  tokenKey?: string;
  customerEmail?: string;
  cardType?: string;
  cardPan?: string;
  tokenExpirationDate?: string;
  [key: string]: unknown;
}

export interface NombaTokenizedCardDataResponse {
  code: string;
  description?: string;
  data?: {
    nextPage?: string;
    tokenizedCardDataList?: NombaTokenizedCardData[];
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
          allowedPaymentMethods: ['Card'],
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

  listTokenizedCardData(input: {
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
  }) {
    return this.nombaHttpService.get<NombaTokenizedCardDataResponse>(
      '/v1/checkout/tokenized-card-data',
      {
        params: {
          customerEmail: input.customerEmail,
          startDate: input.startDate,
          endDate: input.endDate,
          page: input.page,
        },
      },
    );
  }
}
