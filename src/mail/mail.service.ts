import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  public constructor(private mailerService: MailerService) {}

  public async sendMail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      from: '"Support Team" <support@example.com>',
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation-code',
      context: {
        code: code,
      },
    });
  }
}
