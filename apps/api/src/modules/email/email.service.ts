import { Inject, Injectable } from '@nestjs/common';
import {
  EmailMessage,
  
} from './email-sender.interface';
import type {
  
  EmailSender,
} from './email-sender.interface';

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_SENDER)
    private readonly sender: EmailSender,
  ) {}

  send(message: EmailMessage) {
    return this.sender.send(message);
  }

  sendMagicLink(input: {
    to: string;
    link: string;
    expiresMinutes: number;
  }) {
    return this.send({
      to: input.to,
      subject: 'Your AuthFort sign-in link',
      text: `Use this link to continue signing in. It expires in ${input.expiresMinutes} minutes.`,
      html: `
        <p>Use the secure link below to continue signing in.</p>
        <p>
          <a href="${input.link}">
            Continue with AuthFort
          </a>
        </p>
        <p>This link expires in ${input.expiresMinutes} minutes.</p>
      `,
    });
  }

  sendOtp(input: {
    to: string;
    code: string;
    purpose: string;
    expiresMinutes: number;
  }) {
    return this.send({
      to: input.to,
      subject: 'Your AuthFort verification code',
      text: `Your verification code is ${input.code}. It expires in ${input.expiresMinutes} minutes.`,
      html: `
        <p>Your AuthFort verification code is:</p>
        <p><strong>${input.code}</strong></p>
        <p>This code expires in ${input.expiresMinutes} minutes.</p>
      `,
    });
  }
}