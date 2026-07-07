import { EmailService } from './email.service';

const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn();

jest.mock(
  'nodemailer',
  () => ({
    createTransport: mockCreateTransport,
  }),
  { virtual: true },
);

describe('EmailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp-relay.brevo.com',
      SMTP_PORT: '587',
      SMTP_USER: 'smtp-user',
      SMTP_PASSWORD: 'smtp-password',
      SMTP_FROM_EMAIL: 'Optimus Gate <notifications@example.com>',
      NODE_ENV: 'test',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sends email through SMTP with from, content, and idempotency header', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'email_123' });

    const service = new EmailService();
    const result = await service.sendEmail({
      to: 'merchant@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      idempotencyKey: 'email-verification/user_123/token_123',
    });

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'smtp-user',
        pass: 'smtp-password',
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith(
      {
        from: 'Optimus Gate <notifications@example.com>',
        to: 'merchant@example.com',
        subject: 'Hello',
        html: '<p>Hello</p>',
        text: undefined,
        headers: {
          'X-Optimus-Idempotency-Key':
            'email-verification/user_123/token_123',
        },
      },
    );
    expect(result).toEqual({ id: 'email_123' });
  });

  it('returns SMTP errors without throwing for normal send failures', async () => {
    mockSendMail.mockRejectedValue(new Error('rate limited'));

    const service = new EmailService();
    await expect(
      service.sendEmail({
        to: 'merchant@example.com',
        subject: 'Hello',
        html: '<p>Hello</p>',
        idempotencyKey: 'payment-receipt/attempt_123',
      }),
    ).resolves.toEqual({ error: 'rate limited' });
  });

  it('skips sending in non-production when SMTP env is missing', async () => {
    delete process.env.SMTP_HOST;

    const service = new EmailService();
    const result = await service.sendEmail({
      to: 'merchant@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      idempotencyKey: 'payment-receipt/attempt_123',
    });

    expect(mockSendMail).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      error: 'SMTP email is not configured',
    });
  });
});
