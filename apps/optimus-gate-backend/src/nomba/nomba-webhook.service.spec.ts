import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { NombaWebhookService } from './nomba-webhook.service';

describe('NombaWebhookService', () => {
  const secret = 'test-webhook-secret';
  const timestamp = '2025-09-29T10:51:44Z';
  const service = new NombaWebhookService({
    accountId: 'account-id',
    baseUrl: 'https://sandbox.nomba.com',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    subAccountId: 'sub-account-id',
    webhookSecret: secret,
  });
  const payload = {
    event_type: 'payment_success',
    requestId: '45f2dc2d-d559-4773-bba3-2d5ec17b2e20',
    data: {
      merchant: {
        walletId: '6756ff80aafe04a795f18b38',
        userId: 'b7b10e81-e57d-41d0-8fdc-f4e23a132bbf',
      },
      transaction: {
        transactionId: 'API-VACT_TRA-B7B10-0435b274-807a-4bc7-8abe-9db',
        type: 'vact_transfer',
        time: '2025-09-29T10:51:44Z',
        responseCode: '',
      },
    },
  };

  it('accepts signatures generated from the documented Nomba hash payload', () => {
    const hashingPayload = [
      payload.event_type,
      payload.requestId,
      payload.data.merchant.userId,
      payload.data.merchant.walletId,
      payload.data.transaction.transactionId,
      payload.data.transaction.type,
      payload.data.transaction.time,
      payload.data.transaction.responseCode,
      timestamp,
    ].join(':');
    const signature = createHmac('sha256', secret)
      .update(hashingPayload)
      .digest('base64');

    expect(() =>
      service.verifySignature(payload, signature, timestamp),
    ).not.toThrow();
  });

  it('generates the same signature as Nomba script for the redacted sample payload', () => {
    const sampleService = new NombaWebhookService({
      accountId: 'account-id',
      baseUrl: 'https://sandbox.nomba.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      subAccountId: 'sub-account-id',
      webhookSecret: 'sampleSecret',
    });
    const samplePayload = {
      event_type: 'payment_success',
      requestId: '45f2dc2d-d559-4773-bba3-2XXXXXXXXXX',
      data: {
        merchant: {
          walletId: '6756ff80aafe04XXXXXXXXXX',
          walletBalance: 6052,
          userId: 'b7b10e81-**-**-**-f4e23a132bbf',
        },
        terminal: {},
        transaction: {
          aliasAccountNumber: '5343270516',
          fee: 5,
          sessionId:
            'IFAP-TRANSFER-46501-e0339485-1a2f-4b43-9bd5-XXXXXXXXXX',
          type: 'vact_transfer',
          transactionId:
            'API-VACT_TRA-B7B10-0435b274-807a-4bc7-8abe-9XXXXXXXXXX',
          aliasAccountName: 'SAMPLE/JOHN DOE',
          responseCode: '',
          originatingFrom: 'api',
          transactionAmount: 10,
          narration: 'John Does Transfer 10.00 To SAMPLE/JOHN DOE - Nomba',
          time: '2025-09-29T10:51:44Z',
          aliasAccountReference: 'sampleAccountReference',
          aliasAccountType: 'VIRTUAL',
        },
        customer: {
          bankCode: '090645',
          senderName: 'John Does',
          bankName: 'Nombank',
          accountNumber: '0000000000',
        },
      },
    };

    expect(sampleService.generateSignature(samplePayload, timestamp)).toBe(
      'zj2S3DjHKtaQmQMn6Njm0RoFTG6WNi3ObogGyFE5xHA=',
    );
  });

  it('matches Nomba script case-insensitive signature comparison', () => {
    const signature = service.generateSignature(payload, timestamp);

    expect(() =>
      service.verifySignature(payload, signature.toLowerCase(), timestamp),
    ).not.toThrow();
  });

  it('rejects invalid signatures', () => {
    expect(() =>
      service.verifySignature(payload, 'invalid-signature', timestamp),
    ).toThrow(UnauthorizedException);
  });
});
