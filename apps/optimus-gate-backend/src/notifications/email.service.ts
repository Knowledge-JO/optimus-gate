import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

// type NodemailerTransporter = {
//   sendMail(input: {
//     from: string;
//     to: string | string[];
//     subject: string;
//     html: string;
//     text?: string;
//     headers?: Record<string, string>;
//   }): Promise<{ messageId?: string }>;
// };

// type NodemailerModule = {
//   createTransport(input: {
//     host: string;
//     port: number;
//     secure: boolean;
//     auth: { user: string; pass: string };
//   }): NodemailerTransporter;
// };

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  id?: string;
  skipped?: boolean;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private configurationError?: string;
  private readonly transporter = this.createTransporter();

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const from = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER;

    if (!this.transporter || !from) {
      const message = this.configurationError ?? 'SMTP email is not configured';

      if (process.env.NODE_ENV === 'production') {
        this.logger.error(message);
      } else {
        this.logger.warn(`${message}; skipping email send in development`);
      }

      return { skipped: true, error: message };
    }

    try {
      const result = await this.transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        headers: {
          'X-Optimus-Idempotency-Key': input.idempotencyKey,
        },
      });

      return { id: result.messageId };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(
        `SMTP email failed for ${input.idempotencyKey}: ${message}`,
      );
      return { error: message };
    }
  }

  private createTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const port = Number(process.env.SMTP_PORT ?? 587);

    if (!host || !user || !pass || !Number.isFinite(port)) {
      return null;
    }

    // try {
    // } catch {
    //   this.configurationError = 'Nodemailer package is not installed';
    //   return null;
    // }

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown SMTP email error';
  }
}
