import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, {
  Transporter,
} from 'nodemailer';
import {
  EmailMessage,
  EmailSender,
} from './email-sender.interface';

@Injectable()
export class SmtpEmailSenderService
  implements EmailSender
{
  private readonly transporter: Transporter;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port: this.config.getOrThrow<number>('SMTP_PORT'),
      secure: this.config.get<boolean>('SMTP_SECURE') ?? true,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>(
          'SMTP_PASSWORD',
        ),
      },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}