import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

type SendMailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.getOrThrow<string>('MAIL_FROM');

    this.resend = new Resend(apiKey);
  }

  async sendMail({ to, subject, html, text }: SendMailOptions): Promise<void> {
    if (!html && !text) {
      this.logger.error('Attempted to send email without html or text body');
      throw new InternalServerErrorException('Failed to send email');
    }

    const basePayload = {
      from: this.fromEmail,
      to,
      subject,
    };

    let payload: CreateEmailOptions;

    if (html) {
      payload = { ...basePayload, html };

      if (text) {
        payload.text = text;
      }
    } else {
      payload = { ...basePayload, text: text! };
    }

    const { error } = await this.resend.emails.send(payload);

    if (!error) return;

    this.logger.error(
      `Failed to send email via Resend: ${error.name ?? 'Unknown error'} - ${error.message ?? 'No message'}`,
    );
    throw new InternalServerErrorException('Failed to send email');
  }
}
