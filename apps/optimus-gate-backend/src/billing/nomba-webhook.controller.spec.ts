import { NombaWebhookController } from './nomba-webhook.controller';

describe('NombaWebhookController', () => {
  it('acknowledges an already processed duplicate without verifying again', async () => {
    const nombaWebhookService = {
      verifySignature: jest.fn(),
    };
    const billingRepository = {
      findCheckoutOrderByReference: jest.fn().mockResolvedValue({
        businessId: 'business-id',
      }),
      createWebhookEventIdempotently: jest.fn().mockResolvedValue({
        created: false,
        event: {
          id: 'event-id',
          orderReference: 'og_order_123',
          processedAt: new Date('2026-01-01T00:00:00Z'),
        },
      }),
      markWebhookEventProcessed: jest.fn(),
    };
    const billingService = {
      verifyCheckoutOrder: jest.fn(),
    };
    const payoutsService = {
      handleNombaPayoutWebhook: jest.fn(),
    };
    const controller = new NombaWebhookController(
      nombaWebhookService as never,
      billingRepository as never,
      billingService as never,
      payoutsService as never,
    );

    const result = await controller.handleWebhook(
      {
        event_type: 'payment_success',
        requestId: 'request-id',
        data: {
          order: {
            orderReference: 'og_order_123',
          },
        },
      },
      'signature',
      undefined,
      '2026-01-01T00:00:00Z',
    );

    expect(result).toEqual({ received: true, duplicate: true });
    expect(nombaWebhookService.verifySignature).toHaveBeenCalledWith(
      expect.any(Object),
      'signature',
      '2026-01-01T00:00:00Z',
    );
    expect(billingRepository.createWebhookEventIdempotently).toHaveBeenCalled();
    expect(billingService.verifyCheckoutOrder).not.toHaveBeenCalled();
    expect(billingRepository.markWebhookEventProcessed).not.toHaveBeenCalled();
  });

  it('uses only the Nomba order reference from data.order.orderReference', async () => {
    const nombaWebhookService = {
      verifySignature: jest.fn(),
    };
    const billingRepository = {
      findCheckoutOrderByReference: jest.fn().mockResolvedValue(undefined),
      createWebhookEventIdempotently: jest.fn().mockResolvedValue({
        created: true,
        event: {
          id: 'event-id',
          orderReference: '',
          processedAt: null,
        },
      }),
      markWebhookEventProcessed: jest.fn(),
    };
    const billingService = {
      verifyCheckoutOrder: jest.fn(),
    };
    const payoutsService = {
      handleNombaPayoutWebhook: jest.fn(),
    };
    const controller = new NombaWebhookController(
      nombaWebhookService as never,
      billingRepository as never,
      billingService as never,
      payoutsService as never,
    );

    await controller.handleWebhook(
      {
        event_type: 'payment_success',
        requestId: 'request-id',
        data: {
          transaction: {
            merchantTxRef: '18********',
          },
        },
      },
      'signature',
      undefined,
      '2026-01-01T00:00:00Z',
    );

    expect(
      billingRepository.findCheckoutOrderByReference,
    ).not.toHaveBeenCalled();
    expect(
      billingRepository.createWebhookEventIdempotently,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        orderReference: '',
      }),
    );
  });
});
