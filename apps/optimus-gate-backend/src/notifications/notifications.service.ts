import { Injectable } from '@nestjs/common';
import { EmailService, SendEmailResult } from './email.service';

export interface SendEmailVerificationInput {
  email: string;
  token: string;
  userId: string;
  idempotencyKey: string;
}

export interface SendNewSubscriberInput {
  merchantEmail: string;
  customerEmail: string;
  planName: string;
  amount: string | number;
  currency: string;
  subscriptionId: string;
}

export interface SendPaymentReceiptInput {
  customerEmail: string;
  planName: string;
  amount: string | number;
  currency: string;
  paymentAttemptId: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly emailService: EmailService) {}

  sendEmailVerification(
    input: SendEmailVerificationInput,
  ): Promise<SendEmailResult> {
    const verificationUrl = this.buildFrontendUrl(
      `/verify-email?token=${encodeURIComponent(input.token)}`,
    );
    const escapedUrl = this.escapeHtml(verificationUrl);

    return this.emailService.sendEmail({
      to: input.email,
      subject: 'Verify your Optimus Gate email',
      html: `
        <p>Welcome to Optimus Gate.</p>
        <p>Confirm your email address to access your dashboard and manage subscriptions.</p>
        <p><a href="${escapedUrl}">Verify email address</a></p>
        <p>If the button does not work, paste this link into your browser:</p>
        <p>${escapedUrl}</p>
      `,
      text: `Verify your Optimus Gate email: ${verificationUrl}`,
      idempotencyKey: input.idempotencyKey,
      tags: [
        { name: 'category', value: 'email_verification' },
        { name: 'user_id', value: input.userId },
      ],
    });
  }

  sendNewSubscriberNotification(
    input: SendNewSubscriberInput,
  ): Promise<SendEmailResult> {
    const amount = this.formatAmount(input.amount, input.currency);

    return this.emailService.sendEmail({
      to: input.merchantEmail,
      subject: 'New subscriber on Optimus Gate',
      html: `
        <p>You have a new subscriber.</p>
        <p>${this.escapeHtml(input.customerEmail)} subscribed to ${this.escapeHtml(input.planName)}.</p>
        <p>Initial payment: ${this.escapeHtml(amount)}</p>
      `,
      text: `${input.customerEmail} subscribed to ${input.planName}. Initial payment: ${amount}`,
      idempotencyKey: `new-subscriber/${input.subscriptionId}`,
      tags: [
        { name: 'category', value: 'new_subscriber' },
        { name: 'subscription_id', value: input.subscriptionId },
      ],
    });
  }

  sendInitialPaymentReceipt(
    input: SendPaymentReceiptInput,
  ): Promise<SendEmailResult> {
    const amount = this.formatAmount(input.amount, input.currency);

    return this.emailService.sendEmail({
      to: input.customerEmail,
      subject: 'Your subscription payment was successful',
      html: `
        <p>Your payment for ${this.escapeHtml(input.planName)} was successful.</p>
        <p>Amount paid: ${this.escapeHtml(amount)}</p>
      `,
      text: `Your payment for ${input.planName} was successful. Amount paid: ${amount}`,
      idempotencyKey: `payment-receipt/${input.paymentAttemptId}`,
      tags: [
        { name: 'category', value: 'payment_receipt' },
        { name: 'payment_attempt_id', value: input.paymentAttemptId },
      ],
    });
  }

  sendRenewalPaymentReceipt(
    input: SendPaymentReceiptInput,
  ): Promise<SendEmailResult> {
    const amount = this.formatAmount(input.amount, input.currency);

    return this.emailService.sendEmail({
      to: input.customerEmail,
      subject: 'Your subscription renewal was successful',
      html: `
        <p>Your ${this.escapeHtml(input.planName)} subscription renewed successfully.</p>
        <p>Amount paid: ${this.escapeHtml(amount)}</p>
      `,
      text: `Your ${input.planName} subscription renewed successfully. Amount paid: ${amount}`,
      idempotencyKey: `renewal-receipt/${input.paymentAttemptId}`,
      tags: [
        { name: 'category', value: 'renewal_receipt' },
        { name: 'payment_attempt_id', value: input.paymentAttemptId },
      ],
    });
  }

  private buildFrontendUrl(path: string) {
    const baseUrl =
      process.env.APP_FRONTEND_URL?.replace(/\/$/, '') ??
      'http://localhost:3000';

    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private formatAmount(amount: string | number, currency: string) {
    const value = Number(amount);

    if (Number.isFinite(value)) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
      }).format(value);
    }

    return `${currency} ${amount}`;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
